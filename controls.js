'use strict';

const $player = document.getElementById('movie_player');

let appState = {
    autoReplay: false,
    alwaysHD:   false
};

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
    if (appState.alwaysHD) {
        let bestQuality = $player.getAvailableQualityLevels()[0];
        $player.setPlaybackQuality(bestQuality);
    }
    saveAppState();
});

autoreplayCheckbox.addEventListener('change', function (e) {
    appState.autoReplay = e.target.checked;
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

$player.addEventListener('onStateChange', function (state) {
    if ($player.classList.contains('unstarted-mode')) return;
    appState.autoReplay && autoReplay(state);
    appState.alwaysHD && setBestQuality(state);    
    checkForVideoCrash(state);
});

// finally drawing controls
$player.parentNode.appendChild(settingsLine);

