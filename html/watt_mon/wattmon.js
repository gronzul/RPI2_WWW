var application_root = __dirname;
var express = require('express');
var mysql =  require('mysql');

app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);
sys = require('util'),
exec = require('child_process').exec;

var child;
var sock;
var port = 5004;
var proc;

app.use(express.static('public'));
server.listen(port);
console.log('WATT Monitor Socket in ascolto sulla porta *.'+ port);

var sockets = {};
var FlagClientConnesso= false;		
var AVG_misura= [0,0,0,0,0,0];						
var MAX_misura= [0,0,0,0,-10000,0];
var MIN_misura= [10000,10000,10000,10000,0,10000];						

var itz =0;
var maxitz=30;

var connection =  mysql.createConnection({
  	host : "localhost",
  	user : "ut_wattmon",
  	password: "BuaBwUpttwSTd5tq"
  });


connection.connect();					
connection.query("use wattmon");					
//connection.query("delete from `t_consumi`;");					

 
io.on('connection', function(socket)
{
	sock = io.sockets; 
	sockets[socket.id] = socket;
	console.log('connection :', socket.request.connection._peername);
	console.log("Clients totali connessi : ", Object.keys(sockets).length);
	
	socket.on('disconnect', function() 
	{
		delete sockets[socket.id];
		// no more sockets, kill the stream
		if (Object.keys(sockets).length == 0) 
		{
			if (proc) proc.kill();
		}
		//console.log('Disconnessione client:' ,socket.request.connection._peername)
		console.log("Clients totali connessi : ", Object.keys(sockets).length);
	});	
	
	socket.on('getDbData', function ()   
	{
		var callback = function(err, result) {
			//console.log('json:', result);			
			io.sockets.emit('getDbDataRes', result);
		};						
		var rows = getFromDb(callback);				
	});			
});

// When we open the browser establish a connection to socket.io. 
// Every x seconds to send the graph a new value.

io.sockets.once('connection', function(socket) 
{
	console.log('once connection :', socket.request.connection._peername);
	console.log("Total clients connected : ", Object.keys(sockets).length);	
	setInterval(function()
	{		
		if (Object.keys(sockets).length > 0)
		{
			FlagClientConnesso= true;
		}
		else
		{
			FlagClientConnesso= false;		
		}		
	}, 1000);
});
 

setInterval(function() { 

			
				//child = exec("sudo sdm120c -a 1  -b 9600 -P N  -2 /dev/ttyUSB0 -z 10 -w2", function t(error, stdout, stderr) 
				child = exec("sudo sdm120c -a 1  -b 9600 -P N  -2  -p -v -c -f -t -l -n -C  /dev/ttyUSB0 -z 10 -w2 -q", function t(error, stdout, stderr) 			
				{
					if (error !== null) 
					{
					  console.log('exec error: ' + error);
					} else 
					{			  				  
						var stringIn = stdout.split(" ")				  												
						var Voltage = stringIn[0];
						var Current = stringIn[1];
						var Power = stringIn[2];
						var ActiveApparentPower= stringIn[3];
						var ReactiveApparentPower= stringIn[4];										
						var Frequency= stringIn[5];
						var TotalActiveEnergy= stringIn[6];				  
						var TotalReactiveEnergy= stringIn[7];
						
						var time = new Date().getTime();
						
						if (FlagClientConnesso == true)
						{						
							io.sockets.emit('getPower', time, Voltage,Current,Power,ActiveApparentPower,ReactiveApparentPower,Frequency,TotalActiveEnergy,TotalReactiveEnergy);						
						}
						/*else{
							console.log("No Client connessi");				
						}*/
						
						/*
						//console.log("Data: "+ time +" Voltage:" + Voltage+" Current:" + Current +" Power:" + Power+" Frequency:" + Frequency +" TotalActiveEnergy:" + TotalActiveEnergy / 1000);				  															

						//log2DB(Voltage,Current,Power,ActiveApparentPower,ReactiveApparentPower,Frequency,TotalActiveEnergy,TotalReactiveEnergy);
						*/
						Voltage=parseFloat(Voltage)	;											
						Current=parseFloat(Current)	;											
						Power=parseFloat(Power)	;										
						ActiveApparentPower=parseFloat(ActiveApparentPower)	;
						ReactiveApparentPower=parseFloat(ReactiveApparentPower)	;
						Frequency=parseFloat(Frequency)	;
						
						if(itz > (maxitz-1))
						{											
							for (var i = 0; i< 6; i++) {
								AVG_misura[i] = AVG_misura[i]  /maxitz;
								//console.log("i=", i, " AVG_misura", AVG_misura[i])
							}										
							
							/*console.log("AVG_Voltage              :" , AVG_misura[0] ,"- MAX:" , MAX_misura[0] ," - MIN:" , MIN_misura[0]);	
							console.log("AVG_Current              :" , AVG_misura[1] ,"- MAX:" , MAX_misura[1] ," - MIN:" , MIN_misura[1]);	
							console.log("AVG_Power                :" , AVG_misura[2] ,"- MAX:" , MAX_misura[2] ," - MIN:" , MIN_misura[2]);	
							console.log("AVG_ActiveApparentPower  :" , AVG_misura[3] ,"- MAX:" , MAX_misura[3] ," - MIN:" , MIN_misura[3]);	
							console.log("AVG_ReactiveApparentPower:" , AVG_misura[4] ,"- MAX:" , MAX_misura[4] ," - MIN:" , MIN_misura[4]);	
							console.log("AVG_Frequency            :" , AVG_misura[5] ,"- MAX:" , MAX_misura[5] ," - MIN:" , MIN_misura[5]);	
							*/
							
							/********************************************************************/
							log2DB2(AVG_misura,MAX_misura,MIN_misura);							
							AVG_misura= [0,0,0,0,0,0];						
							MAX_misura= [0,0,0,0,-10000,0];						
							MIN_misura= [10000,10000,10000,10000,0,10000];												
							itz=0;
							/********************************************************************/
						}
									
						/***************************************************************************************/								
						AVG_misura[0] += Voltage;
						AVG_misura[1] += Current;
						AVG_misura[2] += Power;
						AVG_misura[3] += ActiveApparentPower;
						AVG_misura[4] += ReactiveApparentPower;
						AVG_misura[5] += Frequency;
						
						/***************************************************************************************/
						if (Voltage > MAX_misura[0]){MAX_misura[0] =Voltage};
						if (Current > MAX_misura[1]){MAX_misura[1] =Current};
						if (Power > MAX_misura[2]){MAX_misura[2] =Power};
						if (ActiveApparentPower > MAX_misura[3]){MAX_misura[3] =ActiveApparentPower};
						if (ReactiveApparentPower > MAX_misura[4]){MAX_misura[4] =ReactiveApparentPower};
						if (Frequency > MAX_misura[5]){MAX_misura[5] =Frequency};
						
						/***************************************************************************************/
						if (Voltage < MIN_misura[0]){MIN_misura[0] =Voltage};
						if (Current < MIN_misura[1]){MIN_misura[1] =Current};
						if (Power < MIN_misura[2]){MIN_misura[2] =Power};
						if (ActiveApparentPower < MIN_misura[3]){MIN_misura[3] =ActiveApparentPower};
						if (ReactiveApparentPower < MIN_misura[4]){MIN_misura[4] =ReactiveApparentPower};
						if (Frequency < MIN_misura[5]){MIN_misura[5] =Frequency};
														
						itz+=1;															
					}				
				});				
				
			
}, 1000);


