import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
const stage=document.querySelector('[data-raptor-view]');
if(stage){
 const initial=document.querySelector('.study-dinosaur .dinosaur-focus');initial.querySelector('h3').textContent='Small theropod';initial.querySelector('i').textContent='Interpretive model';
 const notes=document.querySelector('.study-dinosaur .raptor-notes'), notesOriginal=notes.innerHTML; notes.hidden=true;
 let cache={},request=0, selected='small', activeMesh=null, view={yaw:-.3,pitch:.08,zoom:.8,width:400,height:200}, gpu=null;
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
 async function getModel(id){if(cache[id])return cache[id];let root=(await new GLTFLoader().loadAsync(id==='raptor'?'/assets/dinosaur/velociraptor.glb':'/assets/dinosaur/trex.glb')).scene;cache[id]=gpu?normalize(root):meshData(root);return cache[id]}
 stage.addEventListener('dinosaur-selected',async e=>{const id=e.detail,seq=++request;selected=id;if(gpu){if(activeMesh)gpu.pivot.remove(activeMesh);activeMesh=null;gpu.probe.style.display='none';stage.querySelector('.raptor-canvas').style.visibility='visible'}
 const focus=document.querySelector('.study-dinosaur .dinosaur-focus');focus.querySelector('h3').textContent=id==='small'?'Small theropod':id==='trex'?'T. rex':'Velociraptor';focus.querySelector('i').textContent=id==='small'?'Interpretive model':id==='trex'?'Tyrannosaurus rex':'Velociraptor mongoliensis';focus.querySelector('small').innerHTML=id==='trex'?'LATE CRETACEOUS<br>FOSSIL REGION<br>WESTERN NORTH AMERICA':'LATE CRETACEOUS<br>FOSSIL REGION<br>MONGOLIA, ASIA';notes.hidden=id==='small';notes.innerHTML=id==='trex'?'<summary>About this reconstruction</summary><p>Tyrannosaurus rex 3D model by <a href="https://animalanimator.com/free-3d-animated-t-rex-reference/">AnimalAnimator.com</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Textures resized and animation removed.</p>':notesOriginal+'<p>Velociraptor model: <a href="https://sketchfab.com/3d-models/pbr-velociraptor-animated-8f1744af7b0847a2aabe3df90be802f0">Ferocious Industries</a>, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Textures resized and animation removed.</p>';  const region=document.querySelector('.study-dinosaur .pangaea-panel strong');region.textContent=id==='trex'?'North America':'Gobi Desert'; const periods=document.querySelector('.study-dinosaur .dinosaur-periods span');if(periods)periods.textContent=id==='trex'?'NORTH AMERICA':'GOBI REGION';const date=document.querySelectorAll('.study-dinosaur .dinosaur-periods span')[1];if(date)date.textContent=id==='trex'?'~67 MA':'~80 MA';
 if(id==='small'){stage.dispatchEvent(new CustomEvent('dinosaur-data'));return}try{stage.querySelector('.raptor-status').textContent='Loading model.';let data=await getModel(id);if(seq!==request)return;if(gpu){activeMesh=data;gpu.pivot.add(data);gpu.probe.style.display='block';stage.querySelector('.raptor-canvas').style.visibility='hidden';paint()}else stage.dispatchEvent(new CustomEvent('dinosaur-data',{detail:data}));stage.querySelector('.raptor-status').textContent=(id==='raptor'?'Velociraptor':'T. rex')+' model ready.'}catch(err){console.error('Dinosaur model could not load:',err);stage.dispatchEvent(new CustomEvent('dinosaur-data'));stage.querySelector('.raptor-status').textContent='Model could not load; showing small theropod.'}});
}
