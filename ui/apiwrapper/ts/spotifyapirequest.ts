//Enum for all the different suburls(scopes) that can be used
enum Scopes {
    "albums",
    "artists",
    "browse",
    "recommendations",
    "me",
    "users",
    "search",
    "tracks",
    "audio-analysis",
    "audio-features"
};

enum RequestStatus {
    "UNRESOLVED" = 0,
    "RESOLVING" = 1,
    "RESOLVED" = 2,
    "ERROR" = 3
};

type RequestCallbackFunction = (result : SpotifyApiRequestResult) => void;

interface PlaylistDetails {
    name : string,
    public : boolean,
    collaborative : boolean,
    description : string
}

function test(id, tracks) {
    let r = new SpotifyApiPlaylistAddRequest(id, tracks);
    r.execute((result : any) => {
        console.log(result);
    });
}

class SpotifyApiRequestResult {
    status : RequestStatus = RequestStatus.UNRESOLVED;
    result : Object = null;
    error : Object = null;
    constructor(status? : RequestStatus, result? : Object, error? : Object) {
        this.status = status;
        this.result = result;
        this.error = error;
    }
}

class SpotifyApiGetRequest {
    baseURL = "https://api.spotify.com/v1/"; //Base URL all requests use
    url : string;
    result : SpotifyApiRequestResult;
    constructor() {

    }
    
    /**
     * Converts the provided options to a url
     * 
     * @param options Options as a key/value array
     * @returns The encoded URL component for the options
     * @description Only to be called internally
     */

    parseOptions(options : Array<Object>) {
        let optionsString : string = "";
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

    execute(callback : RequestCallbackFunction) {
        fetch(this.url, {
            headers : {
                Authorization: "Bearer " + credentials.getAccessToken()
            }
        })
        .then(function(res) {
            if (res.ok) {
                //TODO: Further error handling
                return res.json();
            } else {
                alert("Error!");
            }
        })
        .then(function(json) {
            let result : SpotifyApiRequestResult;
            if (json.error) {
                //OOPS
                result = new SpotifyApiRequestResult(RequestStatus.ERROR, json.error, json.error_description);
            } else {
                result = new SpotifyApiRequestResult(RequestStatus.RESOLVED, json);
            }
            callback(result);
        });
    }
}

class SpotifyApiPostRequest {
    baseURL = "https://api.spotify.com/v1/"; //Base URL all requests use
    url : string;
    result : SpotifyApiRequestResult;
    body : string;
    constructor() {

    }

    setBodyParams(jsonstring : string) {
        this.body = jsonstring;
    }

    /**
     * Executes the request
     * 
     * @param callback The function this function was orignally called from.
     * @returns The result of the request as a parameter to the callback parameter.
     */

    execute(callback : Function) {
        if (!this.body) {
            this.result = new SpotifyApiRequestResult(RequestStatus.UNRESOLVED, "Error INTERNAL", "No body paramters have been set");
            //callback(this.result);
            //return;
        }
        fetch(this.url, {
            method: "POST",
            headers : {
                Authorization: "Bearer " + credentials.getAccessToken(),
                "Content-Type": "application/json"
            },
            body: this.body
        })
        .then(function(res) {
            if (res.ok) {
                //TODO: Further error handling
                return res.json();
            } else {
                alert("Error!");
            }
        })
        .then(function(json) {
            let result : SpotifyApiRequestResult;
            if (json.error) {
                //OOPS
                result = new SpotifyApiRequestResult(RequestStatus.ERROR, json.error, json.error_description);
            } else {
                result = new SpotifyApiRequestResult(RequestStatus.RESOLVED, json);
            }
            callback(result);
        });
    }
}

class SpotifyApiPutRequest {
    baseURL = "https://api.spotify.com/v1/"; //Base URL all requests use
    url : string;
    body : Array<string>
    bodyJson = true;
    result : SpotifyApiRequestResult;
    constructor(bodyJson? : boolean) {
        this.bodyJson = bodyJson;
    }

    /**
     * Converts the provided Array of body elements to a valid body string for the request
     * 
     * @param bodyElements Body elements as a key/value array
     * @returns A valid URLSearchParams encoded string for the elements
     * @description Only to be called internally, usually not necessary as most request require a json type encoding for the body
     */

