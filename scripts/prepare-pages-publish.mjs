import { cp,mkdir,mkdtemp,readdir } from 'node:fs/promises';
import { resolve,join } from 'node:path';
// Pages direct uploads do not honor Workers' .assetsignore. Stage only public
// site content; source manuals, local tooling and credentials stay outside it.
const review=resolve('../../.manual-review');await mkdir(review,{recursive:true});
const output=await mkdtemp(join(review,'publish-'));
for(const folder of ['assets','css','js','admin','functions']) {
  await cp(folder,join(output,folder),{recursive:true,filter:(path)=>!path.split(/[\\/]/).some(part=>part.startsWith('.'))});
}
for(const entry of await readdir('.',{withFileTypes:true})) {
  if(entry.isFile()&&(entry.name.endsWith('.html')||['robots.txt','sitemap.xml','_redirects','_headers'].includes(entry.name))) await cp(entry.name,join(output,entry.name));
}
console.log(JSON.stringify({directory:output}));
