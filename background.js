// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
// var a = request.site; // данные о сайте
// var b = request.time; // данные о проведенном времени
// // тут делаем с этими данными что хотим.
//   });

function getClipboardData() {
    bg = chrome.extension.getBackgroundPage();        // get the background page
    bg.document.body.innerHTML = "";                   // clear the background page

// add a DIV, contentEditable=true, to accept the paste action
    var helperdiv = bg.document.createElement("div");
    document.body.appendChild(helperdiv);
    helperdiv.contentEditable = true;

// focus the helper div's content
    var range = document.createRange();
    range.selectNode(helperdiv);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    helperdiv.focus();

// trigger the paste action
    bg.document.execCommand("Paste");

// read the clipboard contents from the helperdiv
    return helperdiv.innerHTML;
}

var searchQueries = [];
var searchUrlRegexp = /https:\/\/www\.google\.ru\/search\?q=([^&]+)&.+/i;

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if ('copy' === request.event) {
            console.log(getClipboardData());
        }
        sendResponse({});
    });

chrome.tabs.onCreated.addListener(function (data) {
    console.log('created' + new Date());
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    var url = changeInfo.url;
    if (changeInfo.status === 'loading' && url) {
        var res;
        if (res = url.match(searchUrlRegexp)) {
            var query = decodeURIComponent(res[1]).replace(/\+/g, ' ');
            console.log(query);
        }
    }
});
// chrome.tabs.onReplaced.addListener(function (data) {
//     console.log('replaced' + new Date());
// });