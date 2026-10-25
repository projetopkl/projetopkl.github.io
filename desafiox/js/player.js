/* Player do vídeo de vendas.
   Prévia: roda sozinho, mudo e em P&B quando aparece na tela (pausa fora dela).
   Clique no botão de som ou no vídeo: volta ao início, colorido e com som.
   Depois: sem pausa manual, sem avançar, barra de progresso, pausa fora da tela e continua ao voltar. */
(function(){
  document.querySelectorAll('.vplayer').forEach(function(box){
    var v=box.querySelector('video'),btn=box.querySelector('.vplay'),bar=box.querySelector('.vbar i');
    var full=false,visible=false,last=0;
    v.controls=false;v.removeAttribute('controls');v.muted=true;v.loop=true;
    v.addEventListener('contextmenu',function(e){e.preventDefault()});
    function play(){var p=v.play();if(p&&p.catch)p.catch(function(){});}
    function tick(){if(v.duration)bar.style.width=(full?v.currentTime/v.duration*100:0)+'%';if(!v.paused)requestAnimationFrame(tick);}
    v.addEventListener('play',function(){requestAnimationFrame(tick)});
    btn.addEventListener('click',function(){
      full=true;box.classList.add('full');
      v.loop=false;v.currentTime=0;last=0;v.muted=false;play();
    });
    // não deixa pausar manualmente: só pausa fora da tela, com a aba escondida ou no fim
    v.addEventListener('pause',function(){if(visible&&!v.ended&&!document.hidden)play()});
    document.addEventListener('visibilitychange',function(){if(!document.hidden&&visible&&!v.ended&&v.paused)play()});
    // impede avançar/voltar depois do play com som
    v.addEventListener('timeupdate',function(){if(!v.seeking)last=v.currentTime});
    v.addEventListener('seeking',function(){if(full&&!v.ended&&Math.abs(v.currentTime-last)>.5)v.currentTime=last});
    v.addEventListener('ended',function(){bar.style.width='100%';full=false;box.classList.remove('full');v.muted=true;v.loop=true;v.currentTime=0;if(visible)play();});
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){es.forEach(function(e){
        visible=e.intersectionRatio>=.35;
        if(visible){if(v.paused)play()}else if(!v.paused)v.pause();
      });},{threshold:[0,.35,.6,1]}).observe(box);
    }else{visible=true;play();}
  });
})();
