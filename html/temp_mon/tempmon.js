var application_root = __dirname;
var express = require('express');
var goglib = require("./google.js");
var GPIO = require('onoff').Gpio;				//modulo pm2 installato: onoff 
var mysql =  require('mysql');

app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);
sys = require('util'),
exec = require('child_process').exec;

/*******************************************
Variabili globali
********************************************/
var child;
var sock;
var port = 5003;
var proc;
var ledGiallo = new GPIO(25, 'out');			//imposta le porte in e out
var ledVerde = new GPIO(24, 'out');
var rele4 = new GPIO(4, 'out');
var rele3 = new GPIO(17, 'out');
var rele2 = new GPIO(27, 'out');
var rele1 = new GPIO(22, 'out');
var button = new GPIO(23, 'in', 'both');
var pir = new GPIO(18, 'in', 'both');
var sockets = {};								//Variabile contenente i client connessi
var totconnessi=0;

var connection =  mysql.createConnection({
  	host : "localhost",
  	user : "ut_tempmon",
  	password: "Voda1234"
  });
connection.connect();					
connection.query("use tempmon");					
/*********************************************/

app.use(express.static('public'));
server.listen(port);
console.log('Socket in ascolto sulla porta *.'+ port);

initGpio();										//Inizializzazione porte GPIO


/***********************************************************************************************/
io.on('connection', function(socket)
{
	sock = io.sockets;
	sockets[socket.id] = socket;
	timeconn = new Date().getTime();
	totconnessi=Object.keys(sockets).length;
	console.log(timeconn, ' -- connection:', socket.request.connection._peername);
	console.log("Totale clients connessi: ", totconnessi);

	io.sockets.emit('totconnessi', {TotConnessi: totconnessi});

	socket.on('getLedStatus', function ()
	{
		io.sockets.emit('ledstatus', readLed());
	});

	socket.on('getReleStatus', function ()
	{
		io.sockets.emit('relestatus', readRele());
	});

	socket.on('sendNotifica', function ()
	{				
		GetKey(function(keys){				
		//console.log(">>keys.length:" + keys.length + " - " + keys[0].valore+ " - " + keys[1].valore);		
		sock.emit('dopir','on'); // TEST INVIO DOPIR contestuale alla notifica
		goglib.SendNotifica(keys);
		});			
	});

	socket.on('disconnect', function()
	{
		delete sockets[socket.id];
		// no more sockets, kill the stream
		totconnessi=Object.keys(sockets).length;

		if (totconnessi == 0)
		{
			if (proc) proc.kill();
		}
		console.log('Disconnessione client:' ,socket.request.connection._peername)
		console.log("Clients totali connessi : ", totconnessi);
		io.sockets.emit('totconnessi', {TotConnessi: totconnessi});
	});

	socket.on('doled', function (Led, stato)
	{
		valore =0
		if (stato == true)
		{
			valore =1
			}
		else
		{
			valore =0
			}

		switch(Led)
		{
			case 'lv':
				ledVerde.writeSync(valore);
				break;
			case 'lg':
				ledGiallo.writeSync(valore);
				break;
		}

		setTimeout(function()
		{
			io.sockets.emit('ledstatus', readLed());
			//if (stato == true){io.sockets.emit('dopir','on')};
			//console.log("Led:" + Led +  " - Stato:" + stato);
		},	500);
	});

	socket.on('doact', function (data)
	{
		stato = data.checked;
		idctrl = data.id
		//console.log ("valore:", stato, "  - controllo:", idctrl);
		valore =0
		if (stato == true)
		{
			valore =0
		}
		else
		{
			valore =1
		}

		switch(idctrl)
		{
			case "toggle-Rele1":
				rele1.writeSync(valore);
				break;
			case "toggle-Rele2":
				rele2.writeSync(valore);
				break;
			case "toggle-Rele3":
				rele3.writeSync(valore);
				break;
			case "toggle-Rele4":
				rele4.writeSync(valore);
				break;
		}
		//Ritardo di propagazione per evitare il loop
		setTimeout(function()
		{
			var statsrele=readRele();
			io.sockets.emit('doact', {id: idctrl, checked: stato, statusrele: statsrele});
		},	500);

	});
	
	socket.on('savetoken', function (newtoken)
	{		
		console.log(">>newtoken: " + newtoken);			
		SaveToken(newtoken, function(data){
			var string=JSON.stringify(data);
			var json =  JSON.parse(string);											
			var json1= json[0];
			var retmsg = json1[0].retmsg
			io.sockets.emit('savetoken_response', retmsg);
			console.log(">>savetoken_response: " + retmsg);			
		});
	});	
});
/***********************************************************************************************/


