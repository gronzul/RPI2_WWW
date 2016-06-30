var application_root = __dirname;
var express = require('express');
app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);
sys = require('util'),
exec = require('child_process').exec;
var child;
var sock;
var port = 5003;
var proc;

app.use(express.static('public'));
server.listen(port);
console.log('Socket in ascolto sulla porta *.'+ port);

var GPIO = require('onoff').Gpio;				//modulo pm2 installato: onoff 
var ledGiallo = new GPIO(25, 'out');			//imposta le porte in e out
var ledVerde = new GPIO(24, 'out');
var rele4 = new GPIO(4, 'out');					
var rele3 = new GPIO(17, 'out');
var rele2 = new GPIO(27, 'out');
var rele1 = new GPIO(22, 'out');
var button = new GPIO(23, 'in', 'both');

var sockets = {};								//Variabile contenente i client connessi

initGpio();										//Inizializzazione porte GPIO

/***********************************************************************************************/
io.on('connection', function(socket)
{
	sock = io.sockets; 
	sockets[socket.id] = socket;
	timeconn = new Date().getTime();
	
	console.log(timeconn, ' -- connection:', socket.request.connection._peername);
	console.log("Totale clients connessi: ", Object.keys(sockets).length);	
	
	socket.on('getLedStatus', function ()   
	{
		io.sockets.emit('ledstatus', readLed());		
	});	
	
	socket.on('getReleStatus', function ()   
	{
		io.sockets.emit('relestatus', readRele());
	});
	
	socket.on('disconnect', function() 
	{
		delete sockets[socket.id];
		// no more sockets, kill the stream
		if (Object.keys(sockets).length == 0) 
		{
			if (proc) proc.kill();
		}
		console.log('Disconnessione client:' ,socket.request.connection._peername)
		console.log("Clients totali connessi : ", Object.keys(sockets).length);
	});
	
	/*socket.on('dorele', function (rele, stato)   
	{		
		valore =0
		if (stato == true)
		{
			valore =0
		}
		else
		{
			valore =1
		}
			
		switch(rele)
		{
			case 1:
				rele1.writeSync(valore); 
				break;
			case 2:
				rele2.writeSync(valore); 
				break;
			case 3:
				rele3.writeSync(valore); 
				break;
			case 4:
				rele4.writeSync(valore); 
				break;
		}
		io.sockets.emit('relestatus',readRele());
		console.log("rele:" + rele +  " - Stato:" + stato);
	});*/
	
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
		io.sockets.emit('ledstatus', readLed());
		console.log("Led:" + Led +  " - Stato:" + stato);
	});	
	
	/*socket.on('dorele2', function (rele, data, statrele) 
	{		
		stato = data.checked;		
		console.log ("valore1:", stato);		
		
		valore =0
		if (stato == true)
		{
			valore =0
		}
		else
		{
			valore =1
		}		
		
		switch(rele)
		{
			case 1:
				rele1.writeSync(valore); 
				break;
			case 2:
				rele2.writeSync(valore); 
				break;
			case 3:
				rele3.writeSync(valore); 
				break;
			case 4:
				rele4.writeSync(valore); 
				break;
		}		
			
		var statsrele=readRele();
		io.sockets.emit('dorele2', rele, {checked: stato}, statsrele);  
	});	*/
	
	socket.on('doact', function (data) 
	{								
		stato = data.checked;		
		idctrl = data.id		
		console.log ("valore:", stato, "  - controllo:", idctrl);				
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
		var statsrele=readRele();
		io.sockets.emit('doact', {id: idctrl, checked: stato, statusrele: statsrele}); 
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
				  io.sockets.emit('temperatureUpdate2', date, temp,fmax,fhigh,flow); 
				  //console.log(stringIn);
				  //console.log('date: ' + date  +  "-TEMP:"+ temp +  " fmax:"+ fmax +  " fhigh:"+ fhigh + " flow:"+ flow);
				}
			});
		}
		
		
		/*if (Object.keys(sockets).length > 0)
		{
			child = exec("cat /sys/class/thermal/thermal_zone0/temp", function t(error, stdout, stderr) 
			{
				if (error !== null) 
				{
				  console.log('exec error: ' + error);
				} else 
				{
				  // You must send time (X axis) and a temperature value (Y axis) 
				  var date = new Date().getTime();
				  var temp = parseFloat(stdout)/1000;
				  //socket.emit('temperatureUpdate', date, temp); 
				  io.sockets.emit('temperatureUpdate', date, temp); 
				  //console.log('date: ' + date  +  "TEMP:"+ temp);
				}
			});
		}*/
//		else
//		{
//			console.log('Non ci sono client collegati');
//		}
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
/***********************************************************************************************/

/********************************************************************/
/* Funzione che intercetta la presssione del pulsante               */
/********************************************************************/
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
/********************************************************************/
