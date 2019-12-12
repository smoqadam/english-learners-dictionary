class Settings {
  settings = {
      theme: 'dark',
      saveWord: true,
      showIcon: true,
  };

  constructor(settings) {
    if (settings !== null) {
      Object.assign(this.settings, settings);
      chrome.storage.sync.set(this.settings);
    }
    let $this = this;
    chrome.storage.sync.get("dict_settings", function (res) {
      $this.settings = res;
    });
  }

  set(key, value) {
    this.settings[key] = value;
    chrome.storage.sync.set({'dict_settings': this.settings});
    if (key == 'theme') {
      browser.tabs.query({
        currentWindow: true,
      }).then(function(tabs){
        for (let tab of tabs) {
          browser.tabs.sendMessage(
              tab.id,
              {theme: value}
          ).then(response => {
            console.log("Message from the content script:");
            console.log(response.response);
          }).catch(onError);
        }
      });
      // chrome.tabs.sendMessage(tabs[0].id, {theme: value});
    }
  }

  get(key) {
    let value ;
    let a= chrome.storage.sync.get("dict_settings", function (res) {
      value = res[key];
    });
    console.log({value});
    console.log({a});
    return value;
  }

  getAll(callback){
    chrome.storage.sync.get("dict_settings", res => {
      this.settings = res['dict_settings'];
      callback(this.settings)
    });
  }
}

let settings = new Settings();

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();
  let theme = (document.querySelector("#theme").checked ? 'dark' : 'light');
  console.log({theme})
  settings.set('saveWord', document.querySelector("#save-word").checked);
  settings.set('theme', theme);
  settings.set('showIcon', document.querySelector("#show-icon").checked);
  document.querySelector("#msg").innerHTML = "Saved";
  setTimeout(function () {
    document.querySelector("#msg").innerHTML = "";
  }, 2000);
});
//
document.addEventListener(
    "DOMContentLoaded",
    function () {
      settings.getAll(function (res) {
        console.log({res});
        document.querySelector("#show-icon").checked = res['showIcon'];
        document.querySelector("#save-word").checked = res['saveWord'];
        document.querySelector("#theme").checked = res['theme'] === 'dark';
      });

      console.log(settings.get('theme'), '');
      console.log({
        s: settings.settings
      })
    }, false);