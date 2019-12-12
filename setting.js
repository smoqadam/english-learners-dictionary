    config = {
        theme: 'dark',
        // saveWord: true,
        showIcon: true,
    };
    //
    function init(settings) {
        chrome.storage.sync.get("dict_settings", function (res) {
            config = res;
        });
    }

    function set(key, value) {
        config[key] = value;
        chrome.storage.sync.set({'dict_settings': config});
    }

    function get(key) {
        let value;
        let a = chrome.storage.sync.get("dict_settings", function (res) {
            value = res[key];
        });
        return value;
    }

    function getAll(callback) {
        chrome.storage.sync.get("dict_settings", res => {
            config = res['dict_settings'];
            callback(config)
        });
    }

document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();

    let form = new FormData(document.querySelector("form"));


    // setting.set('saveWord', parseInt(form.get('saveWord')));
    set('theme', (form.get('theme')));
    set('showIcon', parseInt(form.get('showIcon')));
    document.querySelector("#msg").textContent = "Saved";
    document.querySelector("#msg").style.opacity = 1;
    setTimeout(function () {
        document.querySelector("#msg").style.opacity = 0;
    }, 2000);
});
document.addEventListener(
    "DOMContentLoaded",
    function () {
        getAll(function (res) {
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