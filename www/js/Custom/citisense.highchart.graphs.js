
/*
    CREATED BY NORWEGIAN INSTITUTE OF AIR RESEARCH
            18. March 2014
        Definitiona of Highchart graphs used in Citi-Sense projects
*/

//var categoryLinksAcoustic = {
//    4: '4 Unfriendly',
//    6: '6 need text',
//    8: '8 Acceptable',
//    10: '10 Good',
//    11: '12 Excellent'
//};

citisense.highchart.graphs.grapcolumnGraphThermalComfort = {

	chart: {
		renderTo: 'cgComfortIndex',
		type: 'column'
	},
	title: {
		text: 'Thermal Comfort'
	},
	subtitle: {
		text: 'PET index'
	},
	xAxis: {
	},
	yAxis: {
		min: 0
	},
	tooltip: {
		headerFormat: '<span style="font-size:10px"></span><table>',
		pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
		footerFormat: '</table>',
		shared: true,
		useHTML: true
	},

	legend: {
		enabled: false
	},

	plotOptions: {
		series: {
			dataLabels: {
				enabled: true
			}
		},

		column: {
			pointPadding: 0.2,
			borderWidth: 0
		}
	},
	series: [{
		name: 'Index',
		data: []
	}]

};

citisense.highchart.graphs.grapcolumnGraphAcousticComfort = {
    chart: {
        renderTo: 'cgAcousticIndex',
        type: 'column'
    },
    title: {
        text: null
    },
    subtitle: {
        text: null
    },
    xAxis: {
    
    },
    yAxis: {
        min: 0,
        max: 12,
        tickInterval: 2,
        title: {
            text: null
        },
        plotBands: [
            {
            color: '#8A0808',
            from: 0,
            to: 4},
            {
            color: '#DF0101',
            from: 4,
            to: 6},
            {
            color: '#FF8000',
            from: 6,
            to: 8
            },
            {
            color: '#FFFF00',
            from: 8,
            to: 10
            },
            {
            color: '#01DF01',
            from: 10,
            to: 12
            }
        ]
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px"></span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },

    legend: {
        enabled: false
    },

    plotOptions: {
        series: {
            dataLabels: {
                enabled: true
            }
        },

        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [{
        name: 'Index',
        data: [],
        dataLabels: {
            enabled: true,
            rotation: -90,
            color: '#FFFFFF',
            align: 'right',
            x: 6,
            y: 10,
            style: {
                fontSize: '13px',
                fontFamily: 'Verdana, sans-serif',
                textShadow: '0 0 3px black'
            }
        }
    }]

};