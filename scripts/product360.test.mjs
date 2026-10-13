import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMesh,createState,normalizeAngle,mountViewer,VIEWS,createMeshA10S,A10S_VIEWS,A10S_TOP,A10S_GEOM,A10S_CALIBRATION,a10sBodyVerticals,PROFILES } from '../js/product360.js';

test('360° wrap, exact stop, zoom limits and reset',()=> {
  const state=createState(); state.rotate(-1); assert.equal(state.angle,359);
  state.rotate(721); assert.equal(state.angle,0); state.rotate(42.125); assert.equal(state.angle,42.125);
  state.magnify(20); assert.equal(state.zoom,3); state.magnify(.001); assert.equal(state.zoom,1);
  state.panY=1; state.reset(); assert.deepEqual([state.angle,state.zoom,state.panY],[0,1,0]);
  assert.equal(normalizeAngle(-720),0);
  assert.deepEqual(VIEWS.map(v=>v.angle),[0,90,180,270]);
});

test('closed silhouette side seams and finite unit normals',()=> {
  const mesh=createMesh(); assert.equal(mesh.positions.length,mesh.normals.length);
  assert.equal(mesh.parts.length,mesh.positions.length/3);
  let sideVertices=0;
  for(let i=0;i<mesh.positions.length;i+=3) {
    const [x,y,z]=mesh.positions.slice(i,i+3),[nx,ny,nz]=mesh.normals.slice(i,i+3);
    assert.ok([x,y,z,nx,ny,nz].every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(nx,ny,nz)-1)<1e-5);
    assert.ok(Math.abs(y)<=209.501&&Math.abs(z)<=235.001&&Math.abs(x)<=92.001);
    if(Math.abs(x)>91.9&&Math.abs(y)<117&&Math.abs(nz)<.05) {
      assert.ok(nx*x>0,'side surface must face outwards'); sideVertices++;
    }
  }
  assert.ok(sideVertices>500);
  // Every body vertex on the far side must also appear on the near-side seam.
  const seam=mesh.positions.filter((value,i)=>i%3===2);
  assert.ok(seam.some(z=>z < -234)&&seam.some(z=>z>234));
});

test('A10S profile: five views, superior and tilt limits',()=> {
  assert.deepEqual(A10S_VIEWS.map(v=>v.angle),[0,90,180,270]);
  assert.equal(A10S_TOP.file,'superior.png');
  assert.equal(PROFILES.a10s.samplers.length,5);
  assert.equal(PROFILES.a10s.crops.length,5);
  assert.ok(PROFILES.a10s.tilt.max>PROFILES.a10s.tilt.min);
  assert.equal(PROFILES.a10s.tilt.min,0,'unphotographed underside must never be exposed');
  assert.ok(PROFILES.a10s.tilt.max<=30,'vertical movement must remain a slight inclination');
  assert.equal(PROFILES.a9plus.tilt,null);
});

test('A10S shared band matches landmarks measured in all four source photos',()=> {
  const y=A10S_GEOM.yDeck-.88*(A10S_GEOM.yDeck-A10S_GEOM.yBottom);
  const frontBack=a10sBodyVerticals([0,y,190.5]),side=a10sBodyVerticals([82.5,y,0]);
  for(const [box,v,height,measured] of [
    [A10S_CALIBRATION.frontBody,frontBack[0],1448,1216],
    [A10S_CALIBRATION.backBody,frontBack[2],1448,1222],
    [A10S_CALIBRATION.rightBody,side[1],1254,1054],
    [A10S_CALIBRATION.leftBody,side[3],1254,1079]
  ]) assert.ok(Math.abs((box[1]+v*(box[3]-box[1]))*height-measured)<1,'shared seam must align to the photographed band');
});

