/// <reference types="spotify-web-playback-sdk" />
/// <reference types="node" />
declare const electron: any;
declare const remote: any;
declare const BrowserWindow: any;
declare var authWindow: any, redurl: any;
declare var CLIENT_ID: string;
declare var CLIENT_SECRET: string;
declare var credentials: CredentialsProvider;
declare var currentuser: CurrentUserInformation;
interface SpotifyUserImage {
    height: any;
    width: any;
    url: string;
}
declare class CurrentUserInformation {
    username: string;
    id: string;
    images: Array<SpotifyUserImage>;
    constructor(username: string, id: string, images: Array<SpotifyUserImage>);
}
declare class ExpiringCredentials {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    will_refresh: boolean;
    refresher: number;
    constructor(a_t: string, r_t: string, e_i: number, w_r: boolean);
    refresh(): void;
    willRefresh: boolean;
    revoke(): void;
}
declare class CredentialsProvider {
    authorizationCode: string;
    expiringCredentials: ExpiringCredentials;
    constructor(authCode: string);
    readonly authCode: string;
    getAccessToken(): string;
}
declare function startAuthProcess(): void;
declare function handleAuthCodeCallback(url: any): void;
declare function requestAccesToken(authCode: string, refresh?: boolean): void;
declare function getUserDetails(): void;
declare function createProfile(result: SpotifyApiRequestResult): void;
interface PlaybackParams {
    name: string;
    albumname: string;
    albumcoveruri: string;
    artists: Array<Spotify.Artist>;
}
declare class SeekBar {
    seekbar: HTMLInputElement;
    currentposition: number;
    currentpercentage: number;
    currentduration: number;
    onepercent: number;
    currenttimer: NodeJS.Timer;
    timeractivated: boolean;
    constructor(bar: HTMLInputElement);
    /**
     * Sets (resets) the current song parameter
     * @param newsongduration The duration of the next track in milliseconds
     */
    setParams(newsongduration: number): void;
    /**
     * Seeks the seekbar to a value. Does not change the playing position of the player.
     * @param positionInMS The position to seek to in milliseconds
     */
    seekToValue(positionInMS: number, percentage?: number): void;
    toggleTimer(state: boolean): void;
    protected createTimer(): void;
    protected deleteTimer(): void;
}
declare class PlaybackController {
    sidebarentry: Element;
    currenttrack: string;
    currentseekpercentage: number;
    imgholder: HTMLImageElement;
    titleholder: HTMLSpanElement;
    infoholder: HTMLSpanElement;
    seekbar: SeekBar;
    timecurrent: HTMLSpanElement;
    timefull: HTMLSpanElement;
    controls: HTMLDivElement;
    playbutton: Element;
    nextbutton: Element;
    previousbutton: Element;
    constructor(sidebarEntry: Element);
    setImg(imguri: string): void;
    setTitle(title: string): void;
    setArtistAlbum(artist: string, album: string): void;
    setDuration(time: string): void;
    setNewParams(params: PlaybackParams): void;
    play(): void;
    pause(): void;
    setCurrentTime(timestring: string): void;
}
declare var player: Spotify.SpotifyPlayer;
declare var playbackcontroller: PlaybackController;
declare function initPlayer(): void;
declare function initializePlayerUI(player: Spotify.SpotifyPlayer): void;
declare function updatePlayerUI(information: SpotifyApiRequestResult): void;
declare function secondsToTimeString(seconds: number): string;
declare function setPlaybackState(ev: Event, playing?: boolean): void;
declare function nextTrack(ev: Event): void;
declare function previousTrack(ev: Event): void;
declare function setPosition(position: number): void;
declare enum Scopes {
    "albums" = 0,
    "artists" = 1,
    "browse" = 2,
    "recommendations" = 3,
    "me" = 4,
    "users" = 5,
    "search" = 6,
    "tracks" = 7,
    "audio-analysis" = 8,
    "audio-features" = 9
}
declare enum RequestStatus {
    "UNRESOLVED" = 0,
    "RESOLVING" = 1,
    "RESOLVED" = 2,
    "ERROR" = 3
}
declare type RequestCallbackFunction = (result: SpotifyApiRequestResult) => void;
interface PlaylistDetails {
    name: string;
    public: boolean;
    collaborative: boolean;
    description: string;
}
declare function test(id: any, tracks: any): void;
declare class SpotifyApiRequestResult {
    status: RequestStatus;
    result: Object;
    error: Object;
    constructor(status?: RequestStatus, result?: Object, error?: Object);
}
declare class SpotifyApiGetRequest {
    baseURL: string;
    url: string;
    result: SpotifyApiRequestResult;
    constructor();
    /**
     * Converts the provided options to a url
     *
     * @param options Options as a key/value array
     * @returns The encoded URL component for the options
     * @description Only to be called internally
     */
    parseOptions(options: Array<Object>): string;
    /**
     * Executes the request
     *
     * @param callback The callback function to be called when the request has been executed. Needs to have a variable of the type SpotifyApiRequestResult as a parameter
     * @returns The result of the request as a parameter to the callback parameter.
     */
    execute(callback: RequestCallbackFunction): void;
}
declare class SpotifyApiPostRequest {
    baseURL: string;
    url: string;
    result: SpotifyApiRequestResult;
    body: string;
    constructor();
    setBodyParams(jsonstring: string): void;
    /**
     * Executes the request
     *
     * @param callback The function this function was orignally called from.
     * @returns The result of the request as a parameter to the callback parameter.
     */
    execute(callback: Function): void;
}
declare class SpotifyApiPutRequest {
    baseURL: string;
    url: string;
    body: Array<string>;
    bodyJson: boolean;
    result: SpotifyApiRequestResult;
    constructor(bodyJson?: boolean);
    /**
     * Converts the provided Array of body elements to a valid body string for the request
     *
     * @param bodyElements Body elements as a key/value array
     * @returns A valid URLSearchParams encoded string for the elements
     * @description Only to be called internally, usually not necessary as most request require a json type encoding for the body
     */
    createBody(bodyElements: Array<any>): string;
    /**
     * Converts the provided options to a url
     *
     * @param options Options as a key/value array
     * @returns The encoded URL component for the options
     * @description Only to be called internally
     */
    parseOptions(options: Array<Object>): string;
    /**
     * Executes the request
     *
     * @param callback The function this function was orignally called from.
     * @returns The result of the request as a parameter to the callback parameter.
     */
    execute(callback: Function): void;
}
declare class SpotifyApiDeleteRequest {
}
/**
 * Used to retrieve an overview of the album
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotiyApiAlbumRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotiyApiAlbumRequest
     * @param albumID The Spotify ID for the album
     * @param options Options as a key/value array
     */
    constructor(albumID: string, options: Array<Object>);
}
/**
 * Used to retrieve the tracks of an album
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotiyApiAlbumTracksRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotiyApiAlbumTracksRequest
     * @param albumID The Spotify ID for the album
     * @param options Options as a key/value array
     */
    constructor(albumID: string, options: Array<Object>);
}
/**
 * Used to retrieve multiple albums at once
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiAlbumsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiAlbumsRequest
     * @param albumIDs Array of Spotify album IDs as string
     * @param options Options as a key/value array
     */
    constructor(albumIDs: Array<string>, options: Array<Object>);
}
/**
 * Used to retrieve information about an artist
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiArtistRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistRequest
     * @param artistID The Spotify ID for the artist
     */
    constructor(artistID: string);
}
/**
 * Used to retrieve an artist's albums
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiArtistAlbumsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistAlbumsRequest
     * @param artistID The Spotify ID for the artist
     * @param options Options as a key/value array
     */
    constructor(artistID: string, options: Array<string>);
}
/**
 * Used to retrieve an artist's top tracks in a specific country
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiArtistTopTracksRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistTopTracksRequest
     * @param artistID The Spotify ID for the artist
     * @param country The country for which to retrieve the top tracks
     */
    constructor(artistID: string, country: string);
}
/**
 * Used to retrieve artists related to an artist
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiRelatedArtistsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiRelatedArtistsRequest
     * @param artistID The Spotify ID for the artist
     */
    constructor(artistID: string);
}
/**
 * Used to retrieve information about multiple artists at once
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiArtistsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiArtistsRequest
     * @param artistIDs Array of Spotify artist IDs as string
     */
    constructor(artistIDs: Array<string>);
}
/**
 * Used to retrieve a single category used to tag items in Spotify
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiCategoryRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiCategoryRequest
     * @param categoryID The Spotify Category ID for the category, such as 'party'
     * @param options Options as a key/value array
     */
    constructor(categoryID: string, options: Array<string>);
}
/**
 * Used to retrieve a single category's playlists
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiCategoryPlaylistRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiCategoryPlaylistRequest
     * @param categoryID The Spotify Category ID for the category, such as 'party'
     * @param options Options as a key/value array
     */
    constructor(categoryID: string, options: Array<String>);
}
/**
 * Used to retrieve a list of categories
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiCategoryListRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiCategoryListRequest
     * @param options Options as  a key/value array
     */
    constructor(options: Array<string>);
}
/**
 * Used to retrieve a list of featured playlists
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiFeaturedPlaylistRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiFeaturedPlaylistRequest
     * @param options Options as a key/value array
     */
    constructor(options: Array<string>);
}
/**
 * Used to retrieve a list of featured new album releases
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiNewReleaseRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiNewReleaseRequest
     * @param options Options as a key/value array
     */
    constructor(options: Array<string>);
}
/**
 * Used to retrieve a recommendations (radio feature)
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiRecommendationsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiRecommendationsRequest
     * @param options Options as a key/value array
     */
    constructor(options: Array<string>);
}
/**
 * Used to check if a user is following one or more artists or other users
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiFollowingContainsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiFollowingContainsRequest
     * @param options Option as a key/value array
     */
    constructor(options: Array<string>);
}
/**
 * Used to check if one or more users follow a playlist
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiFollowPlaylistCheckRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiFollowPlaylistCheckRequest
     * @param owner_id Spotify ID of the owner of the playlist
     * @param playlist_id Spotify ID of the playlist
     * @param ids Array of Spotify IDs of users to check if they follow the playlist
     */
    constructor(owner_id: string, playlist_id: string, ids: Array<string>);
}
/**
 * Used to follow one or more artists or users
 *
 * @class
 * @extends SpotifyApiPutRequest
 */
