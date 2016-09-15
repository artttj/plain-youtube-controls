// It matches URLs like: http[s]://[...]stackoverflow.com[...]
//var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com/;
// A function to use as callback
// function doStuffWithDom(domContent) {
//     console.log('I received the following DOM content:\n' + domContent);
// }
// chrome.tabs.onActivated.addListener(function(activeInfo) {
//   var activeTabId = activeInfo.tabId;
//   console.log(activeTabId)
// });

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//     chrome.tabs.sendMessage(tabs[0].id, {text: 'report_back'}, doStuffWithDom);
// });
// chrome.runtime.onMessage.addListener(function(request, sender, callback) {
//     console.log(request)
// })

// chrome.tabs.getSelected(null, function(tab){
//     chrome.tabs.executeScript(tab.id, {code: "alert('test');"}, function(response) {
        
//     });
// });

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//     chrome.tabs.executeScript(tabs[0].id, {code: "alert('test');"}, function(response) {
//     });
// });