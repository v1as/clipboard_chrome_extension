import * as moment from 'moment';
import * as $ from 'jquery';

chrome.storage.sync.get('sessions', function (data) {
    let sessions: any[] = data['sessions'] || [];
    let text = '';
    console.log(sessions);
    for (let session of sessions) {
        console.log(session);
        let queries: string[] = session['queries'] || [''];
        let query = queries[queries.length - 1];
        let temp = '<div style="border: 1px solid black; margin: 10px"> query:' + query;
        for (let data of session['clipboardData']) {
            temp += '<div style="border: 1px solid black; margin: 10px"> data: ' + data + '</div>';
        }
        temp += '</div>';
        text += temp;
    }
    $('#sessions').html(text);
});

// let count = 0;
//
// $(function() {
//   const queryInfo = {
//     active: true,
//     currentWindow: true
//   };
//
//   chrome.tabs.query(queryInfo, function(tabs) {
//     $('#url').text(tabs[0].url);
//     $('#time').text(moment().format('YYYY-MM-DD HH:mm:ss'));
//   });
//
//   chrome.browserAction.setBadgeText({text: '' + count});
//   $('#countUp').click(()=>{
//     chrome.browserAction.setBadgeText({text: '' + count++});
//   });
//
//   $('#changeBackground').click(()=>{
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {
//         color: '#555555'
//       },
//       function(msg) {
//         console.log("result message:", msg);
//       });
//     });
//   });
// });
