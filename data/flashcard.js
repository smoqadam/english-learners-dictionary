let translateButton = '<div class="tr-wrapper"><div class="tr-button"></div></div>';

let translationBody =
    '<div style="" class="tr-window">' +
        '<div class="tr-body">' +
            '<div class="tr-did-you-mean-wrapper">' +
            '</div>' +
            '<div class="tr-def-wrapper">' +
                '<span class="tr-close fat"></span>' +
                '<h4 class="tr-word"></h4>' +
                '<h6 class="tr-pos"></h6>' +
                '<span class="tr-pron"></span><br>' +
                '<ul class="tr-defs"></ul>' +
            '</div> ' +
        '</div>' +
    '</div>';

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
    fetchDefinitions();
});

function fetchDefinitions(){
    $('.tr-wrapper').css('display', 'none');
    if (selection !== ''){
        let url = "http://localhost:8000/"+selection;
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
                if (response.hasOwnProperty('didYouMean')){
                    $('body').find('.tr-body .tr-did-you-mean-wrapper').html('<h4>Did you mean: </h4><ul></ul>');
                    let didYouMean = response['didYouMean'];
                    for (var i =0; i < didYouMean.length; i++) {
                        $('body').find('.tr-body .tr-did-you-mean-wrapper ul').append('<li class="tr-did-you-mean" >'+didYouMean[i]+'</li>');
                    }
                    $('body').find('.tr-body .tr-did-you-mean-wrapper').css("display",'block');
                    $('body').find('.tr-body .tr-def-wrapper').css("display",'none');
                } else {
                    $('body').find('.tr-body .tr-did-you-mean-wrapper').css("display",'none');
                    $('body').find('.tr-body .tr-def-wrapper').css("display",'block');

                    $('body').find('.tr-body .tr-def-wrapper .tr-pos').html(response['parts_of_speech']);
                    $('body').find('.tr-body .tr-def-wrapper .tr-pron').html(response['pronunciation']);
                    $('body').find('.tr-body .tr-def-wrapper .tr-word').html(response['word']);
                    $('body').find('.tr-body .tr-def-wrapper ul.tr-defs').html('')
                    let def;
                    for([index, definition] of Object.entries(response.definitions)){
                        def = $('<li class="tr-def">'+definition.definition+'</li>');
                        $(def).append('<ul></ul>');
                        for ([key, example] of Object.entries(definition.examples)){
                            $(def).find('ul').append('<li class="examples">'+example.example+'</li>')
                        }
                        $('body').find('.tr-body ul.tr-defs').append(def);
                    }
                }

                $('body').find('.tr-loading').css('display','none');
                $('body').find('.tr-body').css('display', 'block');
                setTimeout(function(){
                    $('body').find('.tr-body').css('display', 'none');
                }, 50000)
            })
            .catch(error => {
                $('body').find('.tr-loading').css('display','none');
                console.error(error);
            });
    }
}

$('.tr-body').on('click', 'li.tr-did-you-mean', function (e) {
    selection = $(this).text();
    fetchDefinitions();
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
