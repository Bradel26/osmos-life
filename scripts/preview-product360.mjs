// Offline raster QA of the same mesh and photo projections as the WebGL viewer.
// Does not modify any reference photograph; writes rendered scene previews only.
import { createMesh,VIEWS } from '../js/product360.js';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { inflateSync,deflateSync } from 'node:zlib';

function pngDecode(buffer) {
  const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20),channels=buffer[25]===2?3:4;
  if(buffer[24]!==8||![2,6].includes(buffer[25])) throw Error('Unsupported reference PNG');
  const chunks=[];
  for(let offset=8;offset<buffer.length;) {
    const length=buffer.readUInt32BE(offset),type=buffer.toString('ascii',offset+4,offset+8);
    if(type==='IDAT') chunks.push(buffer.subarray(offset+8,offset+8+length));
    offset+=length+12;
  }
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*channels,pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=> {const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
  for(let y=0;y<height;y++) {
    const filter=raw[y*(stride+1)];
    for(let x=0;x<stride;x++) {
      const a=x>=channels?pixels[y*stride+x-channels]:0,b=y>0?pixels[(y-1)*stride+x]:0,c=y>0&&x>=channels?pixels[(y-1)*stride+x-channels]:0;
      pixels[y*stride+x]=(raw[y*(stride+1)+x+1]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
    }
  }
  return {width,height,channels,pixels};
}
function pngEncode(width,height,pixels) {
  function chunk(type,data) {
    const name=Buffer.from(type),body=Buffer.concat([name,data]);let crc=0xffffffff;
    for(const b of body) {crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    const length=Buffer.alloc(4),sum=Buffer.alloc(4);length.writeUInt32BE(data.length);sum.writeUInt32BE((crc^0xffffffff)>>>0);
    return Buffer.concat([length,body,sum]);
  }
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
  const raw=Buffer.alloc((width*3+1)*height);
  for(let y=0;y<height;y++)pixels.copy(raw,y*(width*3+1)+1,y*width*3,(y+1)*width*3);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
const mesh=createMesh(),textures=await Promise.all(VIEWS.map(async v=>pngDecode(await readFile(`assets/manuais/a9plus/${v.file}`))));
const crop=VIEWS[1].crop,t=textures[1],finishIndex=(Math.round((crop[1]+(crop[3]-crop[1])*.45)*(t.height-1))*t.width+Math.round((crop[0]+(crop[2]-crop[0])*.4)*(t.width-1)))*t.channels;
const finish=[...t.pixels.subarray(finishIndex,finishIndex+3)];
await mkdir('../../.manual-review/360',{recursive:true});
await writeFile('../../.manual-review/360/mesh.json',JSON.stringify({positions:[...mesh.positions],normals:[...mesh.normals]}));
for(const angle of [0,45,90,135,180,225,270,315]) {
  const size=480,frame=Buffer.alloc(size*size*3,255),depth=new Float32Array(size*size).fill(-Infinity);
  const c=Math.cos(angle*Math.PI/180),s=Math.sin(angle*Math.PI/180),scale=size/540;
  const p=mesh.positions,n=mesh.normals;
  for(let i=0;i<p.length;i+=9) {
    const points=[0,3,6].map(j=>[size/2+(c*p[i+j]+s*p[i+j+2])*scale,size/2-p[i+j+1]*scale,-s*p[i+j]+c*p[i+j+2]]);
    const [a,b,d]=points,den=(b[1]-d[1])*(a[0]-d[0])+(d[0]-b[0])*(a[1]-d[1]);
    if(Math.abs(den)<.001)continue;
    const minX=Math.max(0,Math.floor(Math.min(...points.map(v=>v[0])))),maxX=Math.min(size-1,Math.ceil(Math.max(...points.map(v=>v[0]))));
    const minY=Math.max(0,Math.floor(Math.min(...points.map(v=>v[1])))),maxY=Math.min(size-1,Math.ceil(Math.max(...points.map(v=>v[1]))));
    const weights=[n[i+2],-n[i],-n[i+2],n[i]].map(v=>Math.max(0,v)**6),sum=weights.reduce((a,b)=>a+b,0);
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++) {
      const u=((b[1]-d[1])*(x-d[0])+(d[0]-b[0])*(y-d[1]))/den,v=((d[1]-a[1])*(x-d[0])+(a[0]-d[0])*(y-d[1]))/den,w=1-u-v;
      if(u<0||v<0||w<0)continue;
      const z=u*a[2]+v*b[2]+w*d[2],index=y*size+x;if(z<=depth[index])continue;depth[index]=z;
      const point=[0,1,2].map(j=>u*p[i+j]+v*p[i+3+j]+w*p[i+6+j]);
      const vertical=(209.5-point[1])/419,horizontal=(point[0]+92)/184,lateral=(point[2]+235)/470;
      const part=mesh.parts[i/3],cy=part<1.5?120:-64,photoCy=part<1.5?125:-4;
      const sideVertical=part>.5?(209.5-(photoCy+(point[1]-cy)*.72))/419:vertical;
      const us=[horizontal,lateral,1-horizontal,1-lateral];const color=[0,0,0];
      if(sum<.001)color.splice(0,3,59,64,71);
      else textures.forEach((t,j)=> {
        if(weights[j]<.00001)return;
        const crop=VIEWS[j].crop;
        const tx=Math.min(t.width-1,Math.max(0,Math.round((crop[0]+(crop[2]-crop[0])*Math.min(1,Math.max(0,us[j])))*(t.width-1))));
        const py=j===1||j===3?sideVertical:vertical;
        const ty=Math.min(t.height-1,Math.max(0,Math.round((crop[1]+(crop[3]-crop[1])*Math.min(1,Math.max(0,py)))*(t.height-1))));
        const ti=(ty*t.width+tx)*t.channels;
        const values=[...t.pixels.subarray(ti,ti+3)];
        const edge=(j===1||j===3)?(lateral<=.08||lateral>=.76||part>.5):(horizontal<=.13||horizontal>=.87);
        let white=(edge||vertical<=.04||vertical>=.94)?Math.max(0,Math.min(1,(Math.min(...values)/255-.78)/.16)):0;
        white=white*white*(3-2*white);
        for(let ch=0;ch<3;ch++)color[ch]+=(values[ch]*(1-white)+finish[ch]*white)*weights[j]/sum;
      });
      for(let ch=0;ch<3;ch++)frame[index*3+ch]=Math.round(color[ch]);
    }
  }
  await writeFile(`../../.manual-review/360/angle-${angle}.png`,pngEncode(size,size,frame));
}
console.log('Rendered 8 mesh angles for visual QA.');
