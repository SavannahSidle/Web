import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
const stage=document.querySelector('[data-raptor-view]');
if(stage){
 const initial=document.querySelector('.study-dinosaur .dinosaur-focus');initial.querySelector('h3').textContent='Small theropod';initial.querySelector('i').textContent='Interpretive model';
 const notes=document.querySelector('.study-dinosaur .raptor-notes'), notesOriginal=notes.innerHTML; notes.hidden=true;
 let cache={},request=0, selected='raptor', activeMesh=null, view={yaw:-.3,pitch:.08,zoom:.8,width:400,height:200}, gpu=null;
 // Prefer textured WebGL; preserve the existing canvas as a fallback.
 try {
  const probe=document.createElement('canvas'); const gl=probe.getContext('webgl2',{alpha:true,antialias:true});
  if(gl){probe.className='dino-webgl';probe.setAttribute('aria-hidden','true');probe.style.display='none';stage.insertBefore(probe,stage.querySelector('.raptor-canvas').nextSibling);
   const renderer=new THREE.WebGLRenderer({canvas:probe,context:gl,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
   const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xf7eee0,0x4b5048,2));const lamp=new THREE.DirectionalLight(0xffffff,2.1);lamp.position.set(-3,5,7);scene.add(lamp);
   const pivot=new THREE.Group();scene.add(pivot);const camera=new THREE.OrthographicCamera(-2,2,1,-1,.01,100);camera.position.set(0,.25,8);camera.lookAt(0,.25,0);gpu={probe,renderer,scene,pivot,camera};
  }
 }catch(e){console.warn('3D acceleration unavailable; using canvas fallback.',e)}
 function normalize(root){root.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());const wrap=new THREE.Group();root.position.sub(center);wrap.add(root);if(size.z>size.x)wrap.rotation.y=Math.PI/2;wrap.scale.setScalar(2.9/Math.max(size.x,size.z));return wrap}
 function paint(){if(!gpu||!activeMesh||selected==='small')return;const {width,height,yaw,pitch,zoom}=view;const aspect=width/height, span=Math.max(2.7,4.2/aspect)*(.8/zoom);gpu.renderer.setSize(width,height,false);Object.assign(gpu.camera,{left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2});gpu.camera.updateProjectionMatrix();gpu.pivot.rotation.set(pitch,yaw,0,'YXZ');gpu.renderer.render(gpu.scene,gpu.camera)}
 stage.addEventListener('dinosaur-view',e=>{view=e.detail;paint()});
 function meshData(root){
  root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(root),center=box.getCenter(new THREE.Vector3()), size=box.getSize(new THREE.Vector3()), alongZ=size.z>size.x, scale=3.25/Math.max(size.x,size.z);
  const vertices=[],faces=[],v=new THREE.Vector3();
  root.traverse(o=>{if(!o.isMesh||!o.geometry.attributes.position)return;
   const geo=o.geometry, pos=geo.attributes.position, idx=geo.index, start=vertices.length;
   for(let i=0;i<pos.count;i++){
    if(o.isSkinnedMesh)o.getVertexPosition(i,v); else v.fromBufferAttribute(pos,i);
    v.applyMatrix4(o.matrixWorld).sub(center); const x=(alongZ?v.z:v.x)*scale, z=(alongZ?-v.x:v.z)*scale;
    vertices.push([x-.8,v.y*scale,z]);
   }
   const mat=Array.isArray(o.material)?o.material[0]:o.material; const base=mat?.color||new THREE.Color('#776c5d'); let tex=null; const img=mat?.map?.image;
   if(img&&geo.attributes.uv){try {const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0);tex={data:cx.getImageData(0,0,cv.width,cv.height).data,w:cv.width,h:cv.height,uv:geo.attributes.uv}}catch(e){console.warn('Texture unavailable',e)}}
   const vc=geo.attributes.color; let count=idx?idx.count:pos.count;
   for(let j=0;j+2<count;j+=3){const a=idx?idx.getX(j):j,b=idx?idx.getX(j+1):j+1,c=idx?idx.getX(j+2):j+2;let color=base.clone();
    if(vc)color.setRGB((vc.getX(a)+vc.getX(b)+vc.getX(c))/3,(vc.getY(a)+vc.getY(b)+vc.getY(c))/3,(vc.getZ(a)+vc.getZ(b)+vc.getZ(c))/3);
    if(tex){let u=(tex.uv.getX(a)+tex.uv.getX(b)+tex.uv.getX(c))/3,v=(tex.uv.getY(a)+tex.uv.getY(b)+tex.uv.getY(c))/3;let x=Math.min(tex.w-1,Math.max(0,Math.floor(u*tex.w))),y=Math.min(tex.h-1,Math.max(0,Math.floor((1-v)*tex.h))),p=(y*tex.w+x)*4;color.setRGB(tex.data[p]/255,tex.data[p+1]/255,tex.data[p+2]/255,THREE.SRGBColorSpace)}
    faces.push({a:start+a,b:start+b,c:start+c,color:'#'+color.getHexString(),feather:false});
   }
  });
  return {vertices,faces};
 }
 function custom(id){
  const g=new THREE.Group(), mat=(c,r=.82)=>new THREE.MeshStandardMaterial({color:c,roughness:r,flatShading:true});
  const skin=mat(({triceratops:'#79584a',stegosaurus:'#7c503e',pteranodon:'#78827d',brontosaurus:'#82634a',dimorphodon:'#62534e',compy:'#79503a'})[id]);
  const pale=mat('#c2a982'), dark=mat('#302c28'), sail=mat('#8e5140'), eye=mat('#d2a45d');
  const ell=(x,y,z,a,b,c,m=skin)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),m);o.position.set(x,y,z);o.scale.set(a,b,c);g.add(o);return o};
  const limb=(a,b,r1,r2,m=skin)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),12),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o};
  const horn=(a,b,r,m=pale)=>limb(a,b,r,.002,m);
  const eyePair=(x,y,z)=>[-1,1].forEach(s=>{ell(x,y,z*s,.052,.052,.025,eye);ell(x+.01,y,z*s*1.14,.022,.03,.014,dark)});
  if(id==='triceratops'||id==='stegosaurus'||id==='brontosaurus'){
   ell(-.05,.9,0,.95,.58,.48); for(const x of [-.62,.62])for(const z of [-.31,.31])limb([x,.85,z],[x-.03,.12,z],.19,.12);
   if(id==='triceratops'){ell(.93,.95,0,.52,.38,.38);ell(1.1,1.16,0,.28,.46,.43,pale);horn([.98,1.2,.25],[1.06,1.82,.28],.12);horn([.98,1.2,-.25],[1.06,1.82,-.28],.12);horn([1.28,.99,0],[1.66,1.14,0],.13);eyePair(1.05,1.18,.34);limb([1.12,.78,0],[1.4,.72,0],.04,.02,dark)}
   if(id==='stegosaurus'){ell(1.05,.93,0,.35,.22,.25);for(let i=0;i<8;i++){const x=-.75+i*.22;horn([x,1.28,0],[x-.05,1.75+(i%2)*.12,0],.17,mat(i%2?'#81503c':'#a56548'))}limb([-.88,.95,0],[-2,.67,0],.17,.018);for(let i=0;i<4;i++)horn([-1.5-i*.12,.7,(i%2?1:-1)*.08],[-1.58-i*.12,1.02,(i%2?1:-1)*.25],.07);eyePair(1.27,1.05,.23)}
   if(id==='brontosaurus'){ell(1.07,.96,0,.4,.22,.24);limb([.55,1.15,0],[1.05,1.75,0],.2,.14);limb([1.05,1.75,0],[1.45,2.55,0],.14,.1);ell(1.54,2.62,0,.25,.16,.16);eyePair(1.66,2.67,.14);limb([-.83,1,0],[-2,.98,0],.24,.012)}
  } else if(id==='pteranodon'||id==='dimorphodon'){
   ell(-.08,1.12,0,.4,.3,.32);limb([.12,1.22,0],[.7,1.9,0],.15,.08);ell(.82,2,0,id==='pteranodon'?.48:.38,.16,.14);limb([.85,2,0],[id==='pteranodon'?2.1:1.65,2,0],.07,.003,pale);eyePair(.77,2.04,.13);
   if(id==='pteranodon')horn([.47,2.08,0],[-.15,2.62,0],.14);else {ell(.2,1.95,0,.22,.28,.2);horn([.27,2.18,0],[-.25,2.68,0],.17);limb([.82,1.8,0],[.1,1.72,0],.04,.025,dark)}
   for(const s of [-1,1]){limb([-.24,1.12,s*.2],[-.5,.3,s*.45],.1,.07);limb([-.5,.3,s*.45],[-.1,.12,s*.42],.07,.04);limb([.05,1.25,s*.18],[-.1,.8,s*1.05],.08,.045);limb([-.1,.8,s*1.05],[-.45,.36,s*1.85],.045,.015);limb([-.45,.36,s*1.85],[.88,.16,s*1.55],.018,.005,mat('#a79b87'));}
   limb([-.42,1.12,0],[-1.9,.8,0],.1,.008);
  } else if(id==='compy'){
   ell(-.1,.95,0,.48,.3,.25);limb([.2,1.03,0],[.56,1.46,0],.12,.08);ell(.7,1.52,0,.24,.15,.14);limb([.82,1.51,0],[1.26,1.44,0],.06,.012,dark);eyePair(.73,1.56,.13);limb([-.46,.96,0],[-1.9,.85,0],.12,.005);for(const s of [-1,1]){limb([-.35,.85,s*.13],[-.05,.25,s*.17],.1,.07);limb([-.05,.25,s*.17],[.25,.1,s*.2],.07,.035);limb([.18,1,s*.18],[.48,.72,s*.32],.055,.025)}
  }
  return g;
 }
 const customIds=['triceratops','stegosaurus','pteranodon','brontosaurus','dimorphodon','compy'];
 async function getModel(id){if(cache[id])return cache[id];if(customIds.includes(id)){const root=custom(id);cache[id]=gpu?normalize(root):meshData(root);return cache[id]}let root=(await new GLTFLoader().loadAsync(id==='raptor'?'/assets/dinosaur/velociraptor.glb':'/assets/dinosaur/trex.glb')).scene;cache[id]=gpu?normalize(root):meshData(root);return cache[id]}
 stage.addEventListener('dinosaur-selected',async e=>{const id=e.detail,seq=++request;selected=id;if(gpu){if(activeMesh)gpu.pivot.remove(activeMesh);activeMesh=null;gpu.probe.style.display='none';stage.querySelector('.raptor-canvas').style.visibility='visible'}
 const meta={raptor:['Velociraptor','Velociraptor mongoliensis','LATE CRETACEOUS<br>FOSSIL REGION<br>MONGOLIA, ASIA','Gobi Desert','GOBI REGION','~80 MA'],trex:['T. rex','Tyrannosaurus rex','LATE CRETACEOUS<br>WESTERN NORTH AMERICA','North America','NORTH AMERICA','~67 MA'],triceratops:['Triceratops','Triceratops horridus','LATE CRETACEOUS<br>WESTERN NORTH AMERICA','North America','NORTH AMERICA','~68 MA'],stegosaurus:['Stegosaurus','Stegosaurus stenops','LATE JURASSIC<br>WESTERN NORTH AMERICA','Morrison Formation','NORTH AMERICA','~150 MA'],pteranodon:['Pteranodon','Pteranodon longiceps · pterosaur','LATE CRETACEOUS<br>WESTERN NORTH AMERICA','North America','NORTH AMERICA','~85 MA'],brontosaurus:['Brontosaurus','Brontosaurus excelsus','LATE JURASSIC<br>WESTERN NORTH AMERICA','Morrison Formation','NORTH AMERICA','~150 MA'],dimorphodon:['Dimorphodon','Dimorphodon macronyx · pterosaur','EARLY JURASSIC<br>ENGLAND','Dorset','EUROPE','~195 MA'],compy:['Compy','Compsognathus longipes','LATE JURASSIC<br>BAVARIA, GERMANY','Solnhofen','EUROPE','~150 MA']};const m=meta[id]||meta.raptor;const focus=document.querySelector('.study-dinosaur .dinosaur-focus');focus.querySelector('h3').textContent=m[0];focus.querySelector('i').textContent=m[1];focus.querySelector('small').innerHTML=m[2];notes.innerHTML='<summary>About this reconstruction</summary><p>Interpretive 3D model based on the selected concept image.</p>';const region=document.querySelector('.study-dinosaur .pangaea-panel strong');region.textContent=m[3];const periods=document.querySelector('.study-dinosaur .dinosaur-periods span');if(periods)periods.textContent=m[4];const date=document.querySelectorAll('.study-dinosaur .dinosaur-periods span')[1];if(date)date.textContent=m[5];
 try{stage.querySelector('.raptor-status').textContent='Loading model.';let data=await getModel(id);if(seq!==request)return;if(gpu){activeMesh=data;gpu.pivot.add(data);gpu.probe.style.display='block';stage.querySelector('.raptor-canvas').style.visibility='hidden';paint()}else stage.dispatchEvent(new CustomEvent('dinosaur-data',{detail:data}));stage.querySelector('.raptor-status').textContent=(meta[id]||meta.raptor)[0]+' model ready.'}catch(err){console.error('Dinosaur model could not load:',err);stage.dispatchEvent(new CustomEvent('dinosaur-data'));stage.querySelector('.raptor-status').textContent='Model could not load. Please reselect the specimen.'}});
}
