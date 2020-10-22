function entry(API) {
  const bookmarks = new Map()
  const styleExtensions = [ 'css' ]

  function detectColor(text) {
    const reColors = {
      HEX: /#(?!.{5}\b)[A-F0-9]{3,6}\b/i,
      RGBA: /rgba\((?<rgb>(1?\d{1,2}|2[0-4]\d|25[0-5])\s*,\s*){3}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\)/i,
      HSLA: /hsla\((?<hue>\d+(deg)?)\s*,\s*(?<sl>(\d{1,2}|100)%\s*,\s*){2}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\)/i,
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
    let b = instance.setBookmark(
      { line, ch },
      { widget: bullet }
    )
    bookmarks.set(line, b)
  }
  
  
  function processLine(cm, line, text) {
    let color = detectColor(text)
      
    if (bookmarks.has(line))
      bookmarks.get(line).clear()
      
    if (color) {
      let ch = text.indexOf(color) + color.length
      showColorBullet(cm, color, line, ch)
    }
  }


  API.RunningConfig.on('aTabHasBeenCreated', (tab) => {
    const { directory: path, instance } = tab
    
    if (styleExtensions.indexOf(path.split('.').pop()) === -1)
      return

    let line = 0, ch = 0
    
    instance.on('change', (cm, data) => {
      let { text } = cm.state.activeLines[0]
      let { line } = data.from
      
      processLine(cm, line, text)
    })

    instance.doc.eachLine((lh) => {
      processLine(instance, line, lh.text)
      line++
    })
  })
}

module.exports = { entry }