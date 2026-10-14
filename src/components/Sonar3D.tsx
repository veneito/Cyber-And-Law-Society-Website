import * as THREE from "three";
import { useEffect, useRef } from "react";
import { BLOCKED, BOOKSTAND, DIVIDERS, DOORS, FLOORS, GLOBE, LABELS, PILLARS, PLAN_H, PLAN_W, SHELVES, TABLES, WING, type Rect } from "./floorplan";

export type ViewProps = {
  pos: { x: number; y: number };
  heat: number;
  pings: number[];
  found: boolean;
  started: boolean;
  angle: number; // view rotation in degrees
  onMove: (x: number, y: number) => void;
};

const GREEN = 0x4ade80;
const edge = (geo: THREE.BufferGeometry, color = GREEN, opacity = 0.5) =>
  new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));

function box(b: Rect, fill: number, color: number, opacity: number) {
  const h = b.height || 1;
  const geo = new THREE.BoxGeometry(b.w, h, b.h);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: fill }));
  m.add(edge(geo, color, opacity));
  m.position.set(b.x + b.w / 2, h / 2, b.y + b.h / 2);
  return m;
}

function label(text: string, x: number, z: number) {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#a3a3a3"; g.font = "28px monospace"; g.textAlign = "center"; g.fillText(text, 128, 40);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
  s.scale.set(150, 38, 1);
  s.position.set(x, 50, z);
  return s;
}

export default function Sonar3D(props: ViewProps) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  const api = useRef<{ ripple: () => void } | null>(null);
  useEffect(() => { live.current = props; });

  useEffect(() => {
    const el = mount.current!;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(40, 1, 10, 4000);
    const center = new THREE.Vector3(PLAN_W / 2, 0, PLAN_H / 2);

    // floor, walls and furniture
    const floor = (b: Rect) => scene.add(box({ ...b, height: 2 }, 0x0b1a12, GREEN, 0.35));
    FLOORS.forEach(floor);
    const wing = new THREE.Shape(WING.map((w) => new THREE.Vector2(w.x, w.y)));
    const wingGeo = new THREE.ExtrudeGeometry(wing, { depth: 2, bevelEnabled: false });
    wingGeo.rotateX(Math.PI / 2); // lay the shape flat; y in the shape becomes z
    const wingMesh = new THREE.Mesh(wingGeo, new THREE.MeshBasicMaterial({ color: 0x0b1a12, side: THREE.DoubleSide }));
    wingMesh.add(edge(wingGeo, GREEN, 0.35));
    wingMesh.position.y = 2;
    scene.add(wingMesh);
    BLOCKED.forEach((b) => {
      scene.add(box(b, b.height ? 0x111827 : 0x1a0b0b, b.height ? 0x94a3b8 : 0xf87171, 0.6));
      if (b.label) scene.add(label(b.label, b.x + b.w / 2, b.y + b.h / 2));
    });
    SHELVES.forEach((b) => scene.add(box(b, 0x1a1408, 0xfbbf24, 0.7)));
    DIVIDERS.forEach((b) => scene.add(box(b, 0x111827, 0x94a3b8, 0.9)));
    scene.add(box(BOOKSTAND, 0x0b1a12, GREEN, 0.9));
    scene.add(label("Bookstand", BOOKSTAND.x + BOOKSTAND.w / 2, BOOKSTAND.y - 20));
    DOORS.forEach((b) => {
      scene.add(box(b, 0x082f49, 0x38bdf8, 0.9));
      if (b.label) scene.add(label(b.label, b.x + b.w / 2, b.y + b.h / 2));
    });
    const globeGeo = new THREE.SphereGeometry(20, 16, 12);
    const globe = new THREE.Mesh(globeGeo, new THREE.MeshBasicMaterial({ color: 0x082f49 }));
    globe.add(edge(globeGeo, 0x38bdf8, 0.7));
    globe.position.set(GLOBE.x, 34, GLOBE.y);
    scene.add(globe);
    LABELS.forEach((l) => scene.add(label(l.text, l.x, l.y)));
    PILLARS.forEach((q) => {
      const geo = new THREE.CylinderGeometry(14, 14, 80, 16);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x111827 }));
      m.add(edge(geo, 0x94a3b8, 0.5));
      m.position.set(q.x, 40, q.y);
      scene.add(m);
    });
    TABLES.forEach((q) => {
      const geo = new THREE.CylinderGeometry(22, 22, 14, 20);
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x0f1d15 }));
      m.add(edge(geo, GREEN, 0.4));
      m.position.set(q.x, 7, q.y);
      scene.add(m);
    });

    // scanner and ripples
    const scanner = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), new THREE.MeshBasicMaterial({ color: GREEN }));
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.2 }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 3;
    scene.add(scanner, glow);
    const ripples: { mesh: THREE.Mesh; t0: number; max: number }[] = [];
    api.current = {
      ripple: () => {
        const mesh = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 48), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, side: THREE.DoubleSide }));
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(live.current.pos.x, 4, live.current.pos.y);
        scene.add(mesh);
        ripples.push({ mesh, t0: performance.now(), max: 50 + live.current.heat * 140 });
      },
    };

    const resize = () => {
      const w = el.clientWidth, h = Math.round(w * 0.8);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    addEventListener("resize", resize);

    let raf = 0;
    const loop = (now: number) => {
      const s = live.current, a = (s.angle * Math.PI) / 180;
      camera.position.set(center.x + Math.sin(a) * 700, 900, center.z + Math.cos(a) * 700);
      camera.lookAt(center);
      scanner.visible = glow.visible = s.started;
      scanner.position.set(s.pos.x, 10, s.pos.y);
      (scanner.material as THREE.MeshBasicMaterial).color.set(s.found ? 0xf87171 : GREEN);
      glow.position.set(s.pos.x, 3, s.pos.y);
      glow.scale.setScalar(30 + s.heat * 70);
      (glow.material as THREE.MeshBasicMaterial).opacity = 0.08 + s.heat * 0.3;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const t = (now - ripples[i].t0) / 900;
        if (t >= 1) { scene.remove(ripples[i].mesh); ripples.splice(i, 1); continue; }
        ripples[i].mesh.scale.setScalar(8 + t * ripples[i].max);
        (ripples[i].mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // pointer -> floor position
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    const move = (e: PointerEvent) => {
      if (e.type === "pointermove" && !e.buttons) return;
      const b = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), camera);
      if (ray.ray.intersectPlane(plane, hit)) live.current.onMove(hit.x, hit.z);
    };
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.addEventListener("pointerdown", move);
    renderer.domElement.addEventListener("pointermove", move);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      api.current = null;
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const last = props.pings[props.pings.length - 1];
  useEffect(() => { if (last) api.current?.ripple(); }, [last]);

  return <div ref={mount} className="w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950" />;
}
