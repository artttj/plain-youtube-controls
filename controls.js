'use strict';

const $player = document.getElementById('movie_player');

// control panel template
const settingsLine = document.createElement('DIV');
settingsLine.className = 'plain-youtube-controls js-plain-youtube-controls';
settingsLine.setAttribute('style', 'width: 30em; height: auto; color: #607D8B; ');
settingsLine.innerHTML = `
    <label><input type="checkbox" class="yt-controls-replay"/>Auto Replay</label>
    <label><input type="checkbox" class="yt-controls-always-hd"/>Always HD</label>
    <label><input type="checkbox" class="yt-controls-store-history"/>Remember Time</label>    
    `;

const hdCheckbox = settingsLine.querySelector('.yt-controls-always-hd');
const autoreplayCheckbox = settingsLine.querySelector('.yt-controls-replay');
const storehistoryCheckbox = settingsLine.querySelector('.yt-controls-store-history');

let appState = {
    autoReplay: false,
    alwaysHD:   false,
    storeHistory: false,
};

let curVideoId = false;
let timingInterval;

function saveAppState() {
    localStorage.setItem('plain_yt_controls', JSON.stringify(appState));
}

function getInitialAppState() {
    let storageAppSate = localStorage.getItem('plain_yt_controls');
    if (storageAppSate) {
        appState = JSON.parse(storageAppSate);
        hdCheckbox.checked = appState.alwaysHD;
        autoreplayCheckbox.checked = appState.autoReplay;
        storehistoryCheckbox.checked = appState.storeHistory;        
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

storehistoryCheckbox.addEventListener('change', function (e) {
    appState.storeHistory = e.target.checked;
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
    if (state === 1 && curVideoId !== $player.getVideoData().video_id) {
        const video = JSON.parse(localStorage.getItem('ytc_' + $player.getVideoData().video_id));
        video && $player.seekTo(video.lastTime);
        curVideoId = $player.getVideoData().video_id;       
    }
    clearInterval(timingInterval);
    timingInterval = setInterval(function(){
        if (state === 0 || !$player.getCurrentTime() || $player.classList.contains('unstarted-mode')) return;
        localStorage.setItem(
            'ytc_' + $player.getVideoData().video_id, 
            JSON.stringify({lastTime: $player.getCurrentTime(), t: Date.now()})
        );
    }, 3000);
    if (state === 0) {
        localStorage.removeItem('ytc_' + $player.getVideoData().video_id);
    }
}

function checkState(state) {
    if ($player.classList.contains('unstarted-mode')) return;
    cleanOldVideoTimings();
    appState.storeHistory && getVideoTiming(state);
    appState.autoReplay && autoReplay(state);
    appState.alwaysHD && setBestQuality(state);    
    checkForVideoCrash(state);
}

function listenPlayerState() {
    $player.removeEventListener('onStateChange');    
    $player.addEventListener('onStateChange', checkState);
}

function cleanOldVideoTimings() {
  const MILLISECONDS_IN_MONTH = 2592000000; // 30 * 24 * 60 * 60 * 1000
  const NOW = Date.now();
  for (let key in localStorage) {
    if (key.includes('ytc_')) {
      let {t} = JSON.parse(localStorage.getItem(key));
      if (NOW - t > MILLISECONDS_IN_MONTH) localStorage.removeItem(key);
    }
  }
}

listenPlayerState();

// finally drawing controls
$player.parentNode.appendChild(settingsLine);

