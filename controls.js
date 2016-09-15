'use strict';

const $player = document.getElementById('movie_player');
let autoReplay = false;

const settingsLine = document.createElement('DIV');
settingsLine.className = 'plain-youtube-controls js-plain-youtube-controls';
settingsLine.setAttribute('style', 'width: 20em; height: auto; color: #607D8B; ');
settingsLine.innerHTML = `
    <label><input type="checkbox" class="yt-controls-always-hd"/>Always HD</label>
    <label><input type="checkbox" class="yt-controls-replay"/>Auto Replay</label>
    `;

const hdCheckbox = settingsLine.querySelector('.yt-controls-always-hd');
const autoreplayCheckbox = settingsLine.querySelector('.yt-controls-replay');

hdCheckbox.addEventListener('change', function (e) {
    let toHD = e.target.checked;
    toHD && $player.setPlaybackQuality('highres');
});

autoreplayCheckbox.addEventListener('change', function (e) {
    autoReplay = e.target.checked;
});

$player.addEventListener('onStateChange', function(state) {
    if(state === 0 && autoReplay) {
        $player.seekTo(0);
    }
});

$player.parentNode.appendChild(settingsLine);

