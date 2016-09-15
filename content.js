// here we append our own script 
// to get an access to the global scope of the page

let s = document.createElement('script');
s.src = chrome.extension.getURL('controls.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);