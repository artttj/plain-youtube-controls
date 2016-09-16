/*
    The Content script has own limited context, 
    so we need an access for outer scope to use Player object's methods.
    To make it possible, we append external script to the page's head.
*/

/* 
    First step: 
       We check loaded page for Player element availablitiy.
       If so, external script uses it as a constant.
    Plan B:
       We are waiting for Player element availability
       using js lib with Mutation Observers
       and then loading external script.
*/

let playerExists = !!document.getElementById('movie_player');
playerExists 
    ? appendControlsScript() 
    : this.ready('#movie_player', appendControlsScript);

function appendControlsScript () {
    let s = document.createElement('script');
    s.src = chrome.extension.getURL('controls.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}