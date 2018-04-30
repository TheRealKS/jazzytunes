const electron = require('electron');
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;

var authWindow, redurl;
var CLIENT_ID = "40918ae807d24a16a7f8217fa1f445c0";
var CLIENT_SECRET = "b1506d8d8edf447a816d773def58a1c3";

var credentials : CredentialsProvider;

class ExpiringCredentials {
    access_token : string
    refresh_token : string
    expires_in : number
    will_refresh : boolean = true;
    refresher : number;
    constructor(a_t : string, r_t : string, e_i : number, w_r : boolean) {
        this.access_token = a_t;
        this.refresh_token = r_t;
        this.expires_in = e_i;
        this.will_refresh = w_r;
        if (w_r) this.refresh();
    }

    refresh() {
        let timeinms = this.expires_in * 1000;
        let fn = requestAccesToken.bind(null, this.refresh_token, true) 
        this.refresher = setInterval(fn, timeinms);
    }

    set willRefresh(refresh : boolean) {
        if (refresh !== this.will_refresh) {
            this.will_refresh = refresh;
            if (refresh) {
                this.refresh();
            } else {
                clearInterval(this.refresher);
            }
        }
    }

    revoke() {
        clearInterval(this.refresher);
    }
}

class CredentialsProvider {
    authorizationCode : string;
    expiringCredentials : ExpiringCredentials;
    constructor(authCode : string) {
        this.authorizationCode = authCode;
    }

    get authCode() {
        return this.authorizationCode;
    }

    getAccessToken() {
        return this.expiringCredentials.access_token;
    }
}

function startAuthProcess() {
    //Define the scopes necessary for this project
    var scopes = [
        'streaming',
        'user-library-read',
        'user-library-modify'
    ];
    var scopesstr = scopes.join(" ");
    scopesstr = encodeURIComponent(scopesstr);
    redurl ="https://localhost/index.html";
    var url = "https://accounts.spotify.com/authorize?client_id=" + CLIENT_ID + "&response_type=code&scope=" +
        scopesstr + "&redirect_uri=" + encodeURIComponent(redurl);
    authWindow = new BrowserWindow({show: false});

    authWindow.on('close', () => {
        authWindow = null;
    }, false);

    authWindow.loadURL(url);
    authWindow.show();

    var webContents = authWindow.webContents;

    webContents.on('will-navigate', (event, url) => {
        handleAuthCodeCallback(url);
    });

    webContents.on('did-get-redirect-request', (event, oldURL, newURL) => {
        handleAuthCodeCallback(newURL);
    });
}
window.onload = function () {
    document.getElementById('authorize').addEventListener("click", startAuthProcess);
};

function handleAuthCodeCallback(url) {
    var raw_code = raw_code = /code=([^&]*)/.exec(url) || null;
    var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    var error = /\?error=(.+)$/.exec(url);
    if (code || error) {
        authWindow.destroy();
    }
    if (code) {
        credentials = new CredentialsProvider(code);
        requestAccesToken(code);
    }
}

function requestAccesToken(authCode : string, refresh : boolean = false) {
    let data = new URLSearchParams();
    data.append("grant_type", "authorization_code");
    data.append("code", authCode);
    data.append("redirect_uri", redurl);
    data.append("client_id", CLIENT_ID);
    data.append("client_secret", CLIENT_SECRET);
    fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: data.toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(res => {
        //Process data
        let content = document.getElementById("content");
        content.innerHTML = "Authorized! Code = " + res.access_token;
        let cred = new ExpiringCredentials(res.access_token, res.refresh_token, res.expires_in, true);
        if (refresh) {
            credentials.expiringCredentials.revoke();
            credentials.expiringCredentials = cred;
        } else {
            credentials.expiringCredentials = cred;
        }
    });
}