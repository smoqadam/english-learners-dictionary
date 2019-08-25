let translator = {
  init: function() {
    this.selection = "";
    let translateButton =
      '<div class="tr-wrapper"><div class="tr-button"></div></div>';
    let translationBody =
      '<div style="" class="tr-window">' +
      '<div class="tr-body">' +
      '<div class="tr-did-you-mean-wrapper">' +
      "</div>" +
      '<div class="tr-def-wrapper">' +
      '<div class="tr-header">' +
      "</div>" +
      '<ul class="tr-defs"></ul>' +
      "</div> " +
      "</div>" +
      "</div>";
    let loading = '<div class="tr-loading">Please Wait...</div>';
    $(translateButton).appendTo("body");
    this.hideButton();
    $(translationBody).appendTo("body");
    $(loading).appendTo("body");
    this.wrapper = $("body").find(".tr-body .tr-def-wrapper");

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
    var trPhon = _createElement('span', 'tr-phon', data.phonetic);
    var trPron = _createElement('span', 'tr-pron');
    var pronIcon = _createElement('i', 'icon-volume');
    pronIcon.setAttribute('onclick', "(new Audio('"+data.pron+"')).play()");
    trPron.appendChild(pronIcon);
    header.appendChild(trWord);
    header.appendChild(trPhon);
    header.appendChild(trPron);
    return header;
  }

    var btnImgURL = chrome.extension.getURL("icons/dictionary-32.png");
    document.querySelector(".tr-button").style =
      "background: url('" +
      btnImgURL +
      "') 0% 0% / 24px 24px no-repeat !important; ";
  },
  showButton: function(top, left) {
    $(document)
      .find(".tr-wrapper")
      .css({
        top: top + "px",
        left: left + "px",
        display: "table-cell"
      });
    setTimeout(function() {
      translator.hideButton();
    }, 5000);
  },
  hideButton: function() {
    $(".tr-wrapper").css("display", "none");
  },
  showWindow: function() {
    $("body")
      .find(".tr-body")
      .css("display", "block");
    $("body")
      .find(".tr-body .tr-defs")
      .scrollTop(0);
  },
  hideWindow: function() {
    $("body")
      .find(".tr-body")
      .css("display", "none");
  },
  showLoading: function() {
    $("body")
      .find(".tr-loading")
      .css("display", "block");
  },
  hideLoading: function() {
    $("body")
      .find(".tr-loading")
      .css("display", "none");
  },
  setWord: function(selection) {
    this.selection = selection;
  },
  setData: function(data) {
    this.data = data;
  },
  fetchData: function() {
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
          chrome.runtime.sendMessage({ word: this.selection }, function(
            result
          ) {
            $this.showPopup(result);
          });
        }
      });
    }
  },
  showPopup: function(response) {
    if (response) {
      this.wrapper.css("display", "block");
      var header =
        '<span class="tr-word">' +
        response["word"] +
        '</span><span class="tr-pron">' +
        (response["phonetic"] || "") +
        "</span>" +
        '<span class="tr-close fat"></span>';
      this.wrapper.find(".tr-header").html(header);
      this.wrapper.find("ul.tr-defs").html("");
      let def;
      for ([index, meaning] of Object.entries(response.meaning)) {
        meaning.forEach(function(m) {
          def = $(
            '<li class="tr-def"><div class="tr-def">' +
              m.definition +
              "</div></li>"
          );
          var example = "";
          if (m.example) {
            example =
              '<span class="examples"><strong>Example:</strong> ' +
              m.example +
              "</span>";
          }
          var synonyms = "";
          if (m.synonyms && m.synonyms.length > 0) {
            var syns = m.synonyms.map(function(item) {
              return '<a href="#" class="syn">' + item + "</a>";
            });
            synonyms =
              '<span class="synonyms"><strong>Synonyms:</strong> ' +
              syns.join(" ") +
              "</span>";
          }
          $(def).append('<div class="extra">' + example + synonyms + "</div>");
          $("body")
            .find(".tr-body ul.tr-defs")
            .append(def);
        });
      }
      this.hideLoading();
      this.showWindow();
      chrome.storage.sync.get("dict_settings", result => {
        if (result.dict_settings.saveWords) {
          let word = {};
          word[response["word"]] = response;
          chrome.storage.sync.set(word);
        }

        if (result.dict_settings.hideWindow > 0) {
          setTimeout(function() {
            translator.hideWindow();
          }, result.dict_settings.hideWindow);
        }
      });
    }
  }
};

translator.init();

$(".tr-body").on("click", "a.syn", function(e) {
  e.preventDefault();
  translator.setWord($(this).text());
  translator.fetchData();
});
$(".tr-body").click(function(e) {
  e.stopPropagation();
});

$(document).click(function(e) {
  if (e.originalEvent.button == 0) {
    translator.hideWindow();
  }
});

$(".tr-body").on("click", ".tr-close", function() {
  translator.hideWindow();
});

$(document).on("click", ".tr-button", function(e) {
  e.preventDefault();
  translator.fetchData();
  translator.showPopup();
});

document.onmouseup = function(evt) {
  let selection;
  let s = document.getSelection(),
    bodyRect = document.body.getBoundingClientRect();
  if (s.rangeCount > 0) {
    r = s.getRangeAt(0);
    if (r && s.toString()) {
      let p = r.getBoundingClientRect();
      if (p.left || p.top) {
        selection = s.toString();
        translator.setWord(selection);
        chrome.storage.sync.get("dict_settings", result => {
          console.log(result.dict_settings.showIcon);
          if (result && result.dict_settings.showIcon == true) {
            translator.showButton(p.top - bodyRect.top - 30, p.right);
          }
        });
      }
    }
  }
};

chrome.runtime.onMessage.addListener(function(req) {
  if (req.notFound) {
    translator.hideLoading();
  } else {
    translator.showLoading();
    translator.fetchData();
  }
});
