/* pixel-art.js — วาดภาพ pixel จากตารางตัวอักษร แล้วแปลงเป็น SVG (คมชัดทุกขนาดจอ)
   ใช้: <span class="pix" data-pix="dice"></span> */
(function () {
  const P = {
    K: '#1b1b2f', W: '#ffffff', R: '#ff4d5e', G: '#4cd964', Y: '#ffd23f',
    B: '#4aa3ff', S: '#9aa3b5', D: '#1e5a2e', L: '#b6e3a0'
  };

  const S = {
    // ฟังเสียง
    speaker: [
      '............',
      '......K.....',
      '.....KSK..B.',
      'KKKKKSSK...B',
      'KSSSKSSK.B.B',
      'KSSSKSSK.B.B',
      'KSSSKSSK.B.B',
      'KSSSKSSK.B.B',
      'KKKKKSSK...B',
      '.....KSK..B.',
      '......K.....'
    ],
    // จังหวะสุ่ม
    dice: [
      '.KKKKKKKKKK.',
      'KWWWWWWWWWWK',
      'KWRRWWWWRRWK',
      'KWRRWWWWRRWK',
      'KWWWWWWWWWWK',
      'KWWWWRRWWWWK',
      'KWWWWRRWWWWK',
      'KWWWWWWWWWWK',
      'KWRRWWWWRRWK',
      'KWRRWWWWRRWK',
      'KWWWWWWWWWWK',
      '.KKKKKKKKKK.'
    ],
    // ระดับความยาก
    levels: [
      '............',
      '............',
      '........KKK.',
      '........KRK.',
      '........KRK.',
      '....KKK.KRK.',
      '....KYK.KRK.',
      '....KYK.KRK.',
      'KKK.KYK.KRK.',
      'KGK.KYK.KRK.',
      'KGK.KYK.KRK.',
      'KKK.KKK.KKK.'
    ],
    // คะแนน
    star: [
      '.....K.....',
      '....KYK....',
      '...KYYYK...',
      'KKKKYYYKKKK',
      'KYYYYYYYYYK',
      '.KYYWYYYYK.',
      '..KYYYYYK..',
      '..KYYYYYK..',
      '.KYYYKYYYK.',
      '.KYYK.KYYK.',
      '.KKK...KKK.'
    ],
    // จอ LCD + ตัวละครเดิน
    lcd: [
      'KKKKKKKKKKKKKK',
      'KLLLLLLLLLLLLK',
      'KLLLDDLLLLLDDK',
      'KLLLDDLLLLLDLK',
      'KLLDDDDLLLLDLK',
      'KLLLDDLLLLLDLK',
      'KLLDLLDLLLLDLK',
      'KLLLLLLLLLLLLK',
      'KKKKKKKKKKKKKK'
    ],
    // หมุน Potentiometer
    knob: [
      '...KKKKKK...',
      '..KWBBBBRK..',
      '.KWBBBBBRBK.',
      'KWBBBBBRBBBK',
      'KBBBBBRBBBBK',
      'KBBBBRKBBBBK',
      'KBBBBBBBBBBK',
      'KBBBBBBBBBBK',
      '.KBBBBBBBBK.',
      '..KBBBBBBK..',
      '...KKKKKK...'
    ],
    // กดปุ่ม
    button: [
      '............',
      '...KKKKKK...',
      '..KRWRRRRK..',
      '..KRRRRRRK..',
      '..KRRRRRRK..',
      '..KKKKKKKK..',
      '.KSSSSSSSSK.',
      '.KSSSSSSSSK.',
      '.KKKKKKKKKK.',
      '..K......K..'
    ],
    // เพลงกำลังเล่น
    note: [
      '......KKKKK.',
      '......KYYYYK',
      '......KYKKYK',
      '......KYK.KK',
      '......KYK...',
      '......KYK...',
      '..KKK.KYK...',
      '.KYYYKKYK...',
      '.KYYYYYYK...',
      '.KYYYYYK....',
      '..KKKKK.....'
    ],
    // Game Over
    skull: [
      '...KKKKK...',
      '..KWWWWWK..',
      '.KWWWWWWWK.',
      '.KWWWWWWWK.',
      '.KWKKWKKWK.',
      '.KWKKWKKWK.',
      '.KWWWKWWWK.',
      '..KWWWWWK..',
      '..KWKWKWK..',
      '...KKKKK...'
    ],
    // เส้นชัย
    flag: [
      '.KKKKKKKKK..',
      '.KWKWKWKWK..',
      '.KKWKWKWKK..',
      '.KWKWKWKWK..',
      '.KKKKKKKKK..',
      '.KS.........',
      '.KS.........',
      '.KS.........',
      '.KS.........',
      '.KS.........',
      'KSSSK.......',
      'KKKKK.......'
    ]
  };

  function toSVG(rows) {
    const h = rows.length;
    const w = Math.max.apply(null, rows.map(r => r.length));
    let rects = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const c = row[x];
        if (c === '.') { x++; continue; }
        let e = x;
        while (e < row.length && row[e] === c) e++;
        rects += '<rect x="' + x + '" y="' + y + '" width="' + (e - x) +
                 '" height="1" fill="' + P[c] + '"/>';
        x = e;
      }
    });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h +
           '" style="aspect-ratio:' + w + '/' + h + ';--cols:' + w +
           '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
           rects + '</svg>';
  }

  document.querySelectorAll('[data-pix]').forEach(el => {
    const rows = S[el.dataset.pix];
    if (rows) el.innerHTML = toSVG(rows);
  });
})();
