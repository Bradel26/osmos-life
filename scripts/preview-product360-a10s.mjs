// QA raster offline do A10S: replica EXATAMENTE a malha e a projeção fotográfica
// do viewer WebGL (js/product360.js), incluindo a 5ª textura (superior) e a
// inclinação vertical. Não altera nenhuma foto de referência; só grava previews.
import { createMeshA10S, A10S_VIEWS, A10S_TOP, A10S_CALIBRATION, A10S_CAPS, a10sVertical, a10sHorizontal, a10sLateral, a10sBodyVerticals, PROFILES } from '../js/product360.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { inflateSync, deflateSync } from 'node:zlib';

function pngDecode(buffer) {
  const width = buffer.readUInt32BE(16), height = buffer.readUInt32BE(20), channels = buffer[25] === 2 ? 3 : 4;
  if (buffer[24] !== 8 || ![2, 6].includes(buffer[25])) throw Error('Unsupported reference PNG');
  const chunks = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset), type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * channels, pixels = Buffer.alloc(stride * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? pixels[y*stride+x-channels] : 0, b = y > 0 ? pixels[(y-1)*stride+x] : 0, c = y > 0 && x >= channels ? pixels[(y-1)*stride+x-channels] : 0;
      pixels[y*stride+x] = (raw[y*(stride+1)+x+1] + [0, a, b, Math.floor((a+b)/2), paeth(a, b, c)][raw[y*(stride+1)]]) & 255;
    }
  }
  return { width, height, channels, pixels };
}
function pngEncode(width, height, pixels) {
  function chunk(type, data) {
    const name = Buffer.from(type), body = Buffer.concat([name, data]); let crc = 0xffffffff;
    for (const b of body) { crc ^= b; for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
    const length = Buffer.alloc(4), sum = Buffer.alloc(4); length.writeUInt32BE(data.length); sum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([length, body, sum]);
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const raw = Buffer.alloc((width*3+1)*height);
  for (let y = 0; y < height; y++) pixels.copy(raw, y*(width*3+1)+1, y*width*3, (y+1)*width*3);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const dir = 'assets/manuais/a10s';
const mesh = createMeshA10S();
const sideTex = await Promise.all(A10S_VIEWS.map(async (v) => pngDecode(await readFile(`${dir}/${v.file}`))));
const topTex = pngDecode(await readFile(`${dir}/${A10S_TOP.file}`));
const crops = [...A10S_VIEWS.map((v) => v.crop), A10S_TOP.crop];
const textures = [...sideTex, topTex];
const finishPix = (() => { const c = A10S_CALIBRATION.frontBody, t = sideTex[0];
  const i = (Math.round((c[1]+(c[3]-c[1])*0.5)*(t.height-1))*t.width + Math.round((c[0]+(c[2]-c[0])*0.5)*(t.width-1)))*t.channels;
  return [...t.pixels.subarray(i, i+3)]; })();

function sample(idx, u, v, c = crops[idx]) {
  const t = textures[idx];
  const tx = Math.min(t.width-1, Math.max(0, Math.round((c[0]+(c[2]-c[0])*Math.min(1,Math.max(0,u)))*(t.width-1))));
  const ty = Math.min(t.height-1, Math.max(0, Math.round((c[1]+(c[3]-c[1])*Math.min(1,Math.max(0,v)))*(t.height-1))));
  const ti = (ty*t.width+tx)*t.channels;
  return [t.pixels[ti], t.pixels[ti+1], t.pixels[ti+2]];
}

function renderFrame(angle, tilt, size) {
  const frame = Buffer.alloc(size*size*3, 255), depth = new Float32Array(size*size).fill(-Infinity);
  const c = Math.cos(angle*Math.PI/180), s = Math.sin(angle*Math.PI/180);
  const tc = Math.cos(tilt*Math.PI/180), ts = Math.sin(tilt*Math.PI/180), scale = size/(2*PROFILES.a10s.fit);
  const p = mesh.positions, n = mesh.normals;
  const project = (x, y, z) => {
    let px = c*x - s*z, py = y, pz = s*x + c*z;
    const ry = tc*py - ts*pz, rz = ts*py + tc*pz;
    return [size/2 + px*scale, size/2 - ry*scale, rz];
  };
  for (let i = 0; i < p.length; i += 9) {
    const pts = [0, 3, 6].map((j) => project(p[i+j], p[i+j+1], p[i+j+2]));
    const [a, b, d] = pts, den = (b[1]-d[1])*(a[0]-d[0]) + (d[0]-b[0])*(a[1]-d[1]);
    if (Math.abs(den) < 0.001) continue;
    const minX = Math.max(0, Math.floor(Math.min(a[0],b[0],d[0]))), maxX = Math.min(size-1, Math.ceil(Math.max(a[0],b[0],d[0])));
    const minY = Math.max(0, Math.floor(Math.min(a[1],b[1],d[1]))), maxY = Math.min(size-1, Math.ceil(Math.max(a[1],b[1],d[1])));
    // Pesos pela normal de objeto (não rotacionada), como no shader.
    const nx = n[i], ny = n[i+1], nz = n[i+2];
    const dirs = [Math.max(0,nz), Math.max(0,nx), Math.max(0,-nz), Math.max(0,-nx)].map((x) => x**5);
    const topW = Math.max(0, ny)**6;
    const sum = dirs[0]+dirs[1]+dirs[2]+dirs[3]+topW;
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const u = ((b[1]-d[1])*(x-d[0]) + (d[0]-b[0])*(y-d[1]))/den;
      const v = ((d[1]-a[1])*(x-d[0]) + (a[0]-d[0])*(y-d[1]))/den, w = 1-u-v;
      if (u < 0 || v < 0 || w < 0) continue;
      const z = u*a[2]+v*b[2]+w*d[2], index = y*size+x; if (z <= depth[index]) continue; depth[index] = z;
      const pt = [0,1,2].map((j) => u*p[i+j]+v*p[i+3+j]+w*p[i+6+j]);
      const vertical = a10sVertical(pt[1]), horizontal = a10sHorizontal(pt[0]), lateral = a10sLateral(pt[2]);
      const color = [0, 0, 0];
      if (sum < 0.0001) { frame[index*3] = 54; frame[index*3+1] = 61; frame[index*3+2] = 74; continue; }
      const [fv,rv,bv,lv]=a10sBodyVerticals(pt);
      let uvs = [[horizontal, fv], [1-lateral, rv], [1-horizontal, bv], [lateral, lv], [1-lateral, horizontal]];
      const cal = A10S_CALIBRATION;
      let boxes = [cal.frontBody,cal.rightBody,cal.backBody,cal.leftBody,A10S_TOP.crop];
      const component = mesh.parts[i/3];
      if (component > .5) {
        const cap = A10S_CAPS[component-1], small = component===1;
        const cy = (162+cap.height-pt[1])/cap.height, cx = (pt[0]+cap.radius)/(2*cap.radius), cz = (pt[2]-cap.z+cap.radius)/(2*cap.radius);
        uvs = [[cx,cy],[1-cz,cy],[1-cx,cy],[cz,cy],uvs[4]];
        boxes = [cal.frontSmall,small?cal.rightSmall:cal.rightLarge,cal.backLarge,small?cal.leftSmall:cal.leftLarge,A10S_TOP.crop];
      }
      const weights = [...dirs, topW];
      const endEdge = (vertical <= 0.008 || vertical >= 0.99);
      for (let k = 0; k < 5; k++) {
        if (weights[k] < 1e-5) continue;
        let col = sample(k, uvs[k][0], uvs[k][1], boxes[k]);
        if (component > .5 && ((component===1&&k===2)||(component===2&&k===0))) {
          const right = sample(1,...uvs[1],boxes[1]), left = sample(3,...uvs[3],boxes[3]);
          col = right.map((ch,index)=>(ch+left[index])*.5);
        }
        if (k < 4 && component < .5) {
          const edge = k === 1 || k === 3 ? (lateral <= 0.04 || lateral >= 0.96 || endEdge) : (horizontal <= 0.05 || horizontal >= 0.95 || endEdge);
          let white = edge ? Math.max(0, Math.min(1, (Math.min(...col)/255 - 0.80)/0.15)) : 0;
          white = white*white*(3-2*white);
          col = col.map((ch, c2) => ch*(1-white) + finishPix[c2]*white);
        }
        for (let ch = 0; ch < 3; ch++) color[ch] += col[ch]*weights[k]/sum;
      }
      for (let ch = 0; ch < 3; ch++) frame[index*3+ch] = Math.round(color[ch]);
    }
  }
  return frame;
}

await mkdir('../../.manual-review/360-a10s', { recursive: true });
const size = 420;
// Giro completo, vistas ortogonais e inclinação máxima permitida no produto.
const shots = [
  ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => [`angle-${a}`, a, 10]),
  ['front-flat', 0, 0], ['front-tilt', 0, 22], ['top-down', 0, PROFILES.a10s.tilt.max], ['right-top', 90, PROFILES.a10s.tilt.max],
  ['right-flat',90,0], ['back-flat',180,0], ['left-flat',270,0]
];
for (const [name, angle, tilt] of shots) {
  await writeFile(`../../.manual-review/360-a10s/${name}.png`, pngEncode(size, size, renderFrame(angle, tilt, size)));
}
await writeFile('../../.manual-review/360-a10s/index.html', `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A10S — conferência de geometria e projeção</title><style>body{font:14px system-ui;margin:24px;background:#fff;color:#14253a}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}figure{margin:0;border:1px solid #e9edf1;border-radius:12px;padding:12px}img{display:block;width:100%;height:auto}figcaption{text-align:center;padding:8px}</style><h1>A10S — conferência de geometria e projeção</h1><p>Renderizações offline das cinco fotos originais. Giro completo e inclinação limitada para o topo.</p><main>${shots.map(([name,angle,tilt])=>`<figure><img src="${name}.png" alt="A10S a ${angle} graus, inclinação de ${tilt} graus"><figcaption>Rotação ${angle}° · inclinação ${tilt}°</figcaption></figure>`).join('')}</main></html>`);
console.log(`A10S: ${shots.length} previews renderizados em .manual-review/360-a10s (giro + inclinação).`);
