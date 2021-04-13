//блок некоторых служебных переменных глобальной области видимости
var val, All_thems; //переменные для выбора списка тем
var arr_questions = new Array();//массив вопросов
var actual_question = 0;//номер текущего вопроса
var data_question;//текущий вопрос
var num_anw;//номер варианта ответа на текущий вопрос
var flag_answer = 0;// флаг ответа пользователем на вопрос
//..........................................................................

$('#add').click(function(){
	val = document.getElementById('name_thems').value;
	All_thems = document.getElementById("choises_thems");	
		All_thems.innerHTML += val;
		All_thems.innerHTML += '; ';
} )

$('#go').click(function(){
	$("#select_thems").css({"display": "none"});
	var dataFromServer = new Object();
	if(All_thems){
		dataFromServer.thems = All_thems.innerHTML;
	//отправим данные на сервер
	 $.ajax('/', {
		method: 'POST',
	data: {klientData: dataFromServer},
	fail: function(){alert('Не удалось отправить данные на сервер, повторите попытку');},
	success: function(response){
		actual_question = 0;
		arr_questions = response;
		data_question = arr_questions[actual_question].data
		//преобразуем данные из JSON строки в js объект
		data_question = JSON.parse(data_question);
		//запишем вопрос в блок с id = 'question'	
		$('#question').text(data_question.question);
		//добавим варианты ответов
		for(var i = 0; i <= data_question.answers.length-1; i++){
			$('#test').append("<div class = 'var_ans'></div>");
		}
		var anw = $('#test').children();//массив потомков секции тестирования
		//пробежимся по потомкам начиная со второго (потому-что первый потомок содержит сам вопрос) и вставим текст вопроса
		for(var i = 0; i <= data_question.answers.length-1; i++){
			anw[i+1].innerHTML = data_question.answers[i];
		}		
	}	
})
}
	else {alert('Выбирите тему')};
	$("#go").css({"display": "none"});
})

//т. к. блоки с вариантами ответов создаются динамически то для обработки событий на них делегируем событие блоку с идентификатором test который присутствует изначально, с момента загрузки страницы
$(document).ready($("#test").on('click', '.var_ans', function(e){
	var cont = $(this);
	var anw = $('#test').children();
	num_anw = anw.index(this)-1;
	anw.css({"backgroundColor": "#ececfb"});//при каждомовом клике все варианты красим серым
	cont.css({"backgroundColor": "#bfffbf"});//а тот вариант на ктором кликнули в зелёный
	flag_answer = 1;
	}))
//следующий вопрос	
	$('#next').click(function(){
		 if(flag_answer != 0){
		//удаляем варианты ответов предыдущего вопроса
		$('#test').children('.var_ans').remove();
		if(actual_question < arr_questions.length - 1)
		{//формируем POST запрос в котором отправляем на сервер номер вопроса и номер варианта ответа
		var dataFromServer = new Object();
		 dataFromServer.actual_question = actual_question;
		 dataFromServer.num_anw = num_anw;
		
			 	//отправим данные на сервер 
			$.ajax('klientanswer',{
			 method: 'POST',
			 data: {klientData: dataFromServer},
			 fail: function(){alert('Не удалось отправить данные на сервер, повторите попытку');},
			 success: function(res){
				 flag_answer = 0; //обнуляем флаг ответа			 	 
				 actual_question++; //счётчик номера вопроса увеличиваем на 1 (следующий вопрос)
				 data_question = arr_questions[actual_question].data
 				//преобразуем данные из JSON строки в js объект
				console.log(data_question);
				data_question = JSON.parse(data_question);
			
				//запишем вопрос в блок с id = 'question'	
				$('#question').text(data_question.question);
				//добавим варианты ответов
				for(var i = 0; i <= data_question.answers.length-1; i++){
					$('#test').append("<div class = 'var_ans'></div>");
				}
				var anw = $('#test').children();//массив потомков секции тестирования
				//пробежимся по потомкам начиная со второго (потому-что первый потомок содержит сам вопрос) и вставим текст вопроса
				for(var i = 0; i <= data_question.answers.length-1; i++){
					anw[i+1].innerHTML = data_question.answers[i];
					}	
			 } 
	
		
		 })
		 
		 }	
		 else {
			 console.log('Вопросы закончились');
			 var dataFromServer = new Object();
			 dataFromServer.actual_question = actual_question;
			 dataFromServer.num_anw = num_anw;
			 $.ajax('klientanswer',{
			 method: 'POST',
			 data: {klientData: dataFromServer},
			 fail: function(){alert('Не удалось отправить данные на сервер, повторите попытку');},
			 success: function(res){
				 console.log('OK');
			 } 
	
		
		 })
			alert("Вопросы закончились нажмите кнопку Завершить тестироание")
		}
	}else alert('Вы не ответили на вопрос');}
	)

