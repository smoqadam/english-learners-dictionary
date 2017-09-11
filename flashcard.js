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

var menu = document.createElement("ul");
menu.style.background = "#ccc";
menu.style.listStyleType  = "none";
menu.style.textAlign = "center";
menu.style.position = "absolute";
menu.style.zIndex = "9999";
// menu.style.borderRadius = "50%";
// menu.style.width = "20px";
// menu.style.height = "20px";
var selection;

var menudItemTranslate = document.createElement('li');
menu.appendChild(menudItemTranslate);
var menudItemTranslateA = document.createElement('a');
menudItemTranslateA.style.padding = "5px";
menudItemTranslateA.style.display = "inline";
menudItemTranslateA.style.cursor = "pointer";
menudItemTranslateA.textContent = "Tr";
menudItemTranslateA.href = "#";
menudItemTranslateA.addEventListener('click', function(e){
  e.preventDefault();
  console.log("selection");
  console.log(selection);
  if (selection !== ''){
        translator.textContent = selection;
        translator.style.display = "block";
        menu.style.display = "none";
  }
});
menudItemTranslate.appendChild(menudItemTranslateA);

//TODO: add functionality
// var menudItemAdd = document.createElement('li');
// menudItemAdd.style.display = "inline";
// menudItemAdd.style.background = "#ccc";
// menudItemAdd.style.padding = "5px";
// menudItemAdd.textContent = "Add";
// menudItemAdd.addEventListener('click', function(e){
//   //do something
// });
// menu.appendChild(menudItemAdd);

document.body.appendChild(menu);


document.onmouseup =  function (evt) {
  var s = document.getSelection(),
  bodyRect = document.body.getBoundingClientRect(),
  r = s.getRangeAt(0);
  if (r && s.toString()) {
    var p = r.getBoundingClientRect();
    if (p.left || p.top) {
      menu.style.left = (p.left) +"px";
      menu.style.top = ((p.top - bodyRect.top) - menu.offsetHeight - 10) +"px";
      menu.style.display = "block";
      selection = s.toString();
      console.log(selection);
      return;
    }
  }
};
