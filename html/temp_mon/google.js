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
	datetime=GetCurrentDate();
	for (i=1; i<keys.length; i++) {
        var output;
        var fieldNum = i % 3;
		idToken = keys[i].valore				        
		//console.log(">> idToken"+i +": " + idToken);			
	
		var message = new gcm.Message({
			priority: 'high',
			collapse_key: 'Sensor_Alarm',			
			content_available: true,
			delay_while_idle: true,
			time_to_live: 120,
			restricted_package_name: "it.home.gronzul.homewatch1",
			dry_run: false,
			data: {
				key1: 'ALLARME: Messaggio completo'				
			},
			notification: {
				title: "\u26A0 ATTENZIONE!!",
				icon: "ic_launcher",			
				body: datetime + " - Attivazione Sensore Garage"
			}
		});
		
		
		/*var message = new gcm.Message({
			priority: 'high',
			collapseKey: 'demo',			
			contentAvailable: true,
			delayWhileIdle: true,
			timeToLive: 3,
			restrictedPackageName: "it.home.gronzul.homewatch1",
			dryRun: false,
			data: {
				key1: 'Messaggio di test notifica Push'			
			},
			notification: {
				title: "\u26A0 ATTENZIONE!!",
				icon: "ic_launcher",			
				body: datetime + " - Attivazione Sensore Garage"
			}
		});		*/

		var registrationIds = [];
		registrationIds.push(idToken);
		var sender = new gcm.Sender(idSender);// Set up the sender with you API key

		// Now the sender can be used to send messages
		sender.send(message, registrationIds, 4, function (err, response) {
			if(err) console.error("Errore SendNotifica: "  + err);
			else 
			{
				if (response.success==1)
				{
					console.log("Notifica Inviata alle "+ GetCurrentDate())	
				}
				else
				{
					console.log(response)	
				}						
			}
		});	
	}	
}

function GetCurrentDate(){	
	var currentdate = new Date(); 
	var datetime =  addZero(currentdate.getDate()) + "/"
                + addZero((currentdate.getMonth()+1))  + "@"                 
                + addZero(currentdate.getHours()) + ":"  
                + addZero(currentdate.getMinutes()) + ":" 
                + addZero(currentdate.getSeconds());
	return datetime;
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
/********************************************************************/