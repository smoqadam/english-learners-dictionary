document.querySelector('form').addEventListener('submit', function(e){
    e.preventDefault();
    let settings = {
        "saveWords":document.querySelector('#save-word').checked,
        "showIcon":document.querySelector('#show-icon').checked,
        "hideWindow": document.querySelector('#hide-window').value * 1000 || 0,
    };
    chrome.storage.sync.set({settings});
    document.querySelector('#msg').innerHTML = "Saved";
    setTimeout(function(){
        document.querySelector('#msg').innerHTML = "";
    }, 2000);
});

document.addEventListener('DOMContentLoaded', function(){
    chrome.storage.sync.get('settings', function(res) {
        if (res.settings) {
            document.querySelector('#show-icon').checked = res.settings.showIcon;
            document.querySelector('#save-word').checked = res.settings.saveWords;
            document.querySelector('#hide-window').value = res.settings.hideWindow / 1000;
        }
    })
}, false)