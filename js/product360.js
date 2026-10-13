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

// =============================================================================
// A10S — seção arredondada, CBPA menor à frente, ROCB maior atrás.
// Perfil PRÓPRIO do A10S: nada é reaproveitado da carcaça do A9 PLUS. Cinco
// fotografias (frente, laterais, traseira e SUPERIOR) são projetadas sobre a
// malha; a vista superior habilita a inclinação vertical para revelar o topo.
// Recortes = bounding box real medido em cada foto. Reconstrução aproximada.
// Eixos: frente em +Z (face estreita), eixo longo do corpo ao longo de Z
// (profundidade), eixo curto em X. Topo y=218, deck y=162, base y=-217.5.
export const A10S_VIEWS = [
  { angle: 0,   label: 'Frente',           file: 'frente.png',           crop: [0.276, 0.070, 0.723, 0.922] },
  { angle: 90,  label: 'Lateral direita',  file: 'lateral-direita.png',  crop: [0.106, 0.018, 0.923, 0.969] },
  { angle: 180, label: 'Traseira',         file: 'tras.png',             crop: [0.286, 0.020, 0.713, 0.945] },
  { angle: 270, label: 'Lateral esquerda', file: 'lateral-esquerda.png', crop: [0.085, 0.020, 0.919, 0.986] }
];
export const A10S_TOP = { label: 'Superior', file: 'superior.png', crop: [0.002, 0.187, 0.995, 0.869] };

// Mapeamento foto↔modelo (compartilhado entre o shader WebGL e o preview raster).
export const A10S_GEOM = { yTop: 218, yDeck: 162, yBottom: -217.5, xHalf: 82.5, zHalf: 190.5 };
export const A10S_CAPS = [
  { id: 1, label: 'CBPA', z: 18, radius: 44, height: 46 },
  { id: 2, label: 'ROCB', z: -112, radius: 67, height: 56 }
];
// Separate body and cap landmarks: fitting the full photo to the body flattened
// both caps. Crops are measured pixels from the five supplied PNGs only.
const photoBox = (w, h, x0, y0, x1, y1) => [x0/w, y0/h, x1/w, y1/h];
export const A10S_CALIBRATION = {
  frontBody: photoBox(1086,1448,303,240,782,1317),
  rightBody: photoBox(1254,1254,140,177,1122,1176),
  backBody: photoBox(1086,1448,315,188,771,1346),
  leftBody: photoBox(1254,1254,164,193,1147,1202),
  frontSmall: photoBox(1086,1448,419,110,662,239),
  rightSmall: photoBox(1254,1254,484,54,709,177),
  leftSmall: photoBox(1254,1254,599,63,835,193),
  rightLarge: photoBox(1254,1254,751,30,1078,177),
  backLarge: photoBox(1086,1448,394,36,694,188),
  leftLarge: photoBox(1254,1254,220,34,561,193)
};
export function a10sVertical(y) { return (A10S_GEOM.yDeck - y) / (A10S_GEOM.yDeck - A10S_GEOM.yBottom); }
export function a10sHorizontal(x) { return (x + A10S_GEOM.xHalf) / (2 * A10S_GEOM.xHalf); }
export function a10sLateral(z) { return (z + A10S_GEOM.zHalf) / (2 * A10S_GEOM.zHalf); }
export function a10sBodyVerticals([x,y]) {
  const v=a10sVertical(y), u=a10sHorizontal(x);
  const arc=Math.sqrt(Math.max(0,1-(2*u-1)**2));
  // Measured band centres: front 1216px, rear 1222px, right 1054px,
  // left 1079px. Photo perspective bows the band at rounded ends. Align that
  // shared physical feature before blending, without repainting any image.
  const side=.878-Math.max(0,82.5-Math.abs(x))*.0003;
  const warp=band=>v<.88?v*band/.88:band+(v-.88)*(1-band)/.12;
  return [.852+.0543*arc,side,.824+.069*arc,side].map(warp);
}

