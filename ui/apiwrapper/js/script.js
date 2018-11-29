////<reference path="../../ts/homepage.ts" /> 
const electron = require('electron');
const electronOauth2 = require('electron-oauth2');
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;
const OPERATIONMODE = "production";
var authWindow, redurl;
var CLIENT_ID = "40918ae807d24a16a7f8217fa1f445c0";
var CLIENT_SECRET = "b1506d8d8edf447a816d773def58a1c3";
var credentials;
var currentuser;
class CurrentUserInformation {
    constructor(username, id, images) {
        this.username = username;
        this.id = id;
        this.images = images;
    }
}
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
        this.refresher = setInterval(() => {
            requestAccesToken(this.refresh_token, true);
        }, timeinms);
    }
    set willRefresh(refresh) {
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
    revoke(authcode) {
        clearInterval(this.refresher);
        this.refresh();
        this.access_token = authcode;
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
function startAuthProcess() {
    //Define the scopes necessary for this project
    var scopes = [
        'streaming',
        'user-library-read',
        'user-library-modify',
        "user-read-birthdate",
        "user-read-email",
        "user-read-private",
        "user-read-recently-played"
    ];
    var scopesstr = scopes.join(" ");
    scopesstr = encodeURIComponent(scopesstr);
    redurl = "https://localhost/index.html";
    var url = "https://accounts.spotify.com/authorize?client_id=" + CLIENT_ID + "&response_type=code&scope=" +
        scopesstr + "&redirect_uri=" + encodeURIComponent(redurl);
    authWindow = new BrowserWindow({ show: false });
    authWindow.on('close', () => {
        authWindow = null;
    }, false);
    authWindow.loadURL(url);
    authWindow.show();
    var webContents = authWindow.webContents;
    var session = webContents.session.webRequest;
    session.onBeforeRedirect(['*://*./*'], function (details, callback) {
        if (details.redirectURL) {
            if (details.redirectURL.indexOf("index.html") > -1) {
                handleAuthCodeCallback(details.redirectURL);
            }
        }
    });
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
    if (refresh) {
        data.set("grant_type", "refresh_token");
        data.delete("code");
        data.append("refresh_token", authCode);
    }
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
        //Process data;
        console.log("Authorized! Code = " + res.access_token);
        if (refresh) {
            credentials.expiringCredentials.revoke(res.access_token);
        }
        else {
            let cred = new ExpiringCredentials(res.access_token, res.refresh_token, res.expires_in, true);
            credentials.expiringCredentials = cred;
            getUserDetails();
            initPlayer();
            initHome();
        }
    });
}
function getUserDetails() {
    let userdetailsrequest = new SpotifyApiUserRequest(true);
    userdetailsrequest.execute(createProfile);
}
function createProfile(result) {
    if (result.status == RequestStatus.RESOLVED) {
        let profile = new CurrentUserInformation(result.result.display_name, result.result.id, result.result.images);
        currentuser = profile;
        document.getElementById("user_name").innerText = profile.username;
        document.getElementById("user_picture").src = profile.images[0].url;
    }
}
if (electron.remote.process.argv[0] !== "debug") {
    addLoadEvent(startAuthProcess);
}
////<reference path="../../ts/ui_common.ts" /> 
var Repeat;
(function (Repeat) {
    Repeat["NO_REPEAT"] = "off";
    Repeat["REPEAT_ONCE"] = "track";
    Repeat["REPEAT"] = "context";
})(Repeat || (Repeat = {}));
class SeekBar {
    constructor(bar) {
        this.timeractivated = false;
        this.timeractivated = false;
        this.seekbar = bar;
        this.seekbar.addEventListener("mouseup", (e) => {
            let value = e.target.value;
            let ms = value * this.onepercent;
            this.seekToValue(ms, value);
            player.seek(ms);
        });
    }
    /**
     * Sets (resets) the current song parameter
     * @param newsongduration The duration of the next track in milliseconds
     */
    setParams(newsongduration) {
        this.currentduration = newsongduration;
        this.onepercent = Math.round(newsongduration / 100);
        this.currentposition = 0;
        this.currenpositionseconds = 0;
        this.deleteTimer();
        this.createTimer();
    }
    /**
     * Seeks the seekbar to a value. Does not change the playing position of the player.
     * @param positionInMS The position to seek to in milliseconds
     */
    seekToValue(positionInMS, percentage, updateLabel) {
        if (positionInMS <= this.currentduration) {
            this.currentposition = positionInMS;
            if (percentage) {
                this.currentpercentage = percentage;
            }
            else {
                this.currentpercentage = Math.ceil(positionInMS / this.onepercent);
            }
            if (updateLabel) {
                playbackcontroller.setCurrentTime(secondsToTimeString(Math.round((this.currentposition / 1000))));
                this.currenpositionseconds = Math.round(this.currentposition / 1000);
            }
            this.seekbar.value = this.currentpercentage.toString();
        }
        else {
            this.currentpercentage = 100;
            this.seekbar.value = '100';
            if (updateLabel) {
                playbackcontroller.setCurrentTime(playbackcontroller.timefull.innerHTML);
            }
            this.timeractivated = false;
        }
    }
    toggleTimer(state) {
        this.timeractivated = state;
    }
    createTimer() {
        this.currenttimer = setInterval(() => {
            if (this.timeractivated) {
                this.seekToValue(this.currentposition + this.onepercent);
            }
        }, this.onepercent);
        this.secondstimer = setInterval(() => {
            if (this.timeractivated) {
                playbackcontroller.setCurrentTime(secondsToTimeString(++this.currenpositionseconds));
            }
        }, 1100);
    }
    deleteTimer() {
        if (this.currenttimer) {
            clearInterval(this.currenttimer);
            this.currenttimer = undefined;
        }
        if (this.secondstimer) {
            clearInterval(this.secondstimer);
            this.secondstimer = undefined;
        }
    }
}
class PlaybackController {
    constructor(sidebarEntry) {
        this.repeat = Repeat.NO_REPEAT;
        this.paused = true;
        this.sidebarentry = sidebarEntry;
        this.imgholder = this.sidebarentry.getElementsByClassName("cover_img")[0];
        this.titleholder = this.sidebarentry.getElementsByClassName("title")[0];
        this.infoholder = this.sidebarentry.getElementsByClassName("artist_album")[0];
        this.seekbar = new SeekBar(this.sidebarentry.getElementsByClassName("scrubbar")[0]);
        let divs = this.sidebarentry.getElementsByTagName("div");
        let times = divs[0];
        this.controls = divs[1];
        this.timecurrent = times.children[0];
        this.timefull = times.children[1];
        let children = this.controls.children;
        this.playbutton = children[2].children[0];
        this.playbutton.addEventListener('click', setPlaybackState);
        this.nextbutton = children[3].children[0];
        this.nextbutton.addEventListener('click', nextTrack);
        this.previousbutton = children[1].children[0];
        this.previousbutton.addEventListener('click', previousTrack);
        this.shufflebutton = children[0].children[0];
        this.shufflebutton.addEventListener("click", setShuffle);
        this.repeatbutton = children[4].children[0];
        this.repeatbutton.addEventListener('click', setRepeat);
    }
    setImg(imguri) {
        this.imgholder.src = imguri;
    }
    setTitle(title) {
        this.titleholder.innerHTML = title;
        this.currenttrack = title;
    }
    setArtistAlbum(artist, album) {
        let string = artist + " - " + album;
        this.infoholder.innerHTML = string;
    }
    setDuration(time) {
        this.timefull.innerHTML = time;
    }
    setNewParams(params) {
        this.setImg(params.albumcoveruri);
        this.setTitle(params.name);
        this.setArtistAlbum(params.artists[0].name, params.albumname);
        this.timecurrent.innerText = "0:00";
        this.seekbar.seekToValue(0, 0);
    }
    play() {
        this.controls.children[2].children[0].innerHTML = "pause";
        this.seekbar.toggleTimer(true);
        this.paused = false;
    }
    pause() {
        this.controls.children[2].children[0].innerHTML = "play_arrow";
        this.seekbar.toggleTimer(false);
        this.paused = true;
    }
    setCurrentTime(timestring) {
        this.timecurrent.innerHTML = timestring;
    }
    setShuffle(state) {
        let bttn = this.shufflebutton;
        if (state) {
            bttn.style.color = "#8BC34A";
        }
        else {
            bttn.style.color = "#EEEEEE";
        }
    }
    setRepeat(state) {
        let bttn = this.repeatbutton;
        if (state == Repeat.NO_REPEAT) {
            bttn.innerHTML = "repeat";
            bttn.style.color = "#EEEEEE";
        }
        else if (state == Repeat.REPEAT) {
            bttn.innerHTML = "repeat";
            bttn.style.color = "#8BC34A";
        }
        else {
            bttn.innerHTML = "repeat_one";
            bttn.style.color = "#8BC34A";
        }
    }
    displayError(message) {
        this.setImg("../../assets/images/baseline-warning-24px.svg");
        this.setTitle("Error");
        this.setArtistAlbum(message.message, "");
        this.pause();
    }
}
var player;
var playerid;
var playbackcontroller;
function initPlayer() {
    //At this point, auth should be complete and usable
    let script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    document.body.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
            name: "JazzyTunes",
            getOAuthToken: cb => { cb(credentials.getAccessToken()); }
        });
        player.on('account_error', ({ message }) => {
            alert("The account used to authorize does not have a valid Spotify Premium subscription!");
        });
        player.addListener('ready', ({ device_id }) => {
            playerid = device_id;
            //Take ownership of the playback
            let request = new SpotifyApiTransferPlaybackRequest([device_id], false);
            request.execute((result) => {
                initializePlayerUI(player);
            });
        });
        player.addListener('player_state_changed', state => {
            if (state) {
                let track = state.track_window.current_track;
                if (track.name != playbackcontroller.currenttrack) {
                    let params = {
                        "name": track.name,
                        "albumcoveruri": track.album.images[0].url,
                        "albumname": track.album.name,
                        "artists": track.artists
                    };
                    playbackcontroller.setNewParams(params);
                    let trackrequest = new SpotifyApiTrackRequest([track.id]);
                    trackrequest.execute(updatePlayerUI);
                }
                if (state.paused !== playbackcontroller.paused) {
                    if (state.paused) {
                        playbackcontroller.pause();
                    }
                    else {
                        playbackcontroller.play();
                    }
                }
                if (state.shuffle !== playbackcontroller.shuffling) {
                    playbackcontroller.shuffling = state.shuffle;
                    playbackcontroller.setShuffle(state.shuffle);
                }
                let newrepeat;
                switch (state.repeat_mode) {
                    case 0:
                        newrepeat = Repeat.NO_REPEAT;
                        break;
                    case 2:
                        newrepeat = Repeat.REPEAT_ONCE;
                        break;
                    default:
                        newrepeat = Repeat.REPEAT;
                }
                if (newrepeat !== playbackcontroller.repeat) {
                    playbackcontroller.repeat = newrepeat;
                    playbackcontroller.setRepeat(newrepeat);
                }
                if (state.position - 1500 < playbackcontroller.seekbar.currenpositionseconds || state.position + 1500 > playbackcontroller.seekbar.currenpositionseconds) {
                    playbackcontroller.seekbar.toggleTimer(false);
                    playbackcontroller.seekbar.seekToValue(state.position - 900, null, true);
                    if (!state.paused) {
                        setTimeout(() => { playbackcontroller.seekbar.toggleTimer(true); }, 200);
                    }
                }
            }
        });
        player.on('playback_error', ({ message }) => {
            playbackcontroller.displayError(message);
        });
        player.connect();
    };
}
function initializePlayerUI(player) {
    let controller = createSidebarEntry("Playback Controls");
    document.getElementById("sidebar").appendChild(controller);
    let c = createPlayBackControls(controller);
    playbackcontroller = new PlaybackController(c);
}
function updatePlayerUI(information) {
    if (information.status == RequestStatus.RESOLVED) {
        let duration = information.result.duration_ms;
        playbackcontroller.seekbar.setParams(duration);
        let seconds = Math.round(duration / 1000);
        playbackcontroller.setDuration(secondsToTimeString(seconds));
    }
}
function secondsToTimeString(seconds) {
    let minutes = 0;
    while (seconds > 59) {
        seconds -= 60;
        minutes++;
    }
    let string = minutes + ":";
    if (seconds > 9) {
        string += seconds;
    }
    else {
        string += "0" + seconds;
    }
    return string;
}
function setPlaybackState(ev, playing) {
    player.getCurrentState().then(res => {
        if (res.paused) {
            player.togglePlay();
            playbackcontroller.play(true);
        }
        else {
            player.pause();
            playbackcontroller.pause(true);
        }
    });
}
function nextTrack(ev) {
    player.nextTrack();
}
function previousTrack(ev) {
    player.previousTrack();
}
function setPosition(position) {
    player.seek(position);
    playbackcontroller.seekbar.seekToValue(position, null, false);
}
function setShuffle() {
    if (playbackcontroller.shuffling) {
        let r = new SpotifyApiToggleShuffleRequest(false);
        r.execute((er) => {
            if (er.status == RequestStatus.RESOLVED) {
                playbackcontroller.setShuffle(false);
            }
        });
    }
    else {
        let r = new SpotifyApiToggleShuffleRequest(true);
        r.execute((er) => {
            if (er.status == RequestStatus.RESOLVED) {
                playbackcontroller.setShuffle(true);
            }
        });
    }
    playbackcontroller.shuffling = !playbackcontroller.shuffling;
}
function setRepeat() {
    if (playbackcontroller.repeat == Repeat.NO_REPEAT) {
        playbackcontroller.repeat = Repeat.REPEAT;
    }
    else if (playbackcontroller.repeat == Repeat.REPEAT) {
        playbackcontroller.repeat = Repeat.REPEAT_ONCE;
    }
    else {
        playbackcontroller.repeat = Repeat.NO_REPEAT;
    }
    let r = new SpotifyApiSetRepeatStateRequest(playbackcontroller.repeat);
    r.execute((er) => {
        if (er.status == RequestStatus.RESOLVED) {
            playbackcontroller.setRepeat(playbackcontroller.repeat);
        }
    });
}
function t(chars, i, source, j) {
    if (j == chars.length && i < chars.length) {
    }
    else if (i == chars.length - 1 && chars[i] == source[j]) {
    }
    else if (source[j] == chars[i]) {
    }
    else {
    }
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
function test(id, tracks) {
    let r = new SpotifyApiPlaylistAddRequest(id, tracks);
    r.execute((result) => {
        console.log(result);
    });
}
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
     * @param callback The callback function to be called when the request has been executed. Needs to have a variable of the type SpotifyApiRequestResult as a parameter
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
class SpotifyApiPostRequest {
    constructor(bodyJson) {
        this.baseURL = "https://api.spotify.com/v1/"; //Base URL all requests use
        this.bodyJson = bodyJson;
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
            method: "POST",
            headers: {
                Authorization: "Bearer " + credentials.getAccessToken(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.body)
        })
            .then(function (res) {
            if (res.ok) {
                var contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return res.json();
                }
                else {
                    return {};
                }
            }
            else {
                //alert("Error!");
                return res.json();
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
        this.bodyJson = bodyJson;
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
            body: JSON.stringify(this.body)
        })
            .then(function (res) {
            if (res.ok) {
                var contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return res.json();
                }
                else {
                    return {};
                }
            }
            else {
                //alert("Error!");
                return res.json();
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
class SpotifyApiDeleteRequest {
}
//#region All the subclasses for individual types of requests
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
 * @extends SpotifyApiGetRequest
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
 * @extends SpotifyApiGetRequest
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
/**
 * Used to follow one or more artists or users
 *
 * @class
 * @extends SpotifyApiPutRequest
 */
class SpotifyApiFollowRequest extends SpotifyApiPutRequest {
}
/**
 * Used to follow a playlist
 *
 * @class
 * @extends SpotifyApiPutRequest
 */
class SpotifyApiFollowPlaylistRequest extends SpotifyApiPutRequest {
}
/**
 * Used to unfollow one or more artists or users
 *
 * @class
 * @extends SpotifyApiDeleteRequest
 */
class SpotifyApiUnfollowRequest extends SpotifyApiDeleteRequest {
}
/**
 * Used to unfollow a playlist
 *
 * @class
 * @extends SpotifyApiDeleteRequest
 */
class SpotifyApiUnfollowPlaylistRequest extends SpotifyApiDeleteRequest {
}
//SUBSECTION Subclasses related to retrieving information about the users library
/**
* Used to check if a user has already saved one or more albums
*
* @class
* @extends SpotifyApiGetRequest
*/
class SpotifyApiSavedAlbumsContainsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiSavedAlbumsContainsRequest
     * @param track_id Spotify IDs of the albums
     */
    constructor(album_ids) {
        super();
        if (album_ids.length > 1) {
            this.url = this.baseURL + "me/albums/contains/" + album_ids.join(",");
        }
        else {
            this.url = this.baseURL + "me/albums/contains/" + album_ids[0];
        }
    }
}
/**
* Used to check if a user has already saved one or more tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
class SpotifyApiSavedTracksContainsRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiSavedTracksContainsRequest
    * @param track_id Spotify IDs of the tracks
    */
    constructor(track_ids) {
        super();
        if (track_ids.length > 1) {
            this.url = this.baseURL + "me/tracks/contains/" + track_ids.join(",");
        }
        else {
            this.url = this.baseURL + "me/tracks/contains/" + track_ids[0];
        }
    }
}
/**
* Used to retrieve the users saved albums
*
* @class
* @extends SpotifyApiGetRequest
*/
class SpotifyApiSavedAlbumsRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiSavedAlbumsRequest
    * @param options Options as a key/value array
    */
    constructor(options) {
        super();
        this.url = this.baseURL + this.parseOptions(options);
    }
}
/**
* Used to retrieve the users saved tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
class SpotifyApiSavedTracksRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiSavedTracksRequest
    * @param options Options as a key/value array
    */
    constructor(options) {
        super();
        this.url = this.baseURL + this.parseOptions(options);
    }
}
/**
* Used to remove one or more albums from the users saved tracks
*
* @class
* @extends SpotifyApiDeleteRequest
*/
class SpotifyApiUnsaveAlbumsRequest extends SpotifyApiDeleteRequest {
    /**
    * @constructs SpotifyApiUnsaveAlbumsRequest
    * @param album_ids Spotify IDs of the albums
    */
    constructor(album_ids) {
        super();
        if (album_ids.length > 1) {
            this.url = this.baseURL + "me/albums?ids=" + album_ids.join(",");
        }
        else {
            this.url = this.baseURL + "me/abumns?ids=" + album_ids[0];
        }
    }
}
/**
* Used to remove one or more tracks from the users saved tracks
*
* @class
* @extends SpotifyApiDeleteRequest
*/
class SpotifyApiUnsaveTracksRequest extends SpotifyApiDeleteRequest {
    /**
    * @constructs SpotifyApiUnsaveTracksRequest
    * @param track_ids Spotify IDs of the tracks
    */
    constructor(track_ids) {
        super();
        if (track_ids.length > 1) {
            this.url = this.baseURL + "me/tracks?ids=" + track_ids.join(",");
        }
        else {
            this.url = this.baseURL + "me/abumns?ids=" + track_ids[0];
        }
    }
}
/**
* Used to save one or more albums to the users library
*
* @class
* @extends SpotifyApiPutRequest
*/
class SpotifyApiSaveAlbumsRequest extends SpotifyApiPutRequest {
    /**
     * @constructs SpotifyApiSaveAlbumsRequest
     * @param album_ids Spotify IDs of the albums
     */
    constructor(album_ids) {
        super();
        if (album_ids.length > 1) {
            this.url = this.baseURL + "me/albums?ids=" + album_ids.join(",");
        }
        else {
            this.url = this.baseURL + "me/albums?ids=" + album_ids[0];
        }
    }
}
/**
* Used to save one or more tracks to users library
*
* @class
* @extends SpotifyApiPutRequest
*/
class SpotifyApiSaveTracksRequest extends SpotifyApiPutRequest {
    /**
    * @constructs SpotifyApiSaveTracksRequest
    * @param track_ids Spotify IDs of the tracks
    */
    constructor(track_ids) {
        super();
        if (track_ids.length > 1) {
            this.url = this.baseURL + "me/tracks?ids=" + track_ids.join(",");
        }
        else {
            this.url = this.baseURL + "me/abumns?ids=" + track_ids[0];
        }
    }
}
//SUBSECTION Subclasses related to retrieving information about spotify tracks
/**
* Used to get Audio analysis for a track
*
* @class
* @extends SpotifyApiGetRequest
*/
class SpotifyApiAudioAnalysisRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiAudioAnalysisRequest
    * @param track_id Spotify ID of the track
    */
    constructor(track_id) {
        super();
        this.url = this.baseURL + "audio-analysis/" + track_id;
    }
}
//SUBSECTION Subclasses related to retrieving information about the users listening habits
/**
 * Used to get the users top artists or tracks
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiTopRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiTopRequest
    * @param type Type of entity. Valid values are 'artists' or 'tracks'
    */
    constructor(type) {
        super();
        this.url = this.baseURL + "me/top/" + type;
    }
}
//SUBSECTION Subclasses related to controlling the user's playback
/**
 * Used to get the users currently available devices
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiDevicesRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiDevicesRequest
     */
    constructor() {
        super();
        this.url = this.baseURL + "me/player/devices";
    }
}
/**
 * Used to get the users recently played tracks
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiRecentTracksRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiRecentTracksRequest
     * @param limit The maximum amount of tracks to list. Can be between 1 and 50 (inclusive). If not specified, value will be 20
     * @param after Unix Timestamp. If specified, this request will return all tracks played after this timestamp. If this parameter is specified, parameter limit must also be specified, but parameter before may not be specified
     * @param before Unix Timestamp. If specified, this request will return all tracks played before this timestamp. If this paramter is specified, parameter limit must also be specified, but parameter after may not be specified
     */
    constructor(limit = 20, after, before) {
        super();
        if (limit >= 1 && limit <= 50) {
            if (after) {
                this.url = this.baseURL + "me/player/recently-played?limit=" + limit + "&after=" + after;
            }
            else if (before) {
                this.url = this.baseURL + "me/player/recently-played?limit=" + limit + "&before=" + before;
            }
            else {
                this.url = this.baseURL + "me/player/recently-played?limit=" + limit;
            }
        }
        else {
            this.url = this.baseURL + "me/player/recently-played";
        }
    }
}
/**
 * Used to play a track, album, artist, or playlist
 *
 * @class
 * @extends SpotifyApiPutRequest
 */
