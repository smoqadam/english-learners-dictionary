let Dictionary = (function () {
  function _(selector) {
    return document.querySelector(selector);
  }
  function _search (text) {
    let searchWp = _createElement('div', 'tr-search-wrapper');
    searchWp.style.display = "none";
    let search = _createElement('div', 'tr-search');
    let input = _createElement('input', 'tr-input-search');
    input.addEventListener('keydown', function(e){
      if (e.keyCode == 27) {
        Dictionary.hideSearch();
      }
    })
    search.appendChild(input);
    searchWp.appendChild(search);
    return searchWp;
  }
  function _createElement(tag, className, html) {
    var elm = document.createElement(tag);
    elm.className = className;
    if (html) elm.innerHTML = html;
    return elm;
  }

  function _createButton() {
    var wrapper = _createElement('div', 'tr-wrapper');
    wrapper.style.display = "none";
    var btn = _createElement('div', 'tr-button');
    var btnImgURL = chrome.extension.getURL("icons/dictionary-32.png");
    btn.style.backgroundImage = "url('" + btnImgURL + "')";
    btn.style.backgroundPosition = "0% 0%";
    btn.style.backgroundRepeat = "no-repeat";
    btn.style.backgroundSize = "24px 24px";
    btn.addEventListener('click', function (e) {
      console.log('a');
      e.preventDefault();
      Dictionary.fetchData();
      Dictionary.showPopup();
    });
    wrapper.appendChild(btn);
    return wrapper;
  }

  function _createBody() {
    let defs = _createElement('ul', 'tr-defs');
    let header = _createElement('div', 'tr-header');
    let defWrapper = _createElement('div', 'tr-def-wrapper');
    defWrapper.appendChild(header);
    defWrapper.appendChild(defs);
    let body = _createElement('div', 'tr-body');
    body.appendChild(defWrapper);
    let window = _createElement('div', 'tr-window');
    window.appendChild(body);
    return window;
  }

  function _createLoading() {
    let loading = _createElement('div', 'tr-loading', 'Please wait...');
    var loadingImgURL = chrome.extension.getURL("icons/loading.gif");
    loading.style.backgroundImage = "url('" + loadingImgURL + "')";
    loading.style.backgroundPosition = "7px center";
    loading.style.backgroundRepeat = "no-repeat";
    loading.style.backgroundSize = "13px";
    loading.style.backgroundColor = "#2092cc";
    return loading;
  }

  function _header(data) {
    var header = _createElement('div', 'tr-header');
    var trWord = _createElement('span', 'tr-word', data.word);
    var trPhon = _createElement('span', 'tr-pron', data.phonetic);
    
    header.appendChild(trWord);
    header.appendChild(trPhon);
    return header;
  }

  return {
    init: function () {
      this.selection = "";
      _('body').appendChild(_createBody());
      _('body').appendChild(_createButton());
      _('body').appendChild(_createLoading());
      _('body').appendChild(_search());
      this.hideButton();
    },
    showButton: function (top, left) {
      _('.tr-wrapper').style.top = top + "px";
      _('.tr-wrapper').style.left = left + "px";
      _('.tr-wrapper').style.display = "table-cell";
    },
    hideButton: function () {
      _(".tr-wrapper").style.display = "none";
    },
    showWindow: function () {
      _('.tr-body').style.display = " block";
    },
    hideWindow: function () {
      _('.tr-body').style.display = " none";
    },
    showLoading: function () {
      _('.tr-loading').style.display = " block";
    },
    hideLoading: function () {
      _('.tr-loading').style.display = " none";
    },
    setWord: function (selection) {
      this.selection = selection;
    },
    showSearch: function() {
      _('.tr-search-wrapper').style.display = "inline-block";
      let input = _('.tr-search-wrapper').querySelector('input');
      input.focus();
      input.value = "";
    },
    hideSearch: function() {
      _('.tr-search-wrapper').style.display = "none";
    },
    setData: function (data) {
      this.data = data;
    },
    fetchData: function () {
      if (this.selection !== "") {
        this.hideButton();
        this.hideWindow();
        this.showLoading();
        var $this = this;
        var selection = this.selection;
        chrome.storage.sync.get(selection, res => {
          if (res[selection]) {
            $this.showPopup(res[this.selection]);
          } else {
            chrome.runtime.sendMessage({ word: this.selection }, function (result) {
              $this.showPopup(result);
            });
          }
        });
      }
    },
    showPopup: function (response) {
      if (response) {
        _('.tr-window').style.display = "block";
        let header = _header(response);
        _('.tr-window').querySelector('.tr-def-wrapper').querySelector('.tr-header').innerHTML = header.innerHTML;
        let defs = _createElement('ul', 'defs');
        for ([index, meaning] of Object.entries(response.meaning)) {
          meaning.forEach(function (m) {
            let def = _createElement('li', 'tr-def', '<div class="tr-def">' + m.definition + '</div>');
            if (m.example) {
              let example = _createElement('span', 'examples', '<strong>Example:</strong> ' + m.example);
              def.appendChild(example);
            }
            if (m.synonyms && m.synonyms.length > 0) {
              var syns = m.synonyms.map(function (item) {
                return '<a href="#" class="syn">' + item + "</a>";
              });
              let synonyms = _createElement('span', 'synonyms', '<strong>Synonyms:</strong> ' + syns.join(" "));
              def.appendChild(synonyms);
            }
            defs.appendChild(def);
          });
        }
        _('body').querySelector('.tr-body ul.tr-defs').innerHTML = defs.innerHTML;
        this.hideLoading();
        this.showWindow();
        chrome.storage.sync.get("dict_settings", result => {
          if (result.dict_settings.saveWords) {
            let word = {};
            word[response["word"]] = response;
            chrome.storage.sync.set(word);
          }
          if (result.dict_settings.hideWindow > 0) {
            setTimeout(function () {
              Dictionary.hideWindow();
            }, result.dict_settings.hideWindow);
          }
        });
      }
    },
    
  }
})();