declare class SpotifyApiFollowRequest extends SpotifyApiPutRequest {
}
/**
 * Used to follow a playlist
 *
 * @class
 * @extends SpotifyApiPutRequest
 */
declare class SpotifyApiFollowPlaylistRequest extends SpotifyApiPutRequest {
}
/**
 * Used to unfollow one or more artists or users
 *
 * @class
 * @extends SpotifyApiDeleteRequest
 */
declare class SpotifyApiUnfollowRequest extends SpotifyApiDeleteRequest {
}
/**
 * Used to unfollow a playlist
 *
 * @class
 * @extends SpotifyApiDeleteRequest
 */
declare class SpotifyApiUnfollowPlaylistRequest extends SpotifyApiDeleteRequest {
}
/**
* Used to check if a user has already saved one or more albums
*
* @class
* @extends SpotifyApiGetRequest
*/
declare class SpotifyApiSavedAlbumsContainsRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiSavedAlbumsContainsRequest
     * @param track_id Spotify IDs of the albums
     */
    constructor(album_ids: Array<string>);
}
/**
* Used to check if a user has already saved one or more tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
declare class SpotifyApiSavedTracksContainsRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiSavedTracksContainsRequest
    * @param track_id Spotify IDs of the tracks
    */
    constructor(track_ids: Array<string>);
}
/**
* Used to retrieve the users saved albums
*
* @class
* @extends SpotifyApiGetRequest
*/
declare class SpotifyApiSavedAlbumsRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiSavedAlbumsRequest
    * @param options Options as a key/value array
    */
    constructor(options: Array<string>);
}
/**
* Used to retrieve the users saved tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
declare class SpotifyApiSavedTracksRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiSavedTracksRequest
    * @param options Options as a key/value array
    */
    constructor(options: Array<string>);
}
/**
* Used to remove one or more albums from the users saved tracks
*
* @class
* @extends SpotifyApiDeleteRequest
*/
declare class SpotifyApiUnsaveAlbumsRequest extends SpotifyApiDeleteRequest {
    /**
    * @constructs SpotifyApiUnsaveAlbumsRequest
    * @param album_ids Spotify IDs of the albums
    */
    constructor(album_ids: Array<string>);
}
/**
* Used to remove one or more tracks from the users saved tracks
*
* @class
* @extends SpotifyApiDeleteRequest
*/
declare class SpotifyApiUnsaveTracksRequest extends SpotifyApiDeleteRequest {
    /**
    * @constructs SpotifyApiUnsaveTracksRequest
    * @param track_ids Spotify IDs of the tracks
    */
    constructor(track_ids: Array<string>);
}
/**
* Used to save one or more albums to the users library
*
* @class
* @extends SpotifyApiPutRequest
*/
declare class SpotifyApiSaveAlbumsRequest extends SpotifyApiPutRequest {
    /**
     * @constructs SpotifyApiSaveAlbumsRequest
     * @param album_ids Spotify IDs of the albums
     */
    constructor(album_ids: Array<string>);
}
/**
* Used to save one or more tracks to users library
*
* @class
* @extends SpotifyApiPutRequest
*/
declare class SpotifyApiSaveTracksRequest extends SpotifyApiPutRequest {
    /**
    * @constructs SpotifyApiSaveTracksRequest
    * @param track_ids Spotify IDs of the tracks
    */
    constructor(track_ids: Array<string>);
}
/**
* Used to get Audio analysis for a track
*
* @class
* @extends SpotifyApiGetRequest
*/
declare class SpotifyApiAudioAnalysisRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiAudioAnalysisRequest
    * @param track_id Spotify ID of the track
    */
    constructor(track_id: string);
}
/**
 * Used to get the users top artists or tracks
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiTopRequest extends SpotifyApiGetRequest {
    /**
    * @constructs SpotifyApiTopRequest
    * @param type Type of entity. Valid values are 'artists' or 'tracks'
    */
    constructor(type: string);
}
/**
 * Used to get the users currently available devices
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiDevicesRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiDevicesRequest
     */
    constructor();
}
/**
 * Used to get the users recently played tracks
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiRecentTracksRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiRecentTracksRequest
     * @param limit The maximum amount of tracks to list. Can be between 1 and 50 (inclusive). If not specified, value will be 20
     * @param after Unix Timestamp. If specified, this request will return all tracks played after this timestamp. If this parameter is specified, parameter limit must also be specified, but parameter before may not be specified
     * @param before Unix Timestamp. If specified, this request will return all tracks played before this timestamp. If this paramter is specified, parameter limit must also be specified, but parameter after may not be specified
     */
    constructor(limit?: number, after?: number, before?: number);
}
/**
 * Used to transfer the users playback. Can only be used after a SpotifyApiDevicesRequest has been executed
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiTransferPlaybackRequest extends SpotifyApiPutRequest {
    /**
     * @constructs SpotifyTransferPlaybackRequest
     * @param device_ids Array with just one element: the device id of the device to transfer playback to
     * @param play If specified, this parameter indicates whether playback should start or not when the playback has been transfered
     */
    constructor(device_ids: Array<string>, play?: boolean);
}
/**
 * Used to save one or more tracks to a playlist
 *
 * @class
 * @extends SpotifyApiGetRequest
 */
