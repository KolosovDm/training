  $(document).ready(function(){
	  document.getElementById('themsName').innerHTML = '';
  })
  $("#next").click(function(){
	  //console.log('next');
	  $("ul").append("<li> <div class='cont'><table><tr><td class = 'answer'><p class='choice' contenteditable></p></td>	<td class = 'trueOrFalse'> <input type = 'checkbox' class='checkbox'><label for = 'checkbox'>Верно</label></td></tr></table></div></li>");
	  })
	  
	  $(document).ready($("body").on('click', 'label', function(){
	var cont = $(this).css({'color': '#0000ff',
											'font-size': '30px'
										});
	 $(this).prev()[0].checked = 'true';	
	}))
  
//отправка данных на сервер через ajax
$('#submit').on('click', function(){
	var flag = 0;
	//создадим объект в который запишем данные для отправки на сервер
	var dataFromServer = new Object();
	//получим тему вопроса
	var thems = document.getElementById('law_list');	
	// получим вопрос
	var question = document.getElementById('question');
	if(question.innerText == '' || thems.value == '' ){
		alert('Вы не задали вопрос или тему');
	} else{
		// получим массивы вариантов ответов  и пометок истина или ложь
	var ans = document.getElementsByClassName('choice');
	var stat = document.getElementsByClassName('checkbox');
	//получим коментарий
	var coment = document.getElementById('coment');
	//создадим два массива
	var variantAnswerArr = new Array();
	var falsOrTrueArr = new Array();
	for(var i = 0; i <= ans.length-1; i++){
		if(ans[i] == ''){
			alert('Вариант ответа №' + (i+1) + 'пропущен');
		} else{
			variantAnswerArr[i] = ans[i].innerText;
			falsOrTrueArr[i] = stat[i].checked;
			flag = 1;
			}
		
		}
	}
	if(flag == 1){
		dataFromServer.thems = thems.value;
	dataFromServer.question = question.innerText;
	dataFromServer.answers = variantAnswerArr;
	dataFromServer.stat = falsOrTrueArr;
	dataFromServer.coment = coment.innerText;
	$.ajax('entercard', {
		method: 'POST',
		data: {klientData: dataFromServer},
		fail: function(){alert('Не удалось отправить данные на сервер, повторите попытку');},
		success: function(){
			thems.value = '';//обнулим тему
			question.innerText = '';//очистим поле вопроса
			$('ul').children().remove();//удалим варианты ответов
			//очистим поле коментариев
			document.getElementById('coment').innerHTML = '';
			//добавим одно поле для вариантов ответа;
			$("ul").append("<li> <div class='cont'><table><tr><td class = 'answer'><p class='choice' contenteditable></p></td>	<td class = 'trueOrFalse'> <input type = 'checkbox' class='checkbox'><label for = 'checkbox'>Верно</label></td></tr></table></div></li>");
			
			
		}
})
	}
	

})

$('#shower').on('click', function(){
	
	
	console.dir(stat[0].checked);
})

	 
	
