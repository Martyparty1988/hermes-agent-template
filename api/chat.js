const crypto = require('crypto');

const BASE = (process.env.HERMES_API_BASE || 'https://hermes-runtime-production-c91c.up.railway.app').replace(/\/$/, '');
const MAX_MESSAGES=40;

function same(a,b){
  const aa=Buffer.from(String(a||'')); const bb=Buffer.from(String(b||''));
  return aa.length===bb.length && aa.length>0 && crypto.timingSafeEqual(aa,bb);
}

module.exports = async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  if(!same(req.headers['x-hermes-control-password'], process.env.CONTROL_PASSWORD)){
    return res.status(401).json({error:'unauthorized'});
  }
  if(!process.env.HERMES_API_KEY) return res.status(503).json({error:'server_not_configured'});

  const incoming=Array.isArray(req.body?.messages)?req.body.messages:[];
  const messages=incoming.slice(-MAX_MESSAGES).filter(m =>
    m && ['user','assistant','system'].includes(m.role) &&
    typeof m.content==='string' && m.content.length<=20000
  );
  if(!messages.length) return res.status(400).json({error:'messages_required'});

  try{
    const r=await fetch(BASE+'/v1/chat/completions',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.HERMES_API_KEY,'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({model:'hermes-agent',messages,stream:false}),
      signal:AbortSignal.timeout(290000)
    });
    const text=await r.text();
    if(!r.ok) return res.status(r.status>=500?502:r.status).json({error:'hermes_error',status:r.status});
    let data; try{ data=JSON.parse(text); }catch{ return res.status(502).json({error:'invalid_backend_response'}); }
    const content=data?.choices?.[0]?.message?.content ?? data?.message?.content ?? data?.output_text ?? '';
    return res.status(200).json({content:String(content||''),usage:data?.usage||null});
  }catch(e){
    return res.status(502).json({error:'backend_unreachable'});
  }
};