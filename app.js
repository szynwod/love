/* ==========================================================================
   RAZEM PRZEZ ŚWIAT • MARCEL & ASIA
   Główny silnik animacji, cząsteczek, licznika czasu i dźwięków Web Audio
   ========================================================================== */

(function($) {
  'use strict';

  // DATA POCZĄTKOWA Zgodnie z kodem użytkownika: 24 sierpnia 2019
  // (miesiąc liczony od 0 w JS: 7 = sierpień)
  const START_DATE = new Date(2019, 7, 24, 0, 0, 0);

  // Stan aplikacji
  const state = {
    mode: 'auto', // 'auto', 'manual', 'tour'
    currentSeason: 'summer', // 'spring', 'summer', 'autumn', 'winter'
    currentTime: 'day', // 'dawn', 'day', 'sunset', 'night'
    walkMode: 'promenade', // 'promenade', 'infinite', 'paused'
    isWalking: true,
    couplePos: 25, // % pozycji na promenadzie
    walkDirection: 1, // 1: w prawo, -1: w lewo
    soundEnabled: false,
    audioCtx: null,
    ambientGain: null,
    musicGain: null,
    tourInterval: null
  };

  // Cytaty miłosne
  const romanticQuotes = [
    "„Gdziekolwiek prowadzi nas droga, najważniejsze jest to, że idziemy nią trzymając się za ręce.”",
    "„Każdy dzień u Twojego boku to najpiękniejszy krok w naszej wspólnej podróży.”",
    "„Niezależnie od pory roku i dnia — z Tobą każde miejsce na świecie staje się domem.”",
    "„Trzymam Cię mocno za rękę i nie zamierzam puszczać przez kolejne tysiące dni.”",
    "„Pamiętasz ten dzień nad zatoką? To był dopiero początek naszej wielkiej przygody.”",
    "„Dziękuję Ci za każdy wspólny uśmiech, każdy zachód słońca i każdą wspólną chwilę.”"
  ];
  let quoteIndex = 0;

  /* ==========================================================================
     1. KOD SHUFFLE EFFECT (DOKŁADNY KOD UŻYTKOWNIKA)
     ========================================================================== */
  jQuery.fn.extend({
    shuffleEffect: function(duration) {
      if (duration == null) duration = 40;
      var arrLetter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "❤️", "✨"];
      var $this = jQuery(this);
      var strDefault = $this.data('currentText') || $this.text();
      var nLength = strDefault.length - 1;
      var i = 0;
      var strText = "";
      
      // Czyścimy poprzedni interwał jeśli istnieje
      if ($this.data('shuffleTid')) {
        clearInterval($this.data('shuffleTid'));
      }

      var tid = setInterval(function() {
        if (i < nLength + 1) {
          var strShuffle = "";
          var slicedText = strDefault.slice(i, nLength);
          var term = slicedText.split(' ');
          var shuffleLen = term[0] ? term[0].length : 3;
          for (var j = 0; j < Math.max(1, shuffleLen - 1); j++) {
            strShuffle += arrLetter[Math.floor(Math.random() * arrLetter.length)];
          }
          strText += strDefault.charAt(i);
          $this.css({
            display: "block"
          }).html(strText + "<span class='rand_text'>" + strShuffle + "</span>");
          i++;
        } else {
          clearInterval(tid);
          $this.data('shuffleTid', null);
          $this.html(strDefault);
        }
      }, duration);

      $this.data('shuffleTid', tid);
    }
  });

  /* ==========================================================================
     2. LICZNIK CZASU RAZEM
     ========================================================================== */
  function updateLoveCounters() {
    const now = new Date();
    
    // Różnica w milisekundach
    const diffMs = now - START_DATE;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Dokładne rozbicie na lata, miesiące, dni, godziny, minuty, sekundy
    let y = now.getFullYear() - START_DATE.getFullYear();
    let m = now.getMonth() - START_DATE.getMonth();
    let d = now.getDate() - START_DATE.getDate();
    let h = now.getHours() - START_DATE.getHours();
    let min = now.getMinutes() - START_DATE.getMinutes();
    let s = now.getSeconds() - START_DATE.getSeconds();

    if (s < 0) { s += 60; min--; }
    if (min < 0) { min += 60; h--; }
    if (h < 0) { h += 24; d--; }
    if (d < 0) {
      m--;
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      d += prevMonthLastDay;
    }
    if (m < 0) {
      y--;
      m += 12;
    }

    // Aktualizacja elementów DOM
    $('#cntYears').text(y);
    $('#cntMonths').text(m);
    $('#cntDays').text(d);
    $('#cntHours').text(String(h).padStart(2, '0'));
    $('#cntMinutes').text(String(min).padStart(2, '0'));
    $('#cntSeconds').text(String(s).padStart(2, '0'));
    $('#totalDaysBadge').text(totalDays.toLocaleString('pl-PL'));

    // Wiadomość dla Asi
    const targetMsg = `Asiu jesteś dla mnie taką osobą już od ${totalDays} dni.`;
    const $msgElem = $('#userMsg2');
    
    // Jeśli treść się zmieniła lub to pierwsze uruchomienie
    if ($msgElem.data('currentText') !== targetMsg) {
      $msgElem.data('currentText', targetMsg);
      $msgElem.text(targetMsg);
      $msgElem.shuffleEffect(35);
    }

    // Kolejna rocznica
    const currentYear = now.getFullYear();
    let nextAnniv = new Date(currentYear, 7, 24);
    if (now > nextAnniv) {
      nextAnniv = new Date(currentYear + 1, 7, 24);
    }
    const daysToAnniv = Math.ceil((nextAnniv - now) / (1000 * 60 * 60 * 24));
    const nextAnnivCount = nextAnniv.getFullYear() - START_DATE.getFullYear();
    $('#nextAnniversaryText').html(`Kolejna (<strong>${nextAnnivCount}.</strong>) rocznica za <strong>${daysToAnniv} dni</strong>`);
  }

  /* ==========================================================================
     3. SYSTEM PÓR ROKU I PÓR DNIA
     ========================================================================== */
  function getAutoSeason() {
    const month = new Date().getMonth(); // 0-11
    if (month >= 2 && month <= 4) return 'spring';  // Marzec, Kwiecień, Maj
    if (month >= 5 && month <= 7) return 'summer';  // Czerwiec, Lipiec, Sierpień
    if (month >= 8 && month <= 10) return 'autumn'; // Wrzesień, Październik, Listopad
    return 'winter';                               // Grudzień, Styczeń, Luty
  }

  function getAutoTime() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return 'dawn';     // Wschód (5:00 - 8:59)
    if (hour >= 9 && hour < 17) return 'day';     // Dzień (9:00 - 16:59)
    if (hour >= 17 && hour < 21) return 'sunset'; // Zachód (17:00 - 20:59)
    return 'night';                               // Noc (21:00 - 4:59)
  }

  const seasonNames = {
    spring: { name: 'Wiosna', icon: '🌱', outfit: 'Wiosna: pastelowy róż dla Asi i błękitny jeans dla Marcela 🌸' },
    summer: { name: 'Lato', icon: '☀️', outfit: 'Lato: oryginalny styl ze zdjęcia znad zatoki 🏖️' },
    autumn: { name: 'Jesień', icon: '🍂', outfit: 'Jesień: ciepłe karmelowe kurtki i jesienne getry 🍁' },
    winter: { name: 'Zima', icon: '❄️', outfit: 'Zima: ciepłe puchowe kurtki i zimowe stylizacje ❄️' }
  };

  const timeNames = {
    dawn: { name: 'Wschód', icon: '🌅' },
    day: { name: 'Dzień', icon: '☀️' },
    sunset: { name: 'Zachód', icon: '🌇' },
    night: { name: 'Noc', icon: '🌙' }
  };

  function applyEnvironment(season, time) {
    state.currentSeason = season;
    state.currentTime = time;

    // Aktualizacja klas na <body>
    $('body')
      .removeClass('season-spring season-summer season-autumn season-winter')
      .addClass(`season-${season}`)
      .removeClass('time-dawn time-day time-sunset time-night')
      .addClass(`time-${time}`);

    // Przełączanie tła krajobrazu
    $('.landscape-bg').removeClass('active');
    $(`#bg${season.charAt(0).toUpperCase() + season.slice(1)}`).addClass('active');

    // Słońce vs Księżyc
    const $celestial = $('#celestialBody');
    if (time === 'night') {
      $celestial.removeClass('sun').addClass('moon');
    } else {
      $celestial.removeClass('moon').addClass('sun');
    }

    // Aktualizacja wskaźnika w pasku nawigacji
    const sInfo = seasonNames[season];
    const tInfo = timeNames[time];
    $('#envSeasonIcon').text(sInfo.icon);
    $('#envSeasonText').text(sInfo.name);
    $('#envTimeIcon').text(tInfo.icon);
    $('#envTimeText').text(tInfo.name);

    // Aktualizacja aktywnych przycisków w menu wyboru
    $('[data-season]').removeClass('active');
    $(`[data-season="${season}"]`).addClass('active');
    $('[data-time]').removeClass('active');
    $(`[data-time="${time}"]`).addClass('active');

    // Dostosowanie parametrów dźwiękowych otoczenia
    if (state.soundEnabled) {
      updateAudioScene(season, time);
    }
  }

  function syncEnvironment() {
    if (state.mode === 'auto') {
      const s = getAutoSeason();
      const t = getAutoTime();
      applyEnvironment(s, t);
    }
  }

  /* ==========================================================================
     4. KANWA GWIAZD I METEORÓW (NOC)
     ========================================================================== */
  const starsCanvas = document.getElementById('starsCanvas');
  const starsCtx = starsCanvas ? starsCanvas.getContext('2d') : null;
  let stars = [];
  let meteors = [];

  function initStars() {
    if (!starsCanvas) return;
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    stars = [];

    const numStars = Math.floor((starsCanvas.width * starsCanvas.height) / 7500);
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height * 0.65, // górna połowa nieba
        radius: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() * 0.03 + 0.008) * (Math.random() < 0.5 ? 1 : -1)
      });
    }
  }

  function spawnMeteor() {
    if (state.currentTime !== 'night' && state.currentTime !== 'sunset') return;
    if (Math.random() < 0.015 && meteors.length < 3) {
      meteors.push({
        x: Math.random() * starsCanvas.width * 0.8 + starsCanvas.width * 0.1,
        y: Math.random() * starsCanvas.height * 0.3,
        len: Math.random() * 90 + 50,
        speed: Math.random() * 12 + 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        alpha: 1,
        life: 1
      });
    }
  }

  function drawStars() {
    if (!starsCtx) return;
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

    if (state.currentTime === 'night' || state.currentTime === 'sunset') {
      // Rysowanie gwiazd
      for (let s of stars) {
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.2) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }

        starsCtx.beginPath();
        starsCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        starsCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, s.alpha))})`;
        starsCtx.fill();
      }

      // Rysowanie meteorów
      spawnMeteor();
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        const tailX = m.x - Math.cos(m.angle) * m.len;
        const tailY = m.y - Math.sin(m.angle) * m.len;

        const grad = starsCtx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(0.3, `rgba(255, 215, 130, ${m.alpha * 0.8})`);
        grad.addColorStop(1, `rgba(255, 100, 150, 0)`);

        starsCtx.beginPath();
        starsCtx.moveTo(m.x, m.y);
        starsCtx.lineTo(tailX, tailY);
        starsCtx.strokeStyle = grad;
        starsCtx.lineWidth = 2.2;
        starsCtx.lineCap = 'round';
        starsCtx.stroke();

        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.025;

        if (m.alpha <= 0) {
          meteors.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(drawStars);
  }

  /* ==========================================================================
     5. KANWA CZĄSTECZEK POGODOWYCH (SAKURA, ŚNIEG, LIŚCIE, ŚWIETLIKI)
     ========================================================================== */
  const particlesCanvas = document.getElementById('particlesCanvas');
  const partCtx = particlesCanvas ? particlesCanvas.getContext('2d') : null;
  let particles = [];

  function initParticles() {
    if (!particlesCanvas) return;
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
    particles = [];

    const count = 45;
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function createParticle() {
    return {
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      size: Math.random() * 8 + 4,
      speedY: Math.random() * 1.8 + 0.8,
      speedX: (Math.random() - 0.5) * 1.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      alpha: Math.random() * 0.6 + 0.4,
      hueVariation: Math.random(),
      oscillation: Math.random() * Math.PI * 2
    };
  }

  function drawParticles() {
    if (!partCtx) return;
    partCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    const season = state.currentSeason;
    const time = state.currentTime;

    for (let p of particles) {
      p.oscillation += 0.03;

      if (season === 'spring') {
        // Płatki kwitnącej wiśni (Sakura)
        p.y += p.speedY * 0.9;
        p.x += Math.sin(p.oscillation) * 1.2 + 0.5;
        p.rotation += p.rotationSpeed;

        partCtx.save();
        partCtx.translate(p.x, p.y);
        partCtx.rotate(p.rotation);
        partCtx.fillStyle = `rgba(255, ${180 + p.hueVariation * 40}, ${200 + p.hueVariation * 30}, ${p.alpha * 0.85})`;
        partCtx.beginPath();
        partCtx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        partCtx.fill();
        partCtx.restore();

      } else if (season === 'autumn') {
        // Złote i rdzawe liście jesienne
        p.y += p.speedY * 1.2;
        p.x += Math.sin(p.oscillation) * 1.6 + 0.8;
        p.rotation += p.rotationSpeed * 1.3;

        partCtx.save();
        partCtx.translate(p.x, p.y);
        partCtx.rotate(p.rotation);
        // Kolory liści: złoty, pomarańcz, czerwień
        const leafColor = p.hueVariation < 0.35 
          ? `rgba(225, 95, 45, ${p.alpha})` 
          : (p.hueVariation < 0.7 ? `rgba(235, 175, 40, ${p.alpha})` : `rgba(185, 45, 35, ${p.alpha})`);
        partCtx.fillStyle = leafColor;
        partCtx.beginPath();
        partCtx.ellipse(0, 0, p.size * 1.3, p.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        partCtx.fill();
        partCtx.restore();

      } else if (season === 'winter') {
        // Puszysty śnieg
        p.y += p.speedY * 1.1;
        p.x += Math.sin(p.oscillation) * 0.8;

        partCtx.beginPath();
        partCtx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        partCtx.fillStyle = `rgba(240, 248, 255, ${p.alpha * 0.9})`;
        partCtx.shadowBlur = 6;
        partCtx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        partCtx.fill();
        partCtx.shadowBlur = 0;

      } else {
        // Lato: słoneczne refleksy i iskry morskiej bryzy w dzień, świetliki w nocy
        if (time === 'night') {
          // Świecące zielono-złote świetliki
          p.x += Math.sin(p.oscillation) * 1.2;
          p.y += Math.cos(p.oscillation * 0.8) * 0.9 - 0.2;
          const glowAlpha = Math.abs(Math.sin(p.oscillation)) * p.alpha;

          partCtx.beginPath();
          partCtx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
          partCtx.fillStyle = `rgba(180, 255, 100, ${glowAlpha})`;
          partCtx.shadowBlur = 12;
          partCtx.shadowColor = 'rgba(200, 255, 80, 0.9)';
          partCtx.fill();
          partCtx.shadowBlur = 0;
        } else {
          // Letnie świetliste iskry na wodzie i w powietrzu
          p.y += (p.speedY - 1.2);
          p.x += Math.sin(p.oscillation) * 0.5;
          const shimmer = Math.abs(Math.sin(p.oscillation));

          partCtx.beginPath();
          partCtx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
          partCtx.fillStyle = `rgba(255, 245, 200, ${shimmer * 0.6})`;
          partCtx.fill();
        }
      }

      // Reset cząsteczki po opuszczeniu ekranu
      if (p.y > particlesCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * particlesCanvas.width;
      } else if (p.y < -20) {
        p.y = particlesCanvas.height + 10;
      }
      if (p.x > particlesCanvas.width + 20) p.x = -10;
      if (p.x < -20) p.x = particlesCanvas.width + 10;
    }

    requestAnimationFrame(drawParticles);
  }

  /* ==========================================================================
     6. CHÓD POSTACI PO PROMENADZIE
     ========================================================================== */
  const $couple = $('#coupleEntity');

  function updateCoupleWalk() {
    if (state.walkMode === 'promenade') {
      // Spacer w tę i z powrotem wzdłuż malowniczego brzegu
      state.couplePos += 0.045 * state.walkDirection;

      // Granice promenady: od 12% do 76%
      if (state.couplePos >= 76) {
        state.walkDirection = -1;
        // Chwila przerwy na podziwianie widoku zatoki
        pauseCoupleBriefly(3200);
      } else if (state.couplePos <= 14) {
        state.walkDirection = 1;
        pauseCoupleBriefly(2400);
      }

      $couple.css('left', `${state.couplePos}%`);

      // Obrót postaci zależnie od kierunku
      if (state.walkDirection === 1) {
        $couple.css('transform', 'scaleX(1)');
      } else {
        $couple.css('transform', 'scaleX(-1)');
      }

    } else if (state.walkMode === 'infinite') {
      // Wędrówka w miejscu (środek)
      state.couplePos = 40;
      $couple.css({
        left: '40%',
        transform: 'scaleX(1)'
      });
    }

    requestAnimationFrame(updateCoupleWalk);
  }

  function pauseCoupleBriefly(durationMs) {
    $couple.addClass('paused');
    triggerHeart();
    setTimeout(() => {
      if (state.walkMode === 'promenade') {
        $couple.removeClass('paused');
      }
    }, durationMs);
  }

  function triggerHeart() {
    const $bubble = $('#loveBubble');
    $bubble.addClass('show');
    setTimeout(() => {
      $bubble.removeClass('show');
    }, 1200);
  }

  /* ==========================================================================
     7. SYNTEZA DŹWIĘKÓW NATURY I MUZYKI (WEB AUDIO API - BEZ PLIKÓW MP3)
     ========================================================================== */
  function initAudioEngine() {
    if (state.audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AudioContext();

      // Master Gain
      state.ambientGain = state.audioCtx.createGain();
      state.ambientGain.gain.setValueAtTime(0, state.audioCtx.currentTime);
      state.ambientGain.connect(state.audioCtx.destination);

      // Start szumu fal / wiatru
      createAmbientNoiseNode();
      // Start delikatnych akordów
      startChimeArpeggios();

    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  function createAmbientNoiseNode() {
    if (!state.audioCtx) return;
    const bufferSize = 2 * state.audioCtx.sampleRate;
    const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Szum różowy (bardziej miękki niż biały)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = state.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtr pasmowy (efekt fal morskich lub wiatru)
    const filter = state.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, state.audioCtx.currentTime);

    // LFO modulujące filtr (rytm fal morskich co ~4 sekundy)
    const lfo = state.audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.25, state.audioCtx.currentTime);
    const lfoGain = state.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(250, state.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    whiteNoise.connect(filter);
    filter.connect(state.ambientGain);

    whiteNoise.start();
    lfo.start();
  }

  function playRomanticTone(freq, duration = 2.5) {
    if (!state.audioCtx || !state.soundEnabled) return;
    const osc = state.audioCtx.createOscillator();
    const noteGain = state.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);

    noteGain.gain.setValueAtTime(0, state.audioCtx.currentTime);
    noteGain.gain.linearRampToValueAtTime(0.08, state.audioCtx.currentTime + 0.15);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);

    osc.connect(noteGain);
    noteGain.connect(state.ambientGain);

    osc.start();
    osc.stop(state.audioCtx.currentTime + duration);
  }

  function startChimeArpeggios() {
    // Pentatoniczne łagodne nuty: C4, D4, E4, G4, A4, C5
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    setInterval(() => {
      if (state.soundEnabled && Math.random() < 0.6) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        playRomanticTone(note, 3.2);
      }
    }, 4500);
  }

  function toggleSound() {
    initAudioEngine();
    state.soundEnabled = !state.soundEnabled;

    if (state.soundEnabled) {
      if (state.audioCtx && state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }
      state.ambientGain.gain.linearRampToValueAtTime(0.45, state.audioCtx.currentTime + 1.2);
      $('#btnSoundToggle').addClass('active').find('.btn-icon').text('🔊');
      showToast('Włączono dźwięki otoczenia i romantyczną melodię 🎶');
    } else {
      if (state.ambientGain) {
        state.ambientGain.gain.linearRampToValueAtTime(0, state.audioCtx.currentTime + 0.8);
      }
      $('#btnSoundToggle').removeClass('active').find('.btn-icon').text('🔇');
      showToast('Wyciszono dźwięki');
    }
  }

  function updateAudioScene(season, time) {
    // Delikatne zmiany barwy w Web Audio zależnie od pory
  }

  /* ==========================================================================
     8. TOAST POWIADOMIENIA I CYTATY
     ========================================================================== */
  function showToast(text) {
    const $toast = $('#toastNotification');
    $toast.text(text).addClass('show');
    setTimeout(() => {
      $toast.removeClass('show');
    }, 2800);
  }

  function rotateRomanticQuotes() {
    quoteIndex = (quoteIndex + 1) % romanticQuotes.length;
    const $q = $('#romanticQuote');
    $q.css('opacity', 0);
    setTimeout(() => {
      $q.text(romanticQuotes[quoteIndex]).css('opacity', 1);
    }, 500);
  }

  /* ==========================================================================
     9. TRYB PODRÓŻY W CZASIE (TOUR)
     ========================================================================== */
  const tourStages = [
    { season: 'spring', time: 'dawn' },
    { season: 'spring', time: 'day' },
    { season: 'summer', time: 'day' },
    { season: 'summer', time: 'sunset' },
    { season: 'autumn', time: 'sunset' },
    { season: 'autumn', time: 'night' },
    { season: 'winter', time: 'night' },
    { season: 'winter', time: 'dawn' }
  ];
  let tourIdx = 0;

  function startTourMode() {
    state.mode = 'tour';
    $('.pill-btn').removeClass('active');
    $('#modeTour').addClass('active');
    $('#modeHint').text('Tryb Podróży: świat płynnie przemierza wszystkie 4 pory roku i dnia w rytmie Waszego spaceru!');

    if (state.tourInterval) clearInterval(state.tourInterval);
    
    tourIdx = 0;
    const stage = tourStages[tourIdx];
    applyEnvironment(stage.season, stage.time);
    showToast('Rozpoczęto Podróż w Czasie dookoła świata! 🌍');

    state.tourInterval = setInterval(() => {
      tourIdx = (tourIdx + 1) % tourStages.length;
      const nextStage = tourStages[tourIdx];
      applyEnvironment(nextStage.season, nextStage.time);
    }, 11000);
  }

  function stopTourMode() {
    if (state.tourInterval) {
      clearInterval(state.tourInterval);
      state.tourInterval = null;
    }
  }

  /* ==========================================================================
     10. INICJALIZACJA I ZDARZENIA UI
     ========================================================================== */
  $(function() {
    // 1. Start liczników
    updateLoveCounters();
    setInterval(updateLoveCounters, 1000);

    // 2. Start rotacji cytatów
    setInterval(rotateRomanticQuotes, 12000);

    // 3. Rozpoznanie pory roku i dnia
    syncEnvironment();

    // 4. Inicjalizacja kanw
    initStars();
    initParticles();
    drawStars();
    drawParticles();

    // 5. Start animacji chodu
    updateCoupleWalk();

    // Resize okna
    window.addEventListener('resize', () => {
      initStars();
      initParticles();
    });

    // Kliknięcie w nagłówek wiadomości -> ponowny shuffle efekt
    $('#userMsg2').on('click', function() {
      $(this).shuffleEffect(35);
      triggerHeart();
      showToast('Dla Ciebie, Asiu! ❤️');
    });

    // Kliknięcie w postacie -> serduszko, zatrzymanie na chwilę, dźwięk
    $('#coupleEntity').on('click', function(e) {
      e.stopPropagation();
      triggerHeart();
      if (state.soundEnabled) {
        playRomanticTone(523.25, 2.0); // C5
      }
      showToast('Marcel & Asia • Zawsze Razem ❤️');
    });

    // Kliknięcie w scenę -> przejście postaci w stronę kliknięcia
    $('#charactersStage').on('click', function(e) {
      const stageWidth = $(this).width();
      const clickX = e.clientX;
      const targetPercent = Math.max(12, Math.min(80, (clickX / stageWidth) * 100));
      
      state.couplePos = targetPercent;
      $couple.css('left', `${targetPercent}%`);
      triggerHeart();
    });

    // Dźwięk toggle
    $('#btnSoundToggle').on('click', toggleSound);

    // Menu otoczenia (drawer)
    $('#btnSettingsToggle').on('click', function() {
      $('#controlsModal').toggleClass('open');
    });

    $('#btnCloseControls').on('click', function() {
      $('#controlsModal').removeClass('open');
    });

    // Modal wspomnienia ze zdjęciem
    $('#btnMemoryModal').on('click', function() {
      $('#memoryModal').addClass('open');
    });

    $('#btnCloseMemory, #memoryModal').on('click', function(e) {
      if (e.target === this || e.target.id === 'btnCloseMemory') {
        $('#memoryModal').removeClass('open');
      }
    });

    // Przełączniki trybów
    $('#modeAuto').on('click', function() {
      stopTourMode();
      state.mode = 'auto';
      $('.pill-btn').removeClass('active');
      $(this).addClass('active');
      $('#modeHint').text('W trybie automatycznym strona sama rozpoznaje aktualną porę roku i porę dnia według Twojego zegara!');
      syncEnvironment();
      showToast('Włączono czas rzeczywisty (Auto)');
    });

    $('#modeManual').on('click', function() {
      stopTourMode();
      state.mode = 'manual';
      $('.pill-btn').removeClass('active');
      $(this).addClass('active');
      $('#modeHint').text('Możesz swobodnie wybrać dowolną porę roku i dnia poniżej!');
      showToast('Włączono tryb wyboru ręcznego');
    });

    $('#modeTour').on('click', startTourMode);

    // Wybór pory roku (ręczny)
    $('[data-season]').on('click', function() {
      stopTourMode();
      state.mode = 'manual';
      $('.pill-btn').removeClass('active');
      $('#modeManual').addClass('active');
      const selectedSeason = $(this).data('season');
      applyEnvironment(selectedSeason, state.currentTime);
      showToast(`Pora roku: ${seasonNames[selectedSeason].name} ${seasonNames[selectedSeason].icon}`);
    });

    // Wybór pory dnia (ręczny)
    $('[data-time]').on('click', function() {
      stopTourMode();
      state.mode = 'manual';
      $('.pill-btn').removeClass('active');
      $('#modeManual').addClass('active');
      const selectedTime = $(this).data('time');
      applyEnvironment(state.currentSeason, selectedTime);
      showToast(`Pora dnia: ${timeNames[selectedTime].name} ${timeNames[selectedTime].icon}`);
    });

    // Zmiana stylu spaceru
    $('#btnWalkPromenade').on('click', function() {
      state.walkMode = 'promenade';
      $couple.removeClass('paused');
      $('.walk-grid .choice-btn').removeClass('active');
      $(this).addClass('active');
      showToast('Postacie spacerują promenadą wzdłuż zatoki');
    });

    $('#btnWalkInfinite').on('click', function() {
      state.walkMode = 'infinite';
      $couple.removeClass('paused');
      $('.walk-grid .choice-btn').removeClass('active');
      $(this).addClass('active');
      showToast('Niekończąca się wędrówka przez świat');
    });

    $('#btnWalkPause').on('click', function() {
      state.walkMode = 'paused';
      $couple.addClass('paused');
      $('.walk-grid .choice-btn').removeClass('active');
      $(this).addClass('active');
      showToast('Zatrzymaliście się, trzymając za ręce ❤️');
    });

    // Zwijanie / rozwijanie szczegółowego licznika
    $('#btnToggleCardSize').on('click', function(e) {
      e.stopPropagation();
      const $dash = $('#loveDashboard');
      $dash.toggleClass('collapsed');
      const isCollapsed = $dash.hasClass('collapsed');
      if (isCollapsed) {
        $('#minimizeIcon').text('🔼');
        $('#minimizeText').text('Rozwiń');
        showToast('Zwinięto licznik — pełen widok na promenadę i Wasz spacer ✨');
      } else {
        $('#minimizeIcon').text('🔽');
        $('#minimizeText').text('Zwiń');
        showToast('Rozwinięto szczegółowy licznik czasu');
      }
    });

    // Przełączanie pozycji karty (Góra / Dół)
    $('#btnToggleCardPos').on('click', function(e) {
      e.stopPropagation();
      const $dash = $('#loveDashboard');
      $dash.toggleClass('position-bottom');
      const isBottom = $dash.hasClass('position-bottom');
      if (isBottom) {
        showToast('Karta przeniesiona na dół');
      } else {
        showToast('Karta umieszczona na górze (postacie w pełni odsłonięte) ✨');
      }
    });

  });

})(jQuery);