// Malha do A10S: corpo prismático de seção stadium (duas semicircunferências r=80
// unidas por retas ao longo de Z), topo com deck plano e duas
// cúpulas translúcidas. As posições e raios das cúpulas vêm das silhuetas das
// fotos (não é CAD). parts: 0 corpo/deck, 1 CBPA frontal, 2 ROCB traseira.
export function createMeshA10S() {
  const positions = [], normals = [], parts = [];
  let part = 0;
  const push = (p, n) => { positions.push(p[0], p[1], p[2]); normals.push(n[0], n[1], n[2]); parts.push(part); };
  function triangle(a, b, c) {
    const u = [b[0]-a[0], b[1]-a[1], b[2]-a[2]], v = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
    const n = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
    const L = Math.hypot(n[0], n[1], n[2]); if (L < 1e-7) return;
    const nn = [n[0]/L, n[1]/L, n[2]/L];
    push(a, nn); push(b, nn); push(c, nn);
  }
  const quad = (a, b, c, d) => { triangle(a, b, c); triangle(a, c, d); };
  const R = A10S_GEOM.xHalf, STRAIGHT = A10S_GEOM.zHalf-R, ARC = 64, SEG = 2*(ARC+1);
  // Anel da seção stadium na altura y, com inset (recuo) aplicado ao raio.
  function ring(y, inset, recess = 0) {
    const out = [], r = Math.max(0.3, R - inset);
    for (let half = 0; half < 2; half++) for (let i = 0; i <= ARC; i++) {
      // Explicit semicircles joined by straight sides, with a closed seam.
      const t = (half + i/ARC)*Math.PI, c = Math.cos(t), s = Math.sin(t);
      const centre = half === 0 ? STRAIGHT : -STRAIGHT;
      const recessed = s < 0 ? recess * Math.max(0, 1-Math.abs(c)**8) : 0;
      out.push([r*c, y, centre + (r-recessed)*s]);
    }
    out.push([...out[0]]);
    return out;
  }
  // Perfil vertical do corpo: base filetada → parede reta → topo filetado → deck.
  const profile = [
    [-217.5, 10, 0], [-213, 5, 0], [-185, 0, 0],
    [-130, 0, 0], [-119, 0, 9], [96, 0, 9], [112, 0, 0],
    [159, 0, 0], [162, 1, 0]
  ];
  let prev = ring(...profile[0]);
  for (let k = 1; k < profile.length; k++) {
    const cur = ring(...profile[k]);
    for (let i = 0; i < SEG; i++) quad(prev[i], cur[i], cur[i+1], prev[i+1]);
    prev = cur;
  }
  // Fecha a base (fan ao centro) e o deck plano do topo (recebe a foto superior).
  const base = ring(...profile[0]);
  const deck = ring(...profile[profile.length-1]);
  for (let i = 0; i < SEG; i++) {
    triangle([0, profile[0][0], 0], base[i], base[i+1]);
    triangle([0, profile[profile.length-1][0], 0], deck[i+1], deck[i]);
  }
  // Cap profiles follow the photographed silhouettes. Ribs/handles/text are
  // photographic pixels, never synthesized geometry or invented components.
  function dome({z: cz, radius, height, id}) {
    part = id;
    const steps = 96, base = A10S_GEOM.yDeck;
    const levels = [[0,1],[.18,1],[.72,.90],[.90,.72],[1,.32]];
    const at = (t, e, y) => [Math.cos(t)*radius*e, y, cz + Math.sin(t)*radius*e];
    for (let a = 0; a < levels.length-1; a++) {
      const [h0,e0] = levels[a], [h1,e1] = levels[a+1];
      const y0 = base + height*h0, y1 = base + height*h1;
      for (let i = 0; i < steps; i++) {
        const t0 = i/steps*Math.PI*2, t1 = (i+1)/steps*Math.PI*2;
        // Winding horário visto de cima → normais apontando para fora da cúpula.
        quad(at(t0,e0,y0), at(t0,e1,y1), at(t1,e1,y1), at(t1,e0,y0));
      }
    }
    for (let i = 0; i < steps; i++) {
      triangle([0,base+height,cz], at((i+1)/steps*Math.PI*2,.32,base+height), at(i/steps*Math.PI*2,.32,base+height));
    }
  }
  A10S_CAPS.forEach(dome);
  part = 0;
  return { positions: new Float32Array(positions), normals: new Float32Array(normals), parts: new Float32Array(parts) };
}

