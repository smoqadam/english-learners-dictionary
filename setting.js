class Settings {
    settings = {
        theme: 'dark',
        // saveWord: true,
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
    }

    get(key) {
        let value;
        let a = chrome.storage.sync.get("dict_settings", function (res) {
            value = res[key];
        });
        return value;
    }

    getAll(callback) {
        chrome.storage.sync.get("dict_settings", res => {
            this.settings = res['dict_settings'];
            callback(this.settings)
        });
    }
}

let setting = new Settings();

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    let form = new FormData(document.querySelector("form"));


    // setting.set('saveWord', parseInt(form.get('saveWord')));
    setting.set('theme', (form.get('theme')));
    setting.set('showIcon', parseInt(form.get('showIcon')));
    document.querySelector("#msg").innerHTML = "Saved";
    document.querySelector("#msg").style.opacity = 1;
    setTimeout(function () {
        document.querySelector("#msg").style.opacity = 0;
    }, 2000);
});
document.addEventListener(
    "DOMContentLoaded",
    function () {
        setting.getAll(function (res) {
            if (res['showIcon']) {
                document.querySelector("#show-icon-yes").checked = true;
            } else {
                document.querySelector("#show-icon-no").checked = true;
            }

            if (res['theme'] === 'dark') {
                document.querySelector("#theme-dark").checked = true;
            } else {
                document.querySelector("#theme-light").checked = true;
            }

            // if (res['saveWord']) {
            //     document.querySelector("#save-yes").checked = true;
            // } else {
            //     document.querySelector("#save-no").checked = true;
            // }
        });
    }, false);