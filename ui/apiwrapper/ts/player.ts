///<reference path="../../ts/ui_common.ts" /> 
//import '@typings/spotify-web-playback-sdk';
var player : Spotify.SpotifyPlayer;
window.onSpotifyWebPlaybackSDKReady = () => {
    return;
    player = new Spotify.Player({
        name: "JazzyTunes",
        getOAuthToken: cb => {cb(credentials.getAccessToken())}
    });


    player.on('account_error', ({message}) => {
        alert("The account used to authorize does not have a valid Spotify Premium subscription!");
    });

    player.connect();

    initializePlayerUI(player);
};

function initializePlayerUI(player : Spotify.SpotifyPlayer) {
    let controller = createSidebarEntry("Playback Controls");
    
}