class SpotifyApiPlayRequest extends SpotifyApiPutRequest {
    /**
     * @constructs SpotifyApiPlayRequest
     * @param not_track Boolean value to indicate whether or not to play a track. If false, will play a context
     * @param context_uri The Spotify URI of the context to play (artist, album, playlist)
     * @param context_offset Indicates where in the context playback should start (E.G. a track on an album)
     * @param track_ids Array of spotify track uris to play
     */
    constructor(not_track, context_uri, context_offset, track_ids) {
        super();
        this.url = this.baseURL + "me/player/play";
        if (not_track) {
            let o = {
                "context_uri": context_uri,
                "offset": {
                    "position": 0
                },
            };
            if (context_offset) {
                o.offset.position = context_offset;
            }
            if (context_uri.indexOf("artist") !== -1) {
                delete o.offset;
            }
            this.body = o;
        }
        else {
            let o = {
                "uris": track_ids
            };
            this.body = o;
        }
    }
}
/**
 * Used to transfer the users playback. Can only be used after a SpotifyApiDevicesRequest has been executed or if a device id is known.
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiTransferPlaybackRequest extends SpotifyApiPutRequest {
    /**
     * @constructs SpotifyTransferPlaybackRequest
     * @param device_ids Array with just one element: the device id of the device to transfer playback to
     * @param play If specified, this parameter indicates whether playback should start or not when the playback has been transfered
     */
    constructor(device_ids, play = false) {
        super();
        this.url = this.baseURL + "me/player";
        let o = {
            "device_ids": device_ids,
            "play": play
        };
        this.body = o;
    }
}
/**
 * Used to toggle the players shuffling state
 *
 * @class
 * @extends SpotifyApiPutRequest
 */
