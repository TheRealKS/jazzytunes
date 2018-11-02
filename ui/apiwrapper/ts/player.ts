////<reference path="../../ts/ui_common.ts" /> 
//import '@typings/spotify-web-playback-sdk';

interface PlaybackParams {
    name : string,
    albumname : string,
    albumcoveruri : string,
    artists : Array<Spotify.Artist>;
}

class SeekBar {
    seekbar : HTMLInputElement;
    currentposition : number;
    currentpercentage : number; //1-100
    currentduration : number;
    onepercent : number;
    currenttimer : NodeJS.Timer;
    timeractivated : boolean;

    constructor(bar : HTMLInputElement) {
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
    setParams(newsongduration : number) {
        this.currentduration = newsongduration;
        this.onepercent = Math.round(newsongduration / 100);
        this.currentposition = 0;
        this.deleteTimer();
        this.createTimer();
    }

    /**
     * Seeks the seekbar to a value. Does not change the playing position of the player.
     * @param positionInMS The position to seek to in milliseconds
     */
    seekToValue(positionInMS : number, percentage? : number) {
        if (positionInMS <= this.currentduration) {
            this.currentposition = positionInMS;
            if (percentage) {
                this.currentpercentage = percentage;
            } else {
                this.currentpercentage = Math.ceil(positionInMS / this.onepercent);
            }
            playbackcontroller.setCurrentTime(secondsToTimeString(Math.round((this.currentposition / 1000))));
            this.seekbar.value = this.currentpercentage.toString();
        } else {
            this.currentpercentage = 100;
            this.seekbar.value = '100';
            playbackcontroller.setCurrentTime(playbackcontroller.timefull.innerHTML);
            this.deleteTimer();
        }
    }

    toggleTimer(state : boolean) {
        this.timeractivated = state;
    }

    protected createTimer() {
        this.currenttimer = setInterval(() => {
            if (this.timeractivated) {
                this.seekToValue(this.currentposition + this.onepercent);
            }
        }, this.onepercent)
    }

    protected deleteTimer() {
        if (this.currenttimer) {
            clearInterval(this.currenttimer);
            this.currenttimer = undefined;
        }
    }

}

class PlaybackController {
    sidebarentry : Element;
    currenttrack : string;
    currentseekpercentage : number;

    imgholder : HTMLImageElement;
    titleholder : HTMLSpanElement;
    infoholder : HTMLSpanElement;
    seekbar : SeekBar;
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
        this.seekbar = new SeekBar(<HTMLInputElement>this.sidebarentry.getElementsByClassName("scrubbar")[0]);
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
        this.timecurrent.innerText = "0:00";
        this.seekbar.seekToValue(0, 0);
    }

    play() {
        this.controls.children[2].children[0].innerHTML = "play_arrow";
        this.seekbar.toggleTimer(true);
        player.togglePlay();
    }

    pause() {
        this.controls.children[2].children[0].innerHTML = "pause";
        this.seekbar.toggleTimer(false);
        player.pause();
    }

    setCurrentTime(timestring : string) {
        this.timecurrent.innerHTML = timestring;
    }
}

var player : Spotify.SpotifyPlayer;
var playerid : string;
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

        player.addListener('ready', ({device_id}) => {
            playerid = device_id;
            //Take ownership of the playback
            let request = new SpotifyApiTransferPlaybackRequest([device_id], false);
            request.execute((result) => {
                initializePlayerUI(player);
            });
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
        playbackcontroller.seekbar.setParams(duration);
        playbackcontroller.seekbar.toggleTimer(true);
        let seconds = Math.round(duration / 1000);
        playbackcontroller.setDuration(secondsToTimeString(seconds));
    }
}

function secondsToTimeString(seconds : number) : string {
    let minutes = 0;
    while (seconds > 59) {
        seconds -= 60;
        minutes++;
    }
    let string = minutes + ":";
    if (seconds > 9) {
        string += seconds;
    } else {
        string += "0" + seconds;
    }
    return string;
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
    playbackcontroller.seekbar.seekToValue(position);
}