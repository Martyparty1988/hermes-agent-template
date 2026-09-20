const crypto = require('crypto');

const BASE = (process.env.HERMES_API_BASE || 'https://hermes-runtime-production-c91c.up.railway.app').replace(/\/$/, '');

function same(a,b){
  const aa=Buffer.from(String(a||'')); const bb=Buffer.from(String(b||''));
  return aa.length===bb.length && aa.length>0 && crypto.timingSafeEqual(aa,bb);
}

module.exports = async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'method_not_allowed'});
  if(!same(req.headers['x-hermes-control-password'], process.env.CONTROL_PASSWORD)){
    return res.status(401).json({error:'unauthorized'});
  }
  if(!process.env.HERMES_API_KEY) return res.status(503).json({error:'server_not_configured'});
  try{
    const r=await fetch(BASE+'/v1/models',{headers:{Authorization:'Bearer '+process.env.HERMES_API_KEY},signal:AbortSignal.timeout(15000)});
    if(!r.ok) return res.status(502).json({ok:false,status:r.status});
    const data=await r.json().catch(()=>({}));
    const models=Array.isArray(data.data)?data.data.map(x=>x.id).filter(Boolean):[];
    return res.status(200).json({ok:true,models});
  }catch(e){
    return res.status(502).json({ok:false,error:'backend_unreachable'});
  }
};