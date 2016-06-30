// Empty JS for your own code to be here
var portaPubblica = 8003
var ipPubblico = "http://" + httpGet("http://www.gronzul.x24hr.com/getip.php")+":" + portaPubblica
if (ipPubblico.length < 20){ipPubblico= "192.168.1.7:5003"}
var socket = io.connect(ipPubblico);


/**********************************************************************/
GetledStatus();		//legge lo stato iniziale dei led al caricamento della pagina
GetReleStatus();	//legge lo stato iniziale dei rele al caricamento della pagina
/**********************************************************************/
var chart1;
var chart2;
var triggerfired=false;

initSlider();	//inizializzazione controlli Slider
//initAudio();
/**********************************************************************/
$(function() 
{		
	$('#toggle-Rele1').change(function() {toggleRele2($(this))})
	$('#toggle-Rele2').change(function() {toggleRele2($(this))})
	$('#toggle-Rele3').change(function() {toggleRele2($(this))})
	$('#toggle-Rele4').change(function() {toggleRele2($(this))})  
		
	$('#toggle-lv').change(function() {
		toggleLed('lv',$(this).prop('checked'))
	})  
	$('#toggle-lg').change(function() {
		toggleLed('lg',$(this).prop('checked'))
	})	
})

function toggleRele2( toggleBtn)
{
	var stato = toggleBtn.prop('checked');		
	var idctrl = toggleBtn.prop('id');
	socket.emit("doact",{id:idctrl, checked: stato },0);	
}

socket.on('doact', function (data) {
	idctrl=  data.id;
	stato= data.checked;
	statusrele =  data.statusrele;		
	toggleCtrl(data);	
});		

function toggleCtrl(data){	
	var toggleBtn = '#'+data.id;	
	var stato = data.checked;
	var statoToggle = $(toggleBtn).prop('checked')
	if (statoToggle != stato)	
	{		
		//console.log('stato:' + stato);
		$(toggleBtn).prop('checked', stato).change();
	}	
}

function  toggleLabel(data)
{
	label= data.id;
	if (data.stato==1)
	{
		if (label=="lg"){document.getElementById(label).className = "label label-warning";}
		if (label=="lv"){document.getElementById(label).className = "label label-success";}
	}else{
		document.getElementById(label).className = "label label-default";
	}	
/*	
	lv = stato & 0b0001;
	if (lv==1){ 
		document.getElementById("lv").className = "label label-success";
	}else{
		document.getElementById("lv").className = "label label-default";
	}
	lg = (stato & 0b0010)>>1;
	if (lg==1){ 
	document.getElementById("lg").className = "label label-warning";
	}else{
		document.getElementById("lg").className = "label label-default";
	}	*/
}

function getdata(){
	socket.on('temperatureUpdate2', function (data) {
		
		time= data.date;
		temp= data.temperature;
		fmax= data.flagTmax;	
		fhigh= data.flagThigh;
		flow= data.flagTlow;
		
		var chart1 = $('#container').highcharts();
		var point = chart1.series[0].points[0], newVal, inc = time;
		newVal = temp;
		if (newVal < 5 || newVal > 100) {
			newVal = point.y - inc;
		}
		point.update(newVal);
		var chart2 = $('#container2').highcharts();		
		var series2 = chart2.series[0];
		shift = series2.data.length > 60; // shift if the series is longer than x		
		series2.addPoint([time, temp], true, shift);
				
		document.getElementById("valIstante").innerHTML = temp;
		document.getElementById("valfmax").innerHTML = fmax;
		document.getElementById("valfhigh").innerHTML = fhigh;
		document.getElementById("valflow").innerHTML = flow;
		//console.log('temperatureUpdate - ' + parseFloat(data));
	});
}

function toggleLed(Led, stato){
	socket.emit("doled",Led,stato );
}

socket.on('totconnessi', function (data){
	totconnessi= data.TotConnessi;
	document.getElementById("totconn").innerHTML = totconnessi;
});

socket.on('savetoken_response', function (data){	
	console.log(data);	
	document.getElementById("SaveTokenLabel").innerHTML = data;
});


