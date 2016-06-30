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

//Init contatori
var NumElementi = 14;
var AVG_misura= AVG_misura;
var MAX_misura=	MAX_misura;
var MIN_misura= MIN_misura;				
InitContatori();	//Init contatori

var itz =0;
var maxitz=30;
var intervallo_campioni = 1000;
var intervallo_check_conn=1000;

var comando = "sudo sdm120c ";
var address= "-a 1 ";
var baud_rate = "-b 9600 ";
var parity ="-P N ";
var Model = "-2 ";
var device= "/dev/ttyUSB0 ";
var num_retries ="-z 10 ";
var timetowait = "-w2 ";
var compactmode = "-q ";
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
		var rows = getFromDb2(callback);				
	});			
});

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
	}, intervallo_check_conn);
});
 

setInterval(function() { 

/***
Voltage: 222.51 V
Current: 2.33 A
Power: 499.39 W
Active Apparent Power: 519.56 VA
Reactive Apparent Power: -143.34 VAR
Power Factor: 0.96
Phase Angle: -16.01 Degree
Frequency: 50.00 Hz
Import Active Energy: 852687 Wh
Export Active Energy: 0 Wh
Total Active Energy: 852687 Wh
Import Reactive Energy: 20876 VARh
Export Reactive Energy: 143283 VARh
Total Reactive Energy: 164159 VARh
OK

222.15 2.36 510.15 524.85 -123.36 0.97 -13.59 49.99 852688 0 852688 20876 143283 164159 OK
**/			
		
	var StringaLetturaSDM220= comando+address+baud_rate+parity+Model+device+num_retries+timetowait+compactmode;			
	child = exec(StringaLetturaSDM220, function t(error, stdout, stderr) 			
	{
		if (error !== null) 
		{
		  console.log('exec error: ' + error);
		} else 
		{			  				  			
			var stringIn = stdout.split(" ")			
			//console.log(stringIn);			
			var Voltage = stringIn[0];
			var Current = stringIn[1];
			var Power = stringIn[2];
			var ActiveApparentPower = stringIn[3];
			var ReactiveApparentPower = stringIn[4];
			var PowerFactor = stringIn[5];
			var PhaseAngle = stringIn[6];
			var Frequency = stringIn[7];
			var ImportActiveEnergy = stringIn[8];
			var ExportActiveEnergy = stringIn[9];
			var TotalActiveEnergy = stringIn[10];
			var ImportReactiveEnergy = stringIn[11];
			var ExportReactiveEnergy = stringIn[12];
			var TotalReactiveEnergy = stringIn[13];
			var StatoLettura = stringIn[14];					
			var time = new Date().getTime();
			
			if (FlagClientConnesso == true)
			{						
		
				/*var StrData = "{time: "+ time + ", Voltage: " + Voltage+ ", Current: " + Current +", Power: " + Power+ ", ActiveApparentPower: "+ ActiveApparentPower + ", ReactiveApparentPower: "+ ReactiveApparentPower + ", PowerFactor: "+ PowerFactor + ", PhaseAngle: "+ PhaseAngle + ", Frequency: "+ Frequency + ", ImportActiveEnergy: "+ ImportActiveEnergy + ",ExportActiveEnergy: "+ ExportActiveEnergy + ",TotalActiveEnergy: "+ TotalActiveEnergy + ",ImportReactiveEnergy: "+ ImportReactiveEnergy + ",ExportReactiveEnergy:"+ ExportReactiveEnergy + ",TotalReactiveEnergy:"+ TotalReactiveEnergy + ",StatoLettura:"+ StatoLettura + "}";*/
				
				io.sockets.emit('getPower2',{time: time, Voltage: Voltage , Current:  Current , Power: Power, ActiveApparentPower: ActiveApparentPower , ReactiveApparentPower: ReactiveApparentPower , PowerFactor: PowerFactor , PhaseAngle: PhaseAngle , Frequency: Frequency , ImportActiveEnergy: ImportActiveEnergy ,ExportActiveEnergy: ExportActiveEnergy ,TotalActiveEnergy: TotalActiveEnergy ,ImportReactiveEnergy: ImportReactiveEnergy ,ExportReactiveEnergy:ExportReactiveEnergy ,TotalReactiveEnergy:TotalReactiveEnergy ,StatoLettura:StatoLettura });		
				//io.sockets.emit('getPower', time, Voltage,Current,Power,ActiveApparentPower,ReactiveApparentPower,Frequency,TotalActiveEnergy,TotalReactiveEnergy);						
			}

			Voltage=parseFloat(Voltage);
			Current=parseFloat(Current);
			Power=parseFloat(Power);
			ActiveApparentPower=parseFloat(ActiveApparentPower);
			ReactiveApparentPower=parseFloat(ReactiveApparentPower);
			PowerFactor=parseFloat(PowerFactor);
			PhaseAngle=parseFloat(PhaseAngle);
			Frequency=parseFloat(Frequency);
			ImportActiveEnergy = parseInt(ImportActiveEnergy);
			ExportActiveEnergy = parseInt(ExportActiveEnergy);
			TotalActiveEnergy = parseInt(TotalActiveEnergy);
			ImportReactiveEnergy = parseInt(ImportReactiveEnergy);
			ExportReactiveEnergy = parseInt(ExportReactiveEnergy);
			TotalReactiveEnergy = parseInt(TotalReactiveEnergy);
						
			if(itz > (maxitz-1))
			{											
				for (var i = 0; i< NumElementi; i++) {
					AVG_misura[i] = AVG_misura[i]/maxitz;
					//console.log("i=", i, " AVG_misura", AVG_misura[i])
				}		
				/*
				for (var i = 0; i< NumElementi; i++) {
					MAX_misura[i] = MAX_misura[i];
					console.log("i=", i, " MAX_misura", MAX_misura[i])
				}		
				
				for (var i = 0; i< NumElementi; i++) {
					MIN_misura[i] = MIN_misura[i];
					console.log("i=", i, " MIN_misura", MIN_misura[i])
				}*/						
								
				/********************************************************************/				
				log2DB3(AVG_misura,MAX_misura,MIN_misura);															
				InitContatori();//Init contatori											
				/********************************************************************/
			}
						
			/***************************************************************************************/	//console.log("itz" + itz+ "\n AVG_misura" + AVG_misura + "\n MAX_misura"+MAX_misura +"\n MIN_misura" +MIN_misura );			
			
			if (StatoLettura =='OK\n')
			{									
				AVG_misura[0] = AVG_misura[0] + Voltage;
				AVG_misura[1] += Current;
				AVG_misura[2] += Power;
				AVG_misura[3] += ActiveApparentPower;
				AVG_misura[4] += ReactiveApparentPower;
				AVG_misura[5] += PowerFactor
				AVG_misura[6] += PhaseAngle
				AVG_misura[7] += Frequency;
				AVG_misura[8] += ImportActiveEnergy
				AVG_misura[9] += ExportActiveEnergy
				AVG_misura[10] += TotalActiveEnergy
				AVG_misura[11] += ImportReactiveEnergy
				AVG_misura[12] += ExportReactiveEnergy
				AVG_misura[13] += TotalReactiveEnergy
									
				/***************************************************************************************/
				
				if (Voltage > MAX_misura[0]){MAX_misura[0] =Voltage};
				if (Current > MAX_misura[1]){MAX_misura[1] =Current};
				if (Power > MAX_misura[2]){MAX_misura[2] =Power};
				if (ActiveApparentPower > MAX_misura[3]){MAX_misura[3] =ActiveApparentPower};
				if (ReactiveApparentPower > MAX_misura[4]){MAX_misura[4] =ReactiveApparentPower};
				if (PowerFactor > MAX_misura[5]){MAX_misura[5] =PowerFactor};
				if (PhaseAngle > MAX_misura[6]){MAX_misura[6] =PhaseAngle};						
				if (Frequency > MAX_misura[7]){MAX_misura[7] =Frequency};
				if (ImportActiveEnergy > MAX_misura[8]){MAX_misura[8] =ImportActiveEnergy};
				if (ExportActiveEnergy > MAX_misura[9]){MAX_misura[9] =ExportActiveEnergy}						
				if (TotalActiveEnergy > MAX_misura[10]){MAX_misura[10] =TotalActiveEnergy};
				if (ImportReactiveEnergy > MAX_misura[11]){MAX_misura[11] =ImportReactiveEnergy};
				if (ExportReactiveEnergy > MAX_misura[12]){MAX_misura[12] =ExportReactiveEnergy};
				if (TotalReactiveEnergy > MAX_misura[13]){MAX_misura[13] =TotalReactiveEnergy};
				
				/***************************************************************************************/
				if (Voltage < MIN_misura[0]){MIN_misura[0] =Voltage};
				if (Current < MIN_misura[1]){MIN_misura[1] =Current};
				if (Power < MIN_misura[2]){MIN_misura[2] =Power};
				if (ActiveApparentPower < MIN_misura[3]){MIN_misura[3] =ActiveApparentPower};
				if (ReactiveApparentPower < MIN_misura[4]){MIN_misura[4] =ReactiveApparentPower};			
				if (PowerFactor < MIN_misura[5]){MIN_misura[5] =PowerFactor};
				if (PhaseAngle < MIN_misura[6]){MIN_misura[6] =PhaseAngle};
				if (Frequency < MIN_misura[7]){MIN_misura[7] =Frequency};
				if (ImportActiveEnergy < MIN_misura[8]){MIN_misura[8] =ImportActiveEnergy};
				if (ExportActiveEnergy < MIN_misura[9]){MIN_misura[9] =ExportActiveEnergy};
				if (TotalActiveEnergy < MIN_misura[10]){MIN_misura[10] =TotalActiveEnergy};
				if (ImportReactiveEnergy < MIN_misura[11]){MIN_misura[11] =ImportReactiveEnergy};
				if (ExportReactiveEnergy < MIN_misura[12]){MIN_misura[12] =ExportReactiveEnergy};
				if (TotalReactiveEnergy < MIN_misura[13]){MIN_misura[13] =TotalReactiveEnergy};
				itz+=1;				
			}
			else 
			{				
				console.log("Campione scartato");
			}
		}
	});						
}, intervallo_campioni);


