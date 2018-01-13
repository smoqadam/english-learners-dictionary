let translateButton = '<div class="tr-wrapper" style="position: absolute">' +
    '<a href="#" class="tr-button">TR</a> ' +
    '</div>';
let style = '<style>' +
    '.tr-body{} .tr-body ul{list-style: circle}' +
    '</style>' ;
let translationBody =
    '<div class="tr-body" style="display:none; background: #ccc; color:#fff; position: fixed; top:1px; left: 1px; width: 450px; height: 200px; overflow: scroll">' +
    '<h4 class="tr-word"></h4>' +
    '<span class="tr-pos"></span>' +
    '<span class="tr-pron"></span> ' +
    '<ul class="tr-defs"></ul>' +
    '</div>';

$(translateButton).appendTo('body');
$(translationBody).appendTo('body');
$(style).appendTo('head');
let selection;

$('.tr-button').on('click', function(e){
  e.preventDefault();
    if (selection !== ''){
      let url = "http://127.0.0.1:8000/"+selection;
        const myRequest = new Request(url);
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

                $('body').find('.tr-body').css('display', 'block');
                setTimeout(function(){
                    $('body').find('.tr-body').css('display', 'none');
                }, 10000)
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
            top: ((p.top - bodyRect.top) - 10) + "px",
            left: p.left + "px",
            display: "block",
        });
    }
  }
};
