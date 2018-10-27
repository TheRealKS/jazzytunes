///<reference path="../../ts/ui_common.ts" /> 
//import '@typings/spotify-web-playback-sdk';

interface PlaybackParams {
    name : string,
    albumname : string,
    albumcoveruri : string,
    artists : Array<Spotify.Artist>;
}

var currentposition : number;
var currentduration : number;
var onepercent : number;
var currenttimer : number;

class PlaybackController {
    sidebarentry : Element;
    currenttrack : string;
    currentseekpercentage : number;

    imgholder : HTMLImageElement;
    titleholder : HTMLSpanElement;
    infoholder : HTMLSpanElement;
    rangebar : HTMLInputElement;
    timecurrent : HTMLSpanElement;
    timefull : HTMLSpanElement;
    controls : HTMLDivElement;

    playbutton : Element;
    nextbutton : Element;
    previousbutton : Element;

    constructor(sidebarEntry : Element) {
        this.sidebarentry = sidebarEntry;

        this.imgholder = <HTMLImageElement>this.sidebarentry.getElementsByClassName("cover_img")[0];
        this.titleholder = <HTMLSpanElement>this.sidebarentry.getElementsByClassName("title")[0];
        this.infoholder = <HTMLSpanElement>this.sidebarentry.getElementsByClassName("artist_album")[0];
        this.rangebar = <HTMLInputElement>this.sidebarentry.getElementsByClassName("scrubbar")[0];
        let divs = this.sidebarentry.getElementsByTagName("div");
        let times = divs[0];
        this.controls = divs[1];
        this.timecurrent = <HTMLSpanElement>times.children[0];
        this.timefull = <HTMLSpanElement>times.children[1];

        let children = this.controls.children
        this.playbutton = children[2].children[0];
        this.playbutton.addEventListener('click', setPlaybackState);
        this.nextbutton = children[3].children[0];
        this.nextbutton.addEventListener('click', nextTrack);
        this.previousbutton = children[1].children[0];
        this.previousbutton.addEventListener('click', previousTrack);
    }

    setImg(imguri : string) {
        this.imgholder.src = imguri;
    }

    setTitle(title : string) {
        this.titleholder.innerHTML = title;
        this.currenttrack = title;
    }

    setArtistAlbum(artist : string, album : string) {
        let string = artist + " - " + album;
        this.infoholder.innerHTML = string;
    }

    setDuration(time : string) {
        this.timefull.innerHTML = time;
    }

    setNewParams(params : PlaybackParams) {
        this.setImg(params.albumcoveruri);
        this.setTitle(params.name);
        this.setArtistAlbum(params.artists[0].name, params.albumname);
        this.currentseekpercentage = 0;
    }

    play() {
        this.controls.children[2].children[0].innerHTML = "play_arrow";
        player.togglePlay();
    }

    pause() {
        this.controls.children[2].children[0].innerHTML = "pause";
        player.pause();
    }

    seek(seekpercentage : number) {
        this.rangebar.value = seekpercentage.toString();
    }

    seekNext() {
        this.rangebar.value = (++this.currentseekpercentage).toString();
    }
}

var player : Spotify.SpotifyPlayer;
var playbackcontroller : PlaybackController;

function initPlayer() {
    //At this point, auth should be complete and usable
    let script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    document.body.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
            name: "JazzyTunes",
            getOAuthToken: cb => {cb(credentials.getAccessToken())}
        });
    
        player.on('account_error', ({message}) => {
            alert("The account used to authorize does not have a valid Spotify Premium subscription!");
        });

        player.addListener('player_state_changed', state => { 
            let track = state.track_window.current_track;
            if (track.name != playbackcontroller.currenttrack) {
                let params : PlaybackParams = {
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

function initializePlayerUI(player : Spotify.SpotifyPlayer) {
    let controller = createSidebarEntry("Playback Controls");
    document.getElementById("sidebar").appendChild(controller);
    let c = createPlayBackControls(controller);
    playbackcontroller = new PlaybackController(c);
}

function updatePlayerUI(information : SpotifyApiRequestResult) {
    if (information.status == RequestStatus.RESOLVED) {
        let duration = information.result.duration_ms;
        currentduration = duration;
        onepercent = Math.floor(duration / 100);
        let durationins = Math.floor(duration / 1000);
        let minutes = 0;
        while (durationins > 59) {
            durationins -= 60;
            minutes++;
        }
        let string = minutes + ":";
        if (durationins > 9) {
            string += durationins;
        } else {
            string += "0" + durationins;
        }
        playbackcontroller.setDuration(string);
        settimeincrementer();
    }
}

function setPlaybackState(ev : Event, playing? : boolean) {
    player.getCurrentState().then(res => {
        if (res.paused) {
            playbackcontroller.play();
        } else {
            playbackcontroller.pause();
        }
    });
}

function nextTrack(ev : Event) {
    player.nextTrack();
}

function previousTrack(ev : Event) {
    player.previousTrack();
}

function setPosition(position : number) {
    player.seek(position);
    currentposition = position;
    playbackcontroller.seek(Math.floor((currentduration / 100) * position));
}

function settimeincrementer() {
    if (!currenttimer) {
        currenttimer = <number><unknown>setInterval(() => {
            currentposition += onepercent;
            playbackcontroller.seekNext();
        }, onepercent);
    }
}