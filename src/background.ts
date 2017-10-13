import MessageSender = chrome.runtime.MessageSender;
import Tab = chrome.tabs.Tab;

const SEARCH_URL_REGEXP = /https:\/\/www\.google\.ru\/search\?q=([^&]+)&.+/i;

let tabs: { [key: number]: TabLink } = {};
let searchSessions: SearchSession[] = [];

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
            let tab: TabLink = tabs[sender.tab.id];
            while (tab && tab.type != TabType.SEARCH && tab.openerTabId) {
                tab = tab.openerTabId && tabs[tab.openerTabId];
            }
            if (tab && TabType.SEARCH == tab.type) { //todo if we close search tab nothing saved
                let qs = tab.searchSession.queries;
                tab.searchSession.clipboardData.push(getClipboardData());
                chrome.storage.sync.set({'sessions': searchSessions}, function () {
                    console.log('Sessions updated' + JSON.stringify(searchSessions));
                });
                console.log('added to search session for query: ' + qs[qs.length - 1]);
            }
            // console.log('[' + sender.tab.openerTabId + '; ' + sender.tab.id + '] ' + getClipboardData());
        }
        sendResponse({});
    });

chrome.tabs.onCreated.addListener(function (tab: Tab) {
    tabs[tab.id] = new TabLink(TabType.TAB, tab.id, tab.openerTabId);
    console.log('Created tab ' + tab.id);
});

chrome.tabs.onRemoved.addListener(function (tabId: number) {
    tabs[tabId] && delete tabs[tabId];
    console.log('Removed tab ' + tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    console.log('Updated tab ' + tabId);
    let url = changeInfo.url;
    tabs[tabId].url = url;
    if (changeInfo.status === 'loading' && url) {
        let res;
        if (res = url.match(SEARCH_URL_REGEXP)) {
            let query = decodeURIComponent(res[1]).replace(/\+/g, ' ');
            let tab = tabs[tabId];
            if (tabId && !tab) {
                let tabLink = new TabLink(TabType.SEARCH, tabId, null);
                tabLink.searchSession = new SearchSession();
                tabLink.searchSession.queries.push(query);
                tabs[tabId] = tabLink;
                searchSessions.push(tabLink.searchSession);
            } else if (tab && tabId) {
                if (tab.type == TabType.TAB) {
                    tab.type = TabType.SEARCH;
                    tab.searchSession = new SearchSession();
                    searchSessions.push(tab.searchSession);
                }
                tab.searchSession.queries.push(query);
            }
            console.log(tabId + ';' + query);
        }
    }
});

enum TabType {
    SEARCH, TAB
}

class TabLink {
    private _url: string;
    private _type: TabType;
    private _tabId: number;
    private _openerTabId: number;
    private _searchSession: SearchSession;


    constructor(type: TabType, tabId: number, openerTabId: number) {
        this._type = type;
        this._tabId = tabId;
        this._openerTabId = openerTabId;
    }


    get type(): TabType {
        return this._type;
    }

    set type(value: TabType) {
        this._type = value;
    }

    get tabId(): number {
        return this._tabId;
    }

    get openerTabId(): number {
        return this._openerTabId;
    }


    get url(): string {
        return this._url;
    }

    set url(value: string) {
        this._url = value;
    }

    get searchSession(): SearchSession {
        return this._searchSession;
    }

    set searchSession(value: SearchSession) {
        this._searchSession = value;
    }
}


class SearchSession {
    public queries: string[] = [];
    public clipboardData: string[] = [];
}
