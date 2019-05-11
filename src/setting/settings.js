document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();
  let dict_settings = {
    saveWords: document.querySelector("#save-word").checked,
    showIcon: document.querySelector("#show-icon").checked,
    hideWindow: document.querySelector("#hide-window").value * 1000 || 0
  };

  setdict_settings(dict_settings);

  document.querySelector("#msg").innerHTML = "Saved";
  setTimeout(function() {
    document.querySelector("#msg").innerHTML = "";
  }, 2000);
});

document.addEventListener(
  "DOMContentLoaded",
  function() {
    chrome.storage.sync.get("dict_settings", function(res) {
      var showIcon = true,
        saveWords = false,
        hideWindow = 0;
      if (res.dict_settings) {
        showIcon = res.dict_settings.showIcon;
        saveWords = res.dict_settings.saveWords;
        hideWindow = res.dict_settings.hideWindow / 1000;
      }
      document.querySelector("#show-icon").checked = showIcon;
      document.querySelector("#save-word").checked = saveWords;
      document.querySelector("#hide-window").value = hideWindow;
      setdict_settings({
        saveWords: saveWords,
        showIcon: showIcon,
        hideWindow: hideWindow
      });
    });
  },
  false
);

var setdict_settings = function(dict_settings) {
  chrome.storage.sync.set({ dict_settings });
};

