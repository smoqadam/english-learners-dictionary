const MENU_ID = "translate-selected-text";
var browser = browser || chrome;
browser.contextMenus.create({
  id: MENU_ID,
  title: "Translate",
  contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case MENU_ID:
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        function(tabs) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {showLoading: true});
            });
        }
      );
  }
});

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse){
    get(req.word).then(function(ee){
        sendResponse(ee);
    });
    return true;
});

var get = function(word) {
  return fetch("https://dict.smoqadam.me/?define=" + word).then(
    response => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Something went wrong on api server!");
      }
    }
  )
  .then(json => {
      return json[0];
  })
  .catch(err => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {notFound: true});
    });
  });
};
