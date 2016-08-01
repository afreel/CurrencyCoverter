chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {method: "getSelection"}, function(response) {
    console.log(response);
  });
});
