var express = require('express');
var app = express();
var body = require('body-parser');
var multer = require('multer');
var upload = multer({dest: 'public/uploads/'});
var DB = require('mysql');
var cookieParser = require('cookie-parser'); 
var fs = require('fs');

app.use(cookieParser());
app.use(body.json());
app.use(body.urlencoded({extended: true}));
app.use(express.static("public"));

var connection = DB.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'K11131719',
	database: 'training'
});

app.set('view engine', 'ejs');

//блок некоторых служебных переменных глобальной области видимости
var arr_question = [];//массив вопросов по результатам выборки из БД
//var arr_badans = new Array();//массив  номеров неправильных ответов
var actual_question = 'default';//номер текущего вопроса
var actual_bad_answer = 'default';//номер текущего неправильного отвта
//.........................................................................

//рендер страницы выбора тем для проверки (главная)
app.get('/', function(req, res){
	var err = [];//массив вопроссов на которые данн неверный ответ для отправки клиенту (обнуление)
	 count_anw = 0;// количество ответов на которыен ответил пользователь (обнуление)
	 arr_bad_anw = [] ;//массив номеров неправильных ответов (обнуление)
	var SELECT = 'SELECT name FROM thems GROUP BY name';
	connection.query(SELECT, function(error, results, fields){
		if(error){
			console.log("Не удалось соединиться с базой данных");
			res.send('Не удалось соедениться с базой данных');
		}
		else{
			var result = new Array();
			count_anw = 0;
			res.render('index', {names: results});			
		}
	})
		
	res.end;
})
//страница создания карточки вопроса (для админа и запаролена)
app.get('/entercard', function(req, res){
	var SELECT = 'SELECT name FROM thems'
	connection.query(SELECT, function(error, results, fields){
		if(error){
			console.log("Не удалось соединиться с базой данных");
			res.send('Не удалось соедениться с базой данных');
		}
		else{
			
			res.render('enter_cart', {names: results});			
		}
	})
	res.end; 
})
//формирование массива вопросов
app.post('/', function(req, res){
	var str = req.body.klientData.thems;//строка из тем идущих через ;  и пробел
	//разбивка строки на массив
	var arrStr = str.split('; ');
	//если массив не пустой
	if(arrStr.length) {//последний элемент в таком массиве получается строка с одним пробелом, удалим её	
	arrStr.pop();
	//формируем строку SQL запроса к БД по выбранным пользователем темам
	var SELECT = 'SELECT data FROM cards INNER JOIN thems ON cards.thems_id = thems.id WHERE thems.name = ' + 	 	"'" + arrStr[0] + "'";
	var cond = '';//заготовка пустой строки условия
	for(var i = 1; i<=arrStr.length-1; i++){
		cond +=   " OR " + 'thems.name = ' + "'" + arrStr[i] + "'"
	}
	SELECT += cond;
	SELECT += ' ORDER BY RAND();';//добавление в условие выборки случайной последовательности
	connection.query(SELECT, function(error, results, fields){
		if(error){
			console.log('Ошибка связи с базой данных');
			res.send('Что-то пошло не так свяжитесь с администратором сайта')}
		else{
		arr_question = results;
		res.send(results);
	} 
} )
	}
	else {res.send('Выберите тему')}
})
//добавление карточки в БД
app.post('/entercard', function(req, res){
	//переменная которая принимает данные от клиента
	var klientData = req.body.klientData;
	//разберём данные для их дальнейшей записи в БД
	//выберем тему
	var thems = klientData.thems;
	//выберем данные карточки
	var dataCards = {};
	dataCards = {
		question: klientData.question,
		answers: klientData.answers,
		stat: klientData.stat,
		coment: klientData.coment
	}
	dataCards = JSON.stringify(dataCards);
	var SELECT = 'SELECT id FROM thems WHERE name = ' + "'" + klientData.thems + "'";
	connection.query(SELECT, function(error, results, fields){
		if(error){
			console.log("Неудачное соединение с БД при попытке извлечь id темы");
		}
		else{
			var idThems = results[0].id;
			var INSERT = "INSERT INTO cards (data, thems_id) VALUES (" + "'" + dataCards + "'," +  idThems +");"
			//var insFile = fs.createWriteStream('queryIns.txt');
			//insFile.write(INSERT);
			//console.log(INSERT);
			connection.query(INSERT, function(error, results, fields){
				if(error){
					console.log('Ошибка при занесении карточки в БД');
				}
				else{
					console.log('Данные успешно добавлены');
					res.send('1');//вернём простую строку чтобы сработал метод sucsses  на клиенте
				}
			})
		}
	})
	
})
//добавление новой темы в БД
app.post('/addThems', function(req, res){
	var INSERT = 'INSERT INTO thems (name) VALUES (' + '"' + req.body.thems +'"' + ');'
	connection.query(INSERT, function(error, results, fields){
		if (error) 
			console.log('error....');
		else {	
			var SELECT = 'SELECT name FROM thems';		
			connection.query(SELECT, function(error, results, fields){
				if(error){
					console.log("Не удалось соединиться с базой данных");
					res.send('Не удалось соедениться с базой данных');
						}
				else{
					//var result = new Array();
					res.render('enter_cart', {names: results});			
					}
			})	
}
	})
	});
	var count_anw = 0;// количество ответов на которыен ответил пользователь
	var arr_bad_anw = [] ;//массив номеров неправильных ответов
 //приём ответа на вопрос и его обработка
 app.post('/klientanswer', function(req, res){
	 var ans = req.body.klientData;
	 if (ans === 'stop'){
		 count_anw++
		 } else{
		  //создадим локальный массив данных для каждого пользователя
	// var local_arr_question = new Array()
	 //local_arr_question = arr_question;
	 //первод строковых данных в числовые
	 ans.num_anw = +ans.num_anw;
	 ans.actual_question = +ans.actual_question;
	 var ans_string = arr_question[ans.actual_question];//строка ответа
	
	 ans_string = JSON.parse(ans_string.data);//объект ответа
	 	 if(ans_string.stat[ans.num_anw] == 'true'){ 
			 count_anw++ 
		// console.log('Счётчик', count_anw);
	 }else{
		 arr_bad_anw.push(ans.actual_question);//добавляет номер неправильного ответа в массив неправильных ответов
		 count_anw++
		// console.log('нет', arr_bad_anw, count_anw);
	 }
	 }
		 
	 
	
	 res.send('1');//возвращаем просто строку чтобы запрос сработал на клиенте
 })
 var ststistica = 0;//переменная которая хранит статистику
 
 //обработка завершения тестирования
 app.post('/stop', function(req, res){
	 //посчитать статистику и передать в новую страничку
	 statistica = (arr_bad_anw.length/count_anw)*100
	 statistica = Math.round(statistica);
	 console.log(statistica, 'Длинна массива ошибок= ' + arr_bad_anw.length, 'Массив ошибок= '+ arr_bad_anw, 'Текущее значение счётчика= ' + count_anw);
	 res.render('statistica', {value: statistica});//страничка со статистикой, неправильными ответами и ссылкой на главную 
 })
 
 
 app.get('/err_answers', function(req, res){
	 var err = [];//массив вопроссов на которые данн неверный ответ для отправки клиенту
	 for(var i = 0; i < arr_bad_anw.length; i++){
		 err.push(arr_question[arr_bad_anw[i]]);
	 } console.log(err);
	 
	 res.render('error_answers', {errors: err});
	 
 })
 var server = app.listen(4051, function(){
	console.log('listen port 4051...');
});