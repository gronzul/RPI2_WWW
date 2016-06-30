// Empty JS for your own code to be here
var portaPubblica = 8004
var ipPubblico = "http://" + httpGet("http://www.gronzul.x24hr.com/getip.php")+":" + portaPubblica
if (ipPubblico.length < 20){ipPubblico= "192.168.1.7:5004"}
var socket = io.connect(ipPubblico);
var chart1;
var chartAnalis;

$(function() 
{
	$('#btn-getdbdata').click(function() {     
		socket.emit("getDbData");
	})
});

function httpGet(theUrl)
{
    //http://stackoverflow.com/questions/247483/http-get-request-in-javascript
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function controllo(valore, soglia1, soglia2)
{
	if (valore >= soglia1)
	{
		return "label label-danger";		
	}
	else if(valore > soglia2 && valore < soglia1 )
	{
		return "label label-info";		
	}
	else
	{
		return "label label-default";		
	}	
}

function controllo2(valore, soglia1, soglia2)
{
	if (valore <= soglia1)
	{
		return "label label-danger";		
	}
	else if(valore > soglia1 && valore < soglia2)
	{
		return "label label-info";		
	}
	else
	{
		return "label label-default";		
	}	
}

function controllo3(valore, soglia1, soglia2)
{
	if (valore => soglia1)
	{
		return "label label-danger";		
	}
	else if(valore < soglia2)
	{
		return "label label-info";		
	}
	else
	{
		return "label label-default";		
	}	
}

function getLivedata2(){
	socket.on('getPower2', function (Strdata) {			
		//console.log(Strdata.time);
		var chart1 = $('#graphAndamento').highcharts();
		var series1 = chart1.series[0];		
		var series2 = chart1.series[1];		
		
		/**************************************************************/
		shift = series1.data.length > 60; // shift if the series is longer than x		
		series1.addPoint([Strdata.time, parseFloat(Strdata.Power)], true, shift);
		//series1.push([time, parseFloat(Power)]);
		series2.addPoint([Strdata.time, parseFloat(Strdata.Voltage)], true, shift);
				
		/**************************************************************/
		var chartPower = $('#container-Power').highcharts();
		var pointPower = chartPower.series[0].points[0], newVal, inc = Strdata.time;		
		newVal = parseFloat(Strdata.Power);
		if (newVal < 1 || newVal > 5000) {
			newVal = pointPower.y - inc;
		}
		pointPower.update(newVal);		
		/**************************************************************/
		
		var chartActiveApparentPower = $('#container-ActiveApparentPower').highcharts();
		var pointActiveApparentPower = chartActiveApparentPower.series[0].points[0], newVal, inc = Strdata.time;
		newVal = parseFloat(Strdata.ActiveApparentPower);
		if (newVal < 1 || newVal > 5000) {
			newVal = pointActiveApparentPower.y - inc;
		}
		pointActiveApparentPower.update(newVal);				
		
		/**************************************************************/		
		var chartReactiveApparentPower = $('#container-ReactiveApparentPower').highcharts();
		var pointActiveApparentPower = chartReactiveApparentPower.series[0].points[0], newVal, inc = Strdata.time;
		newVal = Math.abs(Strdata.ReactiveApparentPower);
		if (newVal < 1 || newVal > 5000) {
			newVal = pointActiveApparentPower.y - inc;
		}
		if (Strdata.ReactiveApparentPower<0){
			newVal = newVal * -1
		}
		pointActiveApparentPower.update(newVal);				
						
		document.getElementById("Voltage").innerHTML = Strdata.Voltage;
		document.getElementById("Voltage").className = controllo3(Strdata.Voltage,230,219);			
		document.getElementById("Current").innerHTML = Strdata.Current;
		document.getElementById("Power").innerHTML = Strdata.Power;
		document.getElementById("Power").className = controllo(Strdata.Power,1100,1050);			
		document.getElementById("ActiveApparentPower").innerHTML = Strdata.ActiveApparentPower;				
		document.getElementById("ReactiveApparentPower").innerHTML = parseFloat(Strdata.ReactiveApparentPower);
		document.getElementById("ReactiveApparentPower").className = controllo( Math.abs(Strdata.ReactiveApparentPower),270,100);			
		document.getElementById("Frequency").innerHTML = Strdata.Frequency;
		document.getElementById("TotalActiveEnergy").innerHTML = Strdata.TotalActiveEnergy/1000;
		document.getElementById("TotalReactiveEnergy").innerHTML = Strdata.TotalReactiveEnergy/1000;
		document.getElementById("PhaseAngle").innerHTML = Strdata.PhaseAngle;
		
		document.getElementById("PowerFactor").innerHTML = Strdata.PowerFactor;				
		document.getElementById("PowerFactor").className = controllo2(Strdata.PowerFactor,0.8,0.95);			
	});	
}

$(function () 
{
	socket.on('getDbDataRes', function (json){
		//document.getElementById("Jsondata").innerHTML = json;	
		var obj = jQuery.parseJSON( json );		
		//console.log("getDbDataRes" , obj[0].Power );
		//console.log("getDbDataRes" , obj[0] );
		/*
		[
			{"data_misura":"2016-02-07T22:08:04.000Z","Power":662.12},
			{"data_misura":"2016-02-07T22:07:59.000Z","Power":661.7},
			{"data_misura":"2016-02-07T22:07:54.000Z","Power":651.55},
			{"data_misura":"2016-02-07T22:07:49.000Z","Power":662.41},
			{"data_misura":"2016-02-07T22:07:44.000Z","Power":665.97}
		]
		*/
				
		var chart1 = $('#graphAnalisi2').highcharts();
		var series1 = chart1.series[0];		
			
		series1.addPoint({name: 'Aprile', y:2100, drilldown: 'aprile'}, false);
		
		chart1.redraw();		
		//console.log (series1.drilldowns);
		
		//console.log (chart1.series[0].data[2].series.xAxis);
		//chart1.addSeriesAsDrilldown(chart1.series[0].data[2].series.xAxis,{name: 'Aprile', id: 'aprile', data:[]} );		
		/*obj.forEach(function(entry) {
			var data = entry.data_misura.substring(8,10)+"-" + entry.data_misura.substring(5,7) +"-" + entry.data_misura.substring(0,4);	
			var time =  entry.data_misura.substring(11, 19);	
			var datetime = data + " " +time
			//console.log(data, " " ,time);
			series1.addPoint([datetime, parseFloat(entry.Power)]);		
		}); 	*/
	});

	  $('#graphAnalisi2').highcharts({
		chart: {			
			type: 'column',
			events: 
			{				
				load: function(e)
					{
						//console.log(e);
						chartAnalisi = this;
						getAnalisiData();
					 },					
				drilldown: function(e)
				{
					if (!e.seriesOptions) 
					{
						chartAnalisi = this;
						//console.log(e);
						console.log(
                            'point.name', e.point.name, 
                            'series.name', e.point.series.name, 
                            'byCategory', e.byCategory
                        );												
						drd(e);						
					}
				}
			}			
		},
		title: {
			text: 'Power Drilldown'
		},
		xAxis: {
			type: 'category'
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			series: {
				borderWidth: 0,
				dataLabels: {
					enabled: true
				}
			}
		},				
		series: [{
			name: 'Misure',
			colorByPoint: true,
			data: []},					                    
		],
		drilldown: {        	
			series: 
			[]
		}
	});	
	
	
function getAnalisiData(){	
	// Carica la serie principale con i point iniziali
	var series1 = chartAnalisi.series[0];	
	series1.addPoint({name: 'Febbraio', y:2600, drilldown: true}, false);
	series1.addPoint({name: 'Marzo', y:3100, drilldown: true}, false);
	series1.addPoint({name: 'Aprile', y:2800, drilldown: true}, false);

	var drdw1 = chartAnalisi.options.drilldown;
	console.log(drdw1);
	chartAnalisi.redraw();			
}	
	
function drd(e) {			
		var drdseries =
		{
			'Febbraio':{			
			data: [{name:'W6', y:4, drilldown: true},
			{name:'W7', y:2, drilldown:true,},
			{name:'W8', y:1},
			{name:'W9',y:2}]                                    
			},
			'Marzo': {			
			data: [{name:'W9', y:14 , drilldown: true},
			{name:'W10',  y:22},
			{name:'W11',  y:11},
			{name:'W12', y:21}] 
			},
			'Aprile': {			
			data: [{name:'W9', y:14 , drilldown: true},
			{name:'W10',  y:22},
			{name:'W11',  y:11},
			{name:'W12', y:21}] 
			},			
			'W6':
			{
			  data:[['12',1,],
			  ['13',1,],
			  ['14',1,]]
			},
			'W9':{
			  data:[['1',1,],
			  ['2',5,],
			  ['3',6,],
			  ['4',1,],
			  ['5',1,],
			  ['6',8,],
			  ['7',9,]
			  ]         			 
			} ,
			'W7':{    				  
			  data:[['15',1,],
			  ['16',5,],
			  ['17',6,],
			  ['18',1,],
			  ['19',1,],
			  ['20',8,],
			  ['21',9,]
			  ]         			 
			}			
		};				
		chartAnalisi.addSeriesAsDrilldown(e.point, drdseries[e.point.name]);		
		/*
		var chart = chartAnalisi,
			drilldowns = {
					'Febbraio': {
					name: 'Febbraio',
					data: [{name:'W6', y:4, drilldown: true},
					{name:'W7', y:2, drilldown: true,},
					{name:'W8', y:1},
					{name:'W9',y:2}]                                    
				},
				'Marzo': {
					name: 'Marzo',																		
					data: [{name:'W9', y:14 , drilldown: true},
					{name:'W10',  y:22},
					{name:'W11',  y:11},
					{name:'W12', y:21}] 
				}
				
			},
			series = drilldowns[e.point.name];
			chart.addSeriesAsDrilldown(e.point, series);*/
			
}	
	

/*		
	  $('#graphAnalisi2').highcharts({		  
		chart: {
			renderTo: 'graphAnalisi2',
			type: 'column'
		},
		title: {
			text: 'Power Drilldown'
		},
		xAxis: {
			type: 'category'
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			series: {
				borderWidth: 0,
				dataLabels: {
					enabled: true
				}
			}
		},

		series: [{
			name: 'Misure',
			colorByPoint: true,
			data: [
			{
				name: 'February',
				y: 2587,
				drilldown: 'february'
			},
			{
				name: 'March',
				y: 3001,
				drilldown: 'march'
			}                        
			]},					                    
		],
		drilldown: {        	
			series: 
			[
			{	name: 'February',
			  colorByPoint: true,
			  id: 'february',
			  data: [{name:'W6', y:4, drilldown: 'giornoW6'},
					{name:'W7', y:2, drilldown: 'giornoW7',},
					{name:'W8', y:1},
					{name:'W9',y:2}],                    
			},            
			{	name: 'March',
			  colorByPoint: true,
			  id: 'march',
			  data: [{name:'W9', y:14 , drilldown: 'giornoW9'},
						{name:'W10',  y:22},
					{name:'W11',  y:11},
					{name:'W12', y:21}]           			 
			},
			{    	
			  id: 'giornoW6',
			  data:[ ['12',1,],
			  ['13',1,],
			  ['14',1,]  ]         			 
			},
						{    	
			  id: 'giornoW9',
			  data:[ ['1',1,],
			  ['2',5,],
			  ['3',6,],
			  ['4',1,],
			  ['5',1,],
			  ['6',8,],
			  ['7',9,]
			  ]         			 
			} ,
			{    	
			  id: 'giornoW7',
			  data:[ ['15',1,],
			  ['16',5,],
			  ['17',6,],
			  ['18',1,],
			  ['19',1,],
			  ['20',8,],
			  ['21',9,]
			  ]         			 
			}]
		}
	  });
				
	*/


	$('#graphAndamento').highcharts({
		chart: {
				zoomType: 'x',
				events: 
				{
					load: function()
					{
						chart1 = this;
						getLivedata2();
					 }
				}                
		},
		title: {
			text: 'Andamento consumo in tempo reale'			
		},
		subtitle: {
			text: document.ontouchstart === undefined ?
					'Clicca e trascina nell`area per fare lo zoom in' : 'Pinch the chart to zoom in'
		},
		xAxis: {
			type: 'datetime'				
		},
		yAxis: [
			{
				labels: {
					format: '{value}W',
					style: {
						color: Highcharts.getOptions().colors[0]
					}
				},

				startOnTick: false,
				minPadding: 0.2,
				title: {			
					text: 'Consumo [kW]'
				}                
			},
			{
				labels: {
					format: '{value}V',
					style: {
						color: Highcharts.getOptions().colors[4]
					}
				},

				startOnTick: false,
				minPadding: 0.2,
				title: {				
					text: 'Tensione di rete [V]'
				}                
				, opposite: true
			}
				],
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
						[0, Highcharts.getOptions().colors[0]],
						[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
					]
				},
				marker: {
					radius: 2
				},
				dataLabels: {
						enabled: false
				},
				lineWidth: 2,
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
		},
		{
			type: 'spline',
			name: 'Voltage',				
			data: [],
			yAxis: 1,
			color: Highcharts.getOptions().colors[4]
							
			
		}]
	});

	var gaugeOptions = {

		chart: {
			type: 'solidgauge'
		},

		title: null,

		pane: {
			center: ['50%', '85%'],
			size: '140%',
			startAngle: -90,
			endAngle: 90,
			background: {
				backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
				innerRadius: '60%',
				outerRadius: '100%',
				shape: 'arc'
			}
		},

		tooltip: {
			enabled: false
		},

		// the value axis
		yAxis: {
			stops: [
				[0.1, '#55BF3B'], // green
				[0.5, '#DDDF0D'], // yellow
				[0.9, '#DF5353'] // red
			],
			lineWidth: 0,
			minorTickInterval: null,
			tickPixelInterval: 400,
			tickWidth: 0,
			title: {
				y: -70
			},
			labels: {
				y: 16
			}
		},

		plotOptions: {
			solidgauge: {
				dataLabels: {
					y: 5,
					borderWidth: 0,
					useHTML: true
				}
			}
		}
	};

	// The speed gauge
	$('#container-Power').highcharts(Highcharts.merge(gaugeOptions, {
		yAxis: {
			min: 0,
			max: 3500,
			title: {
				text: 'Watt'
			}
		},

		credits: {
			enabled: false
		},

		series: [{
			name: 'Watt',
			data: [10],
			dataLabels: {
				format: '<div style="text-align:center"><span style="font-size:25px;color:' +
					((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
					   '<span style="font-size:12px;color:silver">W</span></div>'
			},
			tooltip: {
				valueSuffix: ' W'
			}
		}]
	}));

	// The ActiveApparentPower gauge
	$('#container-ActiveApparentPower').highcharts(Highcharts.merge(gaugeOptions, {
		yAxis: {
			min: 0,
			max: 3500,
			title: {
				text: 'VA'
			}
		},

		series: [{
			name: 'ActiveApparentPower',
			data: [1],
			dataLabels: {
				format: '<div style="text-align:center"><span style="font-size:25px;color:' +
					((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
					   '<span style="font-size:12px;color:silver">VA</span></div>'
			},
			tooltip: {
				valueSuffix: ' VA'
			}
		}]

	}));

	// The ReactiveApparentPower gauge
	$('#container-ReactiveApparentPower').highcharts(Highcharts.merge(gaugeOptions, {
		yAxis: {
			stops: [
				[0, '#DF5353'], // red
				[0.2, '#DDDF0D'], // yellow
				[0.5, '#55BF3B'], // green
				[0.7, '#DDDF0D'], // yellow
				[1, '#DF5353'] // red
			],		
			min: -1500,
			max: 1500,
			title: {
				text: 'VAR'
			}
		},

		series: [{
			name: 'ReactiveApparentPower',
			data: [0],
			dataLabels: {
				format: '<div style="text-align:center"><span style="font-size:25px;color:' +
					((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
					   '<span style="font-size:12px;color:silver">VAR</span></div>'
			},
			tooltip: {
				valueSuffix: ' VAR'
			}
		}]

	}));

});