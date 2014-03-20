
/*
    CREATED BY NORWEGIAN INSTITUTE OF AIR RESEARCH
            18. March 2014
        Definitiona of Highchart graphs used in Citi-Sense projects
*/


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

