const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
    win = new BrowserWindow({show: false});

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'ui/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    win.maximize();
    //win.setMenu(null);
    win.show();
}

app.on('ready', createWindow);