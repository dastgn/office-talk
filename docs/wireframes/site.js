
(function(){
  const tw=document.createElement('div');tw.className='toasts';document.body.appendChild(tw);
  window.toast=m=>{const t=document.createElement('div');t.className='toast';t.textContent=m;tw.appendChild(t);requestAnimationFrame(()=>t.classList.add('in'));setTimeout(()=>{t.classList.remove('in');setTimeout(()=>t.remove(),250)},2600)};
  window.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  window.store={get(k,d){try{const v=localStorage.getItem('wf.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('wf.'+k,JSON.stringify(v))}catch(e){}}};
  window.copyText=t=>{const c=navigator.clipboard;if(c&&c.writeText)c.writeText(t).catch(()=>{})};
  const nav=document.querySelector('.topnav'),b=document.getElementById('burger');
  if(b)b.addEventListener('click',()=>nav.classList.toggle('open'));
  const here=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{if(a.getAttribute('href')===here)a.classList.add('on')});
  document.addEventListener('click',e=>{const a=e.target.closest('[data-soon]');if(a){e.preventDefault();toast('This page has not been designed yet')}});
  document.addEventListener('click',e=>{const a=e.target.closest('[data-toast]');if(a){e.preventDefault();toast(a.dataset.toast)}});
})();
