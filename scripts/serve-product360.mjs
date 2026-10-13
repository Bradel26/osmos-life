// Local HTTP preview only. No database credentials and no production writes.
import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { A10S } from '../functions/_lib/manuais-data-a10s.js';
import { onRequestGet } from '../functions/manuais/[slug].js';

const root = await realpath(fileURLToPath(new URL('../',import.meta.url)));
const port = Number(process.env.PRODUCT360_PORT || 8792);
const row = {...A10S,id:2,status:'publicado',conteudo_json:JSON.stringify(A10S.conteudo)};
const db = {exec:async()=>{},prepare:()=>({bind(){return this;},first:async()=>row,all:async()=>({results:[row]})})};
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};

const server = createServer(async (req,res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);return res.end();}
    const pathname = decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    if (pathname === '/manuais/purificador-osmos-a10s') {
      const response = await onRequestGet({env:{DB:db},params:{slug:A10S.slug}});
      res.writeHead(response.status,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
      return res.end(req.method==='HEAD'?undefined:await response.text());
    }
    const relative = pathname === '/' ? 'a10s-360.html' : pathname.slice(1);
    const isPublic = path => !path.includes('\\')&&!path.split('/').some(part=>part.startsWith('.'))&&/^(a10s-360\.html|css\/[\w.-]+\.css|js\/[\w.-]+\.js|assets\/(img|manuais\/a10s|fonts)\/[\w./-]+)$/.test(path);
    if (!isPublic(relative)) {
      res.writeHead(404);return res.end();
    }
    const file = await realpath(resolve(root,relative));
    if (!file.startsWith(root+sep)||!isPublic(file.slice(root.length+1).split(sep).join('/'))) {res.writeHead(404);return res.end();}
    const bytes = await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:bytes);
  } catch {
    res.writeHead(404);res.end();
  }
});
server.listen(port,'127.0.0.1',()=>console.log(`A10S: http://127.0.0.1:${port}/a10s-360.html\nPágina integrada: http://127.0.0.1:${port}/manuais/purificador-osmos-a10s#explorar-3d`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(()=>process.exit(0)));
