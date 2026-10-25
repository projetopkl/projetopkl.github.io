(function(){
  var bs=document.querySelectorAll('.quero-abrir');if(!bs.length)return;
  var m=document.createElement('div');m.id='quero-modal';m.className='quero-modal';m.hidden=true;
  m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Escolha seu plano');
  m.innerHTML='<button type="button" class="faq-x" aria-label="Fechar">×</button><div class="quero-lista"><a class="btn quero-op" href="https://pay.kiwify.com.br/g9sPenn" target="_blank" rel="noopener">Quero treinar</a><a class="btn quero-op" href="https://pay.kiwify.com.br/NEKeM38" target="_blank" rel="noopener">Quero competir</a></div>';
  document.body.appendChild(m);
  var aberto=false,y0=0,ultimo=null;
  function abrir(e){e&&e.preventDefault();if(aberto)return;ultimo=document.activeElement;m.hidden=false;aberto=true;y0=scrollY;requestAnimationFrame(function(){m.classList.add('vis')});setTimeout(function(){var a=m.querySelector('.quero-op');a&&a.focus({preventScroll:true})},30);}
  function fechar(){if(!aberto)return;m.classList.remove('vis');m.hidden=true;aberto=false;if(ultimo&&ultimo.focus)ultimo.focus({preventScroll:true});}
  bs.forEach(function(b){b.addEventListener('click',abrir)});
  m.querySelector('.faq-x').addEventListener('click',fechar);
  m.addEventListener('click',function(e){if(e.target.closest('.quero-op'))setTimeout(fechar,50);else fechar();});
  m.addEventListener('wheel',fechar,{passive:true});
  m.addEventListener('touchmove',fechar,{passive:true});
  addEventListener('scroll',function(){if(aberto&&Math.abs(scrollY-y0)>4)fechar();},{passive:true});
  addEventListener('keydown',function(e){if(e.key==='Escape')fechar();});
})();