/***********************************************************************************************/
// When we open the browser establish a connection to socket.io.
// Every 5 seconds to send the graph a new value.
io.sockets.once('connection', function(socket)
{
	console.log('connection :', socket.request.connection._peername);
	console.log("Totale clients once connected : ", Object.keys(sockets).length);

	setInterval(function()
	{

		if (Object.keys(sockets).length > 0)
		{
			child = exec("python /usr/lib/cgi-bin/mon/getTemp.py -c getTemp", function t(error, stdout, stderr)
			{
				if (error !== null)
				{
				  console.log('exec error: ' + error);
				} else
				{
				  //console.log(stdout);
				  var stringIn = stdout.split("|")

				  var temp = parseFloat(stringIn[0]);
				  var fmax = stringIn[1];
				  var fhigh = stringIn[2];
				  var flow = stringIn[3];
				  var date = new Date().getTime();
				  //io.sockets.emit('temperatureUpdate2', date, temp,fmax,fhigh,flow);
				  io.sockets.emit('temperatureUpdate2',{date: date, temperature:temp,flagTmax:fmax,flagThigh:fhigh,flagTlow:flow});
				  //console.log(stringIn);
				  //console.log('date: ' + date  +  "-TEMP:"+ temp +  " fmax:"+ fmax +  " fhigh:"+ fhigh + " flow:"+ flow);
				}
			});
		}
	}, 2000);
});
/***********************************************************************************************/

/***********************************************************************************************/
function readRele(){
	valore = 0
	r1 = Math.pow(2,0) * rele1.readSync()
	r2 = Math.pow(2,1) * rele2.readSync()
	r3 = Math.pow(2,2) * rele3.readSync()
	r4 = Math.pow(2,3) * rele4.readSync()
	valore = 15 - (r1 + r2 +r3 + r4);
	//console.log('Valore: '+ valore +"  =>" + r1+ " - " + r2 +" - " +r3 +" - " +r4 );
	return valore;
	}

/***********************************************************************************************/
function readLed(){
	valore = 0
	l1 = Math.pow(2,0) * ledVerde.readSync()
	l2 = Math.pow(2,1) * ledGiallo.readSync()
	valore = (l1 + l2 );
	return valore;
	}
/***********************************************************************************************/

function initGpio()
{
	Led_Status="";
	Colore="";
	//Init LED e Rele to off
	ledVerde.writeSync(0);
	ledGiallo.writeSync(0);
	rele1.writeSync(1);
	rele2.writeSync(1);
	rele3.writeSync(1);
	rele4.writeSync(1);
	return 0;
}

function SaveToken(idToken, callback)
{	
	strQuery = "CALL `tempmon`.`new_token`('" + idToken +"');";
	connection.query( strQuery, function(err, results){
	if(err){
		throw err;
	}else
	{
		callback(results);
	}
	});	
}

function GetKey(callback)
{
	/**
	http://stackoverflow.com/questions/15982788/nodejs-asynchronous-database-function-needs-synchronous-answer
	**/	
	strQuery = "SELECT valore FROM tempmon.t_google_data where id_tipo_chiave in (1,2);"
	connection.query( strQuery, function(err, results){
	if(err){
		throw err;
	}else
	{			
		/*console.log('>> results: ', results );
        var string=JSON.stringify(results);
        console.log('>> string: ', string );
        var json =  JSON.parse(string);
        console.log('>> json: ', json);
        console.log('>> valore: ', json[0].valore);        
        //next();			
		//var string=JSON.stringify(results);
		//var json =  JSON.parse(string);		
		//var valore = json[0].valore;
		//console.log('>> Key id:'+ idkey,valore );        				
		//return valore;
		*/
		callback(results);
	}
	});					
}

/***********************************************************************************************/

/*******************************************************************
  Funzione che intercetta la presssione del pulsante
 *******************************************************************/
button.watch(function(err, state)
{
if(state == 1)
	{
		//ledVerde.writeSync(0);
		if (sock)
		{
			//console.log('LED off');
			sock.emit('doinput', 'off');
		};
	}
	else
	{
		// turn LED off
		//ledVerde.writeSync(1);
		if (sock)
		{
			//console.log('LED on');
			sock.emit('doinput','on');
		};
	}
});

pir.watch(function(err, state)
{
if(state == 0)
	{
		ledVerde.writeSync(0);
		if (sock)
		{
			console.log('dopir off');			
			GetKey(function(keys)
			{	
				sock.emit('dopir','off');			
				goglib.SendNotifica(keys);			
			});			
		};
	}
	else
	{
		// turn LED off
		ledVerde.writeSync(1);
		if (sock)
		{
			console.log('dopir on');				
			GetKey(function(keys)
			{	
				sock.emit('dopir','on');			
				goglib.SendNotifica(keys);			
			});
		};
	}
});

/********************************************************************/
