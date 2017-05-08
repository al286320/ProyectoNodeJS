const Twitter = require('twitter')
const myCreds = require('./credentials/my-credential.json');

const client = new Twitter(myCreds);
const sentiment = require('sentiment-spanish');
var db=require('./myStorage'),
    DB=new myDB('./data')


var controler = require('./controlers.js')


class StreamManager{

	constructor(){
		this.listaStream={};	
	}

	addStream(name, lista){
		

		var stream = client.stream('statuses/filter', {track: lista});
		this.listaStream[stream]=name;
		//DB.createDataset(name,{name: name, lista: lista})
		DB.createDataset(name, controler.createJSONLD(name, lista));
		stream.on('data', function(tweet) {
		  //filter lang here?
		  //console.log(name);
		  //console.log(tweet.id_str);
		  //console.log(tweet.text);
		 // console.log(tweet.coordinates.coordinates);
		  //console.log(sentiment(tweet.text).score);
		  var a = null;
		  if(tweet.coordinates!=null) a=tweet.coordinates.coordinates;

		  var aux = {tweetID: tweet.id_str, text: tweet.text, coordinates:a, sentiment:sentiment(tweet.text).score};
		  //console.log(aux);
		  DB.insertObject(name,aux);
		});

		stream.on('error', function(err){
		  console.log(err);
		});
	}

	deleteStream(name){
		this.listaStream[name].destroy();
		delete this.listaStream[name];
	}
}
exports.StreamManager = StreamManager;



//Pruebas
//var myStreamManager = new StreamManager();

//myStreamManager.addStream('verano', 'sol,vacaciones,fiesta');
//setTimeout(()=>{myStreamManager.deleteStream('verano')},60000);
//myStreamManager.addStream('ropa','vestido,vaqueros,sudadera');
//setTimeout(()=>{myStreamManager.deleteStream('ropa')},60000);
//myStreamManager.addStream('coches','mercedes,bmw,opel');
//setTimeout(()=>{myStreamManager.deleteStream('coches')},60000);
//myStreamManager.addStream('cafeteria','cafe,cafeteria,bar');
//setTimeout(()=>{myStreamManager.deleteStream('cafeteria')},60000);
//console.log(myStreamManager);