import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
const stage=document.querySelector('[data-raptor-view]');
if(stage){
 const initial=document.querySelector('.study-dinosaur .dinosaur-focus');
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
  const g=new THREE.Group(), mat=(c,r=.82)=>new THREE.MeshStandardMaterial({color:c,roughness:r,flatShading:false});
  const skin=mat(({triceratops:'#a46b4c',stegosaurus:'#927052',pteranodon:'#78827d',brontosaurus:'#82634a',dimorphodon:'#62534e',compy:'#79503a'})[id]);
  if(id==='triceratops'||id==='stegosaurus'){
   // Procedural hide pattern follows the owner-provided concept sheet's earthy mottling.
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');
   const colors=id==='triceratops'?['#a66b4d','#88563f','#bd8761','#59463a','#d1a27a']:['#927052','#755a43','#ae8860','#564937','#c09a70'];
   c.fillStyle=colors[0];c.fillRect(0,0,512,256);let seed=id==='triceratops'?413:801;const rnd=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
   for(let i=0;i<600;i++){const r=2+rnd()*17;c.globalAlpha=.08+rnd()*.24;c.fillStyle=colors[1+Math.floor(rnd()*4)];c.beginPath();c.ellipse(rnd()*512,rnd()*256,r*1.5,r*.65,rnd()*Math.PI,0,Math.PI*2);c.fill()}
   for(let row=0;row<5;row++)for(let col=0;col<38;col++){c.globalAlpha=.13;c.fillStyle=colors[(row+col)%colors.length];c.beginPath();c.ellipse(col*14+rnd()*7,row*48+rnd()*17,3+rnd()*3,2+rnd()*2,0,0,Math.PI*2);c.fill()}
   const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,1.4);skin.map=tex;skin.color.set('#ffffff');skin.needsUpdate=true;
  }
  const pale=mat('#c2a982'), dark=mat('#302c28'), sail=mat('#8e5140'), eye=mat('#d2a45d'), belly=mat(id==='triceratops'?'#c2a07e':'#b69a75');
  const ell=(x,y,z,a,b,c,m=skin)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(1,36,26),m);o.position.set(x,y,z);o.scale.set(a,b,c);g.add(o);return o};
  const limb=(a,b,r1,r2,m=skin)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),20,4),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o};
  const tube=(points,radii,m=skin)=>{const pts=points.map(p=>new THREE.Vector3(...p)),curve=new THREE.CatmullRomCurve3(pts),geo=new THREE.TubeGeometry(curve,32,radii[0],12,false),p=geo.attributes.position;for(let i=0;i<=32;i++){const t=i/32,j=Math.min(radii.length-2,Math.floor(t*(radii.length-1))),f=t*(radii.length-1)-j,r=radii[j]*(1-f)+radii[j+1]*f,center=curve.getPointAt(t);for(let k=0;k<=12;k++){const n=i*13+k,v=new THREE.Vector3().fromBufferAttribute(p,n);v.sub(center).multiplyScalar(r/radii[0]).add(center);p.setXYZ(n,v.x,v.y,v.z)}}geo.computeVertexNormals();const o=new THREE.Mesh(geo,m);g.add(o);return o};
  const horn=(a,b,r,m=pale)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),o=new THREE.Mesh(new THREE.ConeGeometry(r,d.length(),20,4),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o};
  const plate=(x,height,depth,color)=>{const shape=new THREE.Shape();shape.moveTo(-.2,0);shape.quadraticCurveTo(-.3,height*.45,-.06,height);shape.quadraticCurveTo(.02,height*1.04,.12,height*.78);shape.quadraticCurveTo(.28,height*.25,.2,0);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035});const o=new THREE.Mesh(geo,mat(color));o.position.set(x,.93,-depth/2);g.add(o);return o};
  const eyePair=(x,y,z)=>[-1,1].forEach(s=>{ell(x,y,z*s,.052,.052,.025,eye);ell(x+.01,y,z*s*1.14,.022,.03,.014,dark)});
  if(id==='triceratops'||id==='stegosaurus'||id==='brontosaurus'){
   ell(-.05,.92,0,1.02,.58,.52);ell(-.22,.66,0,.69,.31,.45,belly);ell(.50,1.02,0,.49,.49,.51);ell(-.68,1.01,0,.48,.43,.49);
   for(const z of [-.35,.35])for(const rear of [true,false]){const x=rear?-.65:.52,y=rear?.88:.84,r=rear?.22:.20;ell(x,y,z,r*1.25,.34,r);limb([x,y-.05,z],[x+(rear?.10:-.08),.43,z*1.02],r,.15);ell(x+(rear?.10:-.08),.43,z*1.02,.17,.18,.16);limb([x+(rear?.10:-.08),.43,z*1.02],[x+(rear?.02:-.02),.13,z*1.06],.14,.115);ell(x+(rear?.02:-.02),.13,z*1.06,.20,.09,.19);for(let t=-1;t<=1;t++)ell(x+.12,.075,z*1.06+t*.075,.105,.065,.052)}
   if(id==='triceratops'){
    // Selected mockup 2: wide shield frill, rust-red center and pale scalloped rim.
    ell(.55,1.40,0,.55,.73,.17,pale);ell(.62,1.41,0,.45,.62,.18,mat('#9b6248'));ell(.65,1.39,0,.37,.53,.19,mat('#a96d50'));
    ell(.83,1.10,0,.48,.38,.42);ell(1.08,1.03,0,.38,.29,.32);ell(1.30,.99,0,.30,.21,.26);ell(1.43,.83,0,.34,.11,.24,dark);ell(1.40,.91,0,.32,.11,.25,mat('#ac7656'));ell(1.58,.89,0,.20,.11,.16,mat('#d2b393'));
    for(const s of [-1,1]){ell(.90,1.18,s*.30,.14,.15,.055,mat('#593c31'));ell(.93,1.19,s*.348,.075,.076,.025,eye);ell(.95,1.19,s*.37,.032,.05,.014,dark);horn([.92,1.30,s*.25],[1.27,1.88,s*.34],.145,pale)}
    horn([1.28,1.04,0],[1.65,1.35,0],.105,pale);
    for(let i=0;i<13;i++){const a=-1.30+i*.215;ell(.55+Math.cos(a)*.51,1.40+Math.sin(a)*.68,0,.065,.075,.18,mat(i%3?'#d1b28c':'#79503e'))}
    for(let i=0;i<30;i++){const x=.85+((i*17)%31)/100,y=.88+((i*23)%27)/100,z=i%2?.37:-.37;ell(x,y,z,.022,.018,.018,mat(i%4?'#76503c':'#bd8862'))}
    tube([[.50,1.0,0],[.32,.76,0],[.06,.48,0],[-.20,.34,0]],[.18,.13,.07,.012]);ell(-.02,.48,0,.62,.09,.35,belly);
    for(let i=0;i<17;i++){const x=-.78+i*.09;ell(x,1.39+Math.sin(i*.9)*.035,(i%2?1:-1)*.13,.045,.052,.04,mat(i%3?'#79513d':'#c18a65'))}
    for(const z of [-.22,.22])limb([1.27,.87,z],[1.49,.82,z],.045,.02,dark);
   }
   if(id==='stegosaurus'){
    // Selected mockup 1: low barrel body, narrow head, arched neck and two staggered plate rows.
    tube([[.62,1.02,0],[.88,.91,0],[1.12,.82,0],[1.36,.82,0]],[.25,.20,.13,.09]);ell(1.40,.83,0,.22,.15,.18);ell(1.54,.82,0,.15,.095,.14,mat('#b29573'));eyePair(1.47,.91,.16);
    for(let i=0;i<11;i++){const x=-.86+i*.19,h=.40+(i%3===1?.17:0);plate(x,h,.16,i%3===0?'#ac6c4e':i%3===1?'#8a563f':'#b97955')}
    tube([[-.73,.91,0],[-1.15,.80,0],[-1.62,.75,0],[-2.02,.72,0]],[.22,.15,.075,.012]);
    for(const s of [-1,1]){horn([-1.76,.77,s*.08],[-2.05,.99,s*.38],.095,mat('#d3c19e'));horn([-1.94,.73,s*.07],[-2.24,.82,s*.39],.085,mat('#d3c19e'))}
    for(const z of [-.34,.34])for(const rear of [true,false]){const x=rear?-.60:.52,r=rear?.22:.18;ell(x,.83,z,r*1.2,.30,r);limb([x,.78,z],[x+(rear?-.07:.05),.40,z],r,.145);ell(x+(rear?-.07:.05),.39,z,.16,.16,.15);limb([x+(rear?-.07:.05),.39,z],[x,.12,z],.14,.11);ell(x+.08,.105,z,.22,.095,.18);for(let t=-1;t<=1;t++)ell(x+.20,.065,z+t*.065,.09,.06,.05)}
    ell(-.02,.50,0,.66,.12,.36,belly);
    for(let i=0;i<55;i++){const x=-.73+((i*29)%148)/100,y=.48+((i*31)%74)/100,z=i%2?.43:-.43;ell(x,y,z,.025+(i%3)*.006,.018,.014,mat(i%4?'#614c3a':'#bd9369'))}
   }
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
 if(id==='small'){const f=document.querySelector('.study-dinosaur .dinosaur-focus');f.querySelector('h3').textContent='Small theropod';f.querySelector('i').textContent='Interpretive model';f.querySelector('small').innerHTML='FIELD GUIDE<br>SPECIMEN MODEL<br>SMALL THEROPOD';notes.hidden=true;stage.dispatchEvent(new CustomEvent('dinosaur-data'));stage.querySelector('.raptor-status').textContent='Small theropod model ready.';return}
 const meta={raptor:['Velociraptor','Velociraptor mongoliensis','LATE CRETACEOUS<br>FOSSIL REGION<br>MONGOLIA, ASIA','Gobi Desert','GOBI REGION','~80 MA'],trex:['T. rex','Tyrannosaurus rex','LATE CRETACEOUS<br>WESTERN NORTH AMERICA','North America','NORTH AMERICA','~67 MA'],triceratops:['Triceratops','Triceratops horridus','LATE CRETACEOUS<br>WESTERN NORTH AMERICA','North America','NORTH AMERICA','~68 MA'],stegosaurus:['Stegosaurus','Stegosaurus stenops','LATE JURASSIC<br>WESTERN NORTH AMERICA','Morrison Formation','NORTH AMERICA','~150 MA'],pteranodon:['Pteranodon','Pteranodon longiceps · pterosaur','LATE CRETACEOUS<br>WESTERN NORTH AMERICA','North America','NORTH AMERICA','~85 MA'],brontosaurus:['Brontosaurus','Brontosaurus excelsus','LATE JURASSIC<br>WESTERN NORTH AMERICA','Morrison Formation','NORTH AMERICA','~150 MA'],dimorphodon:['Dimorphodon','Dimorphodon macronyx · pterosaur','EARLY JURASSIC<br>ENGLAND','Dorset','EUROPE','~195 MA'],compy:['Compy','Compsognathus longipes','LATE JURASSIC<br>BAVARIA, GERMANY','Solnhofen','EUROPE','~150 MA']};const m=meta[id]||meta.raptor;const focus=document.querySelector('.study-dinosaur .dinosaur-focus');focus.querySelector('h3').textContent=m[0];focus.querySelector('i').textContent=m[1];focus.querySelector('small').innerHTML=m[2];notes.hidden=false;notes.innerHTML='<summary>About this reconstruction</summary><p>Interpretive 3D model based on the selected concept image.</p>';const region=document.querySelector('.study-dinosaur .pangaea-panel strong');region.textContent=m[3];const periods=document.querySelector('.study-dinosaur .dinosaur-periods span');if(periods)periods.textContent=m[4];const date=document.querySelectorAll('.study-dinosaur .dinosaur-periods span')[1];if(date)date.textContent=m[5];
 try{stage.querySelector('.raptor-status').textContent='Loading model.';let data=await getModel(id);if(seq!==request)return;if(gpu){activeMesh=data;gpu.pivot.add(data);gpu.probe.style.display='block';stage.querySelector('.raptor-canvas').style.visibility='hidden';paint()}else stage.dispatchEvent(new CustomEvent('dinosaur-data',{detail:data}));stage.querySelector('.raptor-status').textContent=(meta[id]||meta.raptor)[0]+' model ready.'}catch(err){console.error('Dinosaur model could not load:',err);stage.dispatchEvent(new CustomEvent('dinosaur-data'));stage.querySelector('.raptor-status').textContent='Model could not load. Please reselect the specimen.'}});
 const chooser=stage.querySelector('[data-dinosaur-select]');if(chooser)stage.dispatchEvent(new CustomEvent('dinosaur-selected',{detail:chooser.value}));
}
