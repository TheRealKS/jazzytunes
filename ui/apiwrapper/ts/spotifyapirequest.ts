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
     * @param callback The function this function was orignally called from.
     * @returns The result of the request as a parameter to the callback parameter.
     */

    execute(callback : Function) {
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
 * @extends SpotifyApiRequest
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
 * @extends SpotifyApiRequest
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

class SpotifyApiFollowRequest extends SpotifyApiPutRequest {
    constructor(type : )
}