test('A10S mesh: closed body, finite unit normals, top deck and domes',()=> {
  const mesh=createMeshA10S();
  assert.equal(mesh.positions.length,mesh.normals.length);
  assert.equal(mesh.parts.length,mesh.positions.length/3);
  let upward=0, outward=0, deck=0, base=0; const parts=new Set();
  const capBounds=new Map([1,2].map(id=>[id,{minY:Infinity,maxY:-Infinity,minZ:Infinity,maxZ:-Infinity}]));
  for(let i=0;i<mesh.positions.length;i+=3) {
    const [x,y,z]=mesh.positions.slice(i,i+3),[nx,ny,nz]=mesh.normals.slice(i,i+3);
    assert.ok([x,y,z,nx,ny,nz].every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(nx,ny,nz)-1)<1e-5);
    assert.ok(Math.abs(x)<=A10S_GEOM.xHalf+.01&&Math.abs(z)<=A10S_GEOM.zHalf+.01&&y<=A10S_GEOM.yTop+.01&&y>=A10S_GEOM.yBottom-.01);
    parts.add(mesh.parts[i/3]);
    const id=mesh.parts[i/3];
    if(id===0&&Math.abs(y-A10S_GEOM.yDeck)<.001&&Math.abs(ny)>0.99) {assert.ok(ny>0,'top deck normal must point up');deck++;}
    if(id===0&&Math.abs(y-A10S_GEOM.yBottom)<.001&&Math.abs(ny)>0.99) {assert.ok(ny<0,'base normal must point down');base++;}
    if(id>0) {
      const bounds=capBounds.get(id);
      bounds.minY=Math.min(bounds.minY,y);bounds.maxY=Math.max(bounds.maxY,y);
      bounds.minZ=Math.min(bounds.minZ,z);bounds.maxZ=Math.max(bounds.maxZ,z);
    }
    if(ny>0.9&&y>150) upward++;                                  // deck + domos olham para cima
    if(Math.abs(nx)>0.8&&Math.abs(nz)<0.3&&Math.abs(ny)<0.3) { assert.ok(nx*x>0,'parede lateral para fora'); outward++; }
  }
  assert.ok(upward>200,'deck/cúpulas devem ter área voltada para cima');
  assert.ok(deck>100&&base>100);
  const small=capBounds.get(1),large=capBounds.get(2);
  assert.ok((small.minZ+small.maxZ)/2>0,'CBPA smaller cap belongs towards the front');
  assert.ok((large.minZ+large.maxZ)/2<0,'ROCB larger cap belongs towards the back');
  assert.ok(small.maxY-small.minY>40&&large.maxY-large.minY>50,'caps must retain photographed height');
  assert.ok(large.maxZ-large.minZ>small.maxZ-small.minZ);
  assert.ok(outward>=40,'paredes laterais planas voltadas para fora');
  assert.deepEqual([...parts].sort(),[0,1,2]);                   // corpo, cúpula ROCB, cúpula CBPA
  const edges=new Map();
  const key=p=>[...p].map(value=>Math.round(value*10000)).join(',');
  for(let i=0;i<mesh.positions.length;i+=9) if(mesh.parts[i/3]===0) {
    const points=[0,3,6].map(offset=>key(mesh.positions.slice(i+offset,i+offset+3)));
    for(let j=0;j<3;j++) {
      const a=points[j],b=points[(j+1)%3],edge=[a,b].sort().join('|');
      const [count,direction]=edges.get(edge)||[0,0];
      edges.set(edge,[count+1,direction+(a<b?1:-1)]);
    }
  }
  for(const [count,direction] of edges.values()) {
    assert.equal(count,2,'every body edge must join exactly two triangles');
    assert.equal(direction,0,'joined triangles must have consistent outward winding');
  }
});

