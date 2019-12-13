let selectedWord;
let theme = 'dark';
const HIDE_BTN_SECOND = 3500;

function getSelection(event) {
    var elem = event.target;//.getSelectedText();
    var l = elem.selectionEnd - elem.selectionStart;
    var selection = elem.value.substr(elem.selectionStart, l);
    console.log({
        elem, selection
    })
    return selection;
}


//
// document.onmouseup = function (event) {
//     try {
//         let selection = getSelection(event),
//             bodyRect = document.body.getBoundingClientRect();
//
//         if (selection) {
//             selectedWord = selection;
//
//             getSetting('showIcon', function (value) {
//                 if (value) {
//                     showButton(p.top - bodyRect.top - 30, p.right);
//                 }
//             }, function () {
//                 showButton(p.top - bodyRect.top - 30, p.right);
//             })
//         }
//     } catch
//         (e) {
//         console.log(e)
//     }
// }
// ;
document.onmouseup = function (evt) {
    if (evt.target.type === 'text' || evt.target.type === 'textarea') {
        selectedWord = getSelection(evt);
    } else {
        let s = document.getSelection(),
            bodyRect = document.body.getBoundingClientRect();
        if (s.rangeCount > 0) {
            r = s.getRangeAt(0);
            if (r && s.toString()) {
                let p = r.getBoundingClientRect();
                if (p.left || p.top) {
                    selectedWord = s.toString();
                    // chrome.storage.sync.get("dict_settings", function (res) {
                    //     if (res['dict_settings']['showIcon']) {
                    //         showButton(p.top - bodyRect.top - 30, p.right);
                    //     }
                    // });
                    getSetting('showIcon', function (value) {
                        if (value) {
                            showButton(p.top - bodyRect.top - 30, p.right);
                        }
                    }, function () {
                        showButton(p.top - bodyRect.top - 30, p.right);
                    })
                }
            }
        }
    }
};

function getSetting(key, callback, errorCallback) {
    chrome.storage.sync.get('dict_settings', result => {
        if (result['dict_settings'][key] !== undefined) {
            callback(result['dict_settings'][key]);
        } else {
            errorCallback(result['dict_settings']);
        }
    });
}


function switchTheme(theme) {
    document.querySelector('.sm-tr-main-wrapper').id = 'sm-' + theme + '-tr-wrapper';
}

chrome.runtime.onMessage.addListener(function (req) {
    if (req.notFound) {
        hideLoading();
        hideButton();
    } else if (req.theme) {
        switchTheme(req.theme);
    } else {
        btnClick();
    }
});

function readFile(_path, _cb) {
    fetch(_path, {mode: 'same-origin'})   // <-- important
        .then(function (_res) {
            return _res.blob();
        })
        .then(function (_blob) {
            let reader = new FileReader();
            reader.addEventListener("loadend", function () {
                _cb(this.result);
            });
            reader.readAsText(_blob);
        });
}


function fetchData(selection, callback) {
    chrome.runtime.sendMessage({word: selection}, callback);
}


function next(elem) {
    do {
        elem = elem.nextSibling;
    } while (elem && elem.nodeType !== 1);
    return elem;
}

function toggleNext() {
    let nextElem = next(this);
    if (nextElem) {
        if (nextElem.style.display === 'none' || nextElem.style.display === '') {
            nextElem.style.display = 'block';
            this.id = 'opened-title';
        } else {
            nextElem.style.display = 'none';
            this.id = 'closed-title';
        }
    }
}

function makeList(elm, list, selector, title) {
    if (list === undefined) {
        return;
    }
    let titleElem = document.createElement('h6');
    let listElement = elm.querySelector(selector);
    listElement.textContent = '';
    titleElem.textContent = title;
    listElement.appendChild(titleElem);
    list.forEach(function (e, i) {
        let li = document.createElement('li');
        let anchor = document.createElement('a');
        anchor.href = '#';
        anchor.textContent = e;
        anchor.className = 'sm-tr-tag';
        anchor.addEventListener('click', function () {
            selectedWord = e;
            btnClick();
        });
        li.appendChild(anchor);
        listElement.appendChild(li);
    });
    return listElement;
}

