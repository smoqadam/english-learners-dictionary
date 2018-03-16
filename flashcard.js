let translateButton = '<div class="tr-wrapper" style="position: absolute"><a href="#" class="tr-button">Tr.</a></div>';
let style = '<style>' +
    '.tr-loading {display:none;z-index: 99999999; background: #2092cc; padding:10px;color:#fff; position: fixed; top:5px; left: 5px; } ' +
    '.tr-body{display:none;z-index: 99999999; background: #2092cc; padding:10px;color:#fff; position: fixed; top:5px; left: 5px; width: 450px; height: 250px; overflow-y: scroll;} ' +
    '.tr-body ul{ list-style: disc }' +
    '.tr-pos {font-weight: bold; clear:both;}' +
    '.tr-close {position:absolute; right:0; top: 0; padding: 5px; background-color: red; cursor:pointer; width: 15px; height: 15px; border-radius: 15px;}' +
    '</style>' ;

let translationBody =
    '<div style="overflow: hidden;" class="tr-def-wrapper">' +
    '<div class="tr-body" style="">' +
    '<div class="tr-close">x</div> ' +
    '<h4 class="tr-word"></h4>' +
    '<h6 class="tr-pos"></h6>' +
    '<span class="tr-pron"></span><br>' +
    '<ul class="tr-defs"></ul>' +
    '</div></div>';

let loading = '<div style="display: none;" class="tr-loading">Please Wait...</div>';
$(style).appendTo('head');
$(translateButton).appendTo('body');
$(translationBody).appendTo('body');
$(loading).appendTo('body');
let selection;

$('.tr-button').on('click', function(e){
    e.preventDefault();
    $('.tr-wrapper').css('display', 'none');
    if (selection !== ''){
        let url = "http://127.0.0.1:8000/"+selection;
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
                let def;
                for([index, definition] of Object.entries(response.definitions)){
                    def = $('<li class="tr-def">'+definition.definition+'<ul></ul></li>');
                    for ([key, example] of Object.entries(definition.examples)){
                        console.log(example);
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
            console.log(selection);
            $(document).find('.tr-wrapper').css({
                top: ((p.top - bodyRect.top) - 20) + "px",
                left: p.left + "px",
                display: "block",
            });
        }
    }
};
