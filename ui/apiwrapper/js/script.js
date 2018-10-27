//import '@types/electron-settings';
/* const electron = require('electron');
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;
const settings  = require('electron-settings'); */
var authWindow, redurl;
var CLIENT_ID = "40918ae807d24a16a7f8217fa1f445c0";
var CLIENT_SECRET = "b1506d8d8edf447a816d773def58a1c3";
var credentials;
class ExpiringCredentials {
    constructor(a_t, r_t, e_i, w_r) {
        this.will_refresh = true;
        this.access_token = a_t;
        this.refresh_token = r_t;
        this.expires_in = e_i;
        this.will_refresh = w_r;
        if (w_r)
            this.refresh();
    }
    refresh() {
        let timeinms = this.expires_in * 1000;
        let fn = requestAccesToken.bind(null, this.refresh_token, true);
        this.refresher = setInterval(fn, timeinms);
    }
    willRefresh(refresh) {
        if (refresh !== this.will_refresh) {
            this.will_refresh = refresh;
            if (refresh) {
                this.refresh();
            }
            else {
                clearInterval(this.refresher);
            }
        }
    }
    revoke() {
        clearInterval(this.refresher);
    }
}
class CredentialsProvider {
    constructor(authCode) {
        this.authorizationCode = authCode;
    }
    get authCode() {
        return this.authorizationCode;
    }
    getAccessToken() {
        return this.expiringCredentials.access_token;
    }
}
function checkCredentials() {
    return false;
    //return settings.has('access_granted');
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
    var getUrl = window.location;
    var baseUrl = "https://" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    redurl = baseUrl + "redirect_auth.html";
    var url = "https://accounts.spotify.com/authorize?client_id=" + CLIENT_ID + "&response_type=code&scope=" +
        scopesstr + "&redirect_uri=" + encodeURIComponent(redurl);
    window.open(url, "auth");
    window.addEventListener('storage', (e) => {
        window.focus();
        console.log(e.storageArea);
        //Execute checks
    });
    /*
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
    }); */
}
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
function requestAccesToken(authCode, refresh = false) {
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
        }
        else {
            credentials.expiringCredentials = cred;
        }
        init();
    });
}
function testCredentials(ret, retval) {
    //Launch a simple request to test if the credentials are working
    fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": "Bearer " + credentials.getAccessToken()
        }
    })
        .then(res => {
        if (res.ok) {
            //Looks like we are able to use these credentials!
            return true;
        }
        else {
            return false;
        }
    })
        .then(res => {
        testCredentials(true, res);
    });
}
//All the actions to be executed on window load go here
window.onload = () => {
    if (!checkCredentials()) {
        document.getElementById("authorize").addEventListener("click", startAuthProcess);
    }
    else {
        startAuthProcess();
    }
    setupCustomElements();
};
function init() {
    //Go ahead for player initialization
    if (!settings.has('access_granted')) {
        settings.set('access_granted', true);
    }
    document.getElementById("content").innerHTML = "";
    if (SDKReady) {
        initializePlayer();
    }
    else {
        //Try again in 1 second
        setTimeout(retryInitPlayer, 1000);
    }
}
function retryInitPlayer() {
    if (SDKReady) {
        initializePlayer();
    }
    else {
        setTimeout(retryInitPlayer, 1000);
    }
}
function createSidebarEntry(name) {
    let header = document.createElement("sidebar_element_header");
    let entryName = document.createElement("span");
    entryName.slot = "header_text";
    entryName.innerHTML = name;
    header.appendChild(entryName);
    header.shadowRoot.childNodes[0].addEventListener("click", (event) => {
        let target = event.target;
        let entry = target.parentElement;
        let childNodes = Array.from(entry.childNodes);
        if (target.getAttribute("open")) {
            childNodes.forEach((element, index) => {
                if (index > 0) {
                    element.style.display = "none";
                }
            });
            target.style.transform = "rotate(180deg)";
        }
        else {
            childNodes.forEach((element, index) => {
                if (index > 0) {
                    element.style.display = "block";
                }
            });
            target.style.transform = "rotate(0deg)";
        }
    });
    let box = document.createElement("div");
    box.className = "sidebar_entry";
    box.appendChild(header);
    return box;
}
///<reference path="../../ts/ui_common.ts" /> 
//import '@typings/spotify-web-playback-sdk';
var player;
var SDKReady = false;
window.onSpotifyWebPlaybackSDKReady = () => {
    SDKReady = true;
};
function initializePlayer() {
    player = new Spotify.Player({
        name: "JazzyTunes",
        getOAuthToken: cb => { cb(credentials.getAccessToken()); }
    });
    player.on('account_error', ({ message }) => {
        alert("The account used to authorize does not have a valid Spotify Premium subscription!");
    });
    player.connect();
    initializePlayerUI(player);
}
function initializePlayerUI(player) {
    let controller = createSidebarEntry("Playback Controls");
    console.log(controller);
}
//Enum for all the different suburls(scopes) that can be used
var Scopes;
//Enum for all the different suburls(scopes) that can be used
(function (Scopes) {
    Scopes[Scopes["albums"] = 0] = "albums";
    Scopes[Scopes["artists"] = 1] = "artists";
    Scopes[Scopes["browse"] = 2] = "browse";
    Scopes[Scopes["recommendations"] = 3] = "recommendations";
    Scopes[Scopes["me"] = 4] = "me";
    Scopes[Scopes["users"] = 5] = "users";
    Scopes[Scopes["search"] = 6] = "search";
    Scopes[Scopes["tracks"] = 7] = "tracks";
    Scopes[Scopes["audio-analysis"] = 8] = "audio-analysis";
    Scopes[Scopes["audio-features"] = 9] = "audio-features";
})(Scopes || (Scopes = {}));
;
var RequestStatus;
(function (RequestStatus) {
    RequestStatus[RequestStatus["UNRESOLVED"] = 0] = "UNRESOLVED";
    RequestStatus[RequestStatus["RESOLVING"] = 1] = "RESOLVING";
    RequestStatus[RequestStatus["RESOLVED"] = 2] = "RESOLVED";
    RequestStatus[RequestStatus["ERROR"] = 3] = "ERROR";
})(RequestStatus || (RequestStatus = {}));
;
class SpotifyApiRequestResult {
    constructor(status, result, error) {
        this.status = RequestStatus.UNRESOLVED;
        this.result = null;
        this.error = null;
        this.status = status;
        this.result = result;
        this.error = error;
    }
}
class SpotifyApiGetRequest {
    constructor() {
        this.baseURL = "https://api.spotify.com/v1/"; //Base URL all requests use
    }
    /**
     * Converts the provided options to a url
     *
     * @param options Options as a key/value array
     * @returns The encoded URL component for the options
     * @description Only to be called internally
     */
    parseOptions(options) {
        let optionsString = "";
        let keys = options.keys();
        let l = options.length;
        for (var i = 0; i < l; i++) {
            let str = keys[i] + "=" + options[i];
            str += i < l - 1 ? "&" : "";
            optionsString += str;
        }
        return optionsString;
    }
    /**
     * Executes the request
     *
     * @param callback The function this function was orignally called from.
     * @returns The result of the request as a parameter to the callback parameter.
     */
    execute(callback) {
        fetch(this.url, {
            headers: {
                Authorization: "Bearer " + credentials.getAccessToken()
            }
        })
            .then(function (res) {
            if (res.ok) {
                //TODO: Further error handling
                return res.json();
            }
            else {
                alert("Error!");
            }
        })
            .then(function (json) {
            let result;
            if (json.error) {
                //OOPS
                result = new SpotifyApiRequestResult(RequestStatus.ERROR, json.error, json.error_description);
            }
            else {
                result = new SpotifyApiRequestResult(RequestStatus.RESOLVED, json);
            }
            callback(result);
        });
    }
}
class SpotifyApiPutRequest {
    constructor(bodyJson) {
        this.baseURL = "https://api.spotify.com/v1/"; //Base URL all requests use
        this.bodyJson = true;
        this.bodyJson = bodyJson;
    }
    /**
     * Converts the provided Array of body elements to a valid body string for the request
     *
     * @param bodyElements Body elements as a key/value array
     * @returns A valid URLSearchParams encoded string for the elements
     * @description Only to be called internally, usually not necessary as most request require a json type encoding for the body
     */
    createBody(bodyElements) {
        let body = new URLSearchParams();
        for (var name in bodyElements) {
            body.append(name, bodyElements[name]);
        }
        return body.toString();
    }
    /**
     * Converts the provided options to a url
     *
     * @param options Options as a key/value array
     * @returns The encoded URL component for the options
     * @description Only to be called internally
     */
    parseOptions(options) {
        let optionsString = "";
        let keys = options.keys();
        let l = options.length;
        for (var i = 0; i < l; i++) {
            let str = keys[i] + "=" + options[i];
            str += i < l - 1 ? "&" : "";
            optionsString += str;
        }
        return optionsString;
    }
    /**
     * Executes the request
     *
     * @param callback The function this function was orignally called from.
     * @returns The result of the request as a parameter to the callback parameter.
     */
    execute(callback) {
        fetch(this.url, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + credentials.getAccessToken(),
                "Content-Type": "application/json"
            },
            body: this.bodyJson ? JSON.stringify(this.body) : this.createBody(this.body)
        })
            .then(function (res) {
            if (res.ok) {
                return res.json();
            }
            else {
                alert("Error!");
            }
        })
            .then(function (json) {
            let result;
            if (json.error) {
                //OOPS
                result = new SpotifyApiRequestResult(RequestStatus.ERROR, json.error, json.error_description);
            }
            else {
                result = new SpotifyApiRequestResult(RequestStatus.RESOLVED, json);
            }
            callback(result);
        });
    }
}
//SECTION: All the subclasses for individual types of requests
//SUBSECTION: Subclasses to retrieve data related to albums
/**
 * Used to retrieve an overview of the album
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotiyApiAlbumRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotiyApiAlbumRequest
     * @param albumID The Spotify ID for the album
     * @param options Options as a key/value array
     */
    constructor(albumID, options) {
        super();
        this.url = this.baseURL + "albums/" + albumID + "?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve the tracks of an album
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotiyApiAlbumTracksRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotiyApiAlbumTracksRequest
     * @param albumID The Spotify ID for the album
     * @param options Options as a key/value array
     */
    constructor(albumID, options) {
        super();
        this.url = this.baseURL + "albums/" + albumID + "/tracks?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve multiple albums at once
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiAlbumsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiAlbumsRequest
     * @param albumIDs Array of Spotify album IDs as string
     * @param options Options as a key/value array
     */
    constructor(albumIDs, options) {
        super();
        let joinedids = albumIDs.join(",");
        options['ids'] = joinedids;
        this.url = this.baseURL + "albums/?" + this.parseOptions(options);
    }
}
//SUBSECTION: Subclasses to retrieve data related to artists
/**
 * Used to retrieve information about an artist
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiArtistRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistRequest
     * @param artistID The Spotify ID for the artist
     */
    constructor(artistID) {
        super();
        this.url = this.baseURL + "artists/" + artistID;
    }
}
/**
 * Used to retrieve an artist's albums
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiArtistAlbumsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistAlbumsRequest
     * @param artistID The Spotify ID for the artist
     * @param options Options as a key/value array
     */
    constructor(artistID, options) {
        super();
        this.url = this.baseURL + "artists/" + artistID + "/albums?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve an artist's top tracks in a specific country
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiArtistTopTracksRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistTopTracksRequest
     * @param artistID The Spotify ID for the artist
     * @param country The country for which to retrieve the top tracks
     */
    constructor(artistID, country) {
        super();
        this.url = this.baseURL + "artists/" + artistID + "/toptracks?country=" + country;
    }
}
/**
 * Used to retrieve artists related to an artist
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiRelatedArtistsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiRelatedArtistsRequest
     * @param artistID The Spotify ID for the artist
     */
    constructor(artistID) {
        super();
        this.url = this.baseURL + "artists/" + artistID + "/related-artists";
    }
}
/**
 * Used to retrieve information about multiple artists at once
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiArtistsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistsRequest
     * @param artistIDs Array of Spotify artist IDs as string
     */
    constructor(artistIDs) {
        super();
        let joinedids = artistIDs.join(",");
        this.url = this.baseURL + "albums/?ids=" + joinedids;
    }
}
//SUBSECTION: Subclasses to retrieve data related to browse/discover
/**
 * Used to retrieve a single category used to tag items in Spotify
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiCategoryRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiCategoryRequest
     * @param categoryID The Spotify Category ID for the category, such as 'party'
     * @param options Options as a key/value array
     */
    constructor(categoryID, options) {
        super();
        this.url = this.baseURL + "browse/categories/" + categoryID + "?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve a single category's playlists
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiCategoryPlaylistRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiCategoryPlaylistRequest
     * @param categoryID The Spotify Category ID for the category, such as 'party'
     * @param options Options as a key/value array
     */
    constructor(categoryID, options) {
        super();
        this.url = this.baseURL + "browse/categories/" + categoryID + "/playlists?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve a list of categories
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiCategoryListRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiCategoryListRequest
     * @param options Options as  a key/value array
     */
    constructor(options) {
        super();
        this.url = this.baseURL + "browse/categories?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve a list of featured playlists
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiFeaturedPlaylistRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiFeaturedPlaylistRequest
     * @param options Options as a key/value array
     */
    constructor(options) {
        super();
        this.url = this.baseURL + "browse/featured-playlists?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve a list of featured new album releases
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiNewReleaseRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiNewReleaseRequest
     * @param options Options as a key/value array
     */
    constructor(options) {
        super();
        this.url = this.baseURL + "browse/new-releases?" + this.parseOptions(options);
    }
}
/**
 * Used to retrieve a recommendations (radio feature)
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiRecommendationsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiRecommendationsRequest
     * @param options Options as a key/value array
     */
    constructor(options) {
        super();
        this.url = this.baseURL + "recommendations?" + this.parseOptions(options);
    }
}
//SUBSECTION Subclasses related to following artists, users and playlists
/**
 * Used to check if a user is following one or more artists or other users
 *
 * @class
 * @extends SpotifyApiRequest
 */
class SpotifyApiFollowingContainsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiFollowingContainsRequest
     * @param options Option as a key/value array
     */
    constructor(options) {
        super();
        this.url = this.baseURL + "me/following/contains?" + this.parseOptions(options);
    }
}
/**
 * Used to check if one or more users follow a playlist
 *
 * @class
 * @extends SpotifyApiRequest
 */
class SpotifyApiFollowPlaylistCheckRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiFollowPlaylistCheckRequest
     * @param owner_id Spotify ID of the owner of the playlist
     * @param playlist_id Spotify ID of the playlist
     * @param ids Array of Spotify IDs of users to check if they follow the playlist
     */
    constructor(owner_id, playlist_id, ids) {
        super();
        let joinedids = ids.join(",");
        this.url = this.baseURL + "users/" + owner_id + "/playlists/" + playlist_id + "/followers/contains?" + joinedids;
    }
}
class SpotifyApiFollowRequest extends SpotifyApiPutRequest {
}
