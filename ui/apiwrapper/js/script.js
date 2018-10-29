const electron = require('electron');
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;
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
function startAuthProcess() {
    //Define the scopes necessary for this project
    var scopes = [
        'streaming',
        'user-library-read',
        'user-library-modify',
        "user-read-birthdate",
        "user-read-email",
        "user-read-private"
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
    webContents.on('will-navigate', (event, url) => {
        handleAuthCodeCallback(url);
    });
    webContents.on('did-get-redirect-request', (event, oldURL, newURL) => {
        handleAuthCodeCallback(newURL);
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
        initPlayer();
    });
}
//All the actions to be executed on window load go here
document.addEventListener("dom:loaded", function () {
    document.getElementById("authorize").addEventListener("click", startAuthProcess);
});
////<reference path="../elements/elements.ts" /> 
function createSidebarEntry(name) {
    let header = document.createElement("sidebar_element_header");
    let entryName = document.createElement("span");
    entryName.slot = "header_text";
    entryName.innerHTML = name;
    header.appendChild(entryName);
    /* header.shadowRoot.childNodes[0].addEventListener("click", (event : Event) => {
        let target : HTMLElement = <HTMLElement> event.target;
        let entry = target.parentElement;
        let childNodes = Array.from(entry.childNodes);
        if (target.getAttribute("open")) {
            childNodes.forEach((element : HTMLElement, index) => {
                if (index > 0) {
                    element.style.display = "none";
                }
            });
            target.style.transform = "rotate(180deg)";
        } else {
            childNodes.forEach((element : HTMLElement, index) => {
                if (index > 0) {
                    element.style.display = "block";
                }
            });
            target.style.transform = "rotate(0deg)";
        }
    }); */
    let span = document.createElement("span");
    span.slot = "header_text";
    span.innerHTML = name;
    span.className = "header_text";
    let slots = [span];
    let element = database.getElement("sidebar-element-header");
    element.populateSlots(slots);
    let container = document.createElement("div");
    container.className = "sidebar_entry";
    container = element.getElement(container);
    let contentbox = document.createElement("div");
    contentbox.className = "sidebar_entry_content";
    container.appendChild(contentbox);
    return container;
}
function createPlayBackControls(sidebarentry) {
    let element = database.getElement('playback-controls-basic');
    let box = sidebarentry.getElementsByClassName('sidebar_entry_content')[0];
    return element.getElement(box);
}
///<reference path="../../ts/ui_common.ts" /> 
//import '@typings/spotify-web-playback-sdk';
class PlaybackController {
    constructor(sidebarEntry) {
        this.sidebarentry = sidebarEntry;
        this.imgholder = this.sidebarentry.getElementsByClassName("cover_img")[0];
        this.titleholder = this.sidebarentry.getElementsByClassName("title")[0];
        this.infoholder = this.sidebarentry.getElementsByClassName("artist_album")[0];
        this.rangebar = this.sidebarentry.getElementsByClassName("scrubbar")[0];
        let divs = this.sidebarentry.getElementsByTagName("div");
        let times = divs[0];
        this.controls = divs[1];
        this.timecurrent = times.children[0];
        this.timefull = times.children[1];
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
    }
}
var player;
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
        player.addListener('player_state_changed', state => {
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
        });
        player.connect();
        initializePlayerUI(player);
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
        let durationins = Math.floor(duration / 1000);
        let minutes = 0;
        while (durationins > 59) {
            durationins -= 60;
            minutes++;
        }
        let string = minutes + ":";
        if (durationins > 9) {
            string += durationins;
        }
        else {
            string += "0" + durationins;
        }
        playbackcontroller.setDuration(string);
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
class SpotifyApiPostRequest {
    constructor() {
        this.baseURL = "https://api.spotify.com/v1/"; //Base URL all requests use
    }
    setBodyParams(jsonstring) {
        this.body = jsonstring;
    }
    /**
     * Executes the request
     *
     * @param callback The function this function was orignally called from.
     * @returns The result of the request as a parameter to the callback parameter.
     */
    execute(callback) {
        if (!this.body) {
            this.result = new SpotifyApiRequestResult(RequestStatus.UNRESOLVED, "Error INTERNAL", "No body paramters have been set");
            //callback(this.result);
            //return;
        }
        fetch(this.url, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + credentials.getAccessToken(),
                "Content-Type": "application/json"
            },
            body: this.body
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
            this.url = this.baseURL + "me/abumns?ids=" + album_ids[0];
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
//#endregion
