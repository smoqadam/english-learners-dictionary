let translator = {
    init: function() {
        this.selection = '';
        this.url = "http://127.0.0.1:3000/?define=";
        let translateButton = '<div class="tr-wrapper"><div class="tr-button"></div></div>';
        let translationBody =
            '<div style="" class="tr-window">' +
                '<div class="tr-body">' +
                    '<div class="tr-did-you-mean-wrapper">' +
                    '</div>' +
                    '<div class="tr-def-wrapper">' +
                        '<div class="tr-header">' +
                        '</div>' +
                        '<ul class="tr-defs"></ul>' +
                    '</div> ' +
                '</div>' +
            '</div>';
        let loading = '<div class="tr-loading">Please Wait...</div>';
        $(translateButton).appendTo('body');
        $(translationBody).appendTo('body');
        $(loading).appendTo('body');
        this.wrapper = $('body').find('.tr-body .tr-def-wrapper');
        
        var loadingImgURL = chrome.extension.getURL("images/loading.gif");
        document.querySelector(".tr-loading").style = "background: url('"+loadingImgURL+"') 10px center no-repeat #2092cc !important; ";

        var btnImgURL = chrome.extension.getURL("images/language.png");
        document.querySelector(".tr-button").style = "background: url('"+btnImgURL+"') 0% 0% / 24px 24px no-repeat !important; ";

    },
    showButton: function(top, left) {
        $(document).find('.tr-wrapper').css({
            top : top + "px",
            left: left + "px",
            display: "table-cell",
        });
        setTimeout(function(){
            translator.hideButton();
        }, 5000);
    },
    hideButton: function(){
        $('.tr-wrapper').css('display', 'none');
    },
    showWindow: function() {
        $('body').find('.tr-body').css('display', 'block');
        $('body').find('.tr-body .tr-defs').scrollTop(0);

    },
    hideWindow: function(){
        $('body').find('.tr-body').css('display', 'none');
    },
    showLoading: function() {
        $('body').find('.tr-loading').css('display','block');
    },
    hideLoading: function() {
        $('body').find('.tr-loading').css('display','none');
    },
    setWord: function(selection){
        this.selection = selection;
    },
    fetch: function() {
        this.hideButton();
        if (this.selection !== ''){
            const myRequest = new Request(this.url+this.selection);
            this.hideWindow();
            this.showLoading();
            fetch(myRequest)
                .then(response => {
                    if (response.status === 200) {
                        return response.json();
                    } else {
                        throw new Error('Something went wrong on api server!');
                    }
                })
                .then(response => {
                    response = response[0];
                    if (response) {
                        this.wrapper.css("display",'block');
                        var pron = '';//'<a class="speaker" onclick="this.firstElementChild.play();"><audio src="'+response['pronunciations']+'"></audio></a>';
                        var header = '<span class="tr-word">'+response['word']+'</span><span class="tr-pron">'+response['phonetic']+'</span>'+pron+'<span class="tr-close fat"></span>'
                        this.wrapper.find('.tr-header').html(header);
                        this.wrapper.find('ul.tr-defs').html('')
                        let def;
                        for([index, meaning] of Object.entries(response.meaning)){
                            meaning.forEach(function(m){
                                def = $('<li class="tr-def"><div class="tr-def">'+m.definition+'</div></li>');
                                var example = '';
                                if (m.example) {
                                    example = '<span class="examples"><strong>Example:</strong> '+m.example+'</span>';
                                }
                                var synonyms = '';
                                if (m.synonyms && m.synonyms.length > 0) {
                                    var syns = m.synonyms.map(function(item){
                                        return '<a href="#" class="syn">'+item+'</a>';
                                    });
                                    synonyms = '<span class="synonyms"><strong>Synonyms:</strong> '+syns.join(' ')+'</span>';
                                }
                                $(def).append('<div class="extra">'+example+synonyms+'</div>');
                                $('body').find('.tr-body ul.tr-defs').append(def);
                            })
                        }
                    }
                    this.hideLoading();
                    this.showWindow();
                })
                .catch(error => {
                    this.hideLoading();
                    console.error(error);
                });
        }
    }

}


translator.init();


$('.tr-body').on('click', 'a.syn', function (e) {
    e.preventDefault();
    translator.setWord($(this).text());
    translator.fetch();
});
$('.tr-body').click(function (e) {
    // e.stopPropagation();
});

$(document).click(function (e) {
    translator.hideWindow();
});

$('.tr-body').on('click','.tr-close', function(){
    translator.hideWindow();
});

$(document).on('click', '.tr-button', function(e){
    e.preventDefault();
    translator.fetch();
});

document.onmouseup =  function (evt) {
    let selection;
    let s = document.getSelection(),
        bodyRect = document.body.getBoundingClientRect();
    if (s.rangeCount > 0) {
        r = s.getRangeAt(0);
        if (r && s.toString()) {
            let p = r.getBoundingClientRect();
            console.log({p});
            if (p.left || p.top) {
                selection = s.toString();
                translator.setWord(selection);
                translator.showButton(((p.top - bodyRect.top) - 30 ), p.right);
            }
        }
    }
};
