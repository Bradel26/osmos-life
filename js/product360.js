/* A9Plus: continuous photo-textured reconstruction from four orthogonal views.
 * Geometry is approximate. No synthesized frames, logos, ports or controls.
 * Coordinates use photo silhouette proportions, scaled to height 419.
 * This is a visual reconstruction, not dimensionally certified CAD.
 */
export const VIEWS = [
  { angle: 0, label: 'Frente', file: 'foto-01-studio.png', crop: [0.289, 0.014, 0.710, 0.970] },
  { angle: 90, label: 'Lateral direita', file: 'foto-02-studio.png', crop: [0.048, 0.096, 0.978, 0.921] },
  { angle: 180, label: 'Traseira', file: 'foto-03-studio.png', crop: [0.286, 0.021, 0.713, 0.966] },
  { angle: 270, label: 'Lateral esquerda', file: 'foto-05-studio.png', crop: [0.019, 0.071, 0.965, 0.924] }
];
export const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;
export const clampZoom = (zoom) => Math.max(1, Math.min(3, zoom));

export function createState() {
  return {
    angle: 0, zoom: 1, panY: 0,
    rotate(delta) { this.angle = normalizeAngle(this.angle + delta); },
    magnify(factor) { this.zoom = clampZoom(this.zoom * factor); this.panY=Math.max(1-this.zoom,Math.min(this.zoom-1,this.panY)); },
    reset() { this.angle = 0; this.zoom = 1; this.panY=0; }
  };
}

// Triangle mesh with outward normals. Front cartridge caps are the two visible
// protrusions from the references; all other details come from the photographs.
export function createMesh() {
  const positions = [], normals = [], parts = [];
  let currentPart=0;
  function triangle(a, b, c) {
    const u = b.map((v, i) => v - a[i]), v = c.map((v, i) => v - a[i]);
    const n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
    const length = Math.hypot(...n);
    if (length < 1e-7) return;
    for (const p of [a, b, c]) { positions.push(...p); normals.push(...n.map((x) => x / length)); parts.push(currentPart); }
  }
  function quad(a, b, c, d) { triangle(a,b,c); triangle(a,c,d); }
  // Rounded rectangle perimeter, with front at +Z, back at -Z.
  const segments = 96, layers = 100;
  function bodyPoint(layer, segment) {
    const y = -209.5 + 419 * layer / layers;
    const end = Math.max(0, Math.abs(y) - 117.5);
    const halfWidth = Math.max(.2, Math.sqrt(Math.max(0, 92*92 - end*end)));
    const bevel = Math.max(0, Math.abs(y) - 194.5);
    const halfDepth = 188 - (15 - Math.sqrt(Math.max(0, 15*15 - bevel*bevel)));
    const radius = Math.min(18, halfWidth);
    const t = (segment % segments) / segments * Math.PI * 2;
    const cosine=Math.cos(t),sine=Math.sin(t);
    const sign=(value)=>Math.abs(value)<1e-9?0:Math.sign(value);
    const x = (halfWidth-radius) * sign(cosine) + radius*cosine;
    const z = (halfDepth-radius) * sign(sine) + radius*sine - 47;
    return [x,y,z];
  }
  for (let j=0; j<layers; j++) for (let i=0; i<segments; i++) {
    quad(bodyPoint(j,i),bodyPoint(j+1,i),bodyPoint(j+1,i+1),bodyPoint(j,i+1));
  }
  for (let i=0;i<segments;i++) {
    triangle([0,-209.5,-25.5],bodyPoint(0,i),bodyPoint(0,i+1));
    triangle([0,209.5,-25.5],bodyPoint(layers,i+1),bodyPoint(layers,i));
  }
  // Positions/radii inferred from the front and side silhouettes, not a CAD model.
  for (const [cy, radius] of [[120,75],[-64,75]]) {
    currentPart++;
    const steps = 128;
    const ring = (i,z,r) => [Math.cos(i/steps*Math.PI*2)*r,cy+Math.sin(i/steps*Math.PI*2)*r,z];
    for(let i=0;i<steps;i++) {
      quad(ring(i,137,radius),ring(i+1,137,radius),ring(i+1,225,radius),ring(i,225,radius));
      quad(ring(i,225,radius),ring(i+1,225,radius),ring(i+1,235,radius-5),ring(i,235,radius-5));
      triangle([0,cy,235],ring(i,235,radius-5),ring(i+1,235,radius-5));
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals), parts: new Float32Array(parts) };
}