function log2DB2(AVG_misura,MAX_misura,MIN_misura)
{
	var data_misura = new Date().toISOString().slice(0, 19).replace('T', ' ')	
	var strQuery = "INSERT INTO `t_consumi_log`(`id_sensore`, `data_misura`, `AVG_Voltage`, `AVG_Current`, `AVG_Power`, `AVG_ActiveApparentPower`, `AVG_ReactiveApparentPower`, `AVG_Frequency`, `MAX_Voltage`, `MAX_Current`, `MAX_Power`, `MAX_ActiveApparentPower`, `MAX_ReactiveApparentPower`, `MAX_Frequency`, `MIN_Voltage`, `MIN_Current`, `MIN_Power`, `MIN_ActiveApparentPower`, `MIN_ReactiveApparentPower`, `MIN_Frequency`)   VALUES (1,'" + data_misura +"',"+ AVG_misura[0]+","+ AVG_misura[1]+","+ AVG_misura[2]+","+ AVG_misura[3]+","+ AVG_misura[4]+","+ AVG_misura[5]+","+ MAX_misura[0]+","+ MAX_misura[1]+","+ MAX_misura[2]+","+ MAX_misura[3]+","+ MAX_misura[4]+","+ MAX_misura[5]+","+ MIN_misura[0]+","+ MIN_misura[1]+","+ MIN_misura[2]+","+ MIN_misura[3]+","+ MIN_misura[4]+","+ MIN_misura[5]+")";
	
	//console.log(strQuery);
	connection.query( strQuery, function(err, rows){
	if(err)	{
		throw err;
	}else{
		//console.log( rows );
		return 0;		
	}
	});			
}


function log2DB(Voltage,Current,Power,ActiveApparentPower,ReactiveApparentPower,Frequency,TotalActiveEnergy,TotalReactiveEnergy)
{	
	var data_misura = new Date().toISOString().slice(0, 19).replace('T', ' ')	
	var strQuery = "INSERT INTO `t_consumi`( `id_sensore`, `data_misura`, `Voltage`, `Current`, `Power`, 	`ActiveApparentPower`, `ReactiveApparentPower`, `Frequency`, `TotalActiveEnergy`, `TotalReactiveEnergy`) VALUES (1,'" + data_misura +"',"+ Voltage+","+Current+","+Power+","+ActiveApparentPower+","+ReactiveApparentPower+","+ Frequency+","+TotalActiveEnergy+","+TotalReactiveEnergy +");";
		
	connection.query( strQuery, function(err, rows){
	if(err)	{
		throw err;
	}else{
		return 0;
		//console.log( rows );
	}
	});	
	/*connection.end(function(err){
		// Do something after the connection is gracefully terminated.
		console.log( "connection is gracefully terminated.");
	});	
	console.log(strQuery);  					
		*/				  	
}

function getFromDb(callback){
	//callback, queryData	
	var json = '';
	//var strQuery = "select data_misura, Power from t_consumi order by id_consumo asc"		
	var strQuery = "select data_misura, Power from t_consumi order by id_consumo asc LIMIT 50"		
	connection.query(strQuery, function(err, results, fields) {
        if (err)
            return callback(err, null);        
		//console.log('The query-result is: ', results[0]);
        // wrap result-set as json
        json = JSON.stringify(results);
        /***************
        * Correction 2: Nest the callback correctly!
        ***************/
        //connection.end();
        //console.log('JSON-result:', json);
        callback(null, json);
    });
	
}