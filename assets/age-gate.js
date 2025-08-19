
(function(){
  function ready(fn){document.readyState!='loading'?fn():document.addEventListener('DOMContentLoaded',fn);}
  ready(function(){
    if(sessionStorage.getItem('age_ok')==='1') return;
    var modal=document.createElement('div');
    modal.id='ageGate';
    modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:10000';
    modal.innerHTML='<div style="max-width:500px;background:#16161c;padding:30px;border-radius:16px;color:#fff;text-align:center">'+
      '<h2>Adults Only</h2><p>This website sells sexual wellness products for adults 18+ only.</p>'+
      '<div style="margin-top:20px"><button id="ageEnter" style="padding:10px 20px;border:none;border-radius:8px;background:linear-gradient(90deg,#e753a0,#7c4dff);color:#fff;font-weight:600;cursor:pointer;margin-right:12px">I'm 18+</button>'+
      '<button id="ageExit" style="padding:10px 20px;border:1px solid #444;border-radius:8px;background:#1e1e25;color:#ccc;font-weight:600;cursor:pointer">Exit</button></div>'+
      '<p style="font-size:12px;color:#888;margin-top:15px">We use a light age gate. In some regions, we may ask for stronger verification at checkout.</p>'+
    '</div>';
    document.body.appendChild(modal);
    document.getElementById('ageEnter').onclick=function(){sessionStorage.setItem('age_ok','1');modal.remove();};
    document.getElementById('ageExit').onclick=function(){window.location.href='https://www.google.com';};
  });
})();