export const A10S_VERTEX_SHADER = `
attribute vec3 position;
attribute vec3 normal;
attribute float part;
uniform float angle;
uniform float tilt;
uniform vec2 scale;
uniform float panY;
varying vec3 point;
varying vec3 surface;
varying float component;
void main() {
  point = position; surface = normal; component = part;
  float c = cos(angle), s = sin(angle);
  vec3 p = vec3(c*position.x - s*position.z, position.y, s*position.x + c*position.z);
  float tc = cos(tilt), ts = sin(tilt);
  p = vec3(p.x, tc*p.y - ts*p.z, ts*p.y + tc*p.z);
  gl_Position = vec4(p.x*scale.x, p.y*scale.y + panY, -p.z/760.0, 1.0);
}`;

// TRAVA DE MATERIAL — vale para TODAS as vistas e ângulos do 360°.
// Este viewer NÃO tem modelo de iluminação: não há termo especular, nem
// metalness, nem clear coat, nem reflexo de ambiente/espelhado. A cor de cada
// pixel é apenas a MÉDIA PONDERADA de amostras das fotografias reais (os pesos
// somam 1), portanto a saída nunca excede o brilho das fotos — é impossível a
// superfície "virar" metálica, brilhante ou refletiva ao girar. O acabamento
// que aparece é literalmente o do produto fotografado: gabinete em PLÁSTICO
// CINZA-CHUMBO FOSCO (polímero moldado, baixo brilho, reflexos suaves e
// difusos); faixa rosé/champagne acetinada; cúpulas em plástico translúcido
// fumê; conectores em plástico branco. Girar a câmera só troca QUAL foto é
// amostrada — muda a incidência de luz já capturada, nunca o material.
// NÃO adicionar iluminação, specular, pow() sobre a cor, tonemap ou realce:
// qualquer um desses quebraria a trava e introduziria aparência metálica.
export const A10S_FRAGMENT_SHADER = `
precision mediump float;
varying vec3 point;
varying vec3 surface;
varying float component;
uniform sampler2D frontPhoto;
uniform sampler2D rightPhoto;
uniform sampler2D backPhoto;
uniform sampler2D leftPhoto;
uniform sampler2D topPhoto;
uniform vec4 frontCrop;
uniform vec4 rightCrop;
uniform vec4 backCrop;
uniform vec4 leftCrop;
uniform vec4 topCrop;
uniform vec4 frontBody;
uniform vec4 rightBody;
uniform vec4 backBody;
uniform vec4 leftBody;
uniform vec4 frontSmall;
uniform vec4 rightSmall;
uniform vec4 leftSmall;
uniform vec4 rightLarge;
uniform vec4 backLarge;
uniform vec4 leftLarge;
vec2 uv(vec2 p, vec4 crop) { return mix(crop.xy, crop.zw, clamp(p, 0.0, 1.0)); }
float bandAligned(float v, float band) {
  return v < 0.88 ? v*band/0.88 : band+(v-0.88)*(1.0-band)/0.12;
}
vec3 foreground(vec3 color, vec3 finish, float edge) {
  // Fundo branco de estúdio não faz parte do objeto. Remove só nas bordas da
  // silhueta; rótulos centrais e conexões claras permanecem intactos.
  float light = min(color.r, min(color.g, color.b));
  return mix(color, finish, step(0.5, edge) * smoothstep(0.80, 0.95, light));
}
void main() {
  vec3 n = normalize(surface);
  float fr = max(n.z, 0.0), rt = max(n.x, 0.0), bk = max(-n.z, 0.0), lf = max(-n.x, 0.0), tp = max(n.y, 0.0);
  vec4 sideW = pow(vec4(fr, rt, bk, lf), vec4(5.0));
  float topW = pow(tp, 6.0);
  float sum = sideW.x + sideW.y + sideW.z + sideW.w + topW;
  if (sum < 0.0001) { gl_FragColor = vec4(0.21, 0.24, 0.29, 1.0); return; }
  float vertical = (162.0 - point.y) / 379.5;
  float horizontal = (point.x + 82.5) / 165.0;
  float lateral = (point.z + 190.5) / 381.0;
  float radial = 2.0*horizontal-1.0;
  float arc = sqrt(max(0.0,1.0-radial*radial));
  float sideBand = 0.878-max(0.0,82.5-abs(point.x))*0.0003;
  float frontV = bandAligned(vertical,0.852+0.0543*arc);
  float backV = bandAligned(vertical,0.824+0.069*arc);
  float sideV = bandAligned(vertical,sideBand);
  // Right reference: front at LEFT. Top reference: control panel at LEFT,
  // ROCB at RIGHT (rear). Reversing these introduced rear ports on the front.
  vec3 f = texture2D(frontPhoto, uv(vec2(horizontal, frontV), frontBody)).rgb;
  vec3 r = texture2D(rightPhoto, uv(vec2(1.0-lateral, sideV), rightBody)).rgb;
  vec3 b = texture2D(backPhoto, uv(vec2(1.0-horizontal, backV), backBody)).rgb;
  vec3 l = texture2D(leftPhoto, uv(vec2(lateral, sideV), leftBody)).rgb;
  vec3 t = texture2D(topPhoto, uv(vec2(1.0-lateral, horizontal), topCrop)).rgb;
  vec3 finish = texture2D(frontPhoto, uv(vec2(0.5, 0.5), frontBody)).rgb;
  if (component > 0.5) {
    bool small = component < 1.5;
    float radius = small ? 44.0 : 67.0;
    float cz = small ? 18.0 : -112.0;
    float capY = (162.0 + (small ? 46.0 : 56.0) - point.y) / (small ? 46.0 : 56.0);
    float capX = (point.x + radius) / (2.0*radius);
    float capZ = (point.z-cz + radius) / (2.0*radius);
    r = texture2D(rightPhoto, uv(vec2(1.0-capZ,capY), small ? rightSmall : rightLarge)).rgb;
    l = texture2D(leftPhoto, uv(vec2(capZ,capY), small ? leftSmall : leftLarge)).rgb;
    // The smaller front cap occludes the larger cap in the frontal reference;
    // the larger rear cap occludes the small cap in the rear reference.
    if (small) {
      f = texture2D(frontPhoto, uv(vec2(capX,capY), frontSmall)).rgb;
      b = (r+l)*0.5;
    } else {
      f = (r+l)*0.5;
      b = texture2D(backPhoto, uv(vec2(1.0-capX,capY), backLarge)).rgb;
    }
    // No white-backdrop replacement on transparent caps or chrome highlights.
    gl_FragColor = vec4((f*sideW.x+r*sideW.y+b*sideW.z+l*sideW.w+t*topW)/sum,1.0);
    return;
  }
  float endEdge = step(vertical, 0.008) + step(0.99, vertical);
  float frontEdge = step(horizontal, 0.05) + step(0.95, horizontal) + endEdge;
  float sideEdge = step(lateral, 0.04) + step(0.96, lateral) + endEdge;
  f = foreground(f, finish, frontEdge); b = foreground(b, finish, frontEdge);
  r = foreground(r, finish, sideEdge); l = foreground(l, finish, sideEdge);
  vec3 color = (f*sideW.x + r*sideW.y + b*sideW.z + l*sideW.w + t*topW) / sum;
  gl_FragColor = vec4(color, 1.0);
}`;

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

