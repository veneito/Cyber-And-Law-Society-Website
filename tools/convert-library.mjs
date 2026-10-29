import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Node has Blob but the Three.js exporter also needs the browser FileReader API.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
};

export async function convertLibrary(objPath, mtlPath, outputDir) {
  const source = await fs.readFile(objPath, 'utf8');
  const mtl = await fs.readFile(mtlPath, 'utf8');
  const palette = new Map();
  let material;
  for (const line of mtl.split(/\r?\n/)) {
    const [key, ...values] = line.trim().split(/\s+/);
    if (key === 'newmtl') { material = { color: [0.7, 0.7, 0.7], opacity: 1 }; palette.set(values.join(' '), material); }
    if (material && key === 'Kd') material.color = values.map(Number);
    if (material && key === 'd') material.opacity = Number(values[0]);
  }
  const imported = new OBJLoader().parse(source);
  const merged = new Map();
  const physical = [];
  const edgeChunks = [];
  const bounds = new THREE.Box3();
  let objects = 0, triangles = 0;
  // Preserve Roblox orientation; only convert studs to metres and put floor one at y=0.
  const transform = new THREE.Matrix4().makeScale(0.25, 0.25, 0.25);
  transform.setPosition(0, -0.75, 0);
  const ignored = /^(baseplate|spawnlocation)/i;
  const decoration = /^(book(bundle|s|page)?\d|letterstroke|screenfoot|sign\d|continent|meridian|water|bowlopening|bowlinte|ovalseat|flushbutton|tanklid|tap|soap|mirror|doorhandle|pushbar|insetpanel|brushed|floorindicator|callbutton|pastry|syrup|pump|straw|cup|napkin|sugar|chairleg|deskleg|tableleg|monitor|keyboard|screen\d|register|computer|filebinder|drawerhandle|chairback)/i;
  const sourceObjects = [];
  imported.traverse(object => {
    if (!object.isMesh || ignored.test(object.name)) return;
    const geometry = object.geometry.clone().applyMatrix4(transform);
    geometry.deleteAttribute('uv');
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    assert(box.min.toArray().every(Number.isFinite) && box.max.toArray().every(Number.isFinite));
    // Roblox exports the workspace baseplate separately; never ship its 2 km square.
    assert(box.max.x - box.min.x < 100 && box.max.z - box.min.z < 100, `Unexpected oversized mesh: ${object.name}`);
    bounds.union(box);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const color = palette.get(materials[0].name) ?? { color: [0.7, 0.7, 0.7], opacity: 1 };
    const glass = /glass|windowpane|entranceglass|upperwindow|receptionstaffbarrier/i.test(object.name);
    const opacity = glass ? Math.min(color.opacity, 0.4) : color.opacity;
    const key = `${color.color.join(',')}:${opacity}`;
    if (!merged.has(key)) merged.set(key, { geometries: [], color: color.color, opacity });
    merged.get(key).geometries.push(geometry);
    if (!decoration.test(object.name)) physical.push(geometry.clone().deleteAttribute('normal'));
    // Keep useful architectural outlines without drawing every book as a bright grid.
    if (!/roof|walltopseal|^(book|letterstroke|meridian|continent|straw|cup|pastry|ovalseat)/i.test(object.name)) {
      const edges = new THREE.EdgesGeometry(geometry, 35);
      edgeChunks.push(edges.getAttribute('position').array);
    }
    sourceObjects.push({ name: object.name, min: box.min.toArray(), max: box.max.toArray() });
    objects++;
    triangles += geometry.getAttribute('position').count / 3;
  });
  assert(objects > 1000 && triangles > 10000, 'Export is incomplete');
  const scene = new THREE.Group();
  for (const batch of merged.values()) {
    const geometry = mergeVertices(mergeGeometries(batch.geometries), 0.00001);
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(...batch.color), roughness: 0.8, opacity: batch.opacity, transparent: batch.opacity < 1, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, mat); mesh.name = `Library_${scene.children.length}`; scene.add(mesh);
  }
  const glb = await new GLTFExporter().parseAsync(scene, { binary: true });
  const collider = mergeVertices(mergeGeometries(physical), 0.00001);
  const positions = collider.getAttribute('position').array;
  const indices = new Uint32Array(collider.index.array);
  const collisionHeader = new Uint32Array([positions.length, indices.length]);
  const collision = Buffer.concat([Buffer.from(collisionHeader.buffer), Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength), Buffer.from(indices.buffer)]);
  const edgeCount = edgeChunks.reduce((n, a) => n + a.length, 0);
  const edges = new Float32Array(edgeCount);
  let offset = 0; for (const chunk of edgeChunks) { edges.set(chunk, offset); offset += chunk.length; }
  const version = crypto.createHash('sha256').update(source).update(mtl).update(await fs.readFile(import.meta.filename)).digest('hex').slice(0, 10);
  const prefix = `marx-library-${version}`;
  const lectern = sourceObjects.find(o => /^Lecternbase/i.test(o.name));
  assert(lectern, 'Expected the second-floor bird-book lectern');
  const manifest = {
    version: 1, sourceHash: version,
    model: `${prefix}.glb`, collision: `${prefix}.collision.bin`, edges: `${prefix}.edges.bin`,
    bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    spawn: { position: [19, 0.002, -31.5], yaw: Math.PI / 2, room: 'Room 181' },
    floors: [0, 4.5],
    sonarAnchor: [(lectern.min[0] + lectern.max[0]) / 2, (lectern.min[2] + lectern.max[2]) / 2],
    stats: { objects, triangles, materials: merged.size },
  };
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(outputDir, manifest.model), Buffer.from(glb)),
    fs.writeFile(path.join(outputDir, manifest.collision), collision),
    fs.writeFile(path.join(outputDir, manifest.edges), Buffer.from(edges.buffer)),
    fs.writeFile(path.join(outputDir, `${prefix}.json`), JSON.stringify(manifest, null, 2) + '\n'),
  ]);
  console.log(JSON.stringify({ manifest: `${prefix}.json`, ...manifest, bytes: { glb: glb.byteLength, collision: collision.length, edges: edges.byteLength } }, null, 2));
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  assert(process.argv.length === 5, 'Usage: node tools/convert-library.mjs map.obj map.mtl output-directory');
  await convertLibrary(...process.argv.slice(2));
}
