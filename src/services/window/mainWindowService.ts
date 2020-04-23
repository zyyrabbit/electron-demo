import {
  app,
  screen,
  BrowserWindowConstructorOptions
} from 'electron'

export default function() {
  app.$IPC.on('resize', (options:BrowserWindowConstructorOptions) => {
    const {width = 960, height = 600, resizable = false, maxHeight, maxWidth, minHeight, minWidth } = options

    if (app.$win.isMaximized()) {
      app.$win.restore()
    }
   
    resizable !== undefined && app.$win.setResizable(resizable)
    minWidth  !== undefined && minHeight !== undefined ? app.$win.setMinimumSize(minWidth, minHeight) : !resizable && app.$win.setMinimumSize(width, height)
    maxWidth  !== undefined && maxHeight !== undefined ? app.$win.setMaximumSize(maxWidth, maxHeight) : !resizable && app.$win.setMaximumSize(width, height)
    const bounds = screen.getPrimaryDisplay().bounds
    app.$win.setBounds(
      { 
        x: Math.round((bounds.width - width) / 2), 
        y: Math.round((bounds.height - height) / 2),  
        width: width, 
        height: height
      }
    )
  })
}