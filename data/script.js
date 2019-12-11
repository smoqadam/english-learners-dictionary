// Dictionary.init();
//

//
// document.querySelector('body').addEventListener('click', function (e) {
//   Dictionary.hideWindow();
// });
//
// document.addEventListener("click", function (e) {
//   if (e.target) {
//     switch (e.target.className) {
//       case "tr-search-wrapper":
//         Dictionary.hideSearch();
//         break;
//       case "tr-button":
//         e.preventDefault();
//         Dictionary.fetchData();
//         Dictionary.showPopup();
//         break;
//     }
//   }
// });
// document.addEventListener('keydown', function(e){
//     if (e.keyCode == 27) {
//       Dictionary.hideSearch();
//     }
//   }, false)
// document.addEventListener("keyup", function(e) {
//     if (e.keyCode == 27)  {
//         Dictionary.hideSearch();
//     } else if (e.ctrlKey && e.shiftKey && e.keyCode == 79) {
//         Dictionary.showSearch();
//     } else if (e.keyCode == 13 && e.target && e.target.className == 'tr-input-search' ) {
//         e.preventDefault();
//         Dictionary.setWord(e.target.value);
//         Dictionary.fetchData();
//         Dictionary.hideSearch();
//     }
// });
//
// document.querySelector('.tr-body').addEventListener('click', function (e) {
//   if (e.target) {
//     switch (e.target.className) {
//       case "tr-close":
//         Dictionary.hideWindow();
//         break;
//       case "syn":
//         e.preventDefault();
//         Dictionary.setWord(e.target.text);
//         Dictionary.fetchData();
//         break;
//     }
//   }
// })
var selectedWord;
document.onmouseup = function (evt) {
    let selection;
    let s = document.getSelection(),
        bodyRect = document.body.getBoundingClientRect();
    if (s.rangeCount > 0) {
        r = s.getRangeAt(0);
        if (r && s.toString()) {
            let p = r.getBoundingClientRect();
            if (p.left || p.top) {
                selectedWord = s.toString();
                showButton(p.top - bodyRect.top - 30, p.right);
            }
        }
    }
};

chrome.runtime.onMessage.addListener(function (req) {
    if (req.notFound) {
        hideLoading();
        hideButton();
    } else {
        Dictionary.showLoading();
        Dictionary.fetchData();
    }
});

function readFile(_path, _cb) {
    console.log({_path});
    fetch(_path, {mode: 'same-origin'})   // <-- important
        .then(function (_res) {
            return _res.blob();
        })
        .then(function (_blob) {
            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
                _cb(this.result);
            });
            reader.readAsText(_blob);
        });
}


function fetchData(selection, callback) {
    chrome.runtime.sendMessage({word: selection}, callback);
}

