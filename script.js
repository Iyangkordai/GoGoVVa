(function () {
  'use strict';

  var $ = function (selector) { return document.querySelector(selector); };
  var $$ = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };

  // '#' runs  ->  SVG path   (M x y h w v1 h-w z)
  function toPath(rows) {
    var d = '';
    rows.forEach(function (row, y) {
      var re = /#+/g, m;
      while ((m = re.exec(row))) {
        d += 'M' + m.index + ' ' + y + 'h' + m[0].length + 'v1h-' + m[0].length + 'z';
      }
    });
    return d;
  }

  /* ==========================================================
     DATA  (edit content here)
     ========================================================== */

  // Young-hee pixel art: '#' = filled pixel, '.' = empty.  24 x 21.
  var PIXEL_ART = {
    cols: 24,
    rows: 21,
    front: [
      "........########........",
      "......############......",
      "....################....",
      "...##################...",
      "..################.###..",
      "..###############.#.##..",
      "..################.###..",
      "..####################..",
      "..#####.##.####.##.###..",
      "..####..#..####..#.###..",
      "..###..............###..",
      "..###.###......###.###..",
      "..###..##......##..###..",
      "..###..#........#..###..",
      ".####.#..........#.####.",
      ".####......##......####.",
      ".######..........######.",
      ".####..##########..####.",
      ".###................###.",
      "..##................##..",
      "...#................#..."
    ],
    back: [
      "........########........",
      "......############......",
      "....#######.########....",
      "...########.#########...",
      "..#########.######.###..",
      "..#########.#####.#.##..",
      "..#########.######.###..",
      "..#########.##########..",
      "..#########.##########..",
      "..#########.##########..",
      "..#########.##########..",
      "..#########.##########..",
      "..#########.##########..",
      "..#########.##########..",
      ".######################.",
      ".######################.",
      ".######################.",
      ".####..##########..####.",
      ".###................###.",
      "..##................##..",
      "...#................#..."
    ]
  };

  // Source-code tab
  var CODE_FILES = [
    'code/GoGoWa.ino'
  ];

  // Team tab  (img = image URL, leave '' for the placeholder)
  var MEMBERS = [
    { name: 'ชื่อ–นามสกุล 1', role: 'หน้าที่', img: '' },
    { name: 'ชื่อ–นามสกุล 2', role: 'หน้าที่', img: '' },
    { name: 'ชื่อ–นามสกุล 3', role: 'หน้าที่', img: '' },
    { name: 'ชื่อ–นามสกุล 4', role: 'หน้าที่', img: '' }
  ];

  // Footer buttons  (leave '' = button is greyed out and does nothing)
   var LINKS = {
    poster: 'https://drive.google.com/file/d/1FDtFLunt6TRcrfwziVH90Hby6OqBJ0Nz/view',
    github: 'https://github.com/Iyangkordai/GoGoVVa'
  };

  /* ==========================================================
     YOUNG-HEE  (pixel doll that turns front <-> back)
     ========================================================== */
  function initDoll() {
    var AUTO_TURN_CHECK_MS = 6000;   // how often to check for idle
    var IDLE_BEFORE_TURN_MS = 5000;  // idle time before it turns by itself
    var EASE = 0.14;

    var state = { target: 0, angle: 0, lastTouch: 0 };
    var dolls = [];

    var svg =
      '<svg viewBox="0 0 ' + PIXEL_ART.cols + ' ' + PIXEL_ART.rows + '" aria-hidden="true" ' +
      'shape-rendering="crispEdges" fill="currentColor">' +
      '<path class="front" d="' + toPath(PIXEL_ART.front) + '"/>' +
      '<path class="back" d="' + toPath(PIXEL_ART.back) + '" style="display:none"/>' +
      '</svg>';

    function turn() {
      state.target += 180;
      state.lastTouch = Date.now();
    }

    // replace every [data-doll] placeholder with a button
    $$('[data-doll]').forEach(function (slot) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'doll ' + slot.dataset.doll;
      btn.setAttribute('aria-label', 'ยองฮี: คลิกเพื่อหันหัว');
      btn.innerHTML = svg;
      btn.addEventListener('click', turn);
      slot.replaceWith(btn);

      dolls.push({
        svg: btn.firstChild,
        front: btn.querySelector('.front'),
        back: btn.querySelector('.back')
      });
    });

    // animation loop: ease the angle, squash the sprite, swap front/back
    function tick() {
      state.angle += (state.target - state.angle) * EASE;

      var cos = Math.cos(state.angle * Math.PI / 180);
      var scaleX = Math.max(Math.abs(cos), 0.06);

      dolls.forEach(function (d) {
        d.front.style.display = cos > 0 ? '' : 'none';
        d.back.style.display = cos > 0 ? 'none' : '';
        d.svg.style.transform = 'scaleX(' + scaleX + ')';
      });
      requestAnimationFrame(tick);
    }

    // turn by itself when left alone (skipped for reduced-motion users)
    var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      setInterval(function () {
        if (Date.now() - state.lastTouch > IDLE_BEFORE_TURN_MS) {
          state.target += 180;
          state.lastTouch = Date.now() - IDLE_BEFORE_TURN_MS / 2;
        }
      }, AUTO_TURN_CHECK_MS);
    }

    tick();
  }

  /* ==========================================================
     START  <->  MAIN
     ========================================================== */
  function initScreens() {
    $('#open').addEventListener('click', function () {
      $('#start').hidden = true;
      $('#app').hidden = false;
    });
    $('#close').addEventListener('click', function () {
      $('#app').hidden = true;
      $('#start').hidden = false;
    });
  }

  /* ==========================================================
     TABS  (project / video / code / team)
     ========================================================== */
  function initTabs() {
    var tabs = $$('[data-t]');

    function select(active) {
      tabs.forEach(function (tab) {
        var on = tab === active;
        tab.setAttribute('aria-selected', on);
        tab.classList.toggle('green', !on);
        $('#' + tab.dataset.t).hidden = !on;
      });
      $('#app').scrollTop = 0;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { select(tab); });
    });
  }

  /* ==========================================================
     CODE TAB
     ========================================================== */
  function initCode() {
    var cache = {};              // name -> loaded text
    var current = '';
    var tabBar = $('#ctabs');
    var codeBox = $('#cd');

    function label(path) { return path.split('/').pop(); }

    function highlightTab(path) {
      Array.prototype.forEach.call(tabBar.children, function (btn) {
        var on = btn.dataset.path === path;
        btn.setAttribute('aria-selected', on);
        btn.classList.toggle('green', !on);
      });
    }

    function showFile(path) {
      current = path;
      highlightTab(path);

      if (cache[path] !== undefined) {
        codeBox.textContent = cache[path];
        return;
      }

      codeBox.textContent = 'กำลังโหลด...';
      fetch(path)
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          return res.text();
        })
        .then(function (text) {
          cache[path] = text;
          if (current === path) codeBox.textContent = text;
        })
        .catch(function () {
          if (current === path) {
            codeBox.textContent = 'โหลดไฟล์ ' + path + ' ไม่ได้\n' +
              '- เช็คว่าชื่อไฟล์/โฟลเดอร์ถูกต้อง\n' +
              '- ต้องเปิดผ่าน Live Server หรือเว็บโฮสต์ (เปิดไฟล์ตรงๆ แบบ file:// ใช้ไม่ได้)';
          }
        });
    }

    CODE_FILES.forEach(function (path, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pbtn green';
      btn.textContent = label(path);
      btn.dataset.path = path;
      btn.setAttribute('aria-selected', false);
      btn.addEventListener('click', function () { showFile(path); });
      tabBar.appendChild(btn);
      if (i === 0) showFile(path);
    });

    $('#copy').addEventListener('click', function (e) {
      var btn = e.target;
      var text = cache[current];
      if (text === undefined) return;   // still loading / failed
      try {
        navigator.clipboard.writeText(text).then(function () { btn.textContent = 'แล้ว!'; });
      } catch (err) {
        btn.textContent = 'ไม่ได้';
      }
      setTimeout(function () { btn.textContent = 'คัดลอก'; }, 1400);
    });
  }

  /* ==========================================================
     TEAM TAB
     ========================================================== */
  function initTeam() {
    MEMBERS.forEach(function (member) {
      var card = document.createElement('div');
      card.className = 'm';

      var photo = document.createElement('div');
      photo.className = 'ph';
      if (member.img) {
        var img = document.createElement('img');
        img.src = member.img;
        img.alt = member.name;
        photo.appendChild(img);
      }

      var name = document.createElement('h3');
      name.textContent = member.name;

      var role = document.createElement('p');
      role.textContent = member.role;

      card.append(photo, name, role);
      $('#tm').appendChild(card);
    });
  }

  /* ==========================================================
     JUMP SCARE  (yellow lamp)
     dim -> boo (scary Young-hee) -> bright (cute Young-hee) -> out
     ========================================================== */
  function initScare() {
    var SCARE_SOUND = true;                                   // set false to mute the sting
    var SCARE_CLIP = 'Media/Jumpscare Sound Effect.mp3';
    var SCARE_VOLUME = 0.9;                                   // 0 - 1 (the sting is LOUD on purpose)
    var TIME = { dim: 750, boo: 2900, bright: 2700, out: 650 };  // ms per phase

    var overlay = $('#scare');
    var lamp = $('#lamp');
    var wrap = document.querySelector('.lamp-wrap');
    var page = document.querySelector('main');
    var running = false;
    var timers = [];
    var audio = null;

    /* ---------- sprites ---------- */
    function rects(list, fill) {
      return list.map(function (r) {
        return '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="' + fill + '"/>';
      }).join('');
    }

    function svgOpen() {
      return '<svg viewBox="0 0 ' + PIXEL_ART.cols + ' ' + PIXEL_ART.rows +
        '" aria-hidden="true" shape-rendering="crispEdges">';
    }

    // scary: pale face, black eye sockets, glowing red eyes, wide toothy mouth
    function buildScary() {
      var rows = PIXEL_ART.front.map(function (r) { return r.split(''); });
      // clear the cute face features (eyes, cheeks, mouth) from the hair layer
      [[6, 11], [7, 11], [8, 11], [15, 11], [16, 11], [17, 11], [7, 12], [8, 12], [15, 12], [16, 12],
      [7, 13], [16, 13], [6, 14], [17, 14], [11, 15], [12, 15]
      ].forEach(function (p) { rows[p[1]][p[0]] = '.'; });
      var hair = rows.map(function (r) { return r.join(''); });

      var eyes = [[7, 12, 2, 1], [15, 12, 2, 1]];
      var teeth = [[9, 15, 1, 1], [11, 15, 1, 1], [13, 15, 1, 1], [10, 16, 1, 1], [12, 16, 1, 1], [14, 16, 1, 1]];

      return svgOpen() +
        '<defs><filter id="scareGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/></filter></defs>' +
        rects([[5, 10, 14, 7]], '#cdbfc6') +
        '<path d="' + toPath(hair) + '" fill="#8f1f55"/>' +
        rects([[6, 11, 4, 3], [14, 11, 4, 3]], '#050005') +
        '<g class="scare-eyes"><g filter="url(#scareGlow)">' + rects(eyes, '#ff1d1d') + '</g>' + rects(eyes, '#ff5a4a') + '</g>' +
        rects([[7, 14, 1, 2], [16, 14, 1, 2]], '#050005') +
        rects([[8, 15, 8, 2]], '#050005') +
        rects(teeth, '#e8dde2') +
        '</svg>';
    }

    // cute: the normal pink Young-hee
    function buildCute() {
      return svgOpen().replace('<svg ', '<svg fill="currentColor" ') +
        '<path d="' + toPath(PIXEL_ART.front) + '"/></svg>';
    }

    $('#scareScary').innerHTML = buildScary();
    $('#scareCute').innerHTML = buildCute();

    /* ---------- sound ---------- */
    // 1) the mp3 file (if it exists)   2) otherwise the synthesised sting below
    var clip = null;
    var clipReady = false;

    function loadClip() {
      if (!SCARE_SOUND) return;
      try {
        clip = new Audio();
        clip.preload = 'auto';
        clip.addEventListener('canplaythrough', function () { clipReady = true; });
        clip.addEventListener('error', function () { clipReady = false; });
        clip.src = SCARE_CLIP;
      } catch (err) { clip = null; }
    }

    function playClip() {
      if (!clip || !clipReady) return false;
      try {
        clip.currentTime = 0;
        clip.volume = SCARE_VOLUME;
        var playing = clip.play();
        if (playing && playing.catch) playing.catch(sfxBoo);   // blocked? use the synth instead
        return true;
      } catch (err) { return false; }
    }

    function stopClip(fade) {
      if (!clip) return;
      if (!fade) { clip.pause(); return; }
      var level = clip.volume;
      var timer = setInterval(function () {
        level -= 0.1;
        if (level <= 0) { clearInterval(timer); clip.pause(); clip.volume = SCARE_VOLUME; }
        else clip.volume = level;
      }, 40);
    }

    loadClip();

    /* ---------- synthesised fallback ---------- */
    function audioStart() {
      if (!SCARE_SOUND) return;
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        audio = audio || new Ctx();
        if (audio.state === 'suspended') audio.resume();
      } catch (err) { audio = null; }
    }

    function tone(type, from, to, start, length, volume) {
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, start);
      osc.frequency.exponentialRampToValueAtTime(to, start + length);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      osc.connect(gain).connect(master());
      osc.start(start);
      osc.stop(start + length + 0.05);
    }

    // everything goes through a limiter so it is loud but never clips
    function master() {
      if (!audio.master) {
        var limiter = audio.createDynamicsCompressor();
        limiter.threshold.value = -8;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.002;
        limiter.release.value = 0.25;
        var gain = audio.createGain();
        gain.gain.value = SCARE_VOLUME;
        gain.connect(limiter);
        limiter.connect(audio.destination);
        audio.master = gain;
      }
      return audio.master;
    }

    function distortion(amount) {
      var shaper = audio.createWaveShaper();
      var curve = new Float32Array(1024);
      for (var i = 0; i < 1024; i++) {
        var x = i * 2 / 1024 - 1;
        curve[i] = (3 + amount) * x * 20 * (Math.PI / 180) / (Math.PI + amount * Math.abs(x));
      }
      shaper.curve = curve;
      return shaper;
    }

    function noiseBuffer(seconds) {
      var len = Math.floor(audio.sampleRate * seconds);
      var buf = audio.createBuffer(1, len, audio.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return buf;
    }

    // wobble a frequency a little (makes screeches sound alive)
    function vibrato(osc, rate, depth, start, stop) {
      var lfo = audio.createOscillator();
      var amount = audio.createGain();
      lfo.frequency.value = rate;
      amount.gain.value = depth;
      lfo.connect(amount).connect(osc.frequency);
      lfo.start(start);
      lfo.stop(stop);
    }

    // tension: a thin whine that rises fast, then sudden silence before the hit
    function sfxWhine() {
      if (!audio) return;
      var t = audio.currentTime;
      var end = t + TIME.dim / 1000 - 0.06;
      [['sine', 180, 1500, 0.22], ['triangle', 191, 1590, 0.12]].forEach(function (w) {
        var osc = audio.createOscillator();
        var gain = audio.createGain();
        osc.type = w[0];
        osc.frequency.setValueAtTime(w[1], t);
        osc.frequency.exponentialRampToValueAtTime(w[2], end);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(w[3], end - 0.02);
        gain.gain.setValueAtTime(0.0001, end);
        osc.connect(gain).connect(master());
        osc.start(t);
        osc.stop(end + 0.02);
      });
    }

    // the scare: slam + sub boom + dissonant screech + scream + dark drone
    function sfxBoo() {
      if (!audio) return;
      var t = audio.currentTime;
      var out = master();

      // 1) slam - full-band noise through a closing low-pass
      var slam = audio.createBufferSource();
      var slamFilter = audio.createBiquadFilter();
      var slamGain = audio.createGain();
      slam.buffer = noiseBuffer(1);
      slamFilter.type = 'lowpass';
      slamFilter.frequency.setValueAtTime(9000, t);
      slamFilter.frequency.exponentialRampToValueAtTime(180, t + 0.9);
      slamGain.gain.setValueAtTime(1, t);
      slamGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      slam.connect(slamFilter).connect(slamGain).connect(out);
      slam.start(t);

      // 2) sub boom
      var boom = audio.createOscillator();
      var boomGain = audio.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(95, t);
      boom.frequency.exponentialRampToValueAtTime(28, t + 1.6);
      boomGain.gain.setValueAtTime(1, t);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      boom.connect(boomGain).connect(out);
      boom.start(t);
      boom.stop(t + 1.9);

      // 3) screech - three clashing saws (minor 2nd + tritone), distorted, bending
      [880, 933, 1245].forEach(function (f, i) {
        var osc = audio.createOscillator();
        var gain = audio.createGain();
        var dist = distortion(80);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.linearRampToValueAtTime(f * 1.45, t + 0.25);
        osc.frequency.exponentialRampToValueAtTime(f * 0.5, t + 1.7);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.32, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8 + i * 0.1);
        vibrato(osc, 8 + i * 2, f * 0.03, t, t + 2);
        osc.connect(dist).connect(gain).connect(out);
        osc.start(t);
        osc.stop(t + 2);
      });

      // 4) scream - saw through two vowel-like band-pass filters ("aaaah")
      var voice = audio.createOscillator();
      var voiceGain = audio.createGain();
      var vowels = [[850, 7], [1650, 9]];
      voice.type = 'sawtooth';
      voice.frequency.setValueAtTime(330, t);
      voice.frequency.linearRampToValueAtTime(560, t + 0.4);
      voice.frequency.linearRampToValueAtTime(300, t + 1.7);
      voiceGain.gain.setValueAtTime(0.0001, t);
      voiceGain.gain.linearRampToValueAtTime(0.7, t + 0.05);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      vibrato(voice, 6, 18, t, t + 2);
      vowels.forEach(function (v) {
        var band = audio.createBiquadFilter();
        band.type = 'bandpass';
        band.frequency.value = v[0];
        band.Q.value = v[1];
        voice.connect(band).connect(voiceGain);
      });
      voiceGain.connect(distortion(40)).connect(out);
      voice.start(t);
      voice.stop(t + 2);

      // 5) drone - two beating low saws that hang around under the scene
      [55, 58.3].forEach(function (f) {
        var osc = audio.createOscillator();
        var low = audio.createBiquadFilter();
        var gain = audio.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        low.type = 'lowpass';
        low.frequency.value = 220;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 3);
        osc.connect(low).connect(gain).connect(out);
        osc.start(t);
        osc.stop(t + 3.1);
      });
    }

    function sfxChime() {
      if (!audio) return;
      var t = audio.currentTime;
      tone('sine', 659, 659, t, 0.4, 0.08);
      tone('sine', 880, 880, t + 0.12, 0.4, 0.08);
      tone('sine', 1319, 1319, t + 0.24, 0.6, 0.08);
    }

    /* ---------- timeline ---------- */
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function setPhase(name) { overlay.dataset.phase = name; }

    function goHome() {
      $('#app').hidden = true;
      $('#start').hidden = false;
    }

    function finish() {
      clearTimers();
      stopClip(false);
      overlay.hidden = true;
      overlay.removeAttribute('data-phase');
      page.inert = false;
      wrap.inert = false;
      running = false;
      lamp.focus({ preventScroll: true });
    }

    function toOut() {
      clearTimers();
      setPhase('out');
      later(finish, TIME.out + 50);
    }

    function start() {
      if (running) return;
      running = true;
      page.inert = true;       // nothing behind the overlay can be clicked or tabbed to
      wrap.inert = true;
      audioStart();
      var dim = clipReady ? 450 : TIME.dim;   // the synth needs a longer build-up
      if (!clipReady) sfxWhine();

      overlay.hidden = false;
      void overlay.offsetWidth;   // let the browser register the starting opacity
      setPhase('dim');

      later(function () { setPhase('boo'); if (!playClip()) sfxBoo(); }, dim);

      later(function () {
        goHome();                 // page is already back on the first screen when the light returns
        setPhase('bright');
        stopClip(true);
        sfxChime();
      }, dim + TIME.boo);

      later(toOut, dim + TIME.boo + TIME.bright);
    }

    lamp.addEventListener('click', start);

    // skip: Esc any time, or click the cheerful screen
    document.addEventListener('keydown', function (e) {
      if (!running || e.key !== 'Escape') return;
      goHome();
      toOut();
    });
    overlay.addEventListener('click', function () {
      if (running && overlay.dataset.phase === 'bright') toOut();
    });
  }

  /* ==========================================================
     FOOTER LINKS
     ========================================================== */
  function initLinks() {
    [['#btnPoster', LINKS.poster], ['#btnGithub', LINKS.github]].forEach(function (p) {
      var a = $(p[0]);
      if (p[1]) {
        a.href = p[1];
      } else {
        a.removeAttribute('href');
        a.setAttribute('aria-disabled', 'true');
        a.title = 'ยังไม่ได้ใส่ลิงค์';
      }
    });
  }

  /* ==========================================================
     BOOT
     ========================================================== */
  initDoll();
  initScreens();
  initTabs();
  initCode();
  initTeam();
  initScare();
  initLinks();
})();
