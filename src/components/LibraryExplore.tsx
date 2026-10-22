import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { sfx } from "./sound";
import { OUTLINES, ROOMS, inside } from "./libraryPlan";

type Props = { onPing: (x: number, y: number) => Promise<{ strength: number; found: boolean } | null>; onKey: () => void };
type Block = { x: number; z: number; w: number; d: number; floor: number; label?: string };
const HEIGHT = 3.2, EYE = 1.65;

export default function LibraryExplore({ onPing, onKey }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef({ onPing });
  useEffect(() => { live.current = { onPing }; }, [onPing]);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [floor, setFloor] = useState(0);
  const [overview, setOverview] = useState(false);
  const [inspectFloor, setInspectFloor] = useState(0);
  const inspection = useRef({ overview: false, floor: 0 });
  useEffect(() => { inspection.current = { overview, floor: inspectFloor }; if (overview && document.pointerLockElement) document.exitPointerLock(); }, [overview, inspectFloor]);
  const [heat, setHeat] = useState(0);
  const [found, setFound] = useState(false);
  const [error, setError] = useState("");
  const controls = useRef({ forward: false, back: false, left: false, right: false, turnLeft: false, turnRight: false });
  const state = useRef({ started: false, found: false });
  useEffect(() => { state.current = { started, found }; }, [started, found]);
  useEffect(() => {
    const el = mount.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false }); }
    catch { setError("This exploration needs WebGL. Try a browser with hardware acceleration enabled."); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x010503); scene.fog = new THREE.Fog(0x010503, 12, 42);
    const explorationFog = scene.fog;
    const camera = new THREE.PerspectiveCamera(55, 1, 0.08, 65);
    camera.position.set(11.4, EYE, 34);
    camera.rotation.order = "YXZ";
    const planCamera = new THREE.OrthographicCamera(-24, 24, 24, -24, 0.1, 100);
    planCamera.position.set(16, 55, 20); planCamera.up.set(0, 0, -1); planCamera.lookAt(16, 0, 20);
    let buildingFloor: number | null = null;
    const wallMat = new THREE.MeshBasicMaterial({ color: 0x03140b });
    const lineMat = new THREE.LineBasicMaterial({ color: 0x198a4a, transparent: true, opacity: 0.65 });
    const colliders: Block[] = [];
    const wallLines: { ax:number; az:number; bx:number; bz:number; floor:number }[] = [];
    function box(x: number, y: number, z: number, w: number, h: number, d: number) {
      const geo = new THREE.BoxGeometry(w, h, d); const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineMat)); mesh.userData.floor = buildingFloor; scene.add(mesh);
    }
    function label(text: string, x: number, y: number, z: number) {
      const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 64;
      const ctx = canvas.getContext("2d")!; ctx.fillStyle = "#69d995"; ctx.font = "26px monospace"; ctx.textAlign = "center"; ctx.fillText(text, 256, 42);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true })); sprite.position.set(x, y, z); sprite.scale.set(3.5, 0.45, 1); sprite.userData.floor = buildingFloor; sprite.userData.label = true; scene.add(sprite);
    }
    const balconyVoids = [{x:1.7,z:16.1,w:8.65,d:3.8},{x:23.3,z:16.35,w:7.4,d:3.5}];
    const inVoid=(x:number,z:number)=>balconyVoids.some(b=>x>b.x&&x<b.x+b.w&&z>b.z&&z<b.z+b.d);
    function wall(ax:number,az:number,bx:number,bz:number,f:number,door=false,name="",wallHeight=HEIGHT) {
      const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz); if(len<0.01)return;
      const parts=door?[[0,Math.max(0,len/2-0.6)],[Math.min(len,len/2+0.6),len]]:[[0,len]];
      for(const [from,to] of parts){if(to-from<0.01)continue;const geo=new THREE.BoxGeometry(to-from,wallHeight,0.12);const mesh=new THREE.Mesh(geo,wallMat);mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),lineMat));mesh.position.set(ax+dx/len*(from+to)/2,f*HEIGHT+wallHeight/2,az+dz/len*(from+to)/2);mesh.rotation.y=-Math.atan2(dz,dx);mesh.userData.floor=f;scene.add(mesh);wallLines.push({ax:ax+dx/len*from,az:az+dz/len*from,bx:ax+dx/len*to,bz:az+dz/len*to,floor:f});}
      if(door){
        const mx=(ax+bx)/2,mz=(az+bz)/2;
        // Door header and glowing jambs leave a genuine walk-through opening.
        for(const side of [-1,1])box(mx+dx/len*side*0.61-0.035,f*HEIGHT,mz+dz/len*side*0.61-0.035,0.07,2.25,0.07);
        const header=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.12,0.16),wallMat);header.position.set(mx,f*HEIGHT+2.3,mz);header.rotation.y=-Math.atan2(dz,dx);header.userData.floor=f;scene.add(header);
        label(name,mx,f*HEIGHT+2.7,mz);
        // Top-down door threshold, visible in plan inspection.
        const threshold=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(mx-dx/len*0.6,f*HEIGHT+0.03,mz-dz/len*0.6),new THREE.Vector3(mx+dx/len*0.6,f*HEIGHT+0.03,mz+dz/len*0.6)]),new THREE.LineBasicMaterial({color:0x7afcc0}));threshold.userData.floor=f;scene.add(threshold);
      }
    }
    for(let f=0;f<2;f++){
      buildingFloor=f;
      const outline=OUTLINES[f];
      const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x*0.05,-z*0.05)));
      if(f===1){const hole=new THREE.Path();hole.absarc(16.3,-13.85,3.65,0,Math.PI*2,true);shape.holes.push(hole);}
      const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);
      const slab=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x031009,side:THREE.DoubleSide}));slab.position.y=f*HEIGHT;slab.userData.floor=f;scene.add(slab);
      const ceilingShape = new THREE.Shape(OUTLINES[1].map(([x,z])=>new THREE.Vector2(x*0.05,-z*0.05)));
      if(f===0){const opening=new THREE.Path();opening.absarc(16.3,-13.85,3.65,0,Math.PI*2,true);ceilingShape.holes.push(opening);}
      const ceilingGeo=new THREE.ShapeGeometry(ceilingShape);ceilingGeo.rotateX(-Math.PI/2);
      const ceiling = new THREE.Mesh(ceilingGeo,new THREE.MeshBasicMaterial({color:0x020905,side:THREE.DoubleSide}));
      ceiling.position.y=(f+1)*HEIGHT;ceiling.userData.floor=f;ceiling.userData.ceiling=true;scene.add(ceiling);
      const grid=new THREE.GridHelper(36,72,0x0d361e,0x072313);grid.position.set(16,f*HEIGHT+0.01,20);grid.userData.floor=f;scene.add(grid);
      outline.forEach(([x,z],i)=>{const [nx,nz]=outline[(i+1)%outline.length];const midX=(x+nx)*0.025,midZ=(z+nz)*0.025; const balconyEdge=f===1&&midZ>16&&midZ<20.1&&(midX<10.5||midX>23.2); const tall=f===0&&midZ>15&&midZ<20.5; wall(x*0.05,z*0.05,nx*0.05,nz*0.05,f,false,"",balconyEdge?1.1:tall?HEIGHT*2:HEIGHT);});
      for(const room of ROOMS[f]){
        room.points.forEach(([x,z],i)=>{const [nx,nz]=room.points[(i+1)%room.points.length];wall(x*0.05,z*0.05,nx*0.05,nz*0.05,f,i===room.door&&!/OFFICES|MAINTENANCE|^CAE$/.test(room.name),room.name);});
        const cx=room.points.reduce((n,p)=>n+p[0],0)/room.points.length*0.05,cz=room.points.reduce((n,p)=>n+p[1],0)/room.points.length*0.05;label(room.name,cx,f*HEIGHT+0.3,cz);
      }
      for(const [x,z] of (f===0?[[176,99],[477,97],[141,242],[282,250],[366,245],[322,389]]:[[230,85],[458,82],[429,250],[163,523],[405,529],[154,705],[589,701]])){box(x*0.05,f*HEIGHT,z*0.05,0.6,3.2,0.6);colliders.push({x:x*0.05,z:z*0.05,w:0.6,d:0.6,floor:f});}
      box(14.6,f*HEIGHT,13.8,3.4,2.6,1.5);colliders.push({x:14.6,z:13.8,w:3.4,d:1.5,floor:f});label("CENTRAL ELEVATOR",16.3,f*HEIGHT+2.8,14.5);
      label(f===0?"LEARNING COMMONS":"REFERENCE STACKS",16,f*HEIGHT+1,7);
      label(f===0?"CIRCULATION":"CAE / STUDY AREA",16,f*HEIGHT+1,20);
    }
    for(const b of balconyVoids){buildingFloor=1;box(b.x,HEIGHT*2-0.12,b.z,b.w,0.12,b.d);const cap=scene.children[scene.children.length-1];cap.userData.ceiling=true;}
    buildingFloor=1; box(12.5,HEIGHT-0.12,12.7,1.8,0.12,1.3);
    buildingFloor=null;
    // Curved stair flight wraps around the central elevator, as on the supplied plan.
    const STAIR_START=0, STAIR_END=Math.PI, INNER=2.15, OUTER=3.5;
    for(let n=0;n<40;n++){
      const a=STAIR_START+n/40*Math.PI,b=STAIR_START+(n+1)/40*Math.PI;
      const shape=new THREE.Shape();shape.moveTo(16.3+Math.cos(a)*INNER,-(13.85+Math.sin(a)*INNER));shape.lineTo(16.3+Math.cos(a)*OUTER,-(13.85+Math.sin(a)*OUTER));shape.absarc(16.3,-13.85,OUTER,-a,-b,true);shape.lineTo(16.3+Math.cos(b)*INNER,-(13.85+Math.sin(b)*INNER));shape.absarc(16.3,-13.85,INNER,-b,-a,false);
      const geo=new THREE.ExtrudeGeometry(shape,{depth:0.11,bevelEnabled:false});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,wallMat);mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),lineMat));mesh.position.y=n/40*HEIGHT;scene.add(mesh);
      for(const r of [INNER,OUTER])box(16.3+Math.cos(a)*r,n/40*HEIGHT,13.85+Math.sin(a)*r,0.04,0.95,0.04);
    }
    label("CURVED STAIRS ↑",19.2,2.5,13.2);label("CURVED STAIRS ↓",13.3,HEIGHT+2.5,13.2);
    function stairAt(x:number,z:number){const dx=x-16.3,dz=z-13.85,r=Math.hypot(dx,dz),angle=Math.atan2(dz,dx);return r>INNER+0.18&&r<OUTER-0.18&&angle>=STAIR_START&&angle<=STAIR_END?angle/Math.PI:null;}
    let yaw=0,pitch=0,raf=0,last=0,lastPing=0,currentFloor=0,dead=false,pinging=false;
    const keys = new Set<string>();
    const down=(e:KeyboardEvent)=>{if(document.activeElement===renderer.domElement||document.pointerLockElement===renderer.domElement){if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)){e.preventDefault();keys.add(e.code);}}};
    const up=(e:KeyboardEvent)=>keys.delete(e.code);
    const clear=()=>{keys.clear();Object.keys(controls.current).forEach(k=>{controls.current[k as keyof typeof controls.current]=false;});};
    const look=(e:MouseEvent)=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*0.002;pitch=THREE.MathUtils.clamp(pitch-e.movementY*0.002,-1.2,1.2);}};
    const lock=()=>{setLocked(document.pointerLockElement===renderer.domElement);clear();};
    const click=()=>{if(state.current.started&&!state.current.found&&!inspection.current.overview){renderer.domElement.focus();renderer.domElement.requestPointerLock?.();}};
    const resize=()=>{renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();const aspect=el.clientWidth/el.clientHeight;planCamera.left=-22*aspect;planCamera.right=22*aspect;planCamera.top=22;planCamera.bottom=-22;planCamera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(el);resize();
    addEventListener("keydown",down);addEventListener("keyup",up);addEventListener("mousemove",look);addEventListener("blur",clear);document.addEventListener("pointerlockchange",lock);renderer.domElement.addEventListener("click",click);
    function walk(x:number,z:number){
      if(!inside(x/0.05,z/0.05,OUTLINES[currentFloor]))return false;
      const rooms=ROOMS[currentFloor],restricted=(name:string)=>/OFFICES|MAINTENANCE|^CAE$/.test(name);
      const permittedRoom=rooms.some(r=>!restricted(r.name)&&inside(x/0.05,z/0.05,r.points));
      if(!permittedRoom&&rooms.some(r=>restricted(r.name)&&inside(x/0.05,z/0.05,r.points)))return false;
      if(currentFloor===1&&inVoid(x,z))return false;
      const stair=stairAt(x,z),old=stairAt(camera.position.x,camera.position.z);
      const candidateHeight=stair===null?currentFloor*HEIGHT:stair*HEIGHT;
      if(Math.abs(candidateHeight-(camera.position.y-EYE))>0.3)return false;
      if(currentFloor===1&&stair===null&&Math.hypot(x-16.3,z-13.85)<3.65&&!(x<14.4&&z<13.9))return false;
      if(stair!==null&&old===null&&stair>0.07&&stair<0.93)return false;
      if(colliders.some(b=>b.floor===currentFloor&&x>b.x-0.2&&x<b.x+b.w+0.2&&z>b.z-0.2&&z<b.z+b.d+0.2))return false;
      return !wallLines.some(b=>{if(b.floor!==currentFloor)return false;const dx=b.bx-b.ax,dz=b.bz-b.az,t=THREE.MathUtils.clamp(((x-b.ax)*dx+(z-b.az)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-b.ax-t*dx,z-b.az-t*dz)<0.23;});
    }
    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,0.04);last=now;
      if(state.current.started&&!state.current.found&&!inspection.current.overview){
        const c=controls.current; yaw+=((keys.has("ArrowLeft")||c.turnLeft?1:0)-(keys.has("ArrowRight")||c.turnRight?1:0))*dt*1.6;
        const forward=(keys.has("KeyW")||keys.has("ArrowUp")||c.forward?1:0)-(keys.has("KeyS")||keys.has("ArrowDown")||c.back?1:0);
        const side=(keys.has("KeyD")||c.right?1:0)-(keys.has("KeyA")||c.left?1:0);
        const speed=dt*3/Math.max(1,Math.hypot(forward,side));
        const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed;
        if(walk(camera.position.x+dx,camera.position.z))camera.position.x+=dx;
        if(walk(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
        const progress=stairAt(camera.position.x,camera.position.z);const onStairs=progress!==null;
        if(progress!==null){camera.position.y=EYE+progress*HEIGHT;if(progress>=0.96&&currentFloor!==1){currentFloor=1;setFloor(1);}if(progress<=0.04&&currentFloor!==0){currentFloor=0;setFloor(0);}}
        else camera.position.y=EYE+currentFloor*HEIGHT;
        camera.rotation.set(pitch,yaw,0);
        if(now-lastPing>650&&!pinging){lastPing=now;pinging=true;const x=currentFloor===1&&!onStairs?(camera.position.x-14.4)*20+312:2000;const z=currentFloor===1&&!onStairs?(camera.position.z-11.7)*20+175:2000;
          void live.current.onPing(x,z).then(r=>{if(dead||!r)return;const strength=Math.max(0,Math.min(1,(r.strength-0.7)/0.3));setHeat(strength);if(strength>0.05)sfx.beep(strength>0.6);if(r.found){state.current.found=true;setFound(true);if(document.pointerLockElement===renderer.domElement)document.exitPointerLock();}}).catch(()=>{}).finally(()=>{pinging=false;});}
      }
      const inspect = inspection.current;
      scene.fog = inspect.overview ? null : explorationFog;
      scene.children.forEach(o => { o.visible = inspect.overview ? !o.userData.ceiling && (o.userData.floor == null || o.userData.floor === inspect.floor) : !o.userData.ceiling || o.userData.floor === 1 || currentFloor === 0; if(o.userData.label)o.scale.set(inspect.overview?4:3.5,inspect.overview?0.5:0.45,1); });
      renderer.render(scene, inspect.overview ? planCamera : camera);
    };raf=requestAnimationFrame(frame);
    return()=>{dead=true;cancelAnimationFrame(raf);observer.disconnect();clear();if(document.pointerLockElement===renderer.domElement)document.exitPointerLock();removeEventListener("keydown",down);removeEventListener("keyup",up);removeEventListener("mousemove",look);removeEventListener("blur",clear);document.removeEventListener("pointerlockchange",lock);renderer.domElement.removeEventListener("click",click);scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();if(m.material){for(const mat of Array.isArray(m.material)?m.material:[m.material]){const map=(mat as THREE.MeshBasicMaterial).map;map?.dispose();mat.dispose();}}});renderer.dispose();renderer.domElement.remove();};
  },[]);
  const hold=(key:keyof typeof controls.current)=>(e:React.PointerEvent<HTMLButtonElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);controls.current[key]=true;};
  return <div className="max-w-5xl">
    <div className="mb-3 flex flex-wrap gap-2">
      <button aria-pressed={overview} onClick={() => setOverview(!overview)} className="rounded border border-green-600 px-4 py-2 text-sm text-green-300">{overview ? "Return to first person" : "Inspect top-down layout"}</button>
      {overview && [0,1].map(f => <button key={f} aria-pressed={inspectFloor === f} onClick={() => setInspectFloor(f)} className={`rounded border px-4 py-2 text-sm ${inspectFloor === f ? "border-green-300 text-green-200" : "border-neutral-700 text-neutral-400"}`}>Floor {f+1}</button>)}
    </div>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-green-300"><span>MARX LIBRARY // FLOOR {(overview ? inspectFloor : floor)+1}</span><span>{found?"SIGNAL LOCATED":`SIGNAL ${Math.round(heat*100)}%`}</span></div>
    <div className="relative overflow-hidden rounded-xl border border-green-500/60 bg-black">
      <div ref={mount} className="h-[min(65vh,38rem)] min-h-80 w-full" />
      {!started&&!error&&!overview&&<button onClick={()=>setStarted(true)} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border border-green-400 bg-black/90 px-6 py-3 font-mono text-green-300">Begin exploration</button>}
      {error&&<p role="alert" className="absolute inset-4 bg-black p-4 text-red-300">{error}</p>}
      {started&&!found&&!overview&&<><span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 text-green-300/60">+</span><div className="pointer-events-none absolute bottom-4 right-4 rounded border border-green-700 bg-black/85 p-3 font-mono text-green-400"><div className="relative mx-auto h-20 w-20 rounded-full border border-green-800"><div className="absolute inset-3 rounded-full border border-green-900"/><div className="absolute inset-7 rounded-full bg-green-400" style={{opacity:0.2+heat*0.8}}/><div className="absolute inset-x-0 top-1/2 border-t border-green-900"/></div><p className="mt-2 text-center text-[10px]">{Math.round(heat*100)}% // SCANNING</p></div></>}
    </div>
    <p className="mt-3 text-sm text-neutral-400">{overview ? "TOP-DOWN INSPECTION · North is up · Green blocks are walls/closed rooms · Curved curved central stairs wrap around the elevator. Exploration is paused." : found?"USB signal located. Recover the device below.":locked?"WASD to walk · mouse to look · Esc releases mouse. Follow the curved central stairs to floor two.":"Click the scene for mouse look. WASD to walk, arrow keys to turn. Follow the curved central stairs to floor two."}</p>
    {started&&!found&&<div className="mt-3 flex flex-wrap gap-2">{([['forward','Forward'],['back','Back'],['left','Strafe left'],['right','Strafe right'],['turnLeft','Turn left'],['turnRight','Turn right']] as const).map(([key,label])=><button key={key} className="touch-none rounded border border-green-900 px-3 py-2 text-xs text-green-300" onPointerDown={hold(key)} onPointerUp={()=>controls.current[key]=false} onPointerCancel={()=>controls.current[key]=false}>{label}</button>)}</div>}
    {found&&<button onClick={onKey} className="mt-4 rounded-lg bg-green-400 px-5 py-3 font-semibold text-black">Recover USB</button>}
  </div>;
}
