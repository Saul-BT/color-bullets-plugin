function entry(API) {
  const styleExtensions = [ 'css' ];

  function detectColor(text) {
    const reColors = {
      HEX: /#[A-Z0-9]{3,6}/i,
      RGBA: /rgba\((?<rgb>(1?\d{1,2}|2[0-4]\d|25[0-5])\s*,\s*){3}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\)/i,
      HSLA: /hsla\((?<hue>\d+)\s*,\s*(?<sl>(\d{1,2}|100)%\s*,\s*){2}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\)/i,
    }

    for (let format in reColors) {
      let re = reColors[format]
      
      if (re.test(text))
        return text.match(re)[0]
    }
  }

  
  function showColorBullet(instance, color, line, ch) {
    let bullet = document.createElement('span')
    bullet.style.cssText = `
      margin: 0 5px;
      padding: 0.35em;
      background-color: ${color};
      display: inline-block;
      border: 0.05em solid white;
      border-radius: 50%;
    `
    instance.setBookmark(
      { line, ch },
      { widget: bullet }
    )
  }


  API.RunningConfig.on('aTabHasBeenCreated', (tab) => {
    const { tabElement, directory: path, instance, client } = tab
    if (styleExtensions.indexOf(path.split('.').pop()) === -1)
      return

    let line = 0, ch = 0;

    instance.doc.eachLine((lh) => {
      let color = detectColor(lh.text)
      if (color) {
        let ch = lh.text.indexOf(color) + color.length
        showColorBullet(instance, color, line, ch)
        ch = 0
      }
      line++
    })
  })
}

module.exports = { entry }