declare class SpotifyApiPlaylistAddRequest extends SpotifyApiPostRequest {
    /**
     * @constructs SpotifyApiPlaylistAddRequest
     * @param playlist_id The Spotify ID of the playlist to add the tracks to
     * @param track_uris The Spotify URI's (spotify:track:xxx) of the tracks to add to the playlist
     * @param positon (Optional) The position at which to insert the tracks. If omitted, the tracks are appended
     */
    constructor(playlist_id: string, track_uris: Array<string>, position?: number);
}
/**
 * Used to change the details of a playlist
 *
 * @class
 * @extends SpotifyApiPostRequest
 */
declare class SpotifyApiPlaylistChangeRequest extends SpotifyApiPostRequest {
    /**
     * @constructs SpotifyApiPlaylistChangeRequest
     * @param playlist_id The Spotify ID of the playlist to change
     * @param details Object containing the fields name, public, collaborative and description
     */
    constructor(playlist_id: string, details: PlaylistDetails);
}
/**
 * Used to create a new playlist
 *
 * @class
 * @extends SpotifyApiPostRequest
 */
declare class SpotifyApiCreatePlaylistRequest extends SpotifyApiPostRequest {
    /**
     * @constructs SpotifyApiPlaylistChangeRequest
     * @param playlist_id The Spotify ID of the playlist to change
     * @param details Object containing the fields name, public, collaborative and description
     */
    constructor();
}
/**
* Used to get Audio features for one or more tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
declare class SpotifyApiAudioFeaturesRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiAudioFeaturesRequest
     * @param track_id Spotify ID(s) of the track
     */
    constructor(track_id: Array<string>);
}
/**
* Used to get information about one or more tracks
*
* @class
* @extends SpotifyApiGetRequest
*/
declare class SpotifyApiTrackRequest extends SpotifyApiGetRequest {
    /**
     * @constructs SpotifyApiTrackRequest
     * @param track_id Spotify ID(s) of the track
     */
    constructor(track_id: Array<string>);
}
declare class SpotifyApiUserRequest extends SpotifyApiGetRequest {
    constructor(currentuser: boolean, user_id?: string);
}
