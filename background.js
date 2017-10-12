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

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if ('copy' === request.event) {
            console.log(getClipboardData());
        }
        sendResponse({});
    });

setInterval(function () {
    var data = getClipboardData();
    console.log(data);
    // if (bgData !== data) {
    //     bgData = data;
    //     console.log(data);
    // }
}, 3000);