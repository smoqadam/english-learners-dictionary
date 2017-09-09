document.body.style.border = "5px solid red";
var translator = document.createElement('div');
translator.style.display = "none";
translator.style.position = "fixed";
translator.style.top = "0px";
translator.style.left = "0px";
translator.style.zIndex = "9999";
translator.style.background = "#ccc";
translator.style.padding = "5px";
translator.style.border = "1px solid #ddd";
translator.style.margin = "5px";
translator.style.maxWidth = "500px";
document.body.appendChild(translator);

var menu = document.createElement("div");
menu.style.background = "#ccc";
menu.width = "20px";
menu.style.position = "absolute";

var menudItemTranslate = document.createElement('div');
var selection;
menudItemTranslate.style.background = "#ccc";
menudItemTranslate.style.padding = "5px";
menudItemTranslate.textContent = "Tr";
menudItemTranslate.addEventListener('click', function(e){
  if (selection !== ''){
    translator.textContent = selection;
    translator.style.display = "block";
    menu.style.display = "none";
  }
});

var menudItemAdd = document.createElement('div');
menudItemAdd.addEventListener('click', function(e){
  //do something
});
menudItemAdd.style.background = "#ccc";
menudItemAdd.style.padding = "5px";
menudItemAdd.textContent = "Add";

menu.appendChild(menudItemAdd);
menu.appendChild(menudItemTranslate);
document.body.appendChild(menu);


document.onmouseup =  function (evt) {
  var s = document.getSelection(),
  r = s.getRangeAt(0);
  if (r && s.toString()) {
    var p = r.getBoundingClientRect();
    if (p.left || p.top) {
      menu.style.left = (p.left) +"px";
      menu.style.top = (p.top - menu.offsetHeight - 10) +"px";
      menu.style.display = "block";
      selection = s.toString();
      return;
    }
  }
};