class SpotifyApiToggleShuffleRequest extends SpotifyApiPutRequest {
    /**
     * @constructs SpotifyApiToggleShuffleRequest
     * @param state The new shuffling state
     * @param device_id Optional. Device id to set shuffling state on
     */
    constructor(state, device_id) {
        super();
        this.url = this.baseURL + "me/player/shuffle?state=" + state.toString();
        if (device_id) {
            this.url += "&device_id=" + device_id;
        }
    }
}
/**
 * Used to toggle the players shuffling state
 *
 * @class
 * @extends SpotifyApiPutRequest
 */
class SpotifyApiSetRepeatStateRequest extends SpotifyApiPutRequest {
    /**
     * @constructs SpotifyApiSetRepeatStateRequest
     * @param state The new repeating state
     * @param device_id Optional. Device id to set repeating state on
     */
    constructor(state, device_id) {
        super();
        this.url = this.baseURL + "me/player/repeat?state=" + state;
        if (device_id) {
            this.url += "&device_id=" + device_id;
        }
    }
}
//SUBSECTION Subclasses related to manipulation and retrieving information about a user's playlists
/**
 * Used to save one or more tracks to a playlist
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
class SpotifyApiPlaylistAddRequest extends SpotifyApiPostRequest {
    /**
     * @constructs SpotifyApiPlaylistAddRequest
     * @param playlist_id The Spotify ID of the playlist to add the tracks to
     * @param track_uris The Spotify URI's (spotify:track:xxx) of the tracks to add to the playlist
     * @param positon (Optional) The position at which to insert the tracks. If omitted, the tracks are appended
     */
    constructor(playlist_id, track_uris, position) {
        super();
        this.url = this.baseURL + "playlists/" + playlist_id + "?uris=" + track_uris.join(",");
        if (position) {
            this.url += "&position" + position;
        }
    }
}
/**
 * Used to change the details of a playlist
 *
 * @class
 * @extends SpotifyApiPostRequest
 */
