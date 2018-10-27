//All the actions to be executed on window load go here
window.onload = () => {
    if (!checkCredentials()) {
        document.getElementById("authorize").addEventListener("click", startAuthProcess);
    } else {
        startAuthProcess();
    }
    setupCustomElements();
}

function init() {
    //Go ahead for player initialization
    if (!settings.has('access_granted')) {
        settings.set('access_granted', true);
    }
    document.getElementById("content").innerHTML = "";
    if (SDKReady) {
        initializePlayer();
    } else {
        //Try again in 1 second
        setTimeout(retryInitPlayer, 1000);
    }
}

function retryInitPlayer() {
    if (SDKReady) {
        initializePlayer();
    } else {
        setTimeout(retryInitPlayer, 1000);
    }
}