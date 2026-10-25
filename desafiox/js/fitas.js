/* Fitas de isolamento: posicionadas sobre o conteúdo, cruzando em X, nunca sobre texto (HTML ou texto dentro das artes). Estáticas: recalculam só em load/resize. */
(function(){
  var PREF={s1:[.5],s2:[.8,.7,.3],s3:[.18,.3,.8],s4:[.72,.6,.25],s5:[.25,.4,.8],s6:[.82,.6,.2],s7:[.78,.65,.22],s8:[.22,.35,.8]};
  function textRects(){
    var out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,sy=scrollY,sx=scrollX;
    while(n=w.nextNode()){
      if(!n.textContent.trim())continue;var p=n.parentElement;
      if(!p||p.closest('.seam,.ribbons,script,style'))continue;
      var d=p.closest('details');if(d&&!d.open&&!p.closest('summary'))continue;
      var r=document.createRange();r.selectNodeContents(n);var rs=r.getClientRects();
      for(var i=0;i<rs.length;i++){var b=rs[i];if(b.width&&b.height)out.push([b.left+sx,b.top+sy,b.right+sx,b.bottom+sy]);}
    }
    document.querySelectorAll('img[data-txt]').forEach(function(im){
      var b=im.getBoundingClientRect();if(!b.width)return;
      im.dataset.txt.split(';').forEach(function(s){var f=s.split(',').map(Number);
        out.push([b.left+sx+f[0]*b.width,b.top+sy+f[1]*b.height,b.left+sx+f[2]*b.width,b.top+sy+f[3]*b.height]);});
    });
    return out;
  }
  function hits(rects,cx,cy,deg,r){
    var t=deg*Math.PI/180,nx=-Math.sin(t),ny=Math.cos(t);
    for(var i=0;i<rects.length;i++){var q=rects[i],mn=1e9,mx=-1e9;
      for(var k=0;k<4;k++){var x=k&1?q[2]:q[0],y=k&2?q[3]:q[1],d=(x-cx)*nx+(y-cy)*ny;if(d<mn)mn=d;if(d>mx)mx=d;}
      if(mx>=-r&&mn<=r)return true;}
    return false;
  }
  function layout(){
    var W=document.documentElement.clientWidth,mob=W<=800,th=mob?30:44,M=6;
    var mags=mob?[14,11,17,9,20,7,24,5,4,3]:[8,10,6,12,5,14,4,3];
    var all=textRects();
    document.querySelectorAll('.seam').forEach(function(seam){
      seam.style.display='';var sb=seam.getBoundingClientRect(),sy=sb.top+scrollY,id=[].slice.call(seam.classList).find(function(c){return /^s\d+$/.test(c)});
      var tps=[].slice.call(seam.querySelectorAll('.tp'));
      var rects=all.filter(function(q){return q[3]>sy-900&&q[1]<sy+900});
      var R=function(tp){return (tp.classList.contains('k')?th*.85+3:th)/2+M};
      var pref=(PREF[id]||[.5]).concat([.5,.12,.88,.35,.65]),best=null;
      var pairs=[];mags.forEach(function(a,i){mags.forEach(function(b,j){pairs.push([a,-b,i+j]);pairs.push([-a,b,i+j]);});});
      if(tps.length===1)pairs=mags.map(function(a,i){return [i%2?a:-a,null,i]});
      pref.forEach(function(fx,ci){
        var cx=fx*W;
        pairs.forEach(function(pr){
          for(var dy=0;dy<=420;dy+=4){[dy,-dy].forEach(function(o){
            var sc=dy+ci*30+pr[2]*5;if(best&&sc>=best.sc)return;
            var cy=sy+o,angs=[pr[0]];if(pr[1]!==null)angs.push(pr[1]);if(tps.length===3)angs.push((pr[0]+pr[1])/2);
            for(var i=0;i<tps.length;i++)if(hits(rects,cx,cy,angs[i],R(tps[i])))return;
            best={sc:sc,cx:cx,cy:cy,angs:angs};
          });if(best&&dy>best.sc)break;}
        });
      });
      if(!best){seam.style.display='none';return;}
      var ecx=sb.left+0.5*innerWidth;
      // fitas da frente recebem os ângulos principais; a de trás (k) o restante
      var order=tps.slice().sort(function(a,b){return a.classList.contains('k')-b.classList.contains('k')});
      if(tps.length===2)order=tps;
      order.forEach(function(tp,i){
        var a=best.angs[i],yc=best.cy-sy+(ecx-best.cx)*Math.tan(a*Math.PI/180),s=tp.classList.contains('k')?.85:1;
        tp.style.transform='translateY('+yc.toFixed(1)+'px) rotate('+a+'deg) scale('+s+')';
      });
      seam.dataset.cross=Math.round(best.cx)+','+Math.round(best.cy-sy);
    });
  }
  var to;function go(){clearTimeout(to);to=setTimeout(function(){var h=document.documentElement;h.classList.add('fit-medir');try{layout();}finally{h.classList.remove('fit-medir');}},60);}
  if(document.readyState!=='loading')go();else document.addEventListener('DOMContentLoaded',go);
  addEventListener('load',go);document.addEventListener('toggle',go,true);addEventListener('resize',go);
  if(document.fonts)document.fonts.ready.then(go);
})();
