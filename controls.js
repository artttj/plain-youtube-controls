'use strict';

const $player = document.getElementById('movie_player');

let appState = {
    autoReplay: false,
    alwaysHD:   false
};

let curVideoId = false;

const timingInterval = setInterval(function(){
    localStorage.setItem(
        'ytc_' + $player.getVideoData().video_id, 
        $player.getCurrentTime()
    );
}, 3000);

// control panel template
const settingsLine = document.createElement('DIV');
settingsLine.className = 'plain-youtube-controls js-plain-youtube-controls';
settingsLine.setAttribute('style', 'width: 20em; height: auto; color: #607D8B; ');
settingsLine.innerHTML = `
    <label><input type="checkbox" class="yt-controls-replay"/>Auto Replay</label>
    <label><input type="checkbox" class="yt-controls-always-hd"/>Always HD</label>
    `;

const hdCheckbox = settingsLine.querySelector('.yt-controls-always-hd');
const autoreplayCheckbox = settingsLine.querySelector('.yt-controls-replay');

function saveAppState() {
    localStorage.setItem('plain_yt_controls', JSON.stringify(appState));
}

function getInitialAppState() {
    let storageAppSate = localStorage.getItem('plain_yt_controls');
    if (storageAppSate) {
        appState = JSON.parse(storageAppSate);
        hdCheckbox.checked = appState.alwaysHD;
        autoreplayCheckbox.checked = appState.autoReplay;
    } else {
        saveAppState();
    }
}

getInitialAppState();

hdCheckbox.addEventListener('change', function (e) {
    appState.alwaysHD = e.target.checked;
    listenPlayerState();
    saveAppState();
});

autoreplayCheckbox.addEventListener('change', function (e) {
    appState.autoReplay = e.target.checked;
    listenPlayerState();
    saveAppState();    
});

function autoReplay(state) {
    let isInPlaylist = ~$player.getPlaylistIndex();
    // replay if the playback is finished
    if (state === 0) {
        $player.seekTo(0);
    }

    if (isInPlaylist) {
        let playbackInterval;
        if (state === 1) {
            let duration = Math.floor($player.getDuration() * 1000);
            playbackInterval = setInterval(function(){
                let curTime = Math.floor($player.getCurrentTime() * 1000);
                if (curTime + 200 > duration) {
                    $player.seekTo(0);
                    clearInterval(playbackInterval);
                }
            }, 100);
        } else {
            clearInterval(playbackInterval);
        }       
    }    
}

function setBestQuality(state) {
    if (state === 1) {
        let bestQuality = $player.getAvailableQualityLevels()[0];
        $player.setPlaybackQuality(bestQuality);
    }
}

// trying to reload vid every 3 sec if something went wrong
function checkForVideoCrash(state) {
    if (state === -1) {
        setTimeout(function(){
            $player.loadVideoById({
                videoId: $player.getVideoData().video_id,
                startSeconds: $player.getCurrentTime()
            });
        }, 3000);
    }    
}

function getVideoTiming(state) {
    if(state === 1 && curVideoId !== $player.getVideoData().video_id) {
        let lastTime = localStorage.getItem('ytc_' + $player.getVideoData().video_id);    
        lastTime && $player.seekTo(lastTime);
        curVideoId = $player.getVideoData().video_id;       
    }
}

function checkState(state) {
    if ($player.classList.contains('unstarted-mode')) return;
    getVideoTiming(state);
    appState.autoReplay && autoReplay(state);
    appState.alwaysHD && setBestQuality(state);    
    checkForVideoCrash(state);
}

function listenPlayerState() {
    $player.removeEventListener('onStateChange');    
    $player.addEventListener('onStateChange', checkState);
}

listenPlayerState();

// finally drawing controls
$player.parentNode.appendChild(settingsLine);

