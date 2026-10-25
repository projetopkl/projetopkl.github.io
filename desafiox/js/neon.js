/* Regra do Son: toda animação de entrada é reversível.
   Entra quando ~15% do bloco está visível; volta ao estado inicial oculto só quando sai 100% da tela.
   As fitas não participam: medem o layout final (classe fit-medir em fitas.js), então não pulam. */
(function(){
  var els=[].slice.call(document.querySelectorAll('.rev'));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('on')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.intersectionRatio>=.15)en.target.classList.add('on');
    else if(!en.isIntersecting)en.target.classList.remove('on');
  })},{threshold:[0,.15]});
  els.forEach(function(e){io.observe(e)});
})();