class SpotifyApiPlaylistChangeRequest extends SpotifyApiPostRequest {
    /**
     * @constructs SpotifyApiPlaylistChangeRequest
     * @param playlist_id The Spotify ID of the playlist to change
     * @param details Object containing the fields name, public, collaborative and description
     */
    constructor(playlist_id, details) {
        super();
        this.setBodyParams(JSON.stringify(details));
        this.url = this.baseURL + "playlists/" + playlist_id;
    }
}
/**
 * Used to create a new playlist
 *
 * @class
 * @extends SpotifyApiPostRequest
 */
class SpotifyApiCreatePlaylistRequest extends SpotifyApiPostRequest {
    /**
     * @constructs SpotifyApiPlaylistChangeRequest
     * @param playlist_id The Spotify ID of the playlist to change
     * @param details Object containing the fields name, public, collaborative and description
     */
    constructor() {
        super();
    }
}
class SpotifyApiSearchRequest extends SpotifyApiGetRequest {
    constructor(album, artist, track, playlist, limit) {
        super();
        this.url = this.baseURL + "search?type=";
        let urlarray = [];
        if (album)
            urlarray.push("album");
        if (artist)
            urlarray.push("artist");
        if (track)
            urlarray.push("track");
        if (playlist)
            urlarray.push("playlist");
        this.url += urlarray.join(",");
        if (limit)
            this.url += "&limit=" + limit;
    }
    buildGeneralQuery(keywords, matchexact = false, exclude = [], include = []) {
        this.query = "q=";
        if (matchexact) {
            this.query += "\"" + keywords.join("+") + "\"";
            return;
        }
        this.query += keywords.join("+");
        if (exclude.length > 0) {
            this.query += "+NOT+" + exclude.join("+");
        }
        if (include.length > 0) {
            this.query += "+OR+" + include.join("+");
        }
    }
    buildFieldFilteredSearch(filters) {
        this.query += "q=";
        Object.keys(filters).forEach(element => {
            //@ts-ignore
            this.query += element + ":" + filters[element].replace(" ", "+") + "+";
        });
    }
    execute(callback) {
        if (this.query !== "" && this.query !== "q=") {
            this.url += "&" + this.query;
            super.execute(callback);
        }
        else {
            callback(new SpotifyApiRequestResult(RequestStatus.UNRESOLVED, null, { "error": "Baldy formed request" }));
        }
    }
}
//SUBSECTION Subclasses related to retrieving information about Spotify tracks
/**
* Used to get Audio features for one or more tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
class SpotifyApiAudioFeaturesRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiAudioFeaturesRequest
     * @param track_id Spotify ID(s) of the track
     */
    constructor(track_id) {
        super();
        if (track_id.length > 1) {
            let track_ids = track_id.join(",");
            this.url = this.baseURL + "audio-features/" + track_ids;
        }
        else {
            this.url = this.baseURL + "audio-features/" + track_id[0];
        }
    }
}
/**
* Used to get information about one or more tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
class SpotifyApiTrackRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiTrackRequest
     * @param track_id Spotify ID(s) of the track
     */
    constructor(track_id) {
        super();
        if (track_id.length > 1) {
            let track_ids = track_id.join(",");
            this.url = this.baseURL + "tracks/" + track_ids;
        }
        else {
            this.url = this.baseURL + "tracks/" + track_id[0];
        }
    }
}
//SUBSECTION Subclasses related to retrieving information about users(s)
class SpotifyApiUserRequest extends SpotifyApiGetRequest {
    constructor(currentuser, user_id) {
        super();
        if (currentuser) {
            this.url = this.baseURL + "me";
        }
        else {
            this.url = this.baseURL + "users/" + user_id;
        }
    }
}
//#endregion
