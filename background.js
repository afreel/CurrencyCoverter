var base = "USD";
var target = "JPY";

var state = 0;

chrome.browserAction.onClicked.addListener(function(tab) {
  updateState();
  updateIcon();
  chrome.tabs.sendMessage(tab.id, {base: base, target: target, running: (state == 0 ? false : true)}, function(response) {
    // console.log(response);
  });
});

// when switching tabs, send the state to that tab's content script
chrome.tabs.onActivated.addListener(function(activeInfo) {
  console.log('activated');
  chrome.tabs.sendMessage(activeInfo.tabId, {base: base, target: target, running: (state == 0 ? false : true)}, function(response) {
    // ...
  });
});

// content script asking for state
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  chrome.tabs.sendMessage(sender.tab.id, {base: base, target: target, running: (state == 0 ? false : true)}, function(response) {
    // ...
  });
});

function updateState() {
  if (state == 0) {
    base = "USD";
    target = "JPY";
    state = 1;
  } else if (state == 1) {
    base = "JPY";
    target = "USD";
    state = 2;
  } else {
    state = 0;
  }
}

function updateIcon() {
  if (state == 0) {
    chrome.browserAction.setIcon({path:"icon128.png"});
  } else {
    chrome.browserAction.setIcon({path:"icon" + base + "to" + target + ".png"});
  }
}
