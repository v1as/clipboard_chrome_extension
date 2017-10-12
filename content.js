// on copy event, send a message to background.js
function onCopy(e) {
    chrome.extension.sendRequest({event: "copy"});
}

//register event listener for copy events on document
document.addEventListener('copy', onCopy, true);
var links = document.getElementsByTagName('a');
Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (event) {
        console.log(link.getAttribute('href'));
    });
});