socket.on('ledstatus', function (stato){
	//console.log('ledstatus -' + led);	
	idctrl = "toggle-lv";
	ck = stato & 0b0001;	
	toggleCtrl({id:idctrl, checked: ck});
	toggleLabel({id:"lv", stato: ck});
	
	idctrl = "toggle-lg";
	ck = (stato & 0b0010)>>1;	
	toggleCtrl({id:idctrl, checked: ck});			
	toggleLabel({id:"lg", stato: ck});
});

socket.on('relestatus', function (stato){	
	console.log("relestatus -" + stato);	

	idctrl = "toggle-Rele1";
	ck = stato & 0b0001;	
	toggleCtrl({id:idctrl, checked: ck})
	
	idctrl = "toggle-Rele2";
	ck = (stato & 0b0010) >> 1;	
	toggleCtrl({id:idctrl, checked: ck})

	idctrl = "toggle-Rele3";
	ck = (stato & 0b0100) >> 2;	
	toggleCtrl({id:idctrl, checked: ck})

	idctrl = "toggle-Rele4";
	ck = (stato & 0b1000) >> 3;	
	toggleCtrl({id:idctrl, checked: ck})		
});

socket.on('doinput', function (stato){	
	if (stato=='on')
	{
		document.getElementById("interruttore").innerHTML = "ALLARME";
		document.getElementById("interruttore").className = "label label-danger";
		var s = new Audio('/audio/A2.mp3');
		s.play();
	} else 	{
		document.getElementById("interruttore").innerHTML = "NORMALE";
		document.getElementById("interruttore").className = "label label-success";
	}
	//console.log('doinput -' + stato + ' - ' + colore);
});

socket.on('dopir', function (stato){	
	if (stato=='on')
	{
		document.getElementById("interruttore").innerHTML = "ALLARME";
		document.getElementById("interruttore").className = "label label-danger";
		var s = new Audio('/audio/A2.mp3');
		s.play();
	} else 	{
		document.getElementById("interruttore").innerHTML = "NORMALE";
		document.getElementById("interruttore").className = "label label-success";
	}
	console.log('dopir -' + stato );
});

function GetledStatus(){
	socket.emit("getLedStatus");
}

function GetReleStatus(){
	socket.emit("getReleStatus");
}

function PlaySound(){
	var s = new Audio('/audio/A2.mp3');
	s.play();
	/*GetReleStatus();	
	GetledStatus();	*/
}

function SendNotifica(){
	socket.emit("sendNotifica");
}

function SaveToken(){
	data = 'dPJ5BgZftaY:APA91bFtWceEhlU3JTZIoZ0UplD7nEHbvAzt8NnbQw8YhdXWu66NF-SviSSjBkqRaDNe9vS6NfGhG6VArECizyYuUETKU4reqg-IwtHD-bm1GgbjeQWHCZCZTplnbewLv8UcaAV16qae';
	socket.emit("savetoken", data);	
}

