/*******************************************************************
GOOGLE FUNCTIONS
********************************************************************/
// google.js
// var exports = module.exports = {};
var gcm = require('node-gcm');					//https://www.npmjs.com/package/node-gcm

				
//https://developers.google.com/cloud-messaging/http-server-ref#table1
exports.SendNotifica = function (keys) {		
	idSender = keys[0].valore	
	//console.log(">> idSender:"+ idSender);			
	for (i=1; i<keys.length; i++) {
        var output;
        var fieldNum = i % 3;
		idToken = keys[i].valore				        
		//console.log(">> idToken"+i +": " + idToken);			
    }	
	
	datetime=GetCurrentDate();	
	var message = new gcm.Message({
		collapseKey: 'demo',
		priority: 'high',
		contentAvailable: true,
		delayWhileIdle: true,
		timeToLive: 3,
		restrictedPackageName: "it.home.gronzul.homewatch1",
		dryRun: false,
		data: {
			key1: 'Messaggio di test notifica Push'
			//,key2: 'Messaggio di test notifica Push2'
		},
		notification: {
			title: "\u26A0 ATTENZIONE!!",
			icon: "ic_launcher",
			//body: "\u270C Peace, Love \u2764 and PhoneGap \u2706!"  // Caratteri Unicode
			body: datetime + " - Attivazione Sensore Garage"
		}
	});

	var registrationIds = [];
	registrationIds.push(idToken);
	var sender = new gcm.Sender(idSender);// Set up the sender with you API key

	// Now the sender can be used to send messages
	sender.send(message, registrationIds, 4, function (err, response) {
		if(err) console.error("Errore SendNotifica: "  + err);
		else console.log(response);
	});
		
	/*sender.send(message, { registrationTokens: regTokens },
function (err, response) {
		if(err) console.error(err);
		else console.log(response);
	}); */
}

exports.SendNotifica2= function() {
	//exports.SendNotifica2= function() 
	
	var sender = new gcm.Sender(idSender);//API Server Key
	var message = new gcm.Message();
	// Value the payload data to send...
	message.addData('message',"\u270C Peace, Love \u2764 and PhoneGap \u2706!");
	message.addData('title','Push Notification Sample' );
	message.addData('msgcnt','3'); // Shows up in the notification in the status bar
	message.addData('soundname','s1.mp3'); //Sound to play upon notification receipt - put in the www folder in app
	//message.collapseKey = 'demo';
	//message.delayWhileIdle = true; //Default is false
	message.timeToLive = 3;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.

	var registrationIds = [];
	registrationIds.push(idToken);// At least one reg id required

	sender.send(message, registrationIds, 4, function (result) {
		console.log(result);
	});
}

function GetCurrentDate(){	
	var currentdate = new Date(); 
	var datetime =  currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "@"                 
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
	return datetime;
}

/********************************************************************/