// Empty JS for your own code to be here
var portaPubblica = 8004
var ipPubblico = "http://" + httpGet("http://www.gronzul.x24hr.com/getip.php")+":" + portaPubblica
if (ipPubblico.length < 20){ipPubblico= "192.168.1.7:5004"}
var socket = io.connect(ipPubblico);
var chart1;

socket.on('getDbDataRes', function (json){
	//document.getElementById("Jsondata").innerHTML = json;	
	var obj = jQuery.parseJSON( json );
	//console.log("getDbDataRes" , obj[0].Power );
	
	/*
	[
		{"data_misura":"2016-02-07T22:08:04.000Z","Power":662.12},
		{"data_misura":"2016-02-07T22:07:59.000Z","Power":661.7},
		{"data_misura":"2016-02-07T22:07:54.000Z","Power":651.55},
		{"data_misura":"2016-02-07T22:07:49.000Z","Power":662.41},
		{"data_misura":"2016-02-07T22:07:44.000Z","Power":665.97}
	]
	*/
		
	var chart1 = $('#graphAnalisi').highcharts();
	var series1 = chart1.series[0];		

	obj.forEach(function(entry) {
		var data = entry.data_misura.substring(8,10)+"-" + entry.data_misura.substring(5,7) +"-" + entry.data_misura.substring(0,4);	
		var time =  entry.data_misura.substring(11, 19);	
		var datetime = data + " " +time
		//console.log(data, " " ,time);
		series1.addPoint([datetime, parseFloat(entry.Power)]);		
	});
	
	
	
});

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
	else if(valore < soglia2)
	{
		return "label label-info";		
	}
	else
	{
		return "label label-default";		
	}	
}

function getLivedata(){
	socket.on('getPower', function (time, Voltage,Current,Power,ActiveApparentPower,ReactiveApparentPower,Frequency,TotalActiveEnergy,TotalReactiveEnergy) {
		var chart1 = $('#graphAndamento').highcharts();
		var series1 = chart1.series[0];		
		var series2 = chart1.series[1];		
		
		/**************************************************************/
		shift = series1.data.length > 60; // shift if the series is longer than x		
		series1.addPoint([time, parseFloat(Power)], true, shift);
		//series1.push([time, parseFloat(Power)]);
		series2.addPoint([time, parseFloat(Voltage)], true, shift);
				
		/**************************************************************/
		var chartPower = $('#container-Power').highcharts();
		var pointPower = chartPower.series[0].points[0], newVal, inc = time;		
		newVal = parseFloat(Power);
		if (newVal < 1 || newVal > 5000) {
			newVal = pointPower.y - inc;
		}
		pointPower.update(newVal);		
		/**************************************************************/
		
		var chartActiveApparentPower = $('#container-ActiveApparentPower').highcharts();
		var pointActiveApparentPower = chartActiveApparentPower.series[0].points[0], newVal, inc = time;
		newVal = parseFloat(ActiveApparentPower);
		if (newVal < 1 || newVal > 5000) {
			newVal = pointActiveApparentPower.y - inc;
		}
		pointActiveApparentPower.update(newVal);				
		
		/**************************************************************/		
		var chartReactiveApparentPower = $('#container-ReactiveApparentPower').highcharts();
		var pointActiveApparentPower = chartReactiveApparentPower.series[0].points[0], newVal, inc = time;
		newVal = Math.abs(ReactiveApparentPower);
		if (newVal < 1 || newVal > 5000) {
			newVal = pointActiveApparentPower.y - inc;
		}
		if (ReactiveApparentPower<0){
			newVal = newVal * -1
		}
		pointActiveApparentPower.update(newVal);				
						
		document.getElementById("Voltage").innerHTML = Voltage;
		document.getElementById("Voltage").className = controllo(Voltage,230,219);			
		document.getElementById("Current").innerHTML = Current;
		document.getElementById("Power").innerHTML = Power;
		document.getElementById("Power").className = controllo(Power,1100,1050);			
		document.getElementById("ActiveApparentPower").innerHTML = ActiveApparentPower;
		document.getElementById("ReactiveApparentPower").innerHTML = parseFloat(ReactiveApparentPower);
		document.getElementById("Frequency").innerHTML = Frequency;
		document.getElementById("TotalActiveEnergy").innerHTML = TotalActiveEnergy/1000;
		document.getElementById("TotalReactiveEnergy").innerHTML = TotalReactiveEnergy/1000;
	});
	
}

$(function () 
{

$('#graphAndamento').highcharts({
	chart: {
			zoomType: 'x',
			events: 
			{
				load: function()
				{
					chart1 = this;
					getLivedata();
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

$('#graphAnalisi').highcharts({
	chart: {
			zoomType: 'x',
			events: 
			{
				load: function()
				{
					chart1 = this;
					getLivedata();
				 }
			}                
	},
	title: {
		text: 'Analisi consumo'			
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
		}],
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