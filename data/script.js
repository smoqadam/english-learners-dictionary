Dictionary.init();

document.querySelector(".tr-body").addEventListener('click', function (e) {
  e.stopPropagation();
});

document.querySelector('body').addEventListener('click', function (e) {
  Dictionary.hideWindow();
});

document.addEventListener("click", function (e) {
  if (e.target) {
    switch (e.target.className) {
      case "tr-search-wrapper":
        Dictionary.hideSearch();
        break;
      case "tr-button":
        e.preventDefault();
        Dictionary.fetchData();
        Dictionary.showPopup();
        break;
    }
  }
});
document.addEventListener('keydown', function(e){
    if (e.keyCode == 27) {
      Dictionary.hideSearch();
    }
  }, false)
document.addEventListener("keyup", function(e) {
    if (e.keyCode == 27)  {
        Dictionary.hideSearch();
    } else if (e.ctrlKey && e.shiftKey && e.keyCode == 79) {
        Dictionary.showSearch();
    } else if (e.keyCode == 13 && e.target && e.target.className == 'tr-input-search' ) {
        e.preventDefault();
        Dictionary.setWord(e.target.value);
        Dictionary.fetchData();
        Dictionary.hideSearch();
    }
});

document.querySelector('.tr-body').addEventListener('click', function (e) {
  if (e.target) {
    switch (e.target.className) {
      case "tr-close":
        Dictionary.hideWindow();
        break;
      case "syn":
        e.preventDefault();
        Dictionary.setWord(e.target.text);
        Dictionary.fetchData();
        break;
    }
  }
})

document.onmouseup = function (evt) {
  let selection;
  let s = document.getSelection(),
    bodyRect = document.body.getBoundingClientRect();
  if (s.rangeCount > 0) {
    r = s.getRangeAt(0);
    if (r && s.toString()) {
      let p = r.getBoundingClientRect();
      if (p.left || p.top) {
        selection = s.toString();
        Dictionary.setWord(selection);
        chrome.storage.sync.get("dict_settings", result => {
          if (result && result.dict_settings.showIcon == true) {
            Dictionary.showButton(p.top - bodyRect.top - 30, p.right);
          }
        });
      }
    }
  }
};

chrome.runtime.onMessage.addListener(function (req) {
  if (req.notFound) {
    Dictionary.hideLoading();
  } else {
    Dictionary.showLoading();
    Dictionary.fetchData();
  }
});