function log2DB3(AVG_misura,MAX_misura,MIN_misura){
	var data_misura = new Date().toISOString().slice(0, 19).replace('T', ' ')	
	var strQuery ="INSERT INTO `wattmon`.`t_consumi_log2`(`id_sensore`,`data_misura`,`AVG_Voltage`,`AVG_Current`,`AVG_Power`,`AVG_ActiveApparentPower`,`AVG_ReactiveApparentPower`,`AVG_PowerFactor`,`AVG_PhaseAngle`,`AVG_Frequency`,`AVG_ImportActiveEnergy`,`AVG_ExportActiveEnergy`,`AVG_TotalActiveEnergy`,`AVG_ImportReactiveEnergy`,`AVG_ExportReactiveEnergy`,`AVG_TotalReactiveEnergy`,`MAX_Voltage`,`MAX_Current`,`MAX_Power`,`MAX_ActiveApparentPower`,`MAX_ReactiveApparentPower`,`MAX_PowerFactor`,`MAX_PhaseAngle`,`MAX_Frequency`,`MAX_ImportActiveEnergy`,`MAX_ExportActiveEnergy`,`MAX_TotalActiveEnergy`,`MAX_ImportReactiveEnergy`,`MAX_ExportReactiveEnergy`,`MAX_TotalReactiveEnergy`,`MIN_Voltage`,`MIN_Current`,`MIN_Power`,`MIN_ActiveApparentPower`,`MIN_ReactiveApparentPower`,`MIN_PowerFactor`,`MIN_PhaseAngle`,`MIN_Frequency`,`MIN_ImportActiveEnergy`,`MIN_ExportActiveEnergy`,`MIN_TotalActiveEnergy`,`MIN_ImportReactiveEnergy`,`MIN_ExportReactiveEnergy`,`MIN_TotalReactiveEnergy`) VALUES (1,'" + data_misura +"',"+ AVG_misura[0]+","+AVG_misura[1]+","+AVG_misura[2]+","+AVG_misura[3]+","+AVG_misura[4]+","+AVG_misura[5]+","+AVG_misura[6]+","+AVG_misura[7]+","+AVG_misura[8]+","+AVG_misura[9]+","+AVG_misura[10]+","+AVG_misura[11]+","+AVG_misura[12]+","+AVG_misura[13]+","+MAX_misura[0]+","+MAX_misura[1]+","+MAX_misura[2]+","+MAX_misura[3]+","+MAX_misura[4]+","+MAX_misura[5]+","+MAX_misura[6]+","+MAX_misura[7]+","+MAX_misura[8]+","+MAX_misura[9]+","+MAX_misura[10]+","+MAX_misura[11]+","+MAX_misura[12]+","+MAX_misura[13]+","+MIN_misura[0]+","+MIN_misura[1]+","+MIN_misura[2]+","+MIN_misura[3]+","+MIN_misura[4]+","+MIN_misura[5]+","+MIN_misura[6]+","+MIN_misura[7]+","+MIN_misura[8]+","+MIN_misura[9]+","+MIN_misura[10]+","+MIN_misura[11]+","+MIN_misura[12]+","+MIN_misura[13]+");";
	//console.log(strQuery);	
	//console.log("Salvo valori sul db");	
	connection.query( strQuery, function(err, rows){
	if(err)	
	{
		throw err;
	}else
	{
		//console.log( rows );
		return 0;		
	}
	});	
}

function InitContatori(){
	//Init contatori
	var ResetVal = 1000000;
	AVG_misura= AVG_misura = Array(NumElementi).fill(0);
	MAX_misura=	MAX_misura = Array(NumElementi).fill(0);
	MIN_misura= MIN_misura = Array(NumElementi).fill(ResetVal);				
	MAX_misura[4]= -ResetVal;
	MAX_misura[6]= -ResetVal;
	MIN_misura[4]= 0;
	MIN_misura[6]= 0;		
	itz=0;
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

function getFromDb2(callback){
	var json = '';
	var strQuery = "SELECT date_format(data_misura, '%M') as Mese ,date_format(data_misura, '%v') as Week, date_format(data_misura, '%d') as Giorno, date_format(data_misura, '%H') as Ora, count(id_consumo) totcampioni, \
	round(avg(AVG_Voltage),2) as AVG_Voltage, max(MAX_Voltage)as MAX_Voltage, min(MIN_Voltage) as MIN_Voltage,\
	round(avg(AVG_Power),2) as AVG_Power, max(MAX_Power)as MAX_Power, min(MIN_Power) as MIN_Power \
	FROM `wattmon`.`t_consumi_log2` group by  1,2,3,4";
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