function harnessA10S(webgl=true) {
  const uniforms=new Map(),queue=new Map(); let frame=0,draws=0;
  class El {
    constructor(dataset={}) { this.dataset=dataset;this.events={};this.attrs={};this.classList={add(){},remove(){}};this.clientWidth=720;this.clientHeight=500;this.width=0;this.height=0;this.hidden=false;this.disabled=false; }
    addEventListener(n,h){(this.events[n]||=[]).push(h);} setAttribute(n,v){this.attrs[n]=v;} hasAttribute(n){return n==='data-360-view'&&this.dataset['360View']!==undefined;}
    closest(){return this;} setPointerCapture(){} fire(n,e={}){for(const h of this.events[n]||[])h({preventDefault(){},button:0,...e});}
  }
  const canvas=new El(),poster=new El(),status=new El(),slider=new El(),zoom=new El(),degrees=new El();
  const views=[...A10S_VIEWS.map(v=>new El({'360View':String(v.angle)})),new El({'360View':'top'})];
  const acts=['left','right','tilt-up','tilt-down','zoom-in','zoom-out','reset','fullscreen'];
  const buttons=Object.fromEntries(acts.map(n=>[n,new El({'360Action':n})]));
  const root=new El({base:'/assets/manuais/a10s/',model:'a10s',produto:'A10S'});
  const all=[...views,...Object.values(buttons)];root.contains=(e)=>all.includes(e);
  root.querySelector=(q)=>({canvas,'.product360-poster':poster,'[data-360-status]':status,'[data-360-angle]':slider,'[data-360-zoom]':zoom,'[data-360-degrees]':degrees}[q]);
  root.querySelectorAll=(q)=>q==='[data-360-view]'?views:q.includes('zoom-in')?[buttons['zoom-in'],buttons['zoom-out']]:q.includes('tilt-up')?[buttons['tilt-up'],buttons['tilt-down']]:[buttons.left,buttons.right];
  const gl=new Proxy({uniform1f:(k,v)=>uniforms.set(k,v),uniform2f:(k,...v)=>uniforms.set(k,v),getUniformLocation:(p,k)=>k,getShaderParameter:()=>true,getProgramParameter:()=>true,drawArrays:()=>draws++,getAttribLocation:()=>0},{get:(t,k)=>t[k]||(()=>({}))});
  canvas.getContext=()=>webgl?gl:null;
  globalThis.document=new El();globalThis.window=new El();globalThis.devicePixelRatio=1;
  globalThis.ResizeObserver=class{observe(){}disconnect(){}};
  globalThis.requestAnimationFrame=(fn)=>{queue.set(++frame,fn);return frame;};
  globalThis.cancelAnimationFrame=(id)=>queue.delete(id);
  globalThis.Image=class{set src(v){this.source=v;queueMicrotask(()=>this.onload());}};
  const flush=()=>{for(const [id,fn] of [...queue]){queue.delete(id);fn();}};
  return {root,canvas,poster,status,slider,zoom,degrees,views,buttons,uniforms,flush};
}

test('A10S viewer: tilt via Superior view, vertical drag and reset',async()=> {
  const h=harnessA10S(); await mountViewer(h.root); h.flush();
  assert.equal(h.canvas.hidden,false);
  assert.equal(h.buttons['tilt-up'].disabled,false,'up control is usable after loading');
  assert.equal(h.buttons['tilt-down'].disabled,true,'down control stops before exposing the underside');
  const max=PROFILES.a10s.tilt.max;
  h.root.fire('click',{target:h.views[4]}); h.flush();                 // botão "Superior"
  assert.ok(Math.abs(h.uniforms.get('tilt')-max*Math.PI/180)<1e-6,'Superior inclina ao máximo');
  assert.equal(h.buttons['tilt-up'].disabled,true);
  h.root.fire('click',{target:h.buttons['tilt-down']});h.flush();
  assert.ok(h.uniforms.get('tilt')<max*Math.PI/180,'tilt button must change the camera');
  h.root.fire('click',{target:h.buttons.reset}); h.flush();
  assert.equal(h.uniforms.get('tilt'),0,'reset zera a inclinação');
  h.canvas.fire('pointerdown',{pointerId:1,clientX:100,clientY:100});
  h.canvas.fire('pointermove',{pointerId:1,clientX:100,clientY:260}); h.flush();
  assert.ok(h.uniforms.get('tilt')>0,'arraste vertical inclina');
  const tiltMax=h.uniforms.get('tilt');
  h.canvas.fire('pointermove',{pointerId:1,clientX:100,clientY:900}); h.flush();
  assert.ok(h.uniforms.get('tilt')<=max*Math.PI/180+1e-6&&h.uniforms.get('tilt')>=tiltMax,'inclinação respeita o limite');
  h.canvas.fire('pointerup',{pointerId:1});
  h.canvas.fire('keydown',{key:'Home'});h.flush();
  h.canvas.fire('keydown',{key:'ArrowDown'});h.flush();
  assert.equal(h.uniforms.get('tilt'),0);
  h.slider.value='359.8';h.slider.fire('input');h.flush();
  assert.equal(h.slider.value,'0','rounded angle readout wraps at 360');
  assert.equal(h.degrees.textContent,'0°');
  h.canvas.clientWidth=200;h.canvas.clientHeight=500;
  h.canvas.fire('keydown',{key:'Home'});h.flush();
  assert.ok(381*h.uniforms.get('scale')[0]/2<1,'full rotation fits a narrow embedded viewer');
});

