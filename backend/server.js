import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { servers, publicServers } from './servers.js';

const root = fileURLToPath(new URL('../frontend/', import.meta.url));
const port = Number(process.env.PORT || 3000);
const clients = new Set();
const chatMessages = [];
const recentPosts = new Map();
const broadcast = (event, payload) => { for (const client of clients) client.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`); };
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.zip':'application/zip'};
const json = (res,data,status=200) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); };
const snapshot = () => ({type:'servers',updatedAt:new Date().toISOString(),servers:publicServers()});
const server = http.createServer(async (req,res) => {
  const url = new URL(req.url || '/',`http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/health') return json(res,{status:'ok',service:'nexa-api',timestamp:new Date().toISOString()});
  if (url.pathname === '/api/chat' && req.method === 'GET') return json(res,{messages:chatMessages});
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let raw='';
    try { for await (const chunk of req) { raw += chunk; if (raw.length > 1_000_000) return json(res,{error:'Message trop volumineux'},413); } } catch { return json(res,{error:'Requête invalide'},400); }
    let input; try { input=JSON.parse(raw); } catch { return json(res,{error:'JSON invalide'},400); }
    const name=String(input.name||'').trim().slice(0,24), text=String(input.text||'').trim().slice(0,500), image=input.image==null?'':String(input.image);
    if (name.length < 3 || (!text && !image)) return json(res,{error:'Pseudo ou contenu manquant'},400);
    if (image && (image.length > 700_000 || !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image))) return json(res,{error:'Image invalide ou trop volumineuse'},400);
    const ip=req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown', now=Date.now();
    if (now-(recentPosts.get(ip)||0) < 1200) return json(res,{error:'Attends un instant avant le prochain message'},429);
    recentPosts.set(ip,now);
    const message={id:crypto.randomUUID(),name,text,image:image||null,createdAt:new Date().toISOString()};
    chatMessages.push(message); if (chatMessages.length > 80) chatMessages.shift();
    broadcast('chat',message); return json(res,{message},201);
  }
  if (url.pathname === '/api/servers') return json(res,{updatedAt:new Date().toISOString(),servers:publicServers()});
  if (url.pathname.startsWith('/api/servers/')) { const item=publicServers().find(s=>s.id===url.pathname.split('/').pop()); return item?json(res,item):json(res,{error:'Serveur introuvable'},404); }
  if (url.pathname.startsWith('/api/launcher/manifest/')) {
    const item=servers.find(s=>s.id===url.pathname.split('/').pop());
    return item?json(res,{schemaVersion:1,serverId:item.id,name:item.name,minecraft:item.version,loader:{name:item.loaderName,version:item.loaderVersion},modpack:{name:item.pack,version:item.packVersion,manifestUrl:null,downloadUrl:item.downloadUrl},serverAddress:item.address,files:[],generatedAt:new Date().toISOString()}):json(res,{error:'Serveur introuvable'},404);
  }
  if (url.pathname === '/api/events') { res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform',Connection:'keep-alive'}); res.write('retry: 5000\n'); res.write(`event: servers\ndata: ${JSON.stringify(snapshot())}\n\n`); for (const message of chatMessages) res.write(`event: chat\ndata: ${JSON.stringify(message)}\n\n`); clients.add(res); req.on('close',()=>clients.delete(res)); return; }
  const pathname=normalize(decodeURIComponent(url.pathname)).replace(/^([/\\]|\.\.(?:[/\\]|$))+/g,'');
  const file=pathname?join(root,pathname):join(root,'index.html');
  try { const body=await readFile(file); res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'}); res.end(body); }
  catch { json(res,{error:'Ressource introuvable'},404); }
});
setInterval(()=>{for(const client of clients)client.write(': keep-alive\n\n');},20000).unref();
server.listen(port,'0.0.0.0',()=>console.log(`Nexa disponible sur le port ${port}`));
