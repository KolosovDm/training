  $('next').click(function(){
	  var elem = createElement('li');
	  elem.attr({contenteditable: 'true'});
	  $('ul').appendChild(elem);
  })