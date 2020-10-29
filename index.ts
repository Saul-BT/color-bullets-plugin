import BulletManager from './BulletManager.ts'

export function entry({ RunningConfig, StaticConfig }) {
  if (!StaticConfig.data.colorBulletExtensions)
    StaticConfig.data.colorBulletExtensions = [ 'css', 'scss' ]

  RunningConfig.on('aTabHasBeenCreated', (tab) => {
    const { directory: path, instance, isEditor } = tab
    const { colorBulletExtensions } = StaticConfig.data
    const bm = new BulletManager(instance)

    if (colorBulletExtensions.indexOf(path.split('.').pop()) === -1 || !isEditor)
      return

    let line = 0

    instance.doc.eachLine((lh) => {
      bm.processLine(line, lh.text)
      line++
    })
    
    instance.on('change', (_, data) => {
      let { text } = instance.state.activeLines[0]
      let { line } = data.from

      bm.processLine(line, text)
    })
  })
}