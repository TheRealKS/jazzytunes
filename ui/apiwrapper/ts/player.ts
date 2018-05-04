import '@types/spotify-web-playback-sdk';
window.onSpotifyWebPlaybackSDKReady = () => {
    var player = new Spotify.Player({
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
}
