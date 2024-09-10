const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const keytar = require('keytar');
require('dotenv').config();
const { autoUpdater } = require('electron-updater');

const isDevelopment = process.env.NODE_ENV === 'development';
const preloadPath = isDevelopment
  ? path.join(__dirname, 'src', 'preload.cjs')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'src', 'preload.cjs');

let splash;
function createSplashWindow() {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  
  splash.loadFile(path.join(__dirname, './src/splash.html'));
}

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    icon: path.join(__dirname, './public/icon/icon.ico'),
    width,
    height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      preload: preloadPath,
    },
  });

  if (isDevelopment) {
    win.loadURL('http://localhost:3000/');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  win.once('ready-to-show', () => {
    if (splash) {
      splash.close();
    }
    win.show();
    autoUpdater.checkForUpdatesAndNotify();
  });
};

app.whenReady().then(() => {
  createSplashWindow();
  createWindow();
  
  let cssContent = '';

  try {
    const cssFilePath = isDevelopment
      ? path.resolve(__dirname, 'src', 'style.css')
      : path.resolve(process.resourcesPath, 'app.asar', 'src', 'style.css');
    
    cssContent = fs.readFileSync(cssFilePath, 'utf8');
  } catch (error) {
    console.error('Error reading CSS file:', error);
  }
  

  ipcMain.on('print', (event, content) => {
    try {
    const printWindow = new BrowserWindow({ 
      // width: 800,
      // height: 600,
      show: false,
     });

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
      <head>
        <style>
        ${cssContent}
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `)}`);

    
    printWindow.once('ready-to-show', () => {
      try {
      const options = {
        silent: true,
        printBackground: true,
        margins: {
          marginType: 'none',
        }
      };

      
      event.sender.send('fromMain', 'Print command received');

      printWindow.webContents.print(options, (success, failureReason) => {
        if (!success) {
          console.log("Print failed:", failureReason);
          
        } else {
          console.log('Print initiated successfully');
        }
      });
    } catch (error) {
      console.error('Error during print process:', error);
      event.sender.send('print-error', `Print process error: ${error.message}`);
    }
    });

    printWindow.on('error', (error) => {
      console.error('Print window error:', error);
      event.sender.send('print-error', `Print window error: ${error.message}`);
    });
  } catch (error) {
    console.error('Print operation failed:', error);
    event.sender.send('print-error', `Print operation failed: ${error.message}`);
  }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });


  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of the application is available. Downloading now...',
    });
  });
  
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version has been downloaded. The application will now restart to apply the update.',
    }).then(() => {
      autoUpdater.quitAndInstall();
    });

});

});

// Save credentials (store as a JSON string)
ipcMain.handle('save-credentials', async (event, service, credentialsString) => {
  try {
    await keytar.setPassword(service, 'credentials', credentialsString);
    return { status: 'success' };
  } catch (error) {
    console.error('Error saving credentials:', error);
    return { status: 'error', message: error.message };
  }
});

// Retrieve credentials
ipcMain.handle('get-credentials', async (event, service) => {
  try {
    const credentialsString = await keytar.getPassword(service, 'credentials');
    if (credentialsString) {
      const credentials = JSON.parse(credentialsString);
      return { status: 'success', credentials };
    } else {
      return { status: 'error', message: 'No credentials found' };
    }
  } catch (error) {
    console.error('Error retrieving credentials:', error);
    return { status: 'error', message: error.message };
  }
});

// Delete credentials
ipcMain.handle('delete-credentials', async (event, service) => {
  try {
    await keytar.deletePassword(service, 'credentials');
    return { status: 'success' };
  } catch (error) {
    console.error('Error deleting credentials:', error);
    return { status: 'error', message: error.message };
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
