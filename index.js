function entry(API) {
  const bookmarks = new Map()
  const styleExtensions = [ 'css' ]

  function detectColor(text) {
    let matches = [];
    
    const reColors = {
      HEX: /#([A-F0-9]{6}|[A-F0-9]{3,4})\b/gi,
      RGBA: /rgba\((?<rgb>(1?\d{1,2}|2[0-4]\d|25[0-5])\s*,\s*){3}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\)/gi,
      HSLA: /hsla\((?<hue>\d+(deg)?)\s*,\s*(?<sl>(\d{1,2}|100)%\s*,\s*){2}(?<alpha>(?<=0|\s|,)0?\.\d+|1|0)\)/gi,
    }

    for (let format in reColors) {
      let re = reColors[format]
      
      if (re.test(text))
        matches.push(...text.match(re))
    }
    
    return matches
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
    
    if (bookmarks.has(line))
      bookmarks.get(line).push(b)
    else
    	bookmarks.set(line, [b])
  }
  
  
  function processLine(cm, line, text) {
    let colors = detectColor(text)
      
    if (bookmarks.has(line))
      bookmarks.get(line).forEach(b => b.clear())
      
    if (colors) {
      colors.forEach(color => {
        let ch = text.indexOf(color) + color.length
        showColorBullet(cm, color, line, ch)
      })
    }
  }


  API.RunningConfig.on('aTabHasBeenCreated', (tab) => {
    const { directory: path, instance } = tab
    
    if (styleExtensions.indexOf(path.split('.').pop()) === -1)
      return

    let line = 0
    
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