// Perfis de produto. O viewer escolhe o perfil por root.dataset.model (padrão
// a9plus, mantendo a retrocompatibilidade). Cada perfil traz as suas vistas,
// malha, shaders e — quando há vista superior — os limites de inclinação.
export const PROFILES = {
  a9plus: {
    views: VIEWS, top: null, createMesh, vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER, fit: 270,
    samplers: ['frontPhoto', 'rightPhoto', 'backPhoto', 'leftPhoto'],
    crops: ['frontCrop', 'rightCrop', 'backCrop', 'leftCrop'], tilt: null
  },
  a10s: {
    views: A10S_VIEWS, top: A10S_TOP, createMesh: createMeshA10S, vertex: A10S_VERTEX_SHADER, fragment: A10S_FRAGMENT_SHADER, fit: 295,
    samplers: ['frontPhoto', 'rightPhoto', 'backPhoto', 'leftPhoto', 'topPhoto'],
    crops: ['frontCrop', 'rightCrop', 'backCrop', 'leftCrop', 'topCrop'],
    calibration: A10S_CALIBRATION, tilt: { min: 0, max: 26 }
  }
};

export async function mountViewer(root) {
  const profile=PROFILES[root.dataset.model]||PROFILES.a9plus;
  const views=profile.views, tiltCfg=profile.tilt, hasTop=!!profile.top;
  const allViews=hasTop?[...views,profile.top]:views;
  const label=root.dataset.produto||(root.dataset.model==='a10s'?'A10S':'A9Plus');
  const canvas=root.querySelector('canvas');
  const poster=root.querySelector('.product360-poster');
  const status=root.querySelector('[data-360-status]');
  const slider=root.querySelector('[data-360-angle]');
  const zoomLabel=root.querySelector('[data-360-zoom]');
  const viewButtons=[...root.querySelectorAll('[data-360-view]')];
  const zoomButtons=[...root.querySelectorAll('[data-360-action="zoom-in"], [data-360-action="zoom-out"]')];
  const rotationButtons=[...root.querySelectorAll('[data-360-action="left"], [data-360-action="right"]')];
  const tiltButtons=hasTop?[...root.querySelectorAll('[data-360-action="tilt-up"], [data-360-action="tilt-down"]')]:[];
  const angleLabel=root.querySelector('[data-360-degrees]');
  const state=createState();
  let gl, draw, frame=0, ready=false, stopped=false, observer, tilt=0;
  const pointers=new Map();
  const clampTilt=(v)=> tiltCfg?Math.max(tiltCfg.min,Math.min(tiltCfg.max,v)):0;
  function fail(message) {
    ready=false; stopped=true; cancelAnimationFrame(frame);
    canvas.hidden=true; poster.hidden=false;
    root.classList.remove('product360-ready');
    root.classList.add('product360-fallback');
    slider.disabled=true; [...zoomButtons,...rotationButtons,...tiltButtons].forEach((b)=>b.disabled=true);
    const closest=views.reduce((best,view)=> {
      const distance=v=>Math.abs(normalizeAngle(state.angle-v.angle+180)-180);
      return distance(view)<distance(best)?view:best;
    },views[0]);
    showPoster(hasTop&&tilt>=tiltCfg.max/2?profile.top:closest);
    status.textContent=message+' Você pode consultar as vistas pelos botões.';
  }
  function update() {
    const degrees=normalizeAngle(Math.round(state.angle));
    slider.value=String(degrees);
    slider.setAttribute('aria-valuetext',degrees+' graus');
    if(angleLabel) angleLabel.textContent=degrees+'°';
    zoomLabel.textContent=Math.round(state.zoom*100)+'%';
    if(ready) {
      zoomButtons.forEach(b=>b.disabled=b.dataset['360Action']==='zoom-out'?state.zoom<=1:state.zoom>=3);
      tiltButtons.forEach(b=>b.disabled=b.dataset['360Action']==='tilt-down'?tilt<=tiltCfg.min:tilt>=tiltCfg.max);
    }
    viewButtons.forEach((button)=> {
      const value=button.dataset['360View'];
      if(value==='top') { button.setAttribute('aria-pressed',tiltCfg&&tilt>tiltCfg.max-3?'true':'false'); return; }
      const delta=Math.abs(normalizeAngle(state.angle-Number(value)+180)-180);
      button.setAttribute('aria-pressed',delta<1&&(!tiltCfg||tilt<8)?'true':'false');
    });
    if(!ready||stopped||frame) return;
    frame=requestAnimationFrame(()=> { frame=0; if(ready&&!stopped) draw(); });
  }
  function showPoster(view) { poster.src=root.dataset.base+view.file; poster.alt=label+' — '+view.label; }
  function setView(angle) {
    state.angle=normalizeAngle(angle); tilt=0;
    if(!ready) { const view=views.find((v)=>v.angle===state.angle)||views[0]; showPoster(view); }
    update();
  }
  function setTop() {
    if(!tiltCfg) return setView(0);
    tilt=tiltCfg.max; state.angle=0;
    if(!ready&&hasTop) showPoster(profile.top);
    update();
  }
  root.addEventListener('click',(event)=> {
    const button=event.target.closest('button');
    if(!button||!root.contains(button)) return;
    if(button.hasAttribute('data-360-view')) { const v=button.dataset['360View']; return v==='top'?setTop():setView(Number(v)); }
    switch(button.dataset['360Action']) {
      case 'left': state.rotate(-15); break;
      case 'right': state.rotate(15); break;
      case 'zoom-in': state.magnify(1.15); break;
      case 'zoom-out': state.magnify(1/1.15); break;
      case 'tilt-up': tilt=clampTilt(tilt+8); break;
      case 'tilt-down': tilt=clampTilt(tilt-8); break;
      case 'reset': state.reset(); tilt=0; setView(0); break;
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
    if(pointers.size>=2) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    canvas.setPointerCapture(event.pointerId); canvas.classList.add('dragging');
  });
  const pinchDistance=()=> { const p=[...pointers.values()]; return p.length===2?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0; };
  canvas.addEventListener('pointermove',(event)=> {
    const previous=pointers.get(event.pointerId); if(!previous||!ready) return;
    const before=pinchDistance();
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const after=pinchDistance();
    if(before>0&&after>0) {
      state.magnify(after/before);
      state.panY=Math.max(1-state.zoom,Math.min(state.zoom-1,state.panY+(event.clientY-previous.y)/canvas.clientHeight));
    }
    else {
      if(event.shiftKey&&state.zoom>1) {
        state.panY=Math.max(1-state.zoom,Math.min(state.zoom-1,state.panY+(event.clientY-previous.y)/canvas.clientHeight*2));
        return update();
      }
      state.rotate((event.clientX-previous.x)/Math.max(240,canvas.clientWidth)*360*(hasTop?-1:1));
      const dy=event.clientY-previous.y;
      // Arraste vertical: inclina (produto com topo) ou desloca o zoom (demais).
      if(tiltCfg) tilt=clampTilt(tilt+dy/Math.max(200,canvas.clientHeight)*(tiltCfg.max-tiltCfg.min)*1.3);
      else if(state.zoom>1) state.panY=Math.max(1-state.zoom,Math.min(state.zoom-1,state.panY+dy/canvas.clientHeight*2));
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
    const actions={ArrowLeft:()=>state.rotate(-5),ArrowRight:()=>state.rotate(5),'+':()=>state.magnify(1.15),'=':()=>state.magnify(1.15),'-':()=>state.magnify(1/1.15),Home:()=>{state.reset();tilt=0;}};
    if(tiltCfg) { actions.ArrowUp=()=>{tilt=clampTilt(tilt+5);}; actions.ArrowDown=()=>{tilt=clampTilt(tilt-5);}; }
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
    const vertex=compile(gl.VERTEX_SHADER,profile.vertex), fragment=compile(gl.FRAGMENT_SHADER,profile.fragment);
    gl.attachShader(program,vertex); gl.attachShader(program,fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const mesh=profile.createMesh();
    for(const [name,values] of [['position',mesh.positions],['normal',mesh.normals],['part',mesh.parts]]) {
      const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);
      const location=gl.getAttribLocation(program,name);
      if(location>=0) { gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,name==='part'?1:3,gl.FLOAT,false,0,0); }
    }
    const images=await Promise.all(allViews.map((view)=>new Promise((resolve,reject)=> {
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
      gl.uniform1i(gl.getUniformLocation(program,profile.samplers[index]),index);
      gl.uniform4fv(gl.getUniformLocation(program,profile.crops[index]),allViews[index].crop);
    });
    for(const [name,crop] of Object.entries(profile.calibration||{})) {
      gl.uniform4fv(gl.getUniformLocation(program,name),crop);
    }
    const angleUniform=gl.getUniformLocation(program,'angle'), scaleUniform=gl.getUniformLocation(program,'scale'), panUniform=gl.getUniformLocation(program,'panY');
    const tiltUniform=tiltCfg?gl.getUniformLocation(program,'tilt'):null;
    gl.enable(gl.DEPTH_TEST); gl.clearColor(1,1,1,1);
    draw=()=> {
      const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight),dpr=Math.min(devicePixelRatio||1,2);
      if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)) { canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr); }
      gl.viewport(0,0,canvas.width,canvas.height); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(angleUniform,state.angle*Math.PI/180);
      gl.uniform1f(panUniform,state.panY);
      if(tiltUniform) gl.uniform1f(tiltUniform,tilt*Math.PI/180);
      // Fit the entire turn in narrow embeds, using the same scale at ALL angles.
      const fit=tiltCfg?Math.max(profile.fit,215/(width/height)):profile.fit;
      const scale=state.zoom/fit;
      gl.uniform2f(scaleUniform,scale/(width/height),scale);
      gl.drawArrays(gl.TRIANGLES,0,mesh.positions.length/3);
      if(tiltCfg&&root.style?.setProperty) {
        const radians=state.angle*Math.PI/180, pitch=tilt*Math.PI/180;
        const straight=A10S_GEOM.zHalf-A10S_GEOM.xHalf;
        const depth=straight*Math.abs(Math.cos(radians))+A10S_GEOM.xHalf;
        const halfWidth=straight*Math.abs(Math.sin(radians))+A10S_GEOM.xHalf;
        const floor=(A10S_GEOM.yBottom*Math.cos(pitch)-depth*Math.sin(pitch))*scale+state.panY;
        root.style.setProperty('--product360-floor',((1+floor)*50-1)+'%');
        root.style.setProperty('--product360-shadow-width',Math.min(90,halfWidth*scale/(width/height)*110)+'%');
      }
    };
    ready=true; slider.disabled=false; [...zoomButtons,...rotationButtons,...tiltButtons].forEach((b)=>b.disabled=false);
    poster.hidden=true; canvas.hidden=false; root.classList.add('product360-ready');
    status.textContent='Arraste para girar o produto 360°.'+(tiltCfg?' Arraste na vertical para ver o topo.':'')+' Use a pinça ou os botões para ampliar.';
    observer=new ResizeObserver(update); observer.observe(canvas);
    // On-demand frames; no animation loop while the viewer is idle/off screen.
    document.addEventListener('fullscreenchange',update);
    window.addEventListener('pagehide',()=> { stopped=true; cancelAnimationFrame(frame); observer.disconnect(); },{once:true});
    window.addEventListener('pageshow',(event)=> { if(event.persisted&&ready) { stopped=false; observer.observe(canvas); update(); } });
    update();
  } catch(error) {
    console.warn('Product 360:',error.message);
    fail('Não foi possível carregar o giro 360°.');
  }
}

if(typeof document!=='undefined') {
  document.querySelectorAll('[data-product360]').forEach(root=> {
    // Keep the front photograph visible until the viewer is approached.
    if('IntersectionObserver' in window) {
      const observer=new IntersectionObserver((entries)=> {
        if(entries.some((entry)=>entry.isIntersecting)) { observer.disconnect(); void mountViewer(root); }
      },{rootMargin:'300px'});
      observer.observe(root);
    } else void mountViewer(root);
  });
}
