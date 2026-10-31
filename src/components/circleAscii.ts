const palette = ['#211726', '#513756', '#886b8e', '#bca4b8', '#e1d9dc'];
export function asciiImage(seed: string, portrait = false): string {
  const hash = [...seed].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
  const cols = portrait ? 44 : 88, rows = portrait ? 44 : 80;
  const scene = hash % 4;
  const ellipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
  const lines: string[][] = palette.map(() => []);
  for (let row = 0; row < rows; row++) {
    const text = palette.map(() => '');
    for (let col = 0; col < cols; col++) {
      const x = col / cols, y = row / rows;
      let light = 0.08 + 0.05 * Math.sin(x * 19 + y * 7 + hash % 9);
      if (portrait) {
        if (ellipse(x, y, .5, 1, .43, .33)) light = .32;
        if (ellipse(x, y, .5, .43, .25, .32)) light = .21;
        if (ellipse(x, y, .5, .47, .20, .27)) light = .68 + (x - .5) * .45;
        if (y < .32 + .045 * Math.sin(x * (12 + hash % 8)) && ellipse(x, y, .5, .42, .24, .3)) light = .2;
        if (ellipse(x, y, .42, .45, .034, .018) || ellipse(x, y, .58, .45, .034, .018)) light = .1;
        if (ellipse(x, y, .51, .53, .025, .05)) light = .45;
        if (ellipse(x, y, .5, .62, .08, .012)) light = .2;
      } else if (scene === 0) {
        light = y < .58 ? .26 + y * .25 : .18;
        if (ellipse(x, y, .73, .22, .09, .1)) light = .92;
        if (y > .55 - .34 * (1 - Math.abs(x - .35) * 2)) light = .4;
        if (y > .8 - .4 * (1 - Math.abs(x - .8) * 2)) light = .24;
        if (y > .72) light = .26 + .11 * Math.sin(y * 130 + x * 8);
      } else if (scene === 1) {
        light = y > .7 ? .33 : .12;
        if (ellipse(x, y, .49, .74, .32, .07)) light = .55;
        if (x > .25 && x < .68 && y > .38 && y < .7) light = .72 - x * .15;
        if (ellipse(x, y, .7, .52, .13, .13) && !ellipse(x, y, .7, .52, .08, .08)) light = .65;
        if (ellipse(x, y, .465, .38, .215, .055)) light = .3;
        if (y > .12 && y < .3 && Math.abs(x - .44 - .025 * Math.sin(y * 40)) < .013) light = .5;
      } else if (scene === 2) {
        light = .16 + y * .15;
        if (ellipse(x, y, .5, .68, .26, .3)) light = .5;
        if ((x > .25 && x < .43 && y > .17 && y < .4 && x > .25 + (y - .17) * .22) || (x > .57 && x < .75 && y > .17 && y < .4 && x < .75 - (y - .17) * .22)) light = .7;
        if (ellipse(x, y, .5, .44, .25, .2)) light = .67;
        if (ellipse(x, y, .4, .43, .034, .025) || ellipse(x, y, .6, .43, .034, .025)) light = .1;
        if (ellipse(x, y, .5, .51, .03, .02)) light = .2;
        if (y > .52 && y < .57 && Math.abs((x - .5) * .12) < .02) light = .38;
      } else {
        light = .18;
        if (y > .45 && y < .75) light = .35;
        if (x > .16 && x < .48 && y > .3 && y < .7) light = .75;
        if (x > .49 && x < .82 && y > .3 && y < .7) light = .65;
        if (y > .35 && y < .65 && Math.floor(y * 60) % 3 === 0 && x > .21 && x < .77) light *= .6;
        if (Math.abs(x - .485) < .012 && y > .3 && y < .72) light = .2;
      }
      const noise = ((row * 73 + col * 37 + hash) % 19) / 190;
      const level = Math.min(4, Math.max(0, Math.floor((light + noise) * 5)));
      const glyphs = '.:irsXA253hMHGS#@';
      const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor((light + noise) * glyphs.length))];
      for (let layer = 0; layer < palette.length; layer++) text[layer] += layer === level ? glyph : ' ';
    }
    text.forEach((line, layer) => lines[layer].push(`<tspan x="0" y="${row * 10 + 9}">${line}</tspan>`));
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * 6}" height="${rows * 10}" viewBox="0 0 ${cols * 6} ${rows * 10}"><rect width="100%" height="100%" fill="#160f1b"/>${lines.map((line, layer) => `<text fill="${palette[layer]}" font-family="monospace" font-size="10" xml:space="preserve">${line.join('')}</text>`).join('')}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
