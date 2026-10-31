import { useEffect, useState } from 'react';

export function USBLectern({ recovered }: { recovered: boolean }) {
  const [image, setImage] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function capture() {
      const [THREE, { loadLibrary }] = await Promise.all([import('three'), import('./libraryAsset')]);
      const asset = await loadLibrary(controller.signal);
      let renderer: InstanceType<typeof THREE.WebGLRenderer> | undefined;
      try {
        if (controller.signal.aborted) return;
        renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(960, 640);
        renderer.setPixelRatio(1);
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x080c09);
        scene.add(asset.model, new THREE.HemisphereLight(0xffffff, 0x657363, 2));
        const light = new THREE.DirectionalLight(0xffffff, 3);
        const { sonarAnchor, floors } = asset.manifest;
        const focus = new THREE.Vector3(sonarAnchor[0] + 0.22, floors[1] + 1.4, sonarAnchor[1]);
        asset.model.updateMatrixWorld(true);
        const ray = new THREE.Raycaster(focus, new THREE.Vector3(0, -1, 0), 0, 0.7);
        const surface = ray.intersectObject(asset.model, true)[0];
        if (!surface) throw new Error('Lectern not found');
        focus.copy(surface.point);
        const camera = new THREE.PerspectiveCamera(48, 1.5, 0.05, 60);
        camera.position.copy(focus).add(new THREE.Vector3(1.5, 1.25, 2.1));
        camera.lookAt(focus.clone().add(new THREE.Vector3(0, -0.3, 0)));
        light.position.copy(camera.position); scene.add(light);
        renderer.render(scene, camera);
        setImage(renderer.domElement.toDataURL('image/png'));
      } finally {
        renderer?.dispose();
        asset.model.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(material => material.dispose());
          }
        });
        asset.lineGeometry.dispose(); asset.walking.dispose();
      }
    }
    capture().catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);
  return <figure className="overflow-hidden rounded border border-green-900 bg-black">
    <div className="flex justify-between border-b border-green-900 px-4 py-2 font-mono text-[10px] text-green-400"><span>OFFICER CAM / MAP STILL</span><span>{recovered ? 'USB SECURED' : 'STAND BY'}</span></div>
    {image ? <img src={image} alt="Still frame of the actual lectern and book in your library map" className="aspect-[3/2] w-full object-contain" /> : <p role="status" className="p-8 text-sm text-neutral-400">{failed ? 'Camera unavailable. You can still send the officer directions.' : 'Connecting to officer camera…'}</p>}
  </figure>;
}
