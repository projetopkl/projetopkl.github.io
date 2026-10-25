(function(){
  var box=document.getElementById('cdx');if(!box)return;
  var fim=new Date(box.getAttribute('data-fim')).getTime();
  var pls={};box.querySelectorAll('.cdx-pl').forEach(function(p){pls[p.dataset.k]=p;});
  function tile(){var d=document.createElement('div');d.className='fl';
    d.innerHTML='<div class="t"><i></i></div><div class="b"><i></i></div><div class="ft"><i></i></div><div class="fb"><i></i></div>';d._v=null;return d;}
  function setTile(t,v){if(t._v===v)return;var old=t._v===null?v:t._v;
    var q=function(s){return t.querySelector(s+' i');};
    q('.t').textContent=v;q('.b').textContent=old;q('.ft').textContent=old;q('.fb').textContent=v;
    t.classList.remove('go');void t.offsetWidth;if(t._v!==null)t.classList.add('go');
    clearTimeout(t._to);t._to=setTimeout(function(){q('.b').textContent=v;t.classList.remove('go');},620);t._v=v;}
  function put(k,str){var p=pls[k];while(p.children.length<str.length)p.appendChild(tile());
    while(p.children.length>str.length)p.removeChild(p.firstChild);
    for(var i=0;i<str.length;i++)setTile(p.children[i],str[i]);}
  function pad(n){return n<10?'0'+n:''+n;}
  var timer;
  function tick(){var ms=fim-Date.now();
    if(ms<=0){box.querySelector('.cdx-row').hidden=true;box.querySelector('.cdx-tit').hidden=true;box.querySelector('.cdx-end').hidden=false;clearInterval(timer);return;}
    var s=Math.floor(ms/1000),d=Math.floor(s/86400);s%=86400;
    put('d',d<100?pad(d):''+d);put('h',pad(Math.floor(s/3600)));put('m',pad(Math.floor(s%3600/60)));put('s',pad(s%60));
    box.setAttribute('aria-label','Faltam '+d+' dias');}
  tick();timer=setInterval(tick,1000);
})();