function showPopup(result) {
    let elm = document.querySelector("#sm-dict-tr-main-template");

    elm.querySelector('a#sm-tr-setting-link').href = chrome.extension.getURL("settings.html");
    elm.querySelector('a#sm-tr-setting-link').target = '_blank';
    // =============================================== WORD
    elm.querySelector('.sm-tr-word').textContent = result.word;
    elm.querySelector('.sm-tr-pos').textContent = '(' + result.pos + ')';


    // =============================================== Pronunciation and phonetics
    let pronB = elm.querySelector('#sm-dict-british-pron');
    let pronA = elm.querySelector('#sm-dict-american-pron');
    pronB.querySelector('i').dataset.pron = result.pron.audio.British;
    pronB.querySelector('span').textContent = result.pron.phon.British;

    pronA.querySelector('i').dataset.pron = result.pron.audio.American;
    pronA.querySelector('span').textContent = result.pron.phon.American;

    // =============================================== DEFINITIONS
    let defs = elm.querySelector('.tr-defs');
    defs.textContent = '';
    result.defs.forEach(function (e, i) {
        let deftemplate = document.querySelector('#tr-defs-list-item-template');
        let clone = document.importNode(deftemplate.content, true);

        clone.querySelector('.tr-def').textContent = e.definition;

        let collList = clone.querySelector('.tr-coll-list');
        let exTitle = clone.querySelector('h6');
        if (result.defs[i]['collocations'] !== undefined) {
            let colls = result.defs[i]['collocations'];
            Object.keys(colls).forEach(function (k) {
                let cult = document.createElement('h6');
                cult.textContent = k;
                let cul = document.createElement('ul');
                colls[k].forEach(function (f) {
                    let cli = document.createElement('li');
                    cli.textContent = f;
                    cli.className = 'sm-tr-tag';
                    cul.appendChild(cli);
                });
                collList.appendChild(cult);
                collList.appendChild(cul);
            })
        }
        clone.querySelectorAll('h6').forEach(function (h) {
            h.id = 'closed-title';
            h.addEventListener('click', toggleNext);
        });
        if (result['defs'][i]['examples'] !== undefined) {
            result['defs'][i]['examples'].forEach(function (ex, i) {
                if (i > 2) {
                    return;
                }
                let exElm = document.createElement('li');
                exElm.textContent = ex;
                clone.querySelector('.tr-example-list').appendChild(exElm);
            });
        } else {
            exTitle.style.display = 'none';
        }
        defs.appendChild(clone);
    });

    // =============================================== SYNONYMS and ANTONYMS tabs
    makeList(elm, result['synonyms'], '.tr-syn-list', 'Synonyms');
    makeList(elm, result['related'], '.tr-related-list', 'Related Words');
    makeList(elm, result['antonyms'], '.tr-ant-list', 'Antonyms');
    makeList(elm, result['near_ant'], '.tr-rel-ant-list', 'Near Antonyms');

    elm.style.display = 'block';
}

function btnClick() {
    hideButton();
    hidePopup();
    showLoading();
    fetchData(selectedWord, function (result) {
        showPopup(result);
        hideLoading();
    });
}

readFile(chrome.extension.getURL("template.html"), function (_res) {
    let frag = document.createRange().createContextualFragment(_res);
    var mainElem = frag.querySelector('.sm-tr-main-wrapper');
    getSetting('theme', function (theme) {
        mainElem.id = 'sm-' + theme + '-tr-wrapper';
    }, function () {
        mainElem.id = 'sm-dark-tr-wrapper';
    });
    let main = mainElem.querySelector("#sm-dict-tr-main-template");
    main.addEventListener('click', function (e) {
        e.stopPropagation();
    });
    let btn = mainElem.querySelector('.sm-tr-selected-button');
    btn.style.backgroundPosition = "0% 0%";
    btn.style.backgroundRepeat = "no-repeat";
    btn.style.backgroundSize = "24px 24px";
    btn.style.backgroundImage = 'url("' + chrome.extension.getURL("icons/dictionary-32.png") + '")';
    btn.addEventListener('click', btnClick);

    let loading = mainElem.querySelector('.sm-tr-loading');

    let loadingImgURL = chrome.extension.getURL("icons/loading.gif");
    loading.style.backgroundImage = "url('" + loadingImgURL + "')";
    loading.style.backgroundPosition = "7px center";
    loading.style.backgroundRepeat = "no-repeat";
    loading.style.backgroundSize = "13px";
    loading.style.backgroundColor = "#2092cc";

    mainElem.querySelectorAll('.tr-pron i').forEach(function (e) {
        e.addEventListener('click', function () {
            chrome.runtime.sendMessage({audio: this.dataset.pron}, function () {
            });
        })
    });

    document.querySelector('body').appendChild(mainElem);
});


document.querySelector('body').addEventListener('click', function (e) {
    hidePopup();
});

function hidePopup() {
    document.getElementById("sm-dict-tr-main-template").style.display = 'none';
}

function showButton(top, left) {
    let btn = document.querySelector('.sm-tr-selected-button');
    btn.style.top = top + "px";
    btn.style.left = left + "px";
    btn.style.display = "table-cell";

    setTimeout(function () {
        hideButton();
    }, (HIDE_BTN_SECOND));

}

function hideButton() {
    let btn = document.querySelector('.sm-tr-selected-button');
    btn.style.display = "none";
}

function showLoading() {
    let loading = document.querySelector('.sm-tr-loading');
    loading.style.display = "block";
}

function hideLoading() {
    let loading = document.querySelector('.sm-tr-loading');
    loading.style.display = "none";
}