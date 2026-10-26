(function () {
  'use strict';

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
     PIXEL ICONS  (edit / add sprites here)
     ========================================================== */
  // Pixel icons for the tools list.  Each letter = one colour (see TOOL_PALETTE), '.' = empty.
  var TOOL_PALETTE = {
    B: '#3b6fd4',
    C: '#f4ead0',
    G: '#1f7a5e',
    K: '#1a1a1a',
    M: '#8c8c8c',
    N: '#4fd37e',
    P: '#e0458b',
    Q: '#a52a62',
    R: '#e8403a',
    S: '#a9dbe3',
    W: '#ffffff',
    Y: '#f2c12e',
    c: '#e3d6b2',
    d: '#b9a978',
    m: '#c9c9c9',
    p: '#f58bb9',
    r: '#ff8f86',
    y: '#d4a017'
  };

  var TOOL_SPRITES = {
    arduino: [
      "...K.K.K.K.K.K.K.K.K.K...",
      "..KKKKKKKKKKKKKKKKKKKKK..",
      "KKKGGGGGGGGGGGGGGGGGGGKK.",
      "KmmGGGGGGGGGGGGGGGGGGGGK.",
      "KmmGGGGGGKKKKKKGGGGGGGGK.",
      "KmmGGGGGGKKKKKKGGPPGGGGK.",
      "KmmGGGGGGKKKKKKGGPPGYGGK.",
      "KmmGGGGGGKKKKKKGGGGGYGGK.",
      "KmmGGGGGGGGGGGGGGGGGGGGK.",
      "KKKGGGGGGGGGGGGGGGGGGGKK.",
      "..KKKKKKKKKKKKKKKKKKKKK..",
      "...K.K.K.K.K.K.K.K.K.K..."
    ],

    breadboard: [
      "KKKKKKKKKKKKKKKKKKKKKKKK",
      "KCCCCCCCCCCCCCCCCCCCCCCK",
      "KCRRRRRRRRRRRRRRRRRRRRCK",
      "KCKCKCKCKCKCKCKCKCKCKCCK",
      "KCCCCCCCCCCCCCCCCCCCCCCK",
      "KcKcKcKcKcKcKcKcKcKcKcKK",
      "KddddddddddddddddddddddK",
      "KcKcKcKcKcKcKcKcKcKcKcKK",
      "KCCCCCCCCCCCCCCCCCCCCCCK",
      "KCKCKCKCKCKCKCKCKCKCKCCK",
      "KCBBBBBBBBBBBBBBBBBBBBCK",
      "KCCCCCCCCCCCCCCCCCCCCCCK",
      "KKKKKKKKKKKKKKKKKKKKKKKK"
    ],

    lcd: [
      "..K.K.K.K.K.K.K.K.K.K.K.K..",
      "KKKKKKKKKKKKKKKKKKKKKKKKKKK",
      "KGGGGGGGGGGGGGGGGGGGGGGGGGK",
      "KGKKKKKKKKKKKKKKKKKKKKKKKGK",
      "KGKSSSSSSSSSSSSSSSSSSSSSKGK",
      "KGKSKSKKSKSSKKSKSKSSKKSSKGK",
      "KGKSKSKSSKSKSSKSKSKSKSSSKGK",
      "KGKSSSSSSSSSSSSSSSSSSSSSKGK",
      "KGKSKKSKSKSKKSSKSKSKSSKSKGK",
      "KGKSKSSKSKSKSSKSKSKSSKSSKGK",
      "KGKSSSSSSSSSSSSSSSSSSSSSKGK",
      "KGKKKKKKKKKKKKKKKKKKKKKKKGK",
      "KGGGGGGGGGGGGGGGGGGGGGGGGGK",
      "KKKKKKKKKKKKKKKKKKKKKKKKKKK"
    ],

    switch: [
      "..KKKKKKKKKK..",
      ".KMMMMMMMMMMK.",
      "KMmmmmmmmmmmMK",
      "KMmKKKKKKKKmMK",
      "KMmKPPPPPQKmMK",
      "KMmKPppPPQKmMK",
      "KMmKPppPPQKmMK",
      "KMmKPPPPPQKmMK",
      "KMmKQQQQQQKmMK",
      "KMmKKKKKKKKmMK",
      "KMMMMMMMMMMMMK",
      ".KKKKKKKKKKKK.",
      "KmK..KmK.KmK..",
      "KmK..KmK.KmK.."
    ],

    pot: [
      "....KKKKKK....",
      "..KKMMMMMMKK..",
      ".KMMmmmmmmMMK.",
      ".KMmmKPPKmmMK.",
      "KMmmKPpPPQKmMK",
      "KMmmKPPPPQKmMK",
      "KMmmKQPPQQKmMK",
      "KMmmmKKKKmmmMK",
      ".KMMmmmmmmMMK.",
      ".KKMMMMMMMMKK.",
      "..KKKKKKKKKK..",
      "....K..K..K...",
      "....K..K..K...",
      "....K..K..K..."
    ],

    rgbled: [
      "...KKKKKKKK...",
      "..KmmmmmmmmK..",
      ".KmWWmmmmmmmK.",
      "KmmRRmNNmBBmmK",
      "KmmRRmNNmBBmmK",
      "KmmmmmmmmmmMMK",
      "KmmmmmmmmmmMMK",
      "KKKKKKKKKKKKKK",
      ".KMMMMMMMMMMK.",
      ".KKKKKKKKKKKK.",
      ".KK.KK..KK.KK.",
      ".KK.KK..KK.KK.",
      ".KK.KK..KK.KK.",
      ".RR.KK..NN.BB.",
      "....KK........",
      "....KK........"
    ]
  };

  /* ==========================================================
     TOOLS LIST  (pixel icons)
     ========================================================== */
  function initTools() {
    $$('[data-sprite]').forEach(function (slot) {
      var rows = TOOL_SPRITES[slot.dataset.sprite];
      if (!rows) return;

      // one <path> per colour
      var used = {};
      rows.forEach(function (r) {
        r.split('').forEach(function (ch) { if (ch !== '.') used[ch] = true; });
      });
      var paths = Object.keys(used).map(function (ch) {
        var mask = rows.map(function (r) {
          return r.split('').map(function (c) { return c === ch ? '#' : '.'; }).join('');
        });
        return '<path fill="' + TOOL_PALETTE[ch] + '" d="' + toPath(mask) + '"/>';
      }).join('');

      slot.style.setProperty('--c', rows[0].length);
      slot.style.setProperty('--r', rows.length);
      slot.innerHTML =
        '<svg viewBox="0 0 ' + rows[0].length + ' ' + rows.length + '" aria-hidden="true" ' +
        'shape-rendering="crispEdges">' + paths + '</svg>';
    });
  }

  initTools();
})();