export const VERTEX_SHADER = `
attribute vec3 position;
attribute vec3 normal;
attribute float part;
uniform float angle;
uniform vec2 scale;
uniform float panY;
varying vec3 point;
varying vec3 surface;
varying float component;
void main() {
  point = position; surface = normal; component=part;
  float c=cos(angle), s=sin(angle);
  vec3 p=vec3(c*position.x+s*position.z, position.y, -s*position.x+c*position.z);
  gl_Position=vec4(p.x*scale.x, p.y*scale.y+panY, -p.z/700.0, 1.0);
}`;

export const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 point;
varying vec3 surface;
varying float component;
uniform sampler2D frontPhoto;
uniform sampler2D rightPhoto;
uniform sampler2D backPhoto;
uniform sampler2D leftPhoto;
uniform vec4 frontCrop;
uniform vec4 rightCrop;
uniform vec4 backCrop;
uniform vec4 leftCrop;
vec2 uv(vec2 p,vec4 crop) { return mix(crop.xy,crop.zw,clamp(p,0.0,1.0)); }
vec3 foreground(vec3 color,vec3 finish,float edge) {
  // White studio backdrop is not part of the object. Only remove background
  // samples at silhouette edges; central labels and white rear ports stay intact.
  float light=min(color.r,min(color.g,color.b));
  return mix(color,finish,step(0.5,edge)*smoothstep(0.78,0.94,light));
}
void main() {
  vec3 n=normalize(surface);
  // Horizontal surface orientation selects the appropriate reference. Strong
  // weights keep labels crisp on their own face; rounded edges blend smoothly.
  vec4 weights=pow(max(vec4(n.z,-n.x,-n.z,n.x),0.0),vec4(6.0));
  float sum=dot(weights,vec4(1.0));
  if(sum<0.001) { gl_FragColor=vec4(0.23,0.25,0.28,1.0); return; }
  weights/=sum;
  float vertical=(209.5-point.y)/419.0;
  float horizontal=(point.x+92.0)/184.0;
  float lateral=(point.z+235.0)/470.0;
  // Align each photographed protrusion to its own silhouette. Four photographs
  // have small perspective discrepancies; only existing image pixels are used.
  float sideVertical=vertical;
  if(component>0.5) {
    float cy=component<1.5?120.0:-64.0;
    float photoCy=component<1.5?125.0:-4.0;
    sideVertical=(209.5-(photoCy+(point.y-cy)*0.72))/419.0;
  }
  vec3 f=texture2D(frontPhoto,uv(vec2(horizontal,vertical),frontCrop)).rgb;
  vec3 r=texture2D(rightPhoto,uv(vec2(lateral,sideVertical),rightCrop)).rgb;
  vec3 b=texture2D(backPhoto,uv(vec2(1.0-horizontal,vertical),backCrop)).rgb;
  vec3 l=texture2D(leftPhoto,uv(vec2(1.0-lateral,sideVertical),leftCrop)).rgb;
  vec3 finish=texture2D(rightPhoto,uv(vec2(0.4,0.45),rightCrop)).rgb;
  float endEdge=step(vertical,0.04)+step(0.94,vertical);
  float frontEdge=step(horizontal,0.13)+step(0.87,horizontal)+endEdge;
  float sideEdge=step(lateral,0.08)+step(0.76,lateral)+endEdge;
  f=foreground(f,finish,frontEdge); b=foreground(b,finish,frontEdge);
  r=foreground(r,finish,max(sideEdge,component)); l=foreground(l,finish,max(sideEdge,component));
  gl_FragColor=vec4(f*weights.x+r*weights.y+b*weights.z+l*weights.w,1.0);
}`;

export async function mountViewer(root) {
  const canvas=root.querySelector('canvas');
  const poster=root.querySelector('.product360-poster');
  const status=root.querySelector('[data-360-status]');
  const slider=root.querySelector('[data-360-angle]');
  const zoomLabel=root.querySelector('[data-360-zoom]');
  const viewButtons=[...root.querySelectorAll('[data-360-view]')];
  const zoomButtons=[...root.querySelectorAll('[data-360-action="zoom-in"], [data-360-action="zoom-out"]')];
  const rotationButtons=[...root.querySelectorAll('[data-360-action="left"], [data-360-action="right"]')];
  const state=createState();
  let gl, draw, frame=0, ready=false, stopped=false, observer;
  const pointers=new Map();
  function fail(message) {
    ready=false; stopped=true; cancelAnimationFrame(frame);
    canvas.hidden=true; poster.hidden=false;
    root.classList.remove('product360-ready');
    root.classList.add('product360-fallback');
    slider.disabled=true; [...zoomButtons,...rotationButtons].forEach((b)=>b.disabled=true);
    status.textContent=message+' Você pode consultar as quatro vistas pelos botões.';
  }
  function update() {
    slider.value=String(Math.round(state.angle));
    slider.setAttribute('aria-valuetext',Math.round(state.angle)+' graus');
    zoomLabel.textContent=Math.round(state.zoom*100)+'%';
    viewButtons.forEach((button)=> {
      const delta=Math.abs(normalizeAngle(state.angle-Number(button.dataset['360View'])+180)-180);
      button.setAttribute('aria-pressed',delta<1?'true':'false');
    });
    if(!ready||stopped||frame) return;
    frame=requestAnimationFrame(()=> { frame=0; if(ready&&!stopped) draw(); });
  }
  function setView(angle) {
    state.angle=normalizeAngle(angle);
    if(!ready) {
      const view=VIEWS.find((v)=>v.angle===state.angle)||VIEWS[0];
      poster.src=root.dataset.base+view.file; poster.alt='A9Plus — '+view.label;
    }
    update();
  }
  root.addEventListener('click',(event)=> {
    const button=event.target.closest('button');
    if(!button||!root.contains(button)) return;
    if(button.hasAttribute('data-360-view')) return setView(Number(button.dataset['360View']));
    switch(button.dataset['360Action']) {
      case 'left': state.rotate(-15); break;
      case 'right': state.rotate(15); break;
      case 'zoom-in': state.magnify(1.15); break;
      case 'zoom-out': state.magnify(1/1.15); break;
      case 'reset': state.reset(); setView(0); break;
      case 'fullscreen':
        if(document.fullscreenElement===root) document.exitFullscreen?.().catch(()=>{});
        else root.requestFullscreen?.().catch(()=>{ status.textContent='Tela cheia indisponível neste navegador.'; });
        break;
    }
    update();
  });
  slider.addEventListener('input',()=> { state.angle=normalizeAngle(Number(slider.value)); update(); });
  // No momentum: releasing a drag freezes the exact requested angle.
  canvas.addEventListener('pointerdown',(event)=> {
    if(!ready||event.button>0) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    canvas.setPointerCapture(event.pointerId); canvas.classList.add('dragging');
  });
  const pinchDistance=()=> { const p=[...pointers.values()]; return p.length===2?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0; };
  canvas.addEventListener('pointermove',(event)=> {
    const previous=pointers.get(event.pointerId); if(!previous||!ready) return;
    const before=pinchDistance();
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const after=pinchDistance();
    if(before>0&&after>0) state.magnify(after/before);
    else {
      state.rotate((event.clientX-previous.x)/Math.max(240,canvas.clientWidth)*360);
      if(state.zoom>1) state.panY=Math.max(1-state.zoom,Math.min(state.zoom-1,state.panY+(event.clientY-previous.y)/canvas.clientHeight*2));
    }
    update();
  });
  function release(event) {
    pointers.delete(event.pointerId);
    if(!pointers.size) canvas.classList.remove('dragging');
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach((name)=>canvas.addEventListener(name,release));
  canvas.addEventListener('wheel',(event)=> {
    if(!ready) return;
    event.preventDefault(); state.magnify(Math.exp(-Math.max(-100,Math.min(100,event.deltaY))*.002)); update();
  },{passive:false});
  canvas.addEventListener('keydown',(event)=> {
    const actions={ArrowLeft:()=>state.rotate(-5),ArrowRight:()=>state.rotate(5),'+':()=>state.magnify(1.15),'=':()=>state.magnify(1.15),'-':()=>state.magnify(1/1.15),Home:()=>state.reset()};
    if(actions[event.key]) { event.preventDefault(); actions[event.key](); update(); }
  });
  canvas.addEventListener('webglcontextlost',(event)=> { event.preventDefault(); fail('A visualização 360° foi interrompida.'); });
  update();
  try {
    gl=canvas.getContext('webgl',{antialias:true,alpha:false});
    if(!gl) return fail('Visualização 360° indisponível neste dispositivo.');
    function compile(type,source) {
      const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    }
    const program=gl.createProgram();
    const vertex=compile(gl.VERTEX_SHADER,VERTEX_SHADER), fragment=compile(gl.FRAGMENT_SHADER,FRAGMENT_SHADER);
    gl.attachShader(program,vertex); gl.attachShader(program,fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const mesh=createMesh();
    for(const [name,values] of [['position',mesh.positions],['normal',mesh.normals],['part',mesh.parts]]) {
      const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);
      const location=gl.getAttribLocation(program,name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,name==='part'?1:3,gl.FLOAT,false,0,0);
    }
    const samplerNames=['frontPhoto','rightPhoto','backPhoto','leftPhoto'];
    const cropNames=['frontCrop','rightCrop','backCrop','leftCrop'];
    const images=await Promise.all(VIEWS.map((view)=>new Promise((resolve,reject)=> {
      const image=new Image();
      image.onload=()=>resolve(image); image.onerror=()=>reject(new Error('Falha ao carregar fotografia'));
      image.src=root.dataset.base+view.file;
    })));
    if(stopped) return;
    images.forEach((image,index)=> {
      const texture=gl.createTexture(); gl.activeTexture(gl.TEXTURE0+index); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
      gl.uniform1i(gl.getUniformLocation(program,samplerNames[index]),index);
      gl.uniform4fv(gl.getUniformLocation(program,cropNames[index]),VIEWS[index].crop);
    });
    const angleUniform=gl.getUniformLocation(program,'angle'), scaleUniform=gl.getUniformLocation(program,'scale'), panUniform=gl.getUniformLocation(program,'panY');
    gl.enable(gl.DEPTH_TEST); gl.clearColor(1,1,1,1);
    draw=()=> {
      const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight),dpr=Math.min(devicePixelRatio||1,2);
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)) { canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr); }
      gl.viewport(0,0,canvas.width,canvas.height); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(angleUniform,state.angle*Math.PI/180);
      gl.uniform1f(panUniform,state.panY);
      const scale=state.zoom/270;
      gl.uniform2f(scaleUniform,scale/(width/height),scale);
      gl.drawArrays(gl.TRIANGLES,0,mesh.positions.length/3);
    };
    ready=true; slider.disabled=false; [...zoomButtons,...rotationButtons].forEach((b)=>b.disabled=false);
    poster.hidden=true; canvas.hidden=false; root.classList.add('product360-ready');
    status.textContent='Arraste para girar. Use dois dedos ou os botões para ampliar.';
    observer=new ResizeObserver(update); observer.observe(canvas);
    // On-demand frames; no animation loop while the viewer is idle/off screen.
    document.addEventListener('fullscreenchange',update);
    window.addEventListener('pagehide',()=> { stopped=true; cancelAnimationFrame(frame); observer.disconnect(); },{once:true});
    window.addEventListener('pageshow',(event)=> { if(event.persisted&&ready) { stopped=false; observer.observe(canvas); update(); } });
    update();
  } catch(error) {
    console.warn('A9Plus 360:',error.message);
    fail('Não foi possível carregar o giro 360°.');
  }
}

if(typeof document!=='undefined') {
  const root=document.querySelector('[data-product360]');
  if(root) {
    // Keep the front photograph visible until the viewer is approached.
    if('IntersectionObserver' in window) {
      const observer=new IntersectionObserver((entries)=> {
        if(entries.some((entry)=>entry.isIntersecting)) { observer.disconnect(); void mountViewer(root); }
      },{rootMargin:'300px'});
      observer.observe(root);
    } else void mountViewer(root);
  }
}
