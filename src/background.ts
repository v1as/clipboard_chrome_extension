import MessageSender = chrome.runtime.MessageSender;

const SEARCH_URL_REGEXP = /https:\/\/www\.google\.ru\/search\?q=([^&]+)&.+/i;

function getClipboardData() {
    let bg = chrome.extension.getBackgroundPage();        // get the background page
    bg.document.body.innerHTML = "";                   // clear the background page

// add a DIV, contentEditable=true, to accept the paste action
    let helperdiv = bg.document.createElement("div");
    document.body.appendChild(helperdiv);
    helperdiv.contentEditable = 'true';

// focus the helper div's content
    let range = document.createRange();
    range.selectNode(helperdiv);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    helperdiv.focus();

// trigger the paste action
    bg.document.execCommand("Paste");

// read the clipboard contents from the helperdiv
    return helperdiv.innerHTML;
}

chrome.extension.onRequest.addListener(
    function (request, sender: MessageSender, sendResponse) {
        if ('copy' === request.event) {
            console.log('[' + sender.tab.openerTabId + '; ' + sender.tab.id + '] ' + getClipboardData());
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
        if (res = url.match(SEARCH_URL_REGEXP)) {
            var query = decodeURIComponent(res[1]).replace(/\+/g, ' ');
            console.log(tabId + ';' + query);
        }
    }
});