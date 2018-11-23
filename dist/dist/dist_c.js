const e=require("electron"),t=e.remote,s=t.BrowserWindow,r="production";var n,a,i="40918ae807d24a16a7f8217fa1f445c0",l="b1506d8d8edf447a816d773def58a1c3",o,c,u,h,d,m,p,g,y,b,f,E,_,L,T;class x{constructor(e,t,s){this.username=e,this.id=t,this.images=s}}class R{constructor(e,t,s,r){this.will_refresh=!0,this.access_token=e,this.refresh_token=t,this.expires_in=s,this.will_refresh=r,r&&this.refresh()}refresh(){let e=1e3*this.expires_in;this.refresher=setInterval(()=>{C(this.refresh_token,!0)},e)}set willRefresh(e){e!==this.will_refresh&&(this.will_refresh=e,e?this.refresh():clearInterval(this.refresher))}revoke(e){clearInterval(this.refresher),this.refresh(),this.access_token=e}}class k{constructor(e){this.authorizationCode=e}get authCode(){return this.authorizationCode}getAccessToken(){return this.expiringCredentials.access_token}}function v(){var e,t=["streaming","user-library-read","user-library-modify","user-read-birthdate","user-read-email","user-read-private","user-read-recently-played"].join(" ");t=encodeURIComponent(t),a="https://localhost/index.html";var r="https://accounts.spotify.com/authorize?client_id="+i+"&response_type=code&scope="+t+"&redirect_uri="+encodeURIComponent(a);(n=new s({show:!1})).on("close",()=>{n=null},!1),n.loadURL(r),n.show();var l=n.webContents;l.on("will-navigate",(e,t)=>{w(t)}),l.on("did-get-redirect-request",(e,t,s)=>{w(s)})}function w(e){var t=t=/code=([^&]*)/.exec(e)||null,s=t&&t.length>1?t[1]:null,r=/\?error=(.+)$/.exec(e);(s||r)&&n.destroy(),s&&(o=new k(s),C(s))}function C(e,t=!1){let s=new URLSearchParams;s.append("grant_type","authorization_code"),s.append("code",e),t&&(s.set("grant_type","refresh_token"),s.delete("code"),s.append("refresh_token",e)),s.append("redirect_uri",a),s.append("client_id",i),s.append("client_secret",l),fetch("https://accounts.spotify.com/api/token",{method:"POST",body:s.toString(),headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"}}).then(e=>{if(e.ok)return e.json()}).then(e=>{if(console.log("Authorized! Code = "+e.access_token),t)o.expiringCredentials.revoke(e.access_token);else{let t=new R(e.access_token,e.refresh_token,e.expires_in,!0);o.expiringCredentials=t,N(),P(),$e()}})}function N(){let e;new je(!0).execute(S)}function S(e){if(e.status==y.RESOLVED){let t=new x(e.result.display_name,e.result.id,e.result.images);c=t,document.getElementById("user_name").innerText=t.username,document.getElementById("user_picture").src=t.images[0].url}}function U(){u=document.getElementById("content")}function A(){}"debug"!==e.remote.process.argv[0]&&addLoadEvent(v),function(e){e.NO_REPEAT="off",e.REPEAT="context",e.REPEAT_ONCE="track"}(h||(h={}));class O{constructor(e){this.seekbar=e,this.seekbar.addEventListener("mouseup",e=>{let t=e.target.value,s=t*this.onepercent;this.seekToValue(s,t),d.seek(s)})}setParams(e){this.currentduration=e,this.onepercent=Math.round(e/100),this.currentposition=0,this.deleteTimer(),this.createTimer()}seekToValue(e,t){e<=this.currentduration?(this.currentposition=e,this.currentpercentage=t||Math.ceil(e/this.onepercent),p.setCurrentTime(H(Math.round(this.currentposition/1e3))),this.seekbar.value=this.currentpercentage.toString()):(this.currentpercentage=100,this.seekbar.value="100",p.setCurrentTime(p.timefull.innerHTML),this.deleteTimer())}toggleTimer(e){this.timeractivated=e}createTimer(){this.currenttimer=setInterval(()=>{this.timeractivated&&this.seekToValue(this.currentposition+this.onepercent)},this.onepercent)}deleteTimer(){this.currenttimer&&(clearInterval(this.currenttimer),this.currenttimer=void 0)}}class M{constructor(e){this.sidebarentry=e,this.imgholder=this.sidebarentry.getElementsByClassName("cover_img")[0],this.titleholder=this.sidebarentry.getElementsByClassName("title")[0],this.infoholder=this.sidebarentry.getElementsByClassName("artist_album")[0],this.seekbar=new O(this.sidebarentry.getElementsByClassName("scrubbar")[0]);let t=this.sidebarentry.getElementsByTagName("div"),s=t[0];this.controls=t[1],this.timecurrent=s.children[0],this.timefull=s.children[1];let r=this.controls.children;this.playbutton=r[2].children[0],this.playbutton.addEventListener("click",j),this.nextbutton=r[3].children[0],this.nextbutton.addEventListener("click",V),this.previousbutton=r[1].children[0],this.previousbutton.addEventListener("click",D),this.shufflebutton=r[0].children[0],this.shufflebutton.addEventListener("click",z),this.repeatbutton=r[4].children[0],this.repeatbutton.addEventListener("click",G)}setImg(e){this.imgholder.src=e}setTitle(e){this.titleholder.innerHTML=e,this.currenttrack=e}setArtistAlbum(e,t){let s=e+" - "+t;this.infoholder.innerHTML=s}setDuration(e){this.timefull.innerHTML=e}setNewParams(e){this.setImg(e.albumcoveruri),this.setTitle(e.name),this.setArtistAlbum(e.artists[0].name,e.albumname),this.timecurrent.innerText="0:00",this.seekbar.seekToValue(0,0)}play(){this.controls.children[2].children[0].innerHTML="play_arrow",this.seekbar.toggleTimer(!0),d.togglePlay()}pause(){this.controls.children[2].children[0].innerHTML="pause",this.seekbar.toggleTimer(!1),d.pause()}setCurrentTime(e){this.timecurrent.innerHTML=e}setShuffle(e){let t=this.shufflebutton;t.style.color=e?"#8BC34A":"#EEEEEE"}setRepeat(e){let t=this.repeatbutton;e==h.NO_REPEAT?(t.innerHTML="repeat",t.style.color="#EEEEEE"):e==h.REPEAT?(t.innerHTML="repeat",t.style.color="#8BC34A"):(t.innerHTML="repeat_one",t.style.color="#8BC34A")}}function P(){let e=document.createElement("script");e.src="https://sdk.scdn.co/spotify-player.js",document.body.appendChild(e),window.onSpotifyWebPlaybackSDKReady=(()=>{(d=new Spotify.Player({name:"JazzyTunes",getOAuthToken:e=>{e(o.getAccessToken())}})).on("account_error",({message:e})=>{alert("The account used to authorize does not have a valid Spotify Premium subscription!")}),d.addListener("ready",({device_id:e})=>{let t;m=e,new Se([e],!1).execute(e=>{I(d)})}),d.addListener("player_state_changed",e=>{if(e){let t=e.track_window.current_track;if(t.name!=p.currenttrack){let e={name:t.name,albumcoveruri:t.album.images[0].url,albumname:t.album.name,artists:t.artists},s;p.setNewParams(e),new He([t.id]).execute(B)}}}),d.connect()})}function I(e){let t=ut("Playback Controls");document.getElementById("sidebar").appendChild(t);let s=ht(t);p=new M(s)}function B(e){if(e.status==y.RESOLVED){let t=e.result.duration_ms;p.seekbar.setParams(t),p.seekbar.toggleTimer(!0);let s=Math.round(t/1e3);p.setDuration(H(s))}}function H(e){let t=0;for(;e>59;)e-=60,t++;let s=t+":";return s+=e>9?e:"0"+e}function j(e,t){d.getCurrentState().then(e=>{e.paused?p.play():p.pause()})}function V(e){d.nextTrack()}function D(e){d.previousTrack()}function q(e){d.seek(e),p.seekbar.seekToValue(e)}function z(){if(p.shuffling){let e;new Ue(!1).execute(e=>{e.status==y.RESOLVED&&p.setShuffle(!1)})}else{let e;new Ue(!0).execute(e=>{e.status==y.RESOLVED&&p.setShuffle(!0)})}p.shuffling=!p.shuffling}function G(){let e;p.repeat==h.NO_REPEAT?p.repeat=h.REPEAT:p.repeat==h.REPEAT?p.repeat=h.REPEAT_ONCE:p.repeat=h.NO_REPEAT,new Ae(p.repeat).execute(e=>{e.status==y.RESOLVED&&p.setRepeat(p.repeat)})}function Y(e,t){let s;new Oe(e,t).execute(e=>{console.log(e)})}!function(e){e[e.albums=0]="albums",e[e.artists=1]="artists",e[e.browse=2]="browse",e[e.recommendations=3]="recommendations",e[e.me=4]="me",e[e.users=5]="users",e[e.search=6]="search",e[e.tracks=7]="tracks",e[e["audio-analysis"]=8]="audio-analysis",e[e["audio-features"]=9]="audio-features"}(g||(g={})),function(e){e[e.UNRESOLVED=0]="UNRESOLVED",e[e.RESOLVING=1]="RESOLVING",e[e.RESOLVED=2]="RESOLVED",e[e.ERROR=3]="ERROR"}(y||(y={}));class J{constructor(e,t,s){this.status=y.UNRESOLVED,this.result=null,this.error=null,this.status=e,this.result=t,this.error=s}}class K{constructor(){this.baseURL="https://api.spotify.com/v1/"}parseOptions(e){let t="",s=e.keys(),r=e.length;for(var n=0;n<r;n++){let a=s[n]+"="+e[n];t+=a+=n<r-1?"&":""}return t}execute(e){fetch(this.url,{headers:{Authorization:"Bearer "+o.getAccessToken()}}).then(function(e){if(e.ok)return e.json();alert("Error!")}).then(function(t){let s;s=t.error?new J(y.ERROR,t.error,t.error_description):new J(y.RESOLVED,t),e(s)})}}class Q{constructor(e){this.baseURL="https://api.spotify.com/v1/",this.bodyJson=e}parseOptions(e){let t="",s=e.keys(),r=e.length;for(var n=0;n<r;n++){let a=s[n]+"="+e[n];t+=a+=n<r-1?"&":""}return t}execute(e){fetch(this.url,{method:"POST",headers:{Authorization:"Bearer "+o.getAccessToken(),"Content-Type":"application/json"},body:JSON.stringify(this.body)}).then(function(e){if(e.ok){var t=e.headers.get("content-type");return t&&t.includes("application/json")?e.json():{}}return e.json()}).then(function(t){let s;s=t.error?new J(y.ERROR,t.error,t.error_description):new J(y.RESOLVED,t),e(s)})}}class F{constructor(e){this.baseURL="https://api.spotify.com/v1/",this.bodyJson=e}parseOptions(e){let t="",s=e.keys(),r=e.length;for(var n=0;n<r;n++){let a=s[n]+"="+e[n];t+=a+=n<r-1?"&":""}return t}execute(e){fetch(this.url,{method:"PUT",headers:{Authorization:"Bearer "+o.getAccessToken(),"Content-Type":"application/json"},body:JSON.stringify(this.body)}).then(function(e){if(e.ok){var t=e.headers.get("content-type");return t&&t.includes("application/json")?e.json():{}}return e.json()}).then(function(t){let s;s=t.error?new J(y.ERROR,t.error,t.error_description):new J(y.RESOLVED,t),e(s)})}}class W{}class $ extends K{constructor(e,t){super(),this.url=this.baseURL+"albums/"+e+"?"+this.parseOptions(t)}}class X extends K{constructor(e,t){super(),this.url=this.baseURL+"albums/"+e+"/tracks?"+this.parseOptions(t)}}class Z extends K{constructor(e,t){super();let s=e.join(",");t.ids=s,this.url=this.baseURL+"albums/?"+this.parseOptions(t)}}class ee extends K{constructor(e){super(),this.url=this.baseURL+"artists/"+e}}class te extends K{constructor(e,t){super(),this.url=this.baseURL+"artists/"+e+"/albums?"+this.parseOptions(t)}}class se extends K{constructor(e,t){super(),this.url=this.baseURL+"artists/"+e+"/toptracks?country="+t}}class re extends K{constructor(e){super(),this.url=this.baseURL+"artists/"+e+"/related-artists"}}class ne extends K{constructor(e){super();let t=e.join(",");this.url=this.baseURL+"albums/?ids="+t}}class ae extends K{constructor(e,t){super(),this.url=this.baseURL+"browse/categories/"+e+"?"+this.parseOptions(t)}}class ie extends K{constructor(e,t){super(),this.url=this.baseURL+"browse/categories/"+e+"/playlists?"+this.parseOptions(t)}}class le extends K{constructor(e){super(),this.url=this.baseURL+"browse/categories?"+this.parseOptions(e)}}class oe extends K{constructor(e){super(),this.url=this.baseURL+"browse/featured-playlists?"+this.parseOptions(e)}}class ce extends K{constructor(e){super(),this.url=this.baseURL+"browse/new-releases?"+this.parseOptions(e)}}class ue extends K{constructor(e){super(),this.url=this.baseURL+"recommendations?"+this.parseOptions(e)}}class he extends K{constructor(e){super(),this.url=this.baseURL+"me/following/contains?"+this.parseOptions(e)}}class de extends K{constructor(e,t,s){super();let r=s.join(",");this.url=this.baseURL+"users/"+e+"/playlists/"+t+"/followers/contains?"+r}}class me extends F{}class pe extends F{}class ge extends W{}class ye extends W{}class be extends K{constructor(e){super(),e.length>1?this.url=this.baseURL+"me/albums/contains/"+e.join(","):this.url=this.baseURL+"me/albums/contains/"+e[0]}}class fe extends K{constructor(e){super(),e.length>1?this.url=this.baseURL+"me/tracks/contains/"+e.join(","):this.url=this.baseURL+"me/tracks/contains/"+e[0]}}class Ee extends K{constructor(e){super(),this.url=this.baseURL+this.parseOptions(e)}}class _e extends K{constructor(e){super(),this.url=this.baseURL+this.parseOptions(e)}}class Le extends W{constructor(e){super(),e.length>1?this.url=this.baseURL+"me/albums?ids="+e.join(","):this.url=this.baseURL+"me/abumns?ids="+e[0]}}class Te extends W{constructor(e){super(),e.length>1?this.url=this.baseURL+"me/tracks?ids="+e.join(","):this.url=this.baseURL+"me/abumns?ids="+e[0]}}class xe extends F{constructor(e){super(),e.length>1?this.url=this.baseURL+"me/albums?ids="+e.join(","):this.url=this.baseURL+"me/albums?ids="+e[0]}}class Re extends F{constructor(e){super(),e.length>1?this.url=this.baseURL+"me/tracks?ids="+e.join(","):this.url=this.baseURL+"me/abumns?ids="+e[0]}}class ke extends K{constructor(e){super(),this.url=this.baseURL+"audio-analysis/"+e}}class ve extends K{constructor(e){super(),this.url=this.baseURL+"me/top/"+e}}class we extends K{constructor(){super(),this.url=this.baseURL+"me/player/devices"}}class Ce extends K{constructor(e=20,t,s){super(),this.url=e>=1&&e<=50?t?this.baseURL+"me/player/recently-played?limit="+e+"&after="+t:s?this.baseURL+"me/player/recently-played?limit="+e+"&before="+s:this.baseURL+"me/player/recently-played?limit="+e:this.baseURL+"me/player/recently-played"}}class Ne extends F{constructor(e,t,s,r){if(super(),this.url=this.baseURL+"me/player/play",e){let e={context_uri:t,offset:{position:0}};s&&(e.offset.position=s),-1!==t.indexOf("artist")&&delete e.offset,this.body=e}else{let e={uris:r};this.body=e}}}class Se extends F{constructor(e,t=!1){super(),this.url=this.baseURL+"me/player";let s={device_ids:e,play:t};this.body=s}}class Ue extends F{constructor(e,t){super(),this.url=this.baseURL+"me/player/shuffle?state="+e.toString(),t&&(this.url+="&device_id="+t)}}class Ae extends F{constructor(e,t){super(),this.url=this.baseURL+"me/player/repeat?state="+e,t&&(this.url+="&device_id="+t)}}class Oe extends Q{constructor(e,t,s){super(),this.url=this.baseURL+"playlists/"+e+"?uris="+t.join(","),s&&(this.url+="&position"+s)}}class Me extends Q{constructor(e,t){super(),this.setBodyParams(JSON.stringify(t)),this.url=this.baseURL+"playlists/"+e}}class Pe extends Q{constructor(){super()}}class Ie extends K{constructor(e,t,s,r,n){super(),this.url=this.baseURL+"search?type=";let a=[];e&&a.push("album"),t&&a.push("artist"),s&&a.push("track"),r&&a.push("playlist"),this.url+=a.join(","),n&&(this.url+="&limit="+n)}buildGeneralQuery(e,t=!1,s=[],r=[]){this.query="q=",t?this.query+='"'+e.join("+")+'"':(this.query+=e.join("+"),s.length>0&&(this.query+="+NOT+"+s.join("+")),r.length>0&&(this.query+="+OR+"+r.join("+")))}buildFieldFilteredSearch(e){this.query+="q=",Object.keys(e).forEach(t=>{this.query+=t+":"+e[t].replace(" ","+")+"+"})}execute(e){""!==this.query&&"q="!==this.query?(this.url+="&"+this.query,super.execute(e)):e(new J(y.UNRESOLVED,null,{error:"Baldy formed request"}))}}class Be extends K{constructor(e){if(super(),e.length>1){let t=e.join(",");this.url=this.baseURL+"audio-features/"+t}else this.url=this.baseURL+"audio-features/"+e[0]}}class He extends K{constructor(e){if(super(),e.length>1){let t=e.join(",");this.url=this.baseURL+"tracks/"+t}else this.url=this.baseURL+"tracks/"+e[0]}}class je extends K{constructor(e,t){super(),this.url=e?this.baseURL+"me":this.baseURL+"users/"+t}}class Ve{constructor(e){this.SEPARATOR="&nbsp; | &nbsp;",this.domTargetsTracks=[],this.data=e,this.create(1)}create(e){if(1===e){let e=database.getElement("albumview"),t,s=new CustomElement(e.name,e.getContent()).getElement(null,!1).children[0];this.createHeader(),s.prepend(this.header);let r=document.getElementById("content");for(;r.firstElementChild!=r.lastElementChild;)r.removeChild(r.lastElementChild);this.domTargetMain=r.appendChild(s),this.domTargetImages=this.domTargetMain.firstChild.firstChild}else if(2===e){let e=document.createElement("div");e.className="albumenumeration";let s=this.domTargetMain.appendChild(e);for(var t=0;t<this.trackel.length;t++){let e,r,n={target:s.appendChild(this.trackel[t]),payload:{type:T.PLAY,contexttype:"album",contextparams:{offset:this.tracks[t].track_no},uri:this.data.uri}};this.domTargetsTracks.push(n)}this.create(3)}else if(3===e)for(var t=0;t<this.domTargetsTracks.length;t++){let e=this.domTargetsTracks[t].target,s=this.domTargetsTracks[t].payload,r=()=>{let e;new Ne(!0,s.uri,s.contextparams.offset-1).execute(()=>{})};this.attachListener("click",r,e),this.attachListener("mouseenter",Ge,e),this.attachListener("mouseout",Ye,e)}}attachListener(e,t,s){s.addEventListener(e,t)}createHeader(){let e=database.getElement("albumheader"),t=new CustomElement(e.name,e.getContent()),s=document.createElement("img");s.src=this.data.images[0],s.className="albumcover",s.slot="albumcover";let r=yt();r.innerHTML=this.data.name,r.className="maintext",r.slot="maintext",$clamp(r,{clamp:2,useNativeClamp:!0});let n=yt();n.innerHTML=Ke(this.data.type),n.className="type",n.slot="type";let a=yt();a.innerHTML=this.data.artists.join(", "),a.className="subtext_al",a.slot="subtext";let i=yt();i.innerHTML=Je(this.data.release)+this.SEPARATOR+this.data.tracks+" tracks"+this.SEPARATOR+this.data.duration,i.className="subsubtext",i.slot="subsubtext";let l=[s,n,r,a,i];t.populateSlots(l),this.header=t.getElement(null,!1),this.header.className="albumheader"}setTracks(e){this.tracks=e}setTracksElements(e){this.trackel=e}}function De(e){let t=e.items,s=[],r=[];for(var n=0;n<t.length;n++){let e=t[n],a={name:e.name,duration:e.duration_ms,features:[],track_no:e.track_number};s.push(a);let i=yt();i.innerHTML=a.name,i.className="trackdetail";let l=yt();l.innerHTML=H(Math.round(a.duration/1e3)),l.className="trackdetail";let o=database.getElement("albumtrack"),c=new CustomElement(o.name,o.getContent());c.populateSlots([i,l]);let u=c.getElement(null,!1);u.className="albumtrack",r.push(u)}b.setTracks(s),b.setTracksElements(r),b.create(2)}function qe(e){if(e.status==y.RESOLVED){let s=e.result,r=[];for(var t=0;t<s.artists.length;t++)r.push(s.artists[t].name);let n=[];for(var t=0;t<s.images.length;t++)n.push(s.images[t].url);let a={type:"album",name:s.name,artists:r,images:n,release:s.release_date,tracks:s.tracks.items.length,duration:0,uri:s.uri};b=new Ve(a),De(s.tracks)}}function ze(e){let t;new $(e,[]).execute(qe)}function Ge(e){let t=e.target;t&&(t.children[1].classList.add("front"),t.children[0].style.display="inline-block")}function Ye(e){let t=e.target;t&&(t.children[0].style.display="none",t.children[1].classList.remove("front"))}function Je(e){let t=e.split("-");t.reverse();let s="";for(var r=0;r<t.length;r++)r!=t.length-1?s+=t[r]+"-":s+=t[r];return s}function Ke(e){let t;return e.charAt(0).toUpperCase()+e.substr(1)}class Qe{constructor(e){this.entries=[],this.header=e;let t=database.getElement("homepage"),s=new CustomElement(t.name,t.getContent());s.populateSlots([e]),this.holder=s.getElement(null,!1).children[0]}addEntry(e,t){let s=document.createElement("slot");s.slot="homepage_entry_header",s.className="homepage_entry_header",s.innerHTML=e;let r=new Fe(s,t);r.create(),this.entries.push(r),this.entries[this.entries.length-1].domTarget=this.holder.appendChild(r.element)}}class Fe{constructor(e,t){this.content=[],this.header=e,this.content=t}create(){let e=database.getElement("homepage-entry"),t=new CustomElement(e.name,e.getContent()),s=document.createElement("div");for(var r of(s.className="homepage_entry_content",s.slot="homepage_entry_content",this.content))s.appendChild(r.element);t.populateSlots([this.header,s]),this.element=t.getElement(null,!1).children[0]}add(e){this.content.push(e),this.domTarget.children[2].appendChild(e.element).addEventListener("click",e.action.bind(e.actionpayload))}clear(){this.domTarget.children[2].innerHTML=""}}class We{constructor(e,t,s,r,n=!1){this.imageuri=e,this.label=t,this.loader=n,this.action=s,this.actionpayload=r,this.create()}create(){let e=document.createElement("img");e.src=this.imageuri,e.slot="homepage_entry_image",this.loader?e.classList.add("homepage_entry_image","spinning"):e.className="homepage_entry_image";let t=document.createElement("span");t.className="homepage_entry_label",t.slot="homepage_entry_label",t.innerHTML=this.label,this.imgelement=e,this.labelelement=t;let s=database.getElement("homepage-entry-single"),r=new CustomElement(s.name,s.getContent());r.populateSlots([e,t]),this.element=r.getElement(null,!1).children[0]}}function $e(){let e=document.createElement("span");e.slot="homepage_header_text",e.className="homepage_header_text",e.innerHTML=Ze()+" What would you like to listen to?";let t=new We("assets/images/album_spin.svg","Loading...",()=>{},null,!0),s;(f=new Qe(e)).addEntry("Your recently played tracks:",[t]),f.domTarget=document.getElementById("content").appendChild(f.holder),new Ce(5).execute(Xe)}function Xe(e){var t=0;for(var s of(console.log(e.result),f.entries[0].clear(),e.result.items)){let e=s.track,t=e.album.images[0].url,r={type:T.PLAY,uri:e.uri},n=new We(t,e.name,et,r,!1);f.entries[0].add(n)}}function Ze(){let e=new Date,t=e.getUTCHours()-e.getTimezoneOffset()/60;return t>=7&&t<12?"Good morning!":t>=12&&t<17?"Good afternoon!":t>=17&&t<23?"Good evening!":t>=23&&t<7?"Good night!":void 0}function et(){let e;new Ne(!1,null,null,[this.uri]).execute(e=>{})}!function(e){e[e.ALBUMS=0]="ALBUMS",e[e.ARTISTS=1]="ARTISTS",e[e.TRACKS=2]="TRACKS",e[e.PLAYLISTS=3]="PLAYLISTS"}(_||(_={}));class tt{constructor(e,t,s,r,n){this.categories=[],this.artists=e,this.albums=t,this.tracks=s,this.playlists=r,this.query=n}create(){let e=document.createElement("span");e.slot="search_results_header",e.className="search_results_header",e.innerHTML='Results for query "'+this.query+'"',this.header=e,this.categoryholder=document.createElement("div"),this.categoryholder.slot="search_results_categories",this.categoryholder.className="search_results_categories";let t=database.getElement("searchresults"),s=new CustomElement(t.name,t.getContent());this.celement=s}finalise(){this.celement.populateSlots([this.header,this.categoryholder]),this.element=this.celement.getElement(null,!1).children[0],this.categories.forEach(e=>{e.finalise(),this.element.children[1].appendChild(e.htmlelement)})}attach(){this.finalise();let e=document.getElementById("content"),t;for(;e.firstElementChild!=e.lastElementChild;)e.removeChild(e.lastElementChild);lt(e.appendChild(this.element))}addCategory(e){this.categories.push(e)}}class st{constructor(e,t,s,r){this.entries=[],this.categorytype=e,this.nexturl=r,this.element=t,this.header=s}addEntry(e){this.entries.push(e)}finalise(){let e=document.createElement("div");e.slot="search_results_category_entries",e.className="search_results_category_entries",this.entries.forEach(t=>{let s=e.appendChild(t.element)}),this.element.populateSlots([this.header,e]),this.htmlelement=this.element.getElement(null,!1).children[0],this.seemorebutton=this.htmlelement.getElementsByClassName("search_results_category_more")[0],this.seemorepayload={type:T.INTENT,contexttype:"moreresults",uri:this.nexturl},this.seemorebutton.addEventListener("click",function(){}.bind(this.seemorepayload))}}class rt{constructor(e,t,s,r,n,a){this.type=e,this.imageelement=s,this.labelelement=r,this.imageactionpayload=n,this.textactionpayload=a,this.customelement=t,this.element=t.getElement(null,!1).children[0]}}function nt(e){if(e.status==y.RESOLVED){let s=e.result.artists.items,r=e.result.albums.items,n=at("Artists"),a=at("Albums"),i=new st(_.ARTISTS,n.element,n.header,s.next);for(var t=0;t<s.length;t++){let e=document.createElement("img");e.slot="search_results_entry_image",e.className="search_results_entry_image",e.src="assets/images/ic_album_white_48px.svg",s[t].images.length>0&&(e.src=s[t].images[0].url);let r=document.createElement("span");r.slot="search_results_entry_label",r.className="search_results_entry_label",r.innerHTML=s[t].name;let n=database.getElement("search-results-entry"),a=new CustomElement(n.name,n.getContent());a.populateSlots([e,r,document.createElement("span")]);let l={type:T.PLAY,contexttype:"artist",uri:s[t].uri},o={type:T.INTENT,contexttype:"artist",uri:s[t].uri},c=new rt(_.ARTISTS,a,e,r,l,o);i.addEntry(c),c=null,delete{celement:a}.celement}let l=new st(_.ALBUMS,a.element,a.header,r.next);for(var t=0;t<r.length;t++){let e={type:T.PLAY,contexttype:"album",uri:r[t].uri},n={type:T.INTENT,contexttype:"album",uri:r[t].uri,id:r[t].id},a=document.createElement("img");a.slot="search_results_entry_image",a.className="search_results_entry_image",a.src="assets/images/ic_album_white_48px.svg",s[t].images.length>0&&(a.src=r[t].images[0].url),a.addEventListener("click",function(){console.log("DDD")}.bind(e));let i=document.createElement("span");i.slot="search_results_entry_label",i.className="search_results_entry_label",i.innerHTML=r[t].name,i.addEventListener("click",function(){console.log("HALLO")}.bind(n));let o=database.getElement("search-results-entry"),c=new CustomElement(o.name,o.getContent());c.populateSlots([a,i,document.createElement("span")]);let u=new rt(_.ALBUMS,c,a,i,e,n);l.addEntry(u),u=null,delete{celement:c}.celement}L.addCategory(i),L.addCategory(l)}}function at(e){let t=document.createElement("span");t.className="search_results_category_header",t.slot="search_results_category_header",t.innerHTML=e;let s=database.getElement("search-results-category"),r;return{element:new CustomElement(s.name,s.getContent()),header:t}}function it(e){if(e.status=y.RESOLVED){let r=e.result.tracks.items,n=e.result.playlists.items,a=at("Tracks"),i=at("Playlists");for(var t=new st(_.TRACKS,a.element,a.header,r.next),s=0;s<r.length;s++){let e=document.createElement("img");e.slot="search_results_entry_image",e.className="search_results_entry_image",e.src="assets/images/ic_album_white_48px.svg",r[s].album.images.length>0&&(e.src=r[s].album.images[0].url);let n=document.createElement("span");n.slot="search_results_entry_label",n.className="search_results_entry_label",n.innerHTML=r[s].name;let a=database.getElement("search-results-entry"),i=new CustomElement(a.name,a.getContent());i.populateSlots([e,n,document.createElement("span")]);let l={type:T.PLAY,contexttype:"track",uri:r[s].uri},o={type:T.INTENT,contexttype:"track",uri:r[s].uri},c=new rt(_.TRACKS,i,e,n,l,o);t.addEntry(c),c=null,delete{celement:i}.celement}L.addCategory(t),L.attach()}}function lt(e){let t,s=e.children[1].children;for(var r=0;r<L.categories.length;r++){let e,t=s[r].getElementsByClassName("search_results_category_entries")[0].children;for(var n=0;n<t.length;n++){let e=L.categories[r].entries[n],s=t[n];s.getElementsByClassName("search_results_entry_image")[0].addEventListener("click",function(){if("album"==this.contexttype||"artist"==this.contexttype){let e;new Ne(!0,this.uri,0,[]).execute(e=>{})}else{let e;new Ne(!1,null,null,[this.uri]).execute(e=>{})}}.bind(e.textactionpayload)),s.getElementsByClassName("search_results_entry_descriptor")[0].addEventListener("click",function(){"album"==this.contexttype&&ze(this.id)}.bind(e.textactionpayload))}}}function ot(e){if(""==e){let e=document.getElementById("content");for(;e.firstElementChild!=e.lastElementChild;)e.removeChild(e.lastElementChild);return}let t=e.split(" "),s=new Ie(!0,!0,!1,!1,4);s.buildGeneralQuery(t),s.execute(nt);let r=new Ie(!1,!1,!0,!0,10);r.buildGeneralQuery(t),r.execute(it),(L=new tt(!0,!0,!0,!0,e)).create()}addLoadEvent(()=>{document.getElementById("searchbox").addEventListener("keyup",e=>{E?(clearTimeout(E),E=setTimeout(()=>{ot(e.target.value)},200)):E=setTimeout(()=>{ot(e.target.value)},200)})}),function(e){e[e.PLAY=0]="PLAY",e[e.INTENT=1]="INTENT"}(T||(T={}));var ct=!1;function ut(e){let t=document.createElement("sidebar_element_header"),s=document.createElement("span");s.slot="header_text",s.innerHTML=e,t.appendChild(s);let r=document.createElement("span");r.slot="header_text",r.innerHTML=e,r.className="header_text";let n=[r],a=database.getElement("sidebar-element-header"),i=new CustomElement(a.name,a.content);i.populateSlots(n);let l=document.createElement("div");l.className="sidebar_entry",l.setAttribute("expanded","true"),(l=i.getElement(l)).children[0].children[0].addEventListener("click",e=>{let t=e.target;dt(t.parentNode.parentNode,t)});let o=document.createElement("div");return o.className="sidebar_entry_content",l.appendChild(o),l}function ht(e){let t=database.getElement("playback-controls-basic"),s=new CustomElement(t.name,t.content),r=e.getElementsByClassName("sidebar_entry_content")[0];return s.getElement(r)}function dt(e,t){if("true"===e.getAttribute("expanded")){for(var s=1;s<e.children.length;s++)e.children[s].setAttribute("originaldisplay",e.children[s].style.display),e.children[s].style.display="none";t.style.transform="rotate(180deg)",e.setAttribute("expanded","false")}else{for(var s=1;s<e.children.length;s++)e.children[s].style.display=e.children[s].getAttribute("originaldisplay");t.style.transform="rotate(0deg)",e.setAttribute("expanded","true")}}function mt(){let e=document.getElementById("volume_control"),t=document.getElementById("user_info"),s=document.getElementById("volume_controller");ct?(e.style.removeProperty("z-index"),e.style.removeProperty("flex-grow"),e.style.removeProperty("width"),e.classList.remove("volume_button_expanded")):(e.style.zIndex="999",e.classList.add("volume_button_expanded")),ct=!ct}function pt(e){let t=document.getElementById("volume_controller"),s=document.getElementById("volume_icon"),r=t.value;r>.5?s.innerHTML="volume_up":r>0&&r<.5?s.innerHTML="volume_down":0==r&&(s.innerHTML="volume_mute"),d.setVolume(r)}function gt(){let e=new Ie(!0,!0,!0,!0,10);e.buildGeneralQuery(["fefe","nicki"],!1),e.execute(e=>{console.log(e)})}function yt(){return document.createElement("span")}