    createBody(bodyElements : Array<any>) {
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

    parseOptions(options : Array<Object>) {
        let optionsString : string = "";
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

    execute(callback : Function) {
        fetch(this.url, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + credentials.getAccessToken(),
                "Content-Type": "application/json"
            },
            body: this.bodyJson ? JSON.stringify(this.body) : this.createBody(this.body)
        })
        .then(function(res) {
            if (res.ok) {
                return res.json();
            } else {
                alert("Error!");
            }
        })
        .then(function(json) {
            let result : SpotifyApiRequestResult;
            if (json.error) {
                //OOPS
                result = new SpotifyApiRequestResult(RequestStatus.ERROR, json.error, json.error_description);
            } else {
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
    constructor(albumID : string, options : Array<Object>) {
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
    constructor(albumID : string, options : Array<Object>) {
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
    constructor(albumIDs : Array<string>, options : Array<Object>) {
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
    constructor(artistID : string) {
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
    constructor(artistID : string, options : Array<string>) {
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
    constructor(artistID : string, country : string) {
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
    constructor(artistID : string) {
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
    constructor(artistIDs : Array<string>) {
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
    constructor(categoryID : string, options : Array<string>) {
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
    constructor(categoryID : string, options : Array<String>) {
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
    constructor(options : Array<string>) {
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
    constructor(options : Array<string>) {
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
    constructor(options : Array<string>) {
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
    constructor(options : Array<string>) {
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
    constructor(options : Array<string>) {
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
    constructor(owner_id : string, playlist_id : string, ids : Array<string>) {
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
    constructor(album_ids : Array<string>) {
        super();
        if (album_ids.length > 1) {
            this.url = this.baseURL + "me/albums/contains/" + album_ids.join(",");
        } else {
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
     constructor(track_ids : Array<string>) {
        super();
        if (track_ids.length > 1) {
            this.url = this.baseURL + "me/tracks/contains/" + track_ids.join(",");
        } else {
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
     constructor(options : Array<string>) {
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
     constructor(options : Array<string>) {
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
     constructor(album_ids : Array<string>) {
        super();
        if (album_ids.length > 1) {
            this.url = this.baseURL + "me/albums?ids=" + album_ids.join(",");
        } else {
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
    constructor(track_ids : Array<string>) {
       super();
       if (track_ids.length > 1) {      
           this.url = this.baseURL + "me/tracks?ids=" + track_ids.join(",");
       } else {
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
    constructor(album_ids : Array<string>) {
        super();
        if (album_ids.length > 1) {
            this.url = this.baseURL + "me/albums?ids=" + album_ids.join(",");
        } else {
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
    constructor(track_ids : Array<string>) {
       super();
       if (track_ids.length > 1) {      
           this.url = this.baseURL + "me/tracks?ids=" + track_ids.join(",");
       } else {
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
     constructor(track_id : string) {
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
    constructor(type : string) {
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
    constructor(limit : number = 20, after? : number, before? : number) {
        super();
        if (limit >= 1 && limit <= 50) {
            if (after) {
                this.url = this.baseURL + "me/player/recently-played?limit=" + limit + "&after=" + after;
            } else if (before) {
                this.url = this.baseURL + "me/player/recently-played?limit=" + limit + "&before=" + before;
            }
        } else {
            this.url = this.baseURL + "me/player/recently-played";
        }
    }
}

/**
 * Used to transfer the users playback. Can only be used after a SpotifyApiDevicesRequest has been executed
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
    constructor(device_ids : Array<string>, play : boolean = false) {
        super();
        let o = {
            "device_ids": device_ids,
            "play" : play
        };
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
    constructor(playlist_id : string, track_uris : Array<string>, position? : number) {
        super();
        this.url = this.baseURL + "playlists/" + playlist_id + "?uris="+ track_uris.join(",");
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
    constructor(playlist_id : string, details : PlaylistDetails) {
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
    constructor(track_id : Array<string>) {
        super();
        if (track_id.length > 1) {
            let track_ids = track_id.join(",");
            this.url = this.baseURL + "audio-features/" + track_ids;
        } else {
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
    constructor(track_id : Array<string>) {
        super();
        if (track_id.length > 1) {
            let track_ids = track_id.join(",");
            this.url = this.baseURL + "tracks/" + track_ids;
        } else {
            this.url = this.baseURL + "tracks/" + track_id[0];
        }
    }
}

//SUBSECTION Subclasses related to retrieving information about users(s)

class SpotifyApiUserRequest extends SpotifyApiGetRequest {
    constructor(currentuser : boolean, user_id? : string) {
        super();
        if (currentuser) {
            this.url = this.baseURL + "me";
        } else {
            this.url = this.baseURL + "users/" + user_id;
        }
    }
}

//#endregion