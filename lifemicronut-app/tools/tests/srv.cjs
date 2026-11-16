const http=require('http'),fs=require('fs'),path=require('path'); const ROOT=process.argv[2], PORT=+process.argv[3];
const hdr=fs.readFileSync(path.join(ROOT,'_headers'),'utf8'); const csp=(hdr.match(/Content-Security-Policy: (.*)/)||[])[1];
http.createServer((q,s)=>{ let u=decodeURIComponent(q.url.split('?')[0]); if(u.endsWith('/')) u+='index.html'; let f=path.join(ROOT,u);
  if(!fs.existsSync(f)&&fs.existsSync(f+'.html')) f+='.html';
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){ s.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); return s.end(fs.existsSync(path.join(ROOT,'404.html'))?fs.readFileSync(path.join(ROOT,'404.html')):'404'); }
  const ext=path.extname(f); const ct={'.html':'text/html; charset=utf-8','.txt':'text/plain','.xml':'application/xml','.png':'image/png','.svg':'image/svg+xml','.js':'text/javascript','.css':'text/css'}[ext]||'application/octet-stream';
  const h={'Content-Type':ct}; if(ext==='.html'&&csp&&!/admin/.test(u)) h['Content-Security-Policy']=csp; s.writeHead(200,h); s.end(fs.readFileSync(f)); }).listen(PORT,()=>console.log('srv',PORT));
