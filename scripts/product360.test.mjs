import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMesh,createState,normalizeAngle,mountViewer,VIEWS } from '../js/product360.js';

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
  return {root,canvas,poster,status,slider,zoom,views,buttons,uniforms,flush,draws:()=>draws};
}

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
