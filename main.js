const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron');
const electron = require('electron');
const url = require('url')
const path = require('path')
const { autoUpdater } = require('electron-updater');
let pluginName


switch (process.platform) {
	case 'win32':
		pluginName = 'flash/pepflashplayer.dll'
		break;
	case 'darwin':
		pluginName = 'flash/PepperFlashPlayer.plugin';
		break;
	case 'linux':
		pluginName = 'flash/libpepflashplayer.so';
		break;
}

app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/../', pluginName));
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.445')

let mainWindow;
const menuTemplate = [
  {
     label: 'Inicio',
     submenu: [
        {
          label: "Salir(Exit)",
           role: 'quit'
        },       
        {
           type: 'separator'
        },
        {
           label: 'Nº versión('+app.getVersion()+')'
        }
     ]
  },  
  {
     label: 'Vista(View)',
     submenu: [
        {
          label: "Recarga(reload)",
           role: 'reload'
        },
        { type: 'separator' },
        {
          label: "Tamaño original(Actual size)",
           role: 'resetzoom'
        },
        {
          label: "Aumentar(Zoom +)",
           role: 'zoomin'
        },
        {
          label: "Reducir(Zoom -)",
           role: 'zoomout'
        }
     ]
  },
  
   
  {
    label : "Ventana(window)",
    submenu: [
       {
         label : "Pantalla completa(Full Screen)",
         role: 'togglefullscreen'
       },
       {
         label : "Minimizar(Minimize)",
         role: 'minimize'
       },
       {
         label : "Restaurar(Zoom)",
         role: 'zoom'
       },
       {
         label : "Cerrar",
         role: 'close'
       }
    ]
 },
  {
     label : "Ayuda(Help)",
     role: 'help',
     submenu: [
      {
        label: 'Ayuda de Espacio Onda',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://editorial.ondaeduca.com/page/soporte')
        }
      },
      {
        label: 'Informar de incidencias',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://editorial.ondaeduca.com/page/contactus')
        }
      },{
        label: 'Info Licencia'        
      }
     ]
  }
]

function createWindow () {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    title: 'Espacio Onda',
    width: width, height: height,
    icon: __dirname + '/Material Icons_e2bd_256.png',			
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      allowDisplayingInsecureContent: true,
      allowRunningInsecureContent: true,
      plugins: true
    }
  });
  mainWindow.loadURL(url.format ({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
  }));
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  const ses = mainWindow.webContents.session
	ses.clearCache(function() {});

  mainWindow.maximize();
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  

	
  
  mainWindow.once('ready-to-show', () => {
	autoUpdater.checkForUpdatesAndNotify();
  });
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});


autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});