test('A10S mouse grip, pinch/pan and fallback retain the five original views',async()=> {
  let h=harnessA10S();await mountViewer(h.root);h.flush();
  h.canvas.fire('pointerdown',{pointerId:1,clientX:100,clientY:200});
  h.canvas.fire('pointermove',{pointerId:1,clientX:280,clientY:200});h.flush();
  assert.equal(h.slider.value,'270','a rightward grip moves the front surface to the right');
  h.canvas.fire('pointerup',{pointerId:1});
  h.canvas.fire('pointerdown',{pointerId:1,clientX:0,clientY:200});
  h.canvas.fire('pointerdown',{pointerId:2,clientX:100,clientY:200});
  h.canvas.fire('pointermove',{pointerId:2,clientX:200,clientY:200});h.flush();
  assert.equal(h.zoom.textContent,'200%');
  h.canvas.fire('pointermove',{pointerId:2,clientX:200,clientY:230});h.flush();
  assert.ok(h.uniforms.get('panY')>0,'two fingers allow inspecting details after zooming');
  h.root.fire('click',{target:h.views[2]});h.flush();
  h.canvas.fire('webglcontextlost');
  assert.ok(h.poster.src.endsWith('/tras.png'),'context loss must preserve the nearest reference view');
  assert.equal(h.buttons['tilt-up'].disabled,true);
  h=harnessA10S(false);await mountViewer(h.root);
  h.root.fire('click',{target:h.views[4]});
  assert.ok(h.poster.src.endsWith('/superior.png'));
  for(let i=0;i<4;i++) {h.root.fire('click',{target:h.views[i]});assert.ok(h.poster.src.endsWith('/'+A10S_VIEWS[i].file));}
});

function harness(webgl=true) {
  const uniforms=new Map(),queue=new Map(); let frame=0,draws=0;
  class Element {
    constructor(dataset={}) { this.dataset=dataset;this.events={};this.attrs={};this.style={};this.hidden=false;this.disabled=false;this.classList={add(){},remove(){}};this.clientWidth=720;this.clientHeight=500;this.width=0;this.height=0; }
    addEventListener(name,handler) { (this.events[name]||=[]).push(handler); }
    setAttribute(name,value) { this.attrs[name]=value; }
    hasAttribute(name) { return name==='data-360-view'&&this.dataset['360View']!==undefined; }
    closest() { return this; }
    setPointerCapture() {}
    fire(name,event={}) { for(const handler of this.events[name]||[])handler({preventDefault(){},button:0,...event}); }
  }
  const canvas=new Element(),poster=new Element(),status=new Element(),slider=new Element(),zoom=new Element();
  const views=VIEWS.map(v=>new Element({'360View':String(v.angle)}));
  const buttons=Object.fromEntries(['left','right','zoom-in','zoom-out','reset','fullscreen'].map(name=>[name,new Element({'360Action':name})]));
  const root=new Element({base:'/assets/manuais/a9plus/'});
  const all=[...views,...Object.values(buttons)];root.contains=(element)=>all.includes(element);
  root.querySelector=(query)=> ({canvas,'.product360-poster':poster,'[data-360-status]':status,'[data-360-angle]':slider,'[data-360-zoom]':zoom}[query]);
  root.querySelectorAll=(query)=>query==='[data-360-view]'?views:query.includes('zoom-in')?[buttons['zoom-in'],buttons['zoom-out']]:[buttons.left,buttons.right];
  const gl=new Proxy({uniform1f:(key,value)=>uniforms.set(key,value),uniform2f:(key,...value)=>uniforms.set(key,value),getUniformLocation:(program,key)=>key,getShaderParameter:()=>true,getProgramParameter:()=>true,drawArrays:()=>draws++,getAttribLocation:()=>0},{get:(target,key)=>target[key]||(()=>({}))});
  canvas.getContext=()=>webgl?gl:null;
  globalThis.document=new Element();globalThis.window=new Element();globalThis.devicePixelRatio=1;
  globalThis.ResizeObserver=class {observe(){} disconnect(){}};
  globalThis.requestAnimationFrame=(fn)=> {queue.set(++frame,fn);return frame;};
  globalThis.cancelAnimationFrame=(id)=>queue.delete(id);
  globalThis.Image=class { set src(value) { this.source=value;queueMicrotask(()=>this.onload()); } };
  const flush=()=> {for(const [id,fn] of [...queue]) {queue.delete(id);fn();}};
  return {root,canvas,poster,status,slider,zoom,views,buttons,uniforms,flush,gl,draws:()=>draws};
}