function httpGet(theUrl){
    //http://stackoverflow.com/questions/247483/http-get-request-in-javascript
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function initSlider()
{
	$('#exMax').slider()
		.on('slide', function(showSliderValue)
		{
			$("#exMaxLabel").text(showSliderValue.value);		
		})
		.on('change', function(changeSliderValue)
		{
			$("#exMaxLabel").text(changeSliderValue.value.newValue);					
		})	
		.data('slider');		
		
	$("#exInfSup").slider()
		.on('slide', function(showSliderValue)
		{
			$("#exInfSupLabel").text(showSliderValue.value);		
		})
		.on('change', function(changeSliderValue)
		{
			$("#exInfSupLabel").text(changeSliderValue.value.newValue);					
		})	
		.data('slider');	

	$('#exHyst').slider()
		.on('slide', function(showSliderValue)
		{
			$("#exHystLabel").text(showSliderValue.value);		
		})
		.on('change', function(changeSliderValue)
		{
			$("#exHystLabel").text(changeSliderValue.value.newValue);					
		})	
		.data('slider');			
		
	$("#exMaxLabel").text($('#exMax')[0].value );				
	$("#exInfSupLabel").text($('#exInfSup')[0].value );				
	$("#exHystLabel").text($('#exHyst')[0].value );								
}

function SetSoglie()
{
	alert($('#exMax')[0].value +" - " +$('#exInfSup')[0].value +" - " + $('#exHyst')[0].value);	
}
/*
//http://stackoverflow.com/questions/12206631/html5-audio-cant-play-through-javascript-unless-triggered-manually-once

function initAudio() {
    var audio = new Audio('/audio/A2.mp3');
    audio.addEventListener('play', function () {
        // When the audio is ready to play, immediately pause.
        audio.pause();
        audio.removeEventListener('play', arguments.callee, false);
    }, false);
    
	document.addEventListener('click', function () {
        // Start playing audio when the user clicks anywhere on the page,
        // to force Mobile Safari to load the audio.
        document.removeEventListener('click', arguments.callee, false);
        audio.play();
    }, false);
}
*/

$(function () 
{
	$('#container').highcharts({
	//Highcharts.setOptions({
		chart: 
		{
			type: 'gauge',
			plotBackgroundColor: null,
			plotBackgroundImage: null,
			plotBorderWidth: 0,
			plotShadow: false
			,
			events: 
			{
				load: function()
				{
					chart1 = this;
					getdata();
				 }
			}
		},

		title: {
			text: 'Temperatura [ºC]'
		},

		pane: {
			startAngle: -120,
			endAngle: 120,
			background: [{
				backgroundColor: {
					linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
					stops: [
						[0, '#FFF'],
						[1, '#333']
					]
				},
				borderWidth: 0,
				outerRadius: '109%'
			}, {
				backgroundColor: {
					linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
					stops: [
						[0, '#333'],
						[1, '#FFF']
					]
				},
				borderWidth: 1,
				outerRadius: '107%'
			}, {
				// default background
			}, {
				backgroundColor: '#DDD',
				borderWidth: 0,
				outerRadius: '105%',
				innerRadius: '103%'
			}]
		},
		// the value axis
		yAxis: {
			min: 5,
			max: 50,

			minorTickInterval: 'auto',
			minorTickWidth: 1,
			minorTickLength: 10,
			minorTickPosition: 'inside',
			minorTickColor: '#666',

			tickPixelInterval: 30,
			tickWidth: 2,
			tickPosition: 'inside',
			tickLength: 10,
			tickColor: '#666',
			labels: {
				step: 2,
				rotation: 'auto'
			},
			title: {
				text: '[ºC]'
			},
			plotBands: [{
				from: 5,
				to: 16,				
				color: '#1E90FF' // cyan
			}, {
				from: 16,
				to: 24,
				color: '#55BF3B' // green
			}, {
				from: 24,
				to: 50,
				color: '#DF5353' // red
			}]
		},

		series: [{
			name: '[ºC]',							
			data: [5],
/*					tooltip: {
				valueSuffix: ' kW/h'
			}*/
		}]
	});
});

$(function () 
{
$('#container2').highcharts({
	chart: {
			zoomType: 'x',
			events: 
			{
				load: function()
				{
					chart2 = this;
					getdata();
				 }
			}                
	},
	title: {
		text: 'Andamento temperatura ambiente rilevata dal sensore MAX6635'
	},
	subtitle: {
		text: document.ontouchstart === undefined ?
				'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
	},
	xAxis: {
		type: 'datetime'
	},
	yAxis: {
		title: {
			text: 'Consumo [kW]'
		}
	},
	legend: {
		enabled: false
	},
	plotOptions: {
		area: {
			fillColor: {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, Highcharts.getOptions().colors[4]],
					[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
				]
			},
			marker: {
				radius: 2
			},
			lineWidth: 1,
			states: {
				hover: {
					lineWidth: 1
				}
			},
			threshold: null
		}
	},

	series: [{
		type: 'area',
		name: 'KW',
		data: []
	}]
});
});