function showPopup(result) {
    console.log(result);
    var elm = document.getElementById("sm-dict-tr-main-template");

    // =============================================== WORD
    elm.querySelector('.tr-word').innerHTML = result.word;

    // =============================================== Pronunciation and phonetics
    var pronB = elm.querySelector('#sm-dict-british-pron');
    var pronA = elm.querySelector('#sm-dict-american-pron');
    pronB.querySelector('i').dataset.pron = result.pron.audio.British;
    pronB.querySelector('span').innerHTML = result.pron.phon.British;

    pronA.querySelector('i').dataset.pron = result.pron.audio.American;
    pronA.querySelector('span').innerHTML = result.pron.phon.American;


    // =============================================== DEFINITIONS
    var defs = elm.querySelector('.tr-defs');
    result.defs.forEach(function (e, i) {
        var deftemplate = document.querySelector('#tr-defs-list-item-template');
        var clone = document.importNode(deftemplate.content, true);

        clone.querySelector('.tr-def').innerHTML = e.definition;
        var examples = result.defs[i].examples;
        if (examples.length === 0) {
            console.log({examples});
            var h = clone.querySelector('h6');
            h.style.display = 'none';
        }
        examples.forEach(function (ex, i) {
            var exElm = document.createElement('li');
            exElm.innerHTML = ex;
            clone.querySelector('.tr-example-list').appendChild(exElm);
        });
        defs.appendChild(clone);
    });

    // =============================================== SYNONYMS

    if (result['synonyms'] !== undefined) {
      var title = document.createElement('h6');

      var synList = elm.querySelector('.tr-syn-list');
        title.innerHTML = 'Synonyms';
        synList.appendChild(title);
        result.synonyms.forEach(function (e, i) {
            var synLi = document.createElement('li');
            var synA = document.createElement('a');
            synA.href = '#';
            synA.innerHTML = e;
            synLi.appendChild(synA);
            synList.appendChild(synLi);
        });
    }

    if (result['related'] !== undefined) {
      var title = document.createElement('h6');
      var relList = elm.querySelector('.tr-related-list');
        title.innerHTML = 'Related Words';
        relList.appendChild(title);
        result.related.forEach(function (e, i) {
            var synLi = document.createElement('li');
            var synA = document.createElement('a');
            synA.href = '#';
            synA.innerHTML = e;
            synLi.appendChild(synA);
            relList.appendChild(synLi);
        });
    }

    if (result['antonyms'] !== undefined) {
      var title = document.createElement('h6');
      var antList = elm.querySelector('.tr-ant-list');
        title.innerHTML = 'Antonyms';
        antList.appendChild(title);
        result['antonyms'].forEach(function (e, i) {
            var synLi = document.createElement('li');
            var synA = document.createElement('a');
            synA.href = '#';
            synA.innerHTML = e;
            synLi.appendChild(synA);
            antList.appendChild(synLi);
        });
    }

    if (result['near_ant'] !== undefined) {
      var title = document.createElement('h6');
      var relAntList = elm.querySelector('.tr-rel-ant-list');
        title.innerHTML = 'Near Antonyms';
        relAntList.appendChild(title);
        result['near_ant'].forEach(function (e, i) {
            var synLi = document.createElement('li');
            var synA = document.createElement('a');
            synA.href = '#';
            synA.innerHTML = e;
            synLi.appendChild(synA);
            relAntList.appendChild(synLi);
        });
    }

    elm.style.display = 'block';
}

function btnClick() {
    showLoading();
    fetchData(selectedWord, function (result) {
        showPopup(result);
        hideLoading();
        hideButton();
    });
}

readFile(chrome.extension.getURL("template.html"), function (_res) {
    let mainElem = createElementFromHTML(_res);

    mainElem.querySelector("#sm-dict-tr-main-template").addEventListener('click', function (e) {
        e.stopPropagation();
    });

    var btn = mainElem.querySelector('.sm-tr-selected-button');
    btn.style.backgroundPosition = "0% 0%";
    btn.style.backgroundRepeat = "no-repeat";
    btn.style.backgroundSize = "24px 24px";
    btn.style.backgroundImage = 'url("' + chrome.extension.getURL("icons/dictionary-32.png") + '")';
    btn.addEventListener('click', btnClick);

    var loading = mainElem.querySelector('.sm-tr-loading');

    var loadingImgURL = chrome.extension.getURL("icons/loading.gif");
    loading.style.backgroundImage = "url('" + loadingImgURL + "')";
    loading.style.backgroundPosition = "7px center";
    loading.style.backgroundRepeat = "no-repeat";
    loading.style.backgroundSize = "13px";
    loading.style.backgroundColor = "#2092cc";

    mainElem.querySelectorAll('.tr-pron i').forEach(function (e) {
        e.addEventListener('click', function () {
            console.log(this.dataset.pron);
            (new Audio(this.dataset.pron)).play();
        })
    });
    // Change this to div.childNodes to support multiple top-level nodes
    console.log(mainElem);
    document.querySelector('body').appendChild(mainElem);
});


function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

document.onload = function () {

};

document.querySelector('body').addEventListener('click', function (e) {
    document.getElementById("sm-dict-tr-main-template").style.display = 'none';
});

function showButton(top, left) {
    var btn = document.querySelector('.sm-tr-selected-button');
    btn.style.top = top + "px";
    btn.style.left = left + "px";
    btn.style.display = "table-cell";
}

function hideButton() {
    var btn = document.querySelector('.sm-tr-selected-button');
    btn.style.display = "none";
}

function showLoading() {
    var loading = document.querySelector('.sm-tr-loading');
    loading.style.display = "block";
}

function hideLoading() {
    var loading = document.querySelector('.sm-tr-loading');
    loading.style.display = "none";
}