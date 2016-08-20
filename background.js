var base = "USD";
var target = "JPY";
var rate;

var running = false;

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {base: base, target: target, rate: rate, running: running}, function(response) {
    // ...
  });
});

// when switching tabs, send the state to that tab's content script
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.sendMessage(activeInfo.tabId, {base: base, target: target, rate: rate, running: running}, function(response) {
    // ...
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.name) {
    case "popupStartup":
      sendResponse({base: base, target: target, running: running});
      break;
    case "popupChange":
      if (base != request.base || target != request.target) {
        base = request.base;
        target = request.target;
        updateRate(base, target, function(r) {
          rate = r;
          var message = {base: base, target: target, rate: r, running: running};
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, message);
            }
          });
        });
      }
      break;
    case "contentScriptStartup":
      updateRate(base, target, function(r) {
        rate = r;
        sendResponse({base: base, target: target, rate: r, running: running});
      });
      break;
    case "toggle":
      running = request.running;
      if (running) {
        chrome.browserAction.setIcon({path: "images/icon128.png"});
      } else {
        chrome.browserAction.setIcon({path: "images/icon128off.png"});
      }
      var message = {base: base, target: target, rate: rate, running: running};
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });
      break;
    default:
      // handle other messages
      break;
  }
  return true;
});

function updateRate(b, t, callback) {
  $.ajax({
    type: "GET",
    url: "http://rate-exchange.herokuapp.com/fetchRate?from=" + b + "&to=" + t,
    dataType: "json",
    success: function(data) {
      callback(data.Rate);
    },
    error: function (xhr, ajaxOptions, thrownError) {
      return null;
    }
  });
}
