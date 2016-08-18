var base = "USD";
var target = "JPY";
var rate;

var running = true;

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {base: base, target: target, rate: rate, running: running}, function(response) {
    // console.log(response);
  });
});

// when switching tabs, send the state to that tab's content script
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.sendMessage(activeInfo.tabId, {base: base, target: target, rate: rate, running: running}, function(response) {
    // ...
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request.name);
  switch(request.name) {
    case "popupStartup":
      sendResponse({base: base, target: target});
      break;
    case "popupChange":
      if (base != request.base || target != request.target) {
        base = request.base;
        target = request.target;
        updateRate(base, target, function(r) {
          rate = r;
          console.log('from ' + base + ' to ' + target + ': ' + rate);
          var message = {base: base, target: target, rate: r, running: true};
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
        sendResponse({base: base, target: target, rate: r, running: true});
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
      console.log(thrownError);
      return null;
    }
  });
}