test('inactive shader attributes never receive an invalid WebGL location',async()=> {
  const h=harness(),locations=[];
  h.gl.getAttribLocation=(program,name)=>name==='part'?-1:0;
  h.gl.enableVertexAttribArray=location=>locations.push(location);
  await mountViewer(h.root);h.flush();
  assert.equal(h.canvas.hidden,false);
  assert.ok(locations.length>0&&locations.every(location=>location>=0));
});

test('mouse/touch rotation, release, pinch, keyboard, reset and on-demand drawing',async()=> {
  const h=harness(); await mountViewer(h.root);h.flush();
  assert.equal(h.canvas.hidden,false);assert.equal(h.poster.hidden,true);
  h.canvas.fire('pointerdown',{pointerId:1,clientX:100,clientY:200});
  h.canvas.fire('pointermove',{pointerId:1,clientX:280,clientY:200});h.flush();
  assert.equal(Number(h.slider.value),90);
  h.canvas.fire('pointerup',{pointerId:1});const stopped=h.uniforms.get('angle');
  h.canvas.fire('pointermove',{pointerId:1,clientX:600,clientY:200});h.flush();assert.equal(h.uniforms.get('angle'),stopped);
  h.canvas.fire('pointerdown',{pointerId:1,clientX:0,clientY:200});
  h.canvas.fire('pointerdown',{pointerId:2,clientX:100,clientY:200});
  h.canvas.fire('pointermove',{pointerId:2,clientX:200,clientY:200});h.flush();assert.equal(h.zoom.textContent,'200%');
  h.canvas.fire('pointercancel',{pointerId:1});h.canvas.fire('pointercancel',{pointerId:2});
  h.canvas.fire('keydown',{key:'ArrowLeft'});h.flush();assert.equal(Number(h.slider.value),85);
  h.root.fire('click',{target:h.views[2]});h.flush();assert.equal(Number(h.slider.value),180);
  h.root.fire('click',{target:h.buttons.reset});h.flush();assert.equal(h.zoom.textContent,'100%');assert.equal(Number(h.slider.value),0);
  const draws=h.draws();h.flush();assert.equal(h.draws(),draws,'idle viewer must not run an animation loop');
});

test('no WebGL and context loss retain working reference views',async()=> {
  let h=harness(false);await mountViewer(h.root);
  assert.equal(h.canvas.hidden,true);assert.equal(h.poster.hidden,false);assert.equal(h.slider.disabled,true);
  h.root.fire('click',{target:h.views[2]});assert.ok(h.poster.src.endsWith('foto-03-studio.png'));
  h.root.fire('click',{target:h.buttons.reset});assert.ok(h.poster.src.endsWith('foto-01-studio.png'));
  h=harness();await mountViewer(h.root);h.flush();h.canvas.fire('webglcontextlost');
  assert.equal(h.canvas.hidden,true);assert.equal(h.poster.hidden,false);assert.ok(h.status.textContent.includes('interrompida'));
});
