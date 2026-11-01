(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fit the masthead and closing line to the full width */
  function fit(el){
    if(!el) return;
    var box = el.parentElement;
    var cs = getComputedStyle(box);
    var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if(el.id === 'masthead'){ avail = el.clientWidth; }
    var probe = el.querySelector('span') || el;
    el.style.fontSize = '100px';
    var w = probe.offsetWidth || probe.scrollWidth;
    if(probe === el){ w = el.scrollWidth; }
    if(w > 0){ el.style.fontSize = Math.floor(100 * avail / w * 0.995) + 'px'; }
  }
  var mast = document.getElementById('masthead');
  var big = document.querySelector('.contact .big');
  if(big){ big.innerHTML = '<span style="display:inline-block">' + big.textContent + '</span>'; }
  function fitWords(){
    var words = mast.querySelectorAll('.mw'), avail = mast.clientWidth;
    mast.style.fontSize = '';
    words.forEach(function(w){ w.style.fontSize = '100px'; var ww = w.offsetWidth; if(ww){ w.style.fontSize = Math.floor(100 * avail / ww * 0.99) + 'px'; } });
  }
  function fitAll(){
    if(mast){
      if(window.innerWidth <= 900){ fitWords(); }
      else { mast.querySelectorAll('.mw').forEach(function(w){ w.style.fontSize = ''; }); fit(mast); }
    }
    fit(big);
  }
  fitAll();
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fitAll); }
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(fitAll, 80); });

  /* Nav turns solid after the cover */
  var nav = document.getElementById('nav');
  function navState(){ if(document.body.classList.contains('inner')) return; nav.classList.toggle('solid', window.scrollY > 40); }
  navState(); window.addEventListener('scroll', navState, {passive:true});

  /* Statement lights up word by word as it scrolls through */
  var st = document.getElementById('statement'), tx = document.getElementById('statementText');
  if(st && tx && !reduce){
    var out = [];
    tx.childNodes.forEach(function(node){
      var em = node.nodeName === 'EM';
      (node.textContent).split(/(\s+)/).forEach(function(part){
        if(!part) return;
        if(/^\s+$/.test(part)){ out.push(part); }
        else { out.push('<span class="w' + (em ? ' em' : '') + '">' + part.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</span>'); }
      });
    });
    tx.innerHTML = out.join('');
    st.classList.add('js');
    var words = tx.querySelectorAll('.w');
    var ticking = false;
    function light(){
      ticking = false;
      var r = tx.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.82 - r.top) / (r.height + vh * 0.25);
      p = Math.max(0, Math.min(1, p));
      var n = Math.round(p * words.length);
      for(var i = 0; i < words.length; i++){ words[i].classList.toggle('on', i < n); }
    }
    window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(light); } }, {passive:true});
    light();
  }

  /* Shorts carousel */
  var tr = document.getElementById('sTrack'), sp = document.getElementById('sPrev'), sn = document.getElementById('sNext');
  if(tr && sp && sn){
    function step(){ var c = tr.querySelector('.scard'); return c ? c.getBoundingClientRect().width + 16 : 300; }
    function edges(){ sp.disabled = tr.scrollLeft < 8; sn.disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 8; }
    sp.addEventListener('click', function(){ tr.scrollBy({left:-step(), behavior: reduce ? 'auto' : 'smooth'}); });
    sn.addEventListener('click', function(){ tr.scrollBy({left: step(), behavior: reduce ? 'auto' : 'smooth'}); });
    tr.addEventListener('scroll', function(){ requestAnimationFrame(edges); }, {passive:true});
    window.addEventListener('resize', edges); edges();
  }

  /* YouTube: play inline on the live site, open YouTube anywhere else */
  var live = /^https?:$/.test(location.protocol) && window.self === window.top;
  document.querySelectorAll('a[data-yt]').forEach(function(a){
    a.addEventListener('click', function(e){
      if(!live) return;
      e.preventDefault();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + a.getAttribute('data-yt') + '?autoplay=1&rel=0&playsinline=1';
      f.title = a.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      a.replaceWith(Object.assign(document.createElement('div'), {className:'smedia yt'}));
      var holder = document.querySelector('.smedia.yt:not(a)'); holder.appendChild(f);
    });
  });

  /* Contact form */
  var form = document.getElementById('contactForm');
  if(form){
    var status = document.getElementById('f-status'), send = document.getElementById('f-send');
    function say(msg, cls){ status.textContent = msg; status.className = 'fstatus' + (cls ? ' ' + cls : ''); }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var bad = null;
      ['f-name','f-email','f-topic','f-msg'].forEach(function(id){
        var el = document.getElementById(id), lab = el.closest('.field');
        var ok = el.value.trim() !== '' && (el.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
        lab.classList.toggle('bad', !ok);
        if(!ok && !bad) bad = el;
      });
      if(bad){ say(bad.id === 'f-email' ? 'Please enter a valid email address.' : 'Please fill in the highlighted fields.', 'err'); bad.focus(); return; }
      if(document.getElementById('f-hp').value){ return; }
      var endpoint = form.getAttribute('data-endpoint');
      if(!endpoint){ say('The form is not connected yet. Please message me on LinkedIn for now.', 'err'); return; }
      send.disabled = true; say('Sending...');
      fetch(endpoint, {method:'POST', headers:{'Accept':'application/json'}, body:new FormData(form)})
        .then(function(r){
          if(r.ok){ form.reset(); say('Thank you. Your message has been sent and I will be in touch soon.', 'ok'); }
          else { say('Your message could not be sent. Please try again, or message me on LinkedIn.', 'err'); }
        })
        .catch(function(){ say('Your message could not be sent. Check your connection and try again, or message me on LinkedIn.', 'err'); })
        .then(function(){ send.disabled = false; });
    });
    form.querySelectorAll('input,select,textarea').forEach(function(el){
      el.addEventListener('input', function(){ var f = el.closest('.field'); if(f) f.classList.remove('bad'); });
    });
  }
  /* Shorts: silent preview on hover, full player with sound on click */
  var clips = Array.prototype.slice.call(document.querySelectorAll('a.clip'));
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(canHover && !reduce){
    clips.forEach(function(a){
      var pv = null, t = null;
      a.addEventListener('mouseenter', function(){
        t = setTimeout(function(){
          if(!pv){ pv = document.createElement('video'); pv.className = 'pv'; pv.muted = true; pv.loop = true; pv.playsInline = true; pv.preload = 'auto'; pv.setAttribute('aria-hidden','true'); pv.src = a.getAttribute('data-src'); a.insertBefore(pv, a.querySelector('.dur')); pv.addEventListener('playing', function(){ pv.classList.add('on'); }); }
          a.classList.add('previewing');
          var pr = pv.play(); if(pr && pr.catch) pr.catch(function(){});
        }, 120);
      });
      a.addEventListener('mouseleave', function(){
        clearTimeout(t); a.classList.remove('previewing');
        if(pv){ pv.pause(); pv.classList.remove('on'); try{ pv.currentTime = 0; }catch(e){} }
      });
    });
  }
  var lb = document.getElementById('lb'), lbv = document.getElementById('lbv'), lbT = document.getElementById('lbTitle'), lbC = document.getElementById('lbCount'), lbErr = document.getElementById('lbErr');
  var cur = 0, lastFocus = null;
  function show(i){
    cur = (i + clips.length) % clips.length;
    var a = clips[cur];
    lbErr.hidden = true;
    lbv.src = a.getAttribute('data-src');
    lbv.poster = a.querySelector('img').src;
    lbT.textContent = a.getAttribute('data-title').replace(/&#39;/g, "'");
    var sm = document.getElementById('lbSummary'); if(sm) sm.textContent = a.getAttribute('data-summary') || '';
    lbC.textContent = 'Clip ' + (cur + 1) + ' of ' + clips.length + ', ' + a.getAttribute('data-dur');
    var pr = lbv.play(); if(pr && pr.catch) pr.catch(function(){});
  }
  function openLb(i){
    lastFocus = document.activeElement;
    clips.forEach(function(a){ var p = a.querySelector('video.pv'); if(p) p.pause(); });
    lb.hidden = false; document.body.classList.add('lb-open');
    show(i);
    document.getElementById('lbClose').focus();
  }
  function closeLb(){
    lbv.pause(); lbv.removeAttribute('src'); lbv.load();
    lb.hidden = true; document.body.classList.remove('lb-open');
    if(lastFocus) lastFocus.focus();
  }
  if(lb){
    clips.forEach(function(a, i){ a.addEventListener('click', function(e){ e.preventDefault(); openLb(i); }); });
    document.getElementById('lbClose').addEventListener('click', closeLb);
    document.getElementById('lbPrev').addEventListener('click', function(){ show(cur - 1); });
    document.getElementById('lbNext').addEventListener('click', function(){ show(cur + 1); });
    lb.addEventListener('click', function(e){ if(e.target === lb) closeLb(); });
    lbv.addEventListener('error', function(){ lbErr.hidden = false; });
    lbv.addEventListener('ended', function(){ show(cur + 1); });
    document.addEventListener('keydown', function(e){
      if(lb.hidden) return;
      if(e.key === 'Escape') closeLb();
      else if(e.key === 'ArrowRight') show(cur + 1);
      else if(e.key === 'ArrowLeft') show(cur - 1);
      else if(e.key === 'Tab'){
        var f = lb.querySelectorAll('button, video'), first = f[0], last = f[f.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  }
})();
