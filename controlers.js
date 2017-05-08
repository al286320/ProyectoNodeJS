const db=require('./myStorage');
var DB=new db.myDB('./data');

const mng=require('mongoose');
const my_conn_data="mongodb://al286320:labora2000@ds117251.mlab.com:17251/mydb";
var dbMongo = mng.connect(my_conn_data);
var itemSchema = new mng.Schema({
	"@context":String,
	"@type": String,
	"@id":String,
	"query":String,
	"agent": String,
	"startTime":Date,
	"url":String
});
var ItemModel = mng.model('Item', itemSchema);




function getGraphMondoDB(callback){


		ItemModel.find(function (err, data) {
  		if (err) return console.error(err);
  		console.log(data);
			callback(data);
});

 }

function insertMongoDB(name,query){

	var dato = new ItemModel(createJSONLD(name,query));

	dato.save(function(err){
		if(err) throw err;
		console.log("Guardado");
	});
}


function createJSONLD(name,query){
	var dev = {
		"@context":"http://schema.org",
		"@type":"SearchAction",
		"@id":name,
		"query":query,
		"agent": "Creador fijo",
		"startTime":new Date(),
		"url":"http://localhost:8000/dateset"
	}
	return dev;

}

function getDataSets(name,n,callback){
    DB.getLastObjects(req.params.name,n,function(data){
        callback(data);
    })
}

function getPolaridad(name,n, callback) {
	DB.getLastObjects(name,n,function(data, name){
		//contador = 0;
		var positive = 0;
		var neutral = 0;
		var negative = 0;
		for (var i in data.result){
			var pol = data.result[i].sentiment;
			if( pol == 0){
				neutral ++;
			}else if( pol < 0){
				negative ++;
			}else{
				positive ++;
			}
			/*contador ++;
			if (contador > 100){
				break;
			}*/
		}
		//positive=positive*0.1;
		//negative=negative*0.1;
		var aux = {positive: positive, negative:negative,neutral:neutral};

		callback({result:aux});
	})
}


function getHistograma(name,top,n,callback){
	DB.getLastObjects(name,n,function(data,name){

		var dic = {};
		for (var i in data.result){
			var str = data.result[i].text.toLowerCase().split(' ');
			for ( var j in str){
				if (!dic.hasOwnProperty(str[j])) {
      				dic[str[j]] = 0;
   				}
    			dic[str[j]]++;
			}
		}
		var L=[];
		for(var k in dic){
			L.push([k,dic[k]*5]);
		}
		L.sort(function(x, y){return y[1]-x[1];});
		var lista=L.slice(0,top);
		callback({result:lista});
	})
}

function getGeo(name,callback){ //Preguntar como coger todos los elementos
	DB.getLastObjects(name,100,function(data,name){
		var lista = [];
		for ( var i in data.result){
			var coor = data.result[i].coordinates;
			var id = data.result[i].tweetID;
			if ( coor != null){
				lista.push([id,coor]);
			}

		}
		callback({result:lista});

	})
}

function getLastTweets(name,limit,callback){
	DB.getLastObjects(name,limit,function(data,name){
		var lista = [];
		for ( var i in data.result){
			var id = data.result[i].tweetID;
			lista.push(id);
		}
		callback({result:lista});
	})
}

function getGraph(callback){

	var datasets=DB.getDatasets();

	var promises = datasets.map(function(name){

 	return new Promise((resolve, reject) =>
 	{
  	DB.getDatasetInfo(name, function(data){
  		console.log(data)
    	resolve(data.result);
   		});
  	});
 });

 Promise.all(promises).then(values =>
 {
  values.map(function(x){
   delete x['@context'];
  });
  callback({'@context':'http://schema.org',
     '@graph': values});
 });
}
exports.getGraphMondoDB = getGraphMondoDB
exports.getDataSets = getDataSets
exports.getPolaridad = getPolaridad
exports.getHistograma = getHistograma
exports.getGeo = getGeo
exports.getLastTweets = getLastTweets
exports.createJSONLD = createJSONLD
exports.getGraph = getGraph
exports.insertMongoDB = insertMongoDB
