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
        appState.alwaysHD && $player.setPlaybackQuality('highres');
    } else {
        saveAppState();
    }
}

getInitialAppState();

hdCheckbox.addEventListener('change', function (e) {
    appState.alwaysHD = e.target.checked;
    appState.alwaysHD && $player.setPlaybackQuality('highres');
    saveAppState();
});

autoreplayCheckbox.addEventListener('change', function (e) {
    appState.autoReplay = e.target.checked;
    saveAppState();    
});

$player.addEventListener('onStateChange', function (state) {
    if ($player.classList.contains('unstarted-mode')) return;

    // replay if the playback is finished
    if (state === 0 && appState.autoReplay) {
        $player.seekTo(0);
    }

    // trying to reload vid every 3 sec if something went wrong
    if (state === -1) {
        setTimeout(function(){
            $player.loadVideoById({
                videoId: $player.getVideoData().video_id,
                startSeconds: $player.getCurrentTime()
            });
        }, 3000);
    }
});

// finally drawing controls
$player.parentNode.appendChild(settingsLine);

