let translateButton = '<div class="tr-wrapper"><div class="tr-button"></div></div>';

let translationBody =
    '<div style="" class="tr-def-wrapper">' +
    '<div class="tr-body">' +
    '<span class="tr-close fat"></span>     ' +
    '<h4 class="tr-word"></h4>' +
    '<h6 class="tr-pos"></h6>' +
    '<span class="tr-pron"></span><br>' +
    '<ul class="tr-defs"></ul>' +
    '</div></div>';

let loading = '<div class="tr-loading">Please Wait...</div>';
$(translateButton).appendTo('body');
$(translationBody).appendTo('body');
$(loading).appendTo('body');
let selection;
$('.tr-body').click(function (e) {
    e.stopPropagation();
});
$(document).click(function (e) {
    $('body').find('.tr-body').css('display', 'none');
});

$('.tr-close').click(function(){
    $('body').find('.tr-body').css('display', 'none');
});

$('.tr-button').on('click', function(e){
    e.preventDefault();
    $('.tr-wrapper').css('display', 'none');
    if (selection !== ''){
        let url = "http://dict.smoqadam.me/"+selection;
        const myRequest = new Request(url);
        $('body').find('.tr-body').css('display', 'none');
        $('body').find('.tr-loading').css('display','block');

        fetch(myRequest)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong on api server!');
                }
            })
            .then(response => {
                $('body').find('.tr-body .tr-pos').html(response['parts_of_speech']);
                $('body').find('.tr-body .tr-pron').html(response['pronunciation']);
                $('body').find('.tr-body .tr-word').html(response['word']);
                $('body').find('.tr-body ul.tr-defs').html('')
                let def;
                for([index, definition] of Object.entries(response.definitions)){
                    def = $('<li class="tr-def">'+definition.definition+'</li>');
                    $(def).append('<ul></ul>');
                    for ([key, example] of Object.entries(definition.examples)){
                        $(def).find('ul').append('<li class="examples">'+example.example+'</li>')
                    }
                    $('body').find('.tr-body ul.tr-defs').append(def);
                }

                $('body').find('.tr-loading').css('display','none');
                $('body').find('.tr-body').css('display', 'block');
                setTimeout(function(){
                    $('body').find('.tr-body').css('display', 'none');
                }, 50000)
            })
            .catch(error => {
                console.error(error);
            });
    }
});

document.onmouseup =  function (evt) {
    let s = document.getSelection(),
        bodyRect = document.body.getBoundingClientRect(),
        r = s.getRangeAt(0);
    if (r && s.toString()) {
        let p = r.getBoundingClientRect();
        if (p.left || p.top) {
            selection = s.toString();
            $(document).find('.tr-wrapper').css({
                top: ((p.top - bodyRect.top) - 25) + "px",
                left: p.left + "px",
                display: "block",
            });
        }
    }
};
