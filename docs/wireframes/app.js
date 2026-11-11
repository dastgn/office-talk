/* Shared behaviour for every page: toasts, side drawer, status menu, quick switcher (Ctrl+K) */
(function(){
  const esc=window.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const X='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ARROW='<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* small local memory for per-viewer conveniences (status, view mode) */
  window.store={
    get(k,d){try{const v=localStorage.getItem('wf.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
    set(k,v){try{localStorage.setItem('wf.'+k,JSON.stringify(v))}catch(e){}}
  };

  /* servers a thing can be linked to (placeholders until the backend exists) */
  window.SERVERS=[['None','Not linked'],['Project server goes here','Project server goes here'],['Server name goes here','Server name goes here']];
  window.serverCard=name=>(!name||name==='None')
    ?'<div class="muted small">Not linked to a server yet</div>'
    :'<a class="linkcard" href="server.html"><span class="lc-ic">#</span><div><b>'+esc(name)+'</b><small>Channel name goes here &middot; members online go here</small></div>'+ARROW+'</a>';
  window.selectHTML=(id,opts,val)=>'<select class="inp" id="'+id+'">'+opts.map(o=>{
    const v=Array.isArray(o)?o[0]:o,l=Array.isArray(o)?o[1]:o;
    return '<option value="'+esc(v)+'"'+(String(v)===String(val)?' selected':'')+'>'+esc(l)+'</option>'}).join('')+'</select>';

  /* toasts */
  const tw=document.createElement('div');tw.className='toasts';document.body.appendChild(tw);
  window.toast=m=>{const t=document.createElement('div');t.className='toast';t.textContent=m;tw.appendChild(t);
    requestAnimationFrame(()=>t.classList.add('in'));
    setTimeout(()=>{t.classList.remove('in');setTimeout(()=>t.remove(),250)},2400)};

  /* side drawer for details and forms */
  const sc=document.createElement('div');sc.className='scrim';
  const dr=document.createElement('aside');dr.className='drawer';dr.setAttribute('role','dialog');
  document.body.append(sc,dr);
  window.openDrawer=(html,mount,keep)=>{
    const prev=dr.classList.contains('open')?dr.scrollTop:0;
    dr.innerHTML='<button class="ibtn d-x" data-close title="Close">'+X+'</button><div class="d-in">'+html+'</div>';
    sc.classList.add('open');dr.classList.add('open');dr.scrollTop=keep?prev:0;
    if(mount)mount(dr);
  };
  window.closeDrawer=()=>{sc.classList.remove('open');dr.classList.remove('open')};
  sc.addEventListener('click',closeDrawer);
  dr.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeDrawer()});

  /* profile card on "Your name" (status, custom status, edit profile, switch accounts) */
  const me=document.querySelector('.me');
  const ST={on:'Online',away:'Away',dnd:'Do not disturb',off:'Invisible'};
  const STD={on:'',away:'',dnd:'You will not get notifications',off:'You will appear offline'};
  const CHEV='<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
  const PEN='<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
  const SWAP='<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  if(me){
    const pc=document.createElement('div');pc.className='pcard';
    me.appendChild(pc);
    const draw=()=>{
      const k=store.get('status','on'),cs=store.get('cstatus','');
      pc.innerHTML=
        '<div class="pc-banner"></div>'+
        '<div class="pc-top"><div class="pc-av">Y<i class="sdot '+k+'"></i></div>'+
          '<button class="pc-bubble" id="pcBubble">'+(cs?esc(cs):'<span class="muted">+ Set a custom status</span>')+'</button></div>'+
        '<div class="pc-name"><b>Your name</b><span class="muted">username goes here</span></div>'+
        '<div class="pc-box">'+
          '<a class="pc-row" href="settings.html">'+PEN+'<span>Edit profile</span></a>'+
          '<div class="pc-sep"></div>'+
          '<button class="pc-row" data-sub="status"><i class="sdot '+k+'"></i><span>'+ST[k]+'</span>'+CHEV+
            '<div class="pc-fly">'+Object.keys(ST).map(s=>'<div class="pc-opt'+(s===k?' on':'')+'" data-s="'+s+'"><i class="sdot '+s+'"></i><div><b>'+ST[s]+'</b>'+(STD[s]?'<small>'+STD[s]+'</small>':'')+'</div></div>').join('')+'</div></button>'+
        '</div>'+
        '<div class="pc-box">'+
          '<button class="pc-row" data-sub="acct">'+SWAP+'<span>Switch accounts</span>'+CHEV+
            '<div class="pc-fly"><div class="pc-opt on"><span class="pc-mini">Y</span><div><b>Your name</b><small>username goes here</small></div></div>'+
            '<div class="pc-opt" data-add><span class="pc-mini add">+</span><div><b>Add an account</b></div></div></div></button>'+
        '</div>';
    };
    const applyStatus=k=>{me.querySelector('.dot').className='dot '+k;me.querySelector('.who span').textContent=ST[k]};
    draw();applyStatus(store.get('status','on'));
    me.querySelectorAll('.av,.who').forEach(x=>{x.style.cursor='pointer';x.title='Open your profile';
      x.addEventListener('click',e=>{e.stopPropagation();draw();pc.classList.toggle('open')})});
    pc.addEventListener('click',e=>{
      e.stopPropagation();
      const o=e.target.closest('[data-s]');
      if(o){store.set('status',o.dataset.s);applyStatus(o.dataset.s);draw();toast('Status set to '+ST[o.dataset.s]);return}
      if(e.target.closest('[data-add]')){toast('Add an account (comes with the backend)');return}
      const sub=e.target.closest('[data-sub]');if(sub&&!e.target.closest('.pc-fly')){pc.querySelectorAll('[data-sub]').forEach(x=>{if(x!==sub)x.classList.remove('open')});sub.classList.toggle('open');return}
      if(e.target.closest('#pcBubble')){
        const bub=pc.querySelector('#pcBubble');
        bub.outerHTML='<input class="pc-bubble pc-in" id="pcIn" maxlength="60" placeholder="What are you working on?" value="'+esc(store.get('cstatus',''))+'">';
        const i=pc.querySelector('#pcIn');i.focus();
        i.addEventListener('keydown',ev=>{if(ev.key==='Enter'){store.set('cstatus',i.value.trim());draw();toast(i.value.trim()?'Custom status set':'Custom status cleared')}if(ev.key==='Escape'){ev.stopPropagation();draw()}});
        i.addEventListener('blur',()=>setTimeout(draw,100));
      }
    });
    document.addEventListener('click',()=>pc.classList.remove('open'));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')pc.classList.remove('open')});
  }

  /* conversations in the sidebar: open them in Messages from any page */
  const dms=[...document.querySelectorAll('.dm')];
  dms.forEach((d,i)=>d.dataset.i=i);
  const onMessages=/messages\.html$/.test(location.pathname)||!!document.getElementById('msgs');
  if(!onMessages)dms.forEach(d=>{d.title='Open conversation (right-click for options)';d.addEventListener('click',()=>{location.href='messages.html?dm='+d.dataset.i})});

  /* right-click a conversation: pin to top, mark unread, mute */
  const box=document.querySelector('.dms');
  const PIN='<svg viewBox="0 0 24 24"><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3zM12 14v7"/></svg>';
  const BELL='<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/></svg>';
  const DOTI='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>';
  const TABI='<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M9 5v4"/></svg>';
  const CHAT='<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  window.renderDMs=()=>{
    if(!box)return;
    const pinned=store.get('pinned',[]),muted=store.get('muted',[]);
    box.querySelectorAll('.dm-sec').forEach(x=>x.remove());
    const pins=pinned.map(i=>dms[i]).filter(Boolean),rest=dms.filter(d=>!pinned.includes(+d.dataset.i));
    dms.forEach(d=>{
      const i=+d.dataset.i;d.classList.toggle('pinned',pinned.includes(i));d.classList.toggle('muted',muted.includes(i));
      let ic=d.querySelector('.dm-ic');if(!ic){ic=document.createElement('span');ic.className='dm-ic';d.appendChild(ic)}
      ic.innerHTML=(pinned.includes(i)?PIN:'')+(muted.includes(i)?'<span class="mutei" title="Muted">'+BELL+'</span>':'');
    });
    if(pins.length){box.insertAdjacentHTML('beforeend','<div class="dm-sec">Pinned</div>');pins.forEach(d=>box.appendChild(d));
      box.insertAdjacentHTML('beforeend','<div class="dm-sec">Recent</div>')}
    rest.forEach(d=>box.appendChild(d));
  };
  const ctx=document.createElement('div');ctx.className='ctx';document.body.appendChild(ctx);
  const closeCtx=()=>ctx.classList.remove('open');
  if(box)box.addEventListener('contextmenu',e=>{
    const d=e.target.closest('.dm');if(!d)return;e.preventDefault();
    const i=+d.dataset.i,pinned=store.get('pinned',[]),muted=store.get('muted',[]),unread=!!d.querySelector('.unread');
    ctx.innerHTML='<div class="ctx-h">Name goes here</div>'+
      '<button data-a="open">'+CHAT+'Open conversation</button>'+
      '<button data-a="tab">'+TABI+'Open in new tab</button>'+
      '<button data-a="pin">'+PIN+(pinned.includes(i)?'Unpin from top':'Pin to top')+'</button>'+
      '<button data-a="read">'+DOTI+(unread?'Mark as read':'Mark as unread')+'</button>'+
      '<button data-a="mute">'+BELL+(muted.includes(i)?'Unmute':'Mute conversation')+'</button>';
    ctx.classList.add('open');
    const w=ctx.offsetWidth,h=ctx.offsetHeight;
    ctx.style.left=Math.min(e.clientX,innerWidth-w-8)+'px';ctx.style.top=Math.min(e.clientY,innerHeight-h-8)+'px';
    ctx.onclick=ev=>{const b=ev.target.closest('[data-a]');if(!b)return;closeCtx();
      const a=b.dataset.a;
      if(a==='open')d.click();
      if(a==='tab')addTab({title:'Name goes here',url:'messages.html?dm='+i});
      if(a==='pin'){let p=store.get('pinned',[]);p=p.includes(i)?p.filter(x=>x!==i):p.concat(i);store.set('pinned',p);renderDMs();toast(p.includes(i)?'Pinned to the top':'Unpinned')}
      if(a==='mute'){let m=store.get('muted',[]);m=m.includes(i)?m.filter(x=>x!==i):m.concat(i);store.set('muted',m);renderDMs();toast(m.includes(i)?'Conversation muted':'Conversation unmuted')}
      if(a==='read'){const u=d.querySelector('.unread');
        if(u){u.remove();d.classList.remove('has-unread')}else{d.insertAdjacentHTML('beforeend','<span class="unread">1</span>');d.classList.add('has-unread');d.appendChild(d.querySelector('.dm-ic'))}}
    };
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.ctx'))closeCtx()});
  addEventListener('scroll',closeCtx,true);addEventListener('resize',closeCtx);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCtx()});
  renderDMs();

  /* ===== in-app tabs: right-click anything -> Open in new tab ===== */
  const PAGEICON={
    'messages.html':'<path d="M4 5h16v11H9l-5 4z"/>',
    'personal-files.html':'<path d="M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    'personal-tasks.html':'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>',
    'personal-calendar.html':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'personal-roadmap.html':'<path d="M3 7h10M3 12h14M3 17h8"/><circle cx="17" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
    'server.html':'<path d="M5 9h14M5 15h14M10 3L8 21M16 3l-2 18"/>',
    'call.html':'<rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10l6-3v10l-6-3"/>',
    'settings.html':'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    'create-company.html':'<path d="M4 21V4h10v17M14 9h6v12"/>',
    'company.html':'<path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2"/>'};
  const file=u=>(u.split('#')[0].split('?')[0].split('/').pop()||'messages.html');
  const here=()=>file(location.pathname)+location.search;
  const icon=u=>'<svg viewBox="0 0 24 24">'+(PAGEICON[file(u)]||PAGEICON['messages.html'])+'</svg>';
  const strip=document.createElement('div');strip.className='tabstrip';document.body.prepend(strip);
  let activeTab=store.get('activeTab',null);
  function drawTabs(){
    const tabs=store.get('tabs',[]);
    document.body.classList.toggle('has-tabs',tabs.length>0);
    if(!tabs.some(t=>t.id===activeTab&&t.url===here())){const m=tabs.find(t=>t.url===here());activeTab=m?m.id:null}
    strip.innerHTML=tabs.map(t=>'<div class="wtab'+(t.id===activeTab?' on':'')+'" data-tab="'+t.id+'" title="'+esc(t.title)+'">'+
      '<button class="wtab-x" data-x="'+t.id+'" title="Close tab">&times;</button>'+icon(t.url)+'<span>'+esc(t.title)+'</span></div>').join('')+
      (tabs.length>1?'<button class="wtab-all" data-closeall>Close all</button>':'');
    window.dispatchEvent(new Event('resize'));
  }
  window.addTab=({title,url})=>{
    const tabs=store.get('tabs',[]);
    if(tabs.length>=12){toast('You can have up to 12 tabs open');return}
    tabs.push({id:Date.now()+Math.random().toString(36).slice(2,6),title:(title||'Page').trim().slice(0,40),url:url});
    store.set('tabs',tabs);drawTabs();toast('Opened in a new tab');
  };
  strip.addEventListener('click',e=>{
    const x=e.target.closest('[data-x]');
    if(x){store.set('tabs',store.get('tabs',[]).filter(t=>t.id!==x.dataset.x));drawTabs();return}
    if(e.target.closest('[data-closeall]')){store.set('tabs',[]);drawTabs();return}
    const t=e.target.closest('[data-tab]');if(!t)return;
    const tab=store.get('tabs',[]).find(z=>z.id===t.dataset.tab);if(!tab)return;
    store.set('activeTab',tab.id);
    if(tab.url===here()){activeTab=tab.id;drawTabs()}else location.href=tab.url;
  });
  strip.addEventListener('auxclick',e=>{const t=e.target.closest('[data-tab]');if(e.button===1&&t){store.set('tabs',store.get('tabs',[]).filter(z=>z.id!==t.dataset.tab));drawTabs()}});
  addEventListener('storage',e=>{if(e.key==='wf.tabs')drawTabs()});

  /* work out what was right-clicked and where it should open */
  const firstText=el=>{
    const c=el.cloneNode(true);
    c.querySelectorAll('small,.lk,.pb,.fx,.m,em,svg,.gt-chips,.unread,.dm-ic,.gt-star,.gt-circle,.s-on,.av').forEach(x=>x.remove());
    const b=c.querySelector('b,.fn,.gt-tx span');
    return ((b&&b.textContent)||c.textContent||el.getAttribute('title')||'').replace(/\s+/g,' ').replace(/^\d{1,2}:\d{2}\s*/,'').trim()||'Page'};
  function target(el){
    let n;
    if(n=el.closest('.bar-m'))return {title:firstText(n).replace(/ ?(Nov|Dec|Jan|Feb|Mar|Apr).*$/,''),url:'personal-roadmap.html?m='+n.dataset.m};
    if(n=el.closest('[data-e]'))return {title:firstText(n),url:'personal-calendar.html?e='+n.dataset.e};
    if((n=el.closest('[data-f]'))&&/personal-files/.test(location.pathname))return {title:firstText(n),url:'personal-files.html?f='+n.dataset.f};
    if(n=el.closest('.gt-task'))return {title:firstText(n),url:'personal-tasks.html?t='+n.dataset.t};
    if(n=el.closest('.dm'))return {title:'Name goes here',url:'messages.html?dm='+n.dataset.i};
    if(n=el.closest('.ctab'))return {title:n.textContent.trim(),url:'messages.html'};
    n=el.closest('a[href]');
    if(n&&!/^(#|javascript:|mailto:)/.test(n.getAttribute('href'))){
      const t=n.classList.contains('co')?'Company home':n.classList.contains('tile')?(n.querySelector('svg')&&!n.textContent.trim()?'Direct messages':'Server '+n.textContent.replace(/\d+$/,'').trim()):firstText(n);
      return {title:t,url:n.getAttribute('href')};
    }
    return null;
  }
  const PAGE_TITLE=()=>{const h=document.querySelector('.chat-head .title');return (h&&h.textContent.trim())||document.title};
  document.addEventListener('contextmenu',e=>{
    if(e.defaultPrevented)return;
    if(e.target.closest('input,textarea,select,[contenteditable=true],.ctx,.tabstrip'))return;   // keep the normal menu for typing
    e.preventDefault();
    const t=target(e.target);
    const items=t
      ?'<div class="ctx-h">'+esc(t.title)+'</div><button data-a="tab">'+TABI+'Open in new tab</button><button data-a="go">'+CHAT.replace('M4 5h16v11H9l-5 4z','M5 12h14M13 6l6 6-6 6')+'Open</button><button data-a="copy"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>Copy link</button>'
      :'<div class="ctx-h">'+esc(PAGE_TITLE())+'</div><button data-a="here">'+TABI+'Open this page in a new tab</button>';
    ctx.innerHTML=items;ctx.classList.add('open');
    const w=ctx.offsetWidth,h=ctx.offsetHeight;
    ctx.style.left=Math.min(e.clientX,innerWidth-w-8)+'px';ctx.style.top=Math.min(e.clientY,innerHeight-h-8)+'px';
    ctx.onclick=ev=>{const b=ev.target.closest('[data-a]');if(!b)return;closeCtx();
      if(b.dataset.a==='tab')addTab(t);
      if(b.dataset.a==='here')addTab({title:PAGE_TITLE(),url:here()});
      if(b.dataset.a==='go')location.href=t.url;
      if(b.dataset.a==='copy'){const c=navigator.clipboard;if(c)c.writeText(new URL(t.url,location.href).href).catch(()=>{});toast('Link copied')}};
  });
  /* middle-click also opens in a new tab, like a browser */
  document.addEventListener('auxclick',e=>{if(e.button!==1||e.target.closest('.tabstrip'))return;const t=target(e.target);if(t){e.preventDefault();addTab(t)}});
  document.addEventListener('mousedown',e=>{if(e.button===1&&target(e.target))e.preventDefault()});
  drawTabs();

  /* quick switcher: Ctrl+K or the "Find or start a conversation" button */
  const PAGES=[
    ['Direct messages','messages.html','Messages'],
    ['Name goes here','messages.html','Direct message'],
    ['Personal files','personal-files.html','Private'],
    ['Tasks','personal-tasks.html','Private'],
    ['Calendar','personal-calendar.html','Private'],
    ['Visual roadmap','personal-roadmap.html','Private'],
    ['Project server goes here','server.html','Server'],
    ['Server name goes here','server.html','Server'],
    ['Start a video call','call.html','Call'],
    ['Create or join a company','create-company.html','Company'],
    ['Company home','company.html','Company'],
    ['Invite people','settings.html#invites','Settings'],
    ['Members and roles','settings.html#members','Settings'],
    ['Join a call as a guest','join.html','Call'],
    ['Pricing','pricing.html','Website'],
    ['Settings','settings.html','Account']];
  const qs=document.createElement('div');qs.className='qs';
  qs.innerHTML='<div class="qs-box"><input placeholder="Where would you like to go?"><div class="qs-list"></div>'+
    '<div class="qs-foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>';
  document.body.appendChild(qs);
  const qi=qs.querySelector('input'),ql=qs.querySelector('.qs-list');let sel=0,hits=[];
  const drawQS=()=>{const q=qi.value.toLowerCase();hits=PAGES.filter(p=>(p[0]+' '+p[2]).toLowerCase().includes(q));
    sel=Math.min(sel,Math.max(0,hits.length-1));
    ql.innerHTML=hits.length?hits.map((p,i)=>'<a href="'+p[1]+'" class="'+(i===sel?'on':'')+'"><span>'+esc(p[0])+'</span><small>'+p[2]+'</small></a>').join(''):'<div class="qs-none">Nothing matches</div>'};
  window.openQS=()=>{qs.classList.add('open');qi.value='';sel=0;drawQS();qi.focus()};
  window.closeQS=()=>qs.classList.remove('open');
  qs.addEventListener('click',e=>{if(e.target===qs)closeQS()});
  qi.addEventListener('input',()=>{sel=0;drawQS()});
  qi.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){sel=Math.min(sel+1,hits.length-1);drawQS();e.preventDefault()}
    if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);drawQS();e.preventDefault()}
    if(e.key==='Enter'&&hits[sel])location.href=hits[sel][1]});
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openQS()}
    if(e.key==='Escape'){closeDrawer();closeQS()}});
  const sb=document.querySelector('.side .search button');
  if(sb){sb.addEventListener('click',openQS);sb.insertAdjacentHTML('beforeend','<kbd class="kb">Ctrl K</kbd>')}
})();
