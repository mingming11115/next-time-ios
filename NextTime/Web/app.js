
(()=>{
 const root=document.getElementById('nexttime-modern');
 const initial=[];
 const stored=window.NextTimeStorage.read();
 const compatible=data=>data&&[3,4].includes(data.version)&&data.state&&Array.isArray(data.state.items);
 const s={page:'home',minutes:120,filter:'待邀约',selected:null,from:'home',items:[],drafts:{},notice:'',...(compatible(stored)?stored.state:{})};
 const design={theme:'system',showQuotes:true,...(stored?.version===4?stored.design:{})};
 const icon=name=>`<i data-lucide="${name}" aria-hidden="true"></i>`;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const button=(text,act,cls='nt-textbutton',extra='')=>`<button type="button" class="${cls} cursor-interaction" data-act="${act}" ${extra}>${text}</button>`;
 const dayMinutes=1440;
 const duration=m=>{const days=Math.floor(m/dayMinutes),hours=Math.floor(m%dayMinutes/60),minutes=m%60;return [days?`${days} 天`:'',hours?`${hours} 小时`:'',minutes?`${minutes} 分钟`:''].filter(Boolean).join(' ')||'0 分钟';};
 const timeChoices=[{minutes:30,label:'30分'},{minutes:60,label:'1小时'},{minutes:120,label:'2小时'},{minutes:240,label:'4小时'}];
 const current=()=>s.items.find(x=>x.id===s.selected)||s.items[0];
 const draft=()=>s.drafts[s.selected]||(s.drafts[s.selected]={when:'时间再商量',where:'地点再商量'});
 const icons=()=>globalThis.lucide?.createIcons({attrs:{width:20,height:20}});
 const isDark=()=>design.theme==='dark'||(design.theme==='system'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches);
 const themeButton=()=>button(icon(isDark()?'sun':'moon'),'theme','nt-circle',`aria-label="切换${isDark()?'浅':'深'}色外观"`);
 function persist(){window.NextTimeStorage.save({version:4,state:s,design});}
 function applyTheme(){root.querySelector('[data-phone]').dataset.theme=design.theme;}
 function toolbar(){return `<header class="nt-toolbar"><div class="nt-brand">下次一定<small>NEXT TIME.</small></div><div class="nt-toolbar-actions">${themeButton()}${button(icon('plus'),'add','nt-circle nt-accent','aria-label="记一个约定"')}</div></header>`;}
 function card(item,{featured=false,compact=false}={}){
  const target=`data-id="${esc(item.id)}"`;
  const time=`<span class="nt-duration">${icon('clock-3')}${duration(item.minutes)}</span>`;
  if(compact)return `<article class="nt-card nt-compact"><div class="nt-compact-copy"><span class="nt-eyebrow">和 ${esc(item.person)}</span><h3>${esc(item.activity)}</h3>${time}</div>${button(icon('arrow-up-right'),'invite','nt-ask',`${target} aria-label="邀请${esc(item.person)}${esc(item.activity)}"`)}</article>`;
  return `<article class="nt-card ${featured?'nt-featured':''}"><div class="nt-card-head"><span class="nt-avatar" aria-hidden="true">${esc(Array.from(item.person)[0])}</span><span class="nt-person">和 ${esc(item.person)}</span><span class="nt-card-date">${esc(item.date)}记下</span></div><h3>${esc(item.activity)}</h3>${design.showQuotes?`<p class="nt-quote">“${esc(item.quote)}”</p>`:''}<div class="nt-card-foot">${time}${item.status==='待邀约'?button('写张邀请 '+icon('arrow-up-right'),'invite','nt-ask',target):item.status==='已邀约'?button('已经见面了 '+icon('check'),'done','nt-ask',target):`<span class="nt-badge">${icon('check-check')}已兑现</span>`}</div>${item.status==='已邀约'?button('这次没约成，留待下次','restore','nt-textbutton',target):''}</article>`;
 }
 function empty(text){return `<div class="nt-empty"><h3>把时间，留给期待。</h3><p>${text}</p>${button('记个新的约定 '+icon('plus'),'add','nt-primary')}</div>`;}
 function home(){
  const fit=s.items.filter(x=>x.status==='待邀约'&&x.minutes<=s.minutes),isCustom=!timeChoices.some(x=>x.minutes===s.minutes);
  const readout=isCustom?`<div class="nt-time-readout nt-custom-readout"><strong>${duration(s.minutes)}</strong></div>`:`<div class="nt-time-readout"><strong>${s.minutes<60?s.minutes:String(s.minutes/60).padStart(2,'0')}</strong><span>${s.minutes<60?'分钟':'小时'}</span></div>`;
  return toolbar()+`<section class="nt-time-panel" aria-label="选择这次的空闲时长"><div class="nt-time-top"><div class="nt-time-context"><span class="nt-eyebrow">这次，我有空</span></div>${readout}</div><div class="nt-times" role="group" aria-label="空闲时长">${timeChoices.map(({minutes:m,label})=>button(label,'time','nt-time',`data-minutes="${m}" aria-label="${duration(m)}" aria-pressed="${s.minutes===m}"`)).join('')}${button('自定义','custom-time','nt-time',`aria-label="自定义空闲时长" aria-haspopup="dialog" aria-pressed="${isCustom}"`)}</div></section><div class="nt-section-head"><h2>时间刚好</h2><span class="nt-section-count">${String(fit.length).padStart(2,'0')} 个旧约</span></div><div aria-live="polite">${fit.length?fit.map((x,i)=>card(x,{featured:i===0,compact:i>0})).join(''):empty(s.items.some(x=>x.status==='待邀约')?'现有约定需要更久一点。<br>换个时长，或记下一次短短的见面。':'先记一个随口说过的约定。<br>有空的时候，就来这里翻一翻。')}</div>`;
 }
 function collection(){const items=s.items.filter(x=>x.status===s.filter);return toolbar()+`<section class="nt-hero"><h1>我的约定。</h1><p>说过的「改天」，都在这里。</p></section>${s.notice?`<div class="nt-notice" role="status">${esc(s.notice)}</div>`:''}<div class="nt-filters" role="group" aria-label="约定状态">${['待邀约','已邀约','已兑现'].map(v=>button(`${v}<span>${s.items.filter(x=>x.status===v).length}</span>`,'filter','nt-filter',`data-filter="${v}" aria-pressed="${s.filter===v}"`)).join('')}</div>${items.length?items.map(x=>card(x)).join(''):empty(s.filter==='待邀约'?'把想见的人、想做的事，<br>先记在这里。':'见面不用赶进度，<br>等一个刚刚好的日子。')}`;}
 function header(title,act='back'){return `<header class="nt-page-header">${button(icon('chevron-left'),act,'nt-circle','aria-label="返回"')}<h1>${title}</h1>${themeButton()}</header>`;}
 function letter(){const item=current(),d=draft();return `<article class="nt-letter" aria-label="给${esc(item.person)}的邀约草稿"><div class="nt-letter-top"><span class="nt-to">TO. ${esc(item.person)}</span><span class="nt-letter-mark">${icon('arrow-up-right')}</span></div><h2>下次，<br>就这次。</h2><p class="nt-letter-copy">上次说的<b>「${esc(item.activity)}」</b>，<br>我还记着。刚好有空，要不要一起？</p><div class="nt-letter-info"><p>${icon('calendar-days')}<span>${esc(d.when||'时间再商量')}</span></p><p>${icon('map-pin')}<span>${esc(d.where||'地点再商量')}</span></p></div><p class="nt-letter-signature">LET’S MAKE IT HAPPEN.</p></article>`;}
 function invitation(){const d=draft();return header('写张邀请')+`<p class="nt-draft-label">${icon('pencil-line')}邀约草稿 · 等 TA 确认</p><div data-letter>${letter()}</div><div class="nt-editor"><div class="nt-edit-row">${icon('calendar-days')}<label class="nt-edit-label">想约的时间<input class="nt-edit-input" data-field="when" value="${esc(d.when)}" placeholder="时间再商量" maxlength="40"></label></div><div class="nt-edit-row">${icon('map-pin')}<label class="nt-edit-label">想约的地点<input class="nt-edit-input" data-field="where" value="${esc(d.where)}" placeholder="地点再商量" maxlength="50"></label></div></div><div data-feedback aria-live="polite"></div>`;}
 function shareCard(){return header('邀约卡','edit')+`<p class="nt-draft-label">${icon('mail')}给 ${esc(current().person)} 的邀约草稿</p>${letter()}<p class="nt-hint">一个旧约，一个想见面的人。</p>`;}
 function nav(){if(s.page==='invite')return `<div class="nt-actions">${button('复制邀约文案 '+icon('arrow-up-right'),'copy','nt-primary')}${button(icon('scan')+'预览邀约卡','preview','nt-secondary')}<p class="nt-hint">由你发给对方</p>${button('我已发出邀约，记一下','sent')}</div><div class="nt-homebar" aria-hidden="true"></div>`;if(s.page==='preview')return `<div class="nt-actions">${button('继续编辑 '+icon('arrow-up-right'),'edit','nt-primary')}</div><div class="nt-homebar" aria-hidden="true"></div>`;return `<div class="nt-nav-area"><nav class="nt-nav" aria-label="底部导航">${button(icon('sparkles')+'我有空','home','nt-nav-button',s.page==='home'?'aria-current="page"':'')}${button(icon('plus'),'add','nt-nav-add','aria-label="记个约定"')}${button(icon('layers')+'我的约定','collection','nt-nav-button',s.page==='collection'?'aria-current="page"':'')}</nav><div class="nt-homebar" aria-hidden="true"></div></div>`;}
 function render(){if(!current()&&['invite','preview'].includes(s.page))s.page='home';applyTheme();root.querySelector('[data-screen]').innerHTML=s.page==='home'?home():s.page==='collection'?collection():s.page==='preview'?shareCard():invitation();root.querySelector('[data-navigation]').innerHTML=nav();icons();}
 let sheetTrigger=null;
 function closeSheet(){const overlay=root.querySelector('[data-sheet]');if(overlay.hidden)return;overlay.hidden=true;overlay.innerHTML='';root.querySelector('[data-shell]').inert=false;sheetTrigger?.focus();sheetTrigger=null;}
 function durationFields(total,{hidden=false}={}){
  return `<fieldset class="nt-duration-fields" data-duration-fields aria-label="自定义时长" ${hidden?'hidden disabled':''}><label class="nt-label">天<input class="nt-input" name="days" type="number" inputmode="numeric" min="0" step="1" value="${Math.floor(total/dayMinutes)}"></label><label class="nt-label">小时<input class="nt-input" name="hours" type="number" inputmode="numeric" min="0" max="23" step="1" value="${Math.floor(total%dayMinutes/60)}"></label><label class="nt-label">分钟<input class="nt-input" name="extraMinutes" type="number" inputmode="numeric" min="0" max="59" step="1" value="${total%60}"></label></fieldset>`;
 }
 function showSheet(trigger,content){sheetTrigger=trigger;const overlay=root.querySelector('[data-sheet]');overlay.innerHTML=content;overlay.hidden=false;root.querySelector('[data-shell]').inert=true;icons();overlay.querySelector('button')?.focus();}
 function openCustomTime(trigger){showSheet(trigger,`<section class="nt-sheet" role="dialog" aria-modal="true" aria-labelledby="nt-custom-title"><div class="nt-handle" aria-hidden="true"></div><div class="nt-sheet-head"><h2 id="nt-custom-title">这次，空出多久？</h2>${button(icon('x'),'close','nt-circle','aria-label="关闭自定义时长"')}</div><p class="nt-sheet-intro">几个小时，或连续几天，都由你来定。</p><form class="nt-form" data-custom-time-form>${durationFields(s.minutes)}<p class="nt-duration-note">1 天按连续 24 小时计算。</p><div data-errors role="alert"></div><button type="submit" class="nt-primary cursor-interaction">用这个时长找旧约 ${icon('arrow-up-right')}</button>${button('取消','close','nt-secondary')}</form></section>`);}
 function openSheet(trigger){showSheet(trigger,`<section class="nt-sheet" role="dialog" aria-modal="true" aria-labelledby="nt-add-title"><div class="nt-handle" aria-hidden="true"></div><div class="nt-sheet-head"><h2 id="nt-add-title">把下次，记下来。</h2>${button(icon('x'),'close','nt-circle','aria-label="关闭记约定"')}</div><p class="nt-sheet-intro">某天刚好有空，就从这里出发。</p><form class="nt-form" data-add-form><label class="nt-label">和谁<input name="person" class="nt-input" placeholder="想见面的那个人" required maxlength="12"></label><label class="nt-label">想做什么<input name="activity" class="nt-input" placeholder="例如：一起去吃火锅" required maxlength="32"></label><label class="nt-label">预计占用多久<select name="minutes" class="nt-input" data-duration-select>${[30,60,90,120,180,240].map(m=>`<option value="${m}" ${m===120?'selected':''}>${duration(m)}</option>`).join('')}<option value="custom">自定义 · 支持多天</option></select></label>${durationFields(1440,{hidden:true})}<p class="nt-duration-note" data-duration-note hidden></p><label class="nt-label">当时怎么说的 · 选填<textarea name="quote" class="nt-input" placeholder="留住随口说出的那句话。" maxlength="80"></textarea></label><div data-errors role="alert"></div><button type="submit" class="nt-primary cursor-interaction">记下这个约定 ${icon('arrow-up-right')}</button></form></section>`);}
 function readDuration(values){
  const parts=['days','hours','extraMinutes'].map(k=>Number(values.get(k)||0));
  const [days,hours,minutes]=parts,total=days*dayMinutes+hours*60+minutes;
  if(parts.some(v=>!Number.isSafeInteger(v)||v<0)||hours>23||minutes>59||!Number.isSafeInteger(total)||total<=0){root.querySelector('[data-errors]').innerHTML='<p class="nt-error">请输入有效时长：天数为非负整数，小时 0–23、分钟 0–59，合计至少 1 分钟。</p>';return null;}
  return total;
 }
 function inviteText(){const item=current(),d=draft();return `${item.person}，上次说的${item.activity}，我还记着！\n${d.when||'时间再商量'}，要不要一起？\n${d.where||'地点再商量'}。你方便的话，我们就约上。`;}
 root.addEventListener('click',async event=>{if(event.target===root.querySelector('[data-sheet]')){closeSheet();return;}const el=event.target.closest('button[data-act]');if(!el)return;const act=el.dataset.act;s.notice='';
  if(act==='theme'){design.theme=isDark()?'light':'dark';applyTheme();root.querySelectorAll('button[data-act="theme"]').forEach(b=>{b.innerHTML=icon(isDark()?'sun':'moon');b.setAttribute('aria-label',`切换${isDark()?'浅':'深'}色外观`);});icons();persist();return;}
  if(act==='home'||act==='collection')s.page=act;
  else if(act==='add'){openSheet(el);return;}
  else if(act==='custom-time'){openCustomTime(el);return;}
  else if(act==='close'){closeSheet();return;}
  else if(act==='back')s.page=s.from;
  else if(act==='time'){s.minutes=Number(el.dataset.minutes);s.selected=null;}
  else if(act==='filter')s.filter=el.dataset.filter;
  else if(act==='invite'){s.selected=el.dataset.id;s.from=s.page;s.page='invite';draft();}
  else if(act==='preview')s.page='preview';
  else if(act==='edit')s.page='invite';
  else if(act==='sent'){current().status='已邀约';s.page='collection';s.filter='已邀约';s.notice='已记下，等对方一句「好呀」。';}
  else if(act==='done'){const item=s.items.find(x=>x.id===el.dataset.id);if(item)item.status='已兑现';s.filter='已兑现';s.notice='这个「下次」，有了一个今天。';}
  else if(act==='restore'){const item=s.items.find(x=>x.id===el.dataset.id);if(item)item.status='待邀约';s.filter='待邀约';s.notice='收好了，留给下次刚好有空。';}
  else if(act==='copy'){const out=root.querySelector('[data-feedback]');try{if(window.webkit?.messageHandlers?.copyInvitation){window.webkit.messageHandlers.copyInvitation.postMessage(inviteText());}else{if(!navigator.clipboard?.writeText)throw Error('unavailable');await navigator.clipboard.writeText(inviteText());}out.innerHTML='<div class="nt-notice">已复制，发给对方问问吧。</div>';}catch{out.innerHTML=`<div class="nt-notice">长按下方文案，就能选择并复制。</div><textarea class="nt-copybox" readonly aria-label="邀约文案">${esc(inviteText())}</textarea>`;}return;}
  render();persist();
 });
 root.addEventListener('input',event=>{const key=event.target.dataset.field;if(!['when','where'].includes(key))return;draft()[key]=event.target.value;root.querySelector('[data-letter]').innerHTML=letter();root.querySelector('[data-feedback]').innerHTML='';icons();persist();});
 root.addEventListener('keydown',event=>{const overlay=root.querySelector('[data-sheet]');if(overlay.hidden)return;if(event.key==='Escape'){closeSheet();return;}if(event.key==='Tab'){const fields=[...overlay.querySelectorAll('button,input,select,textarea')];const first=fields[0],last=fields[fields.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 root.addEventListener('change',event=>{if(!event.target.matches('[data-duration-select]'))return;const custom=event.target.value==='custom',fields=root.querySelector('[data-duration-fields]');fields.hidden=!custom;fields.disabled=!custom;const note=root.querySelector('[data-duration-note]');note.hidden=!custom;note.textContent=custom?'1 天按连续 24 小时计算。':'';root.querySelector('[data-errors]').innerHTML='';});
 root.addEventListener('submit',event=>{
  const customTime=event.target.matches('[data-custom-time-form]'),add=event.target.matches('[data-add-form]');if(!customTime&&!add)return;event.preventDefault();const values=new FormData(event.target);
  if(customTime){const total=readDuration(values);if(total===null)return;s.minutes=total;s.selected=null;closeSheet();render();root.querySelector('.nt-times button[aria-pressed="true"]')?.focus();persist();return;}
  const person=String(values.get('person')||'').trim(),activity=String(values.get('activity')||'').trim();if(!person||!activity){root.querySelector('[data-errors]').innerHTML='<p class="nt-error">写下想见的人和想做的事吧。</p>';return;}
  const minutes=values.get('minutes')==='custom'?readDuration(values):Number(values.get('minutes'));if(minutes===null)return;if(!Number.isSafeInteger(minutes)||minutes<=0){root.querySelector('[data-errors]').innerHTML='<p class="nt-error">请选择约定需要的时长。</p>';return;}
  s.items.unshift({id:'new-'+crypto.randomUUID(),person,activity,minutes,quote:String(values.get('quote')||'').trim()||'下次，一起去。',date:'今天',status:'待邀约'});closeSheet();s.page='collection';s.filter='待邀约';s.notice='记好了，等一个刚好有空的日子。';render();persist();
 });

 render();
 if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{Promise.resolve(document.modelContext.registerTool({
   name:'get_matching_promises',title:'查看时间合适的旧约',description:'读取这部设备上耗时不超过指定空闲时间、尚未邀约的约定。不会更改筛选或发送邀约。',
   inputSchema:{type:'object',properties:{availableMinutes:{type:'integer',minimum:1}},required:['availableMinutes'],additionalProperties:false},
   annotations:{readOnlyHint:true,untrustedContentHint:true},
   execute(input){if(!input||!Number.isSafeInteger(input.availableMinutes)||input.availableMinutes<1)throw new Error('请输入大于零的整数分钟数。');return {promises:s.items.filter(x=>x.status==='待邀约'&&x.minutes<=input.availableMinutes).map(({id,person,activity,minutes})=>({id,person,activity,minutes}))};}
  },{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',event=>{if(!event.persisted)lifecycle.abort();});
 }

})();
