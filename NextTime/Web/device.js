(()=>{
  const key='next-time-local-v1';
  const warn=message=>{const el=document.getElementById('storage-notice');el.textContent=message;el.hidden=false;};
  window.NextTimeStorage={
    read(){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}catch{warn('暂时无法读取本机记录。请保留此页面，检查 Safari 的存储设置后再试。');return null;}},
    save(value){try{localStorage.setItem(key,JSON.stringify(value));document.getElementById('storage-notice').hidden=true;return true;}catch{warn('本次更改还没有保存。请保持页面打开，释放手机空间后再试。');return false;}}
  };
})();
