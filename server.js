const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;
app.disable('x-powered-by');
app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/occasions', (req,res) => {
  try { res.json(JSON.parse(fs.readFileSync(path.join(__dirname,'data','occasions.json'),'utf8'))); }
  catch { res.status(500).json({error:'Occasion data unavailable'}); }
});
app.get('/health', (_req,res)=>res.json({ok:true, app:'Shubh Avsar Creator'}));
app.get('*', (_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT, '0.0.0.0', ()=>console.log(`Shubh Avsar Creator running on ${PORT}`));
