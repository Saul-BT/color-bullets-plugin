export default class BulletManager {
  cm; // The codemirror instance
  bullets: Map<number, any[]> = new Map()
  
  constructor(cm) {
    this.cm = cm
  }


  detectColor(text: string): string[] {
    let colors: string[] = [];

    const reColors = {
      HEX: /#([A-F0-9]{6}|[A-F0-9]{3,4})\b/gi,
      HSL: /hsl\(\s*(?<hue>\d+(deg)?)\s*,\s*(?<s>\d{1,2}|100)%\s*,\s*(?<l>\d{1,2}|100)%\s*\)/gi,
      RGB: /rgb(?=\((([^%]*?%[^%]*?){3}|([^%]*?\d[^%]*?){3})\))\(\s*(?<rg>(1?\d{1,2}|2[0-4]\d|25[0-5])%?\s*,\s*){2}(?<b>1?\d{1,2}|2[0-4]\d|25[0-5])%?\s*\)/g,
      RGBA: /rgba\(\s*(?<rgb>(1?\d{1,2}|2[0-4]\d|25[0-5])\s*,\s*){3}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\s*\)/g,
      HSLA: /hsla\(\s*(?<hue>\d+(deg)?)\s*,\s*(?<sl>(\d{1,2}|100)%\s*,\s*){2}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\s*\)/gi,
    }

    for (let format in reColors) {
      let re = reColors[format]

      if (re.test(text))
        colors.push(...text.match(re))
    }

    return colors
  }

  showColorBullet(color: string, line: number, ch: number) {
    let bullet = document.createElement('span')

    bullet.style.cssText = `
      margin-right: 0.2em;
      margin-left: 0.4em;
      padding: 0.35em;
      background-color: ${color};
      display: inline-block;
      border: 0.06em solid white;
      border-radius: 50%;
    `
    let b = this.cm.setBookmark(
      { line, ch },
      { widget: bullet }
    )

    if (this.bullets.has(line))
      this.bullets.get(line).push(b)
    else
      this.bullets.set(line, [b])
  }

  processLine(line: number, text: string) {
    let colors: string[] = this.detectColor(text)

    if (this.bullets.has(line))
      this.bullets.get(line).forEach(b => b.clear())

    if (colors) {
      colors.forEach(color => {
        let ch = text.indexOf(color) + color.length
        this.showColorBullet(color, line, ch)
      })
    }
  }
}