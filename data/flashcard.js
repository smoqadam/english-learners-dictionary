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
let selection;
$('.tr-body').click(function (e) {
    e.stopPropagation();
});
// $(document).click(function (e) {
//     $('body').find('.tr-body').css('display', 'none');
// });

// $('.tr-close').click(function(){
//     $('body').find('.tr-body').css('display', 'none');
// });

$('.tr-button').on('click', function(e){
    e.preventDefault();
    fetchDefinitions();
});

function fetchDefinitions(){
    $('.tr-wrapper').css('display', 'none');
    if (selection !== ''){
        let url = "http://127.0.0.1:3000/?define="+selection;
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
                console.log({response});
                response = response[0];
                if (response) {
                    $('body').find('.tr-body .tr-did-you-mean-wrapper').css("display",'none');
                    $('body').find('.tr-body .tr-def-wrapper').css("display",'block');
                    var header = '<div class="tr-word"><span class="">'+response['word']+'</span><span class="tr-pron">'+response['phonetic']+'</span><span class="tr-close fat"></span></div>'
                    $('body').find('.tr-body .tr-def-wrapper .tr-header').html(header);
                    $('body').find('.tr-body .tr-def-wrapper ul.tr-defs').html('')
                    let def;
                    for([index, meaning] of Object.entries(response.meaning)){
                        meaning.forEach(function(m){
                            def = $('<li class="tr-def">'+m.definition+'</li>');
                            var example = '';
                            if (m.example) {
                                example = '<span class="examples"><strong>Example:</strong> '+m.example+'</span></div>';
                            }
                            var synonyms = '';
                            if (m.synonyms && m.synonyms.length) {
                                var syns = m.synonyms.map(function(item){
                                    console.log(item); 
                                    return '<span class="syn">'+item+'</span>';
                                });
                                console.log(syns); 
                                synonyms = '<span class="synonyms"><strong>Synonyms:</strong> '+syns.join(' ')+'</span>';
                            }
                            $(def).append('<div class="extra">'+example+synonyms+'</div>');
                            $('body').find('.tr-body ul.tr-defs').append(def);
                        })

                    }
                }

                $('body').find('.tr-loading').css('display','none');
                $('body').find('.tr-body').css('display', 'block');
                // setTimeout(function(){
                //     $('body').find('.tr-body').css('display', 'none');
                // }, 50000)
            })
            .catch(error => {
                $('body').find('.tr-loading').css('display','none');
                console.error(error);
            });
    }
}


document.onmouseup =  function (evt) {
    let s = document.getSelection(),
        bodyRect = document.body.getBoundingClientRect(),
        r = s.getRangeAt(0);
    if (r && s.toString()) {
        let p = r.getBoundingClientRect();
        if (p.left || p.top) {
            selection = s.toString();
            $(document).find('.tr-wrapper').css({
                top: ((p.top - bodyRect.top)) + "px",
                left: p.left + "px",
                display: "block",
            });
        }
    }
};
