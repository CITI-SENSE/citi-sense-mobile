
/*
    CREATED BY NORWEGIAN INSTITUTE OF AIR RESEARCH
            8. January 2013
        Java Script library for drawing graphs
*/

// global

var meanRadiantTemp = function (temp, cloud, radiation, tmrt) {
    var self = this;
    self.temp = temp;
    self.cloud = cloud;
    self.radiation = radiation;
    self.tmrt = tmrt;
};

screenWidth = $(window).width() * 0.8;  // 80%
$('#lgkWSContainer').add('#lgkRHContainer').add('#lgkTContainer').add('#lgAAContainer').css({ 'width': screenWidth, 'height': 200 });


$(window).on('resize', function () {
    screenWidth = $(window).width() * 0.8;  // 80%
    $('#lgkWSContainer').add('#lgkRHContainer').add('#lgkTContainer').add('#lgAAContainer').css({ 'width': screenWidth, 'height': 200 });
});



var kestrelWSSensor; //Wind Spees
var kestrelRHChart; //Relative Humidity
var kestrelTChart; //Temperature
var kestrelAppTicker;
var acousticAppTicker;
var atekniaAcousticSensor; //Acoustic sensor

var graphSensor = function (chart, fromDate, toDate, sensorId, event) {
    var self = this;
    self.chart = chart;
    self.fromDate = fromDate;
    self.toDate = toDate;
    self.sensorId = sensorId;
    self.event = event;
};

var kestrelTicker = function (windSpeedTickerId, humidityTickerId, temperatureTickerId) {
    var self = this;
    self.windSpeedTickerId = windSpeedTickerId;
    self.humidityTickerId = humidityTickerId;
    self.temperatureTickerId = temperatureTickerId;
}

var acousticTicker = function (accousticTickerId) {
    var self = this;
    self.accousticTickerId = accousticTickerId;
}

$(function () {
    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
});

//LINE GRAPH, WIND SPEED
//Function for drawing a line graph of measured wind speed data from the Kestrel Sensor stored in Sensapp, SINTEF
citisense.graph.createLineGraphKestrelWindSpeed = function (kestrelId, from) {

    kestrelWSSensor = new graphSensor(null, from, 0, kestrelId, null);

    var lgkWSChart = new Highcharts.Chart({
        chart: {
            renderTo: 'lgkWSContainer',

            // Explicitly tell the width and height of a chart
            width: null,
            height: null,

            defaultSeriesType: 'line',
            events: {
                load: citisense.graph.requestlgkWSData
            }
        },
        title: {
            text: 'Wind Speed (m/s)'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'm/s'
            },
            type: "linear",
            max: 7,
            min: -1,
            tickInterval: 1
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                lineWidth: 1,
                marker: {
                    enabled: false
                }
            }
        },
        series: [{
            name: 'Measured',
            data: []
        }]
    });

    kestrelWSSensor.chart = lgkWSChart;

};

citisense.graph.requestlgkWSData = function () {

    kestrelWSSensor.toDate = ((Math.round(new Date().getTime() / 1000)));

    console.log("Url:  " + kestrelSensappUrl + kestrelWSSensor.sensorId + '?from=' + kestrelWSSensor.fromDate + '&to=' + kestrelWSSensor.toDate);

    $.ajax({
        url: kestrelSensappUrl + kestrelWSSensor.sensorId + '?from=' + kestrelWSSensor.fromDate + '&to=' + kestrelWSSensor.toDate,

        success: function (result) {

            var items = [];
            var itemsContainer = [];

            var bt = 0;
            $.each(result, function (key, val) {
                if (key == "e") {
                    items = val;
                    //Create table of time and measured values
                    $.each(items, function (index, value) {
                        var measured = [((bt + value.t) * 1000), value.v];
                        itemsContainer.push(measured);
                    });
                }
                    //Get the base time of the measurements
                else if (key == "bt") {
                    bt = val;
                }
            });

            if (itemsContainer.length > 0) {
                ////Sort ascending
                itemsContainer.sort(citisense.graph.SortByDateTime);

                $.each(itemsContainer, function (index, value) {

                    kestrelWSSensor.chart.series[0].addPoint(value, false, false);

                });

                kestrelWSSensor.chart.redraw();

                //Prepare url parameters for next event
                kestrelWSSensor.fromDate = kestrelWSSensor.toDate + 1;

            }

            // call it again after ten seconds
            kestrelWSSensor.event = setTimeout(citisense.graph.requestlgkWSData, 30000);
        },
        cache: false
    });
};

//Stop the graph from dynamically update
citisense.graph.stoplgkWS = function () {
    window.clearInterval(kestrelWSSensor.event);
};

//LINE GRAPH, Relative Humidity
//Function for drawing a line graph of measured relative humidity data from the Kestrel Sensor stored in Sensapp, SINTEF
citisense.graph.createLineGraphKestrelRelativeHumidity = function (kestrelId, from) {

    //Set data interval
    kestrelRHSensor = new graphSensor(null, from, 0, kestrelId, null);

    var lgkRHChart = new Highcharts.Chart({
        chart: {
            renderTo: 'lgkRHContainer',
            defaultSeriesType: 'line',
            events: {
                load: citisense.graph.requestlgkRHData
            }
        },
        title: {
            text: 'Relative Humidity (%)'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: '%'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                color: '#00FF00'
            }
        },
        series: [{
            name: 'Measured',
            data: []
        }]
    });

    kestrelRHSensor.chart = lgkRHChart;

};

citisense.graph.requestlgkRHData = function () {

    kestrelRHSensor.toDate = ((Math.round(new Date().getTime() / 1000)));
    console.log("Url:  " + kestrelSensappUrl + kestrelRHSensor.sensorId + '?from=' + kestrelRHSensor.fromDate + '&to=' + kestrelRHSensor.toDate);

    $.ajax({
        url: kestrelSensappUrl + kestrelRHSensor.sensorId + '?from=' + kestrelRHSensor.fromDate + '&to=' + kestrelRHSensor.toDate,

        success: function (result) {

            var items = [];
            var itemsContainer = [];

            var bt = 0;
            $.each(result, function (key, val) {
                if (key == "e") {
                    items = val;
                    //Create table of time and measured values
                    $.each(items, function (index, value) {
                        var measured = [((bt + value.t) * 1000), value.v];
                        itemsContainer.push(measured);
                    });
                }
                    //Get the base time of the measurements
                else if (key == "bt") {
                    bt = val;
                }
            });

            if (itemsContainer.length > 0) {
                ////Sort ascending
                itemsContainer.sort(citisense.graph.SortByDateTime);

                $.each(itemsContainer, function (index, value) {

                    kestrelRHSensor.chart.series[0].addPoint(value, false, false);

                });

                kestrelRHSensor.chart.redraw();

                //Prepare url parameters for next event
                kestrelRHSensor.fromDate = kestrelRHSensor.toDate + 1;
            }

            // call it again after five second
            kestrelRHSensor.event = setTimeout(citisense.graph.requestlgkRHData, 30000);
        },
        cache: false
    });
};

//Stop the graph from dynamically update
citisense.graph.stoplgkRH = function () {
    window.clearInterval(kestrelRHSensor.event);
};

//LINE GRAPH, Temperature
//Function for drawing a line graph of measured temperature data from the Kestrel Sensor stored in Sensapp, SINTEF

citisense.graph.createLineGraphKestrelTemperature = function (kestrelId, from) {

    kestrelTSensor = new graphSensor(null, from, 0, kestrelId, null);

    var lgkTChart = new Highcharts.Chart({
        chart: {
            renderTo: 'lgkTContainer',
            defaultSeriesType: 'line',
            events: {
                load: citisense.graph.requestlgkTData
            }
        },
        title: {
            text: 'Temperature'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'celsius'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                color: '#FF0000'
            }
        },
        series: [{
            name: 'Measured',
            data: []
        }]
    });

    kestrelTSensor.chart = lgkTChart;

};

citisense.graph.requestlgkTData = function () {

    kestrelTSensor.toDate = ((Math.round(new Date().getTime() / 1000)));
    console.log("Url:  " + kestrelSensappUrl + kestrelTSensor.sensorId + '?from=' + kestrelTSensor.fromDate + '&to=' + kestrelTSensor.toDate);

    $.ajax({
        url: kestrelSensappUrl + kestrelTSensor.sensorId + '?from=' + kestrelTSensor.fromDate + '&to=' + kestrelTSensor.toDate,

        success: function (result) {

            var items = [];
            var itemsContainer = [];

            var bt = 0;
            $.each(result, function (key, val) {
                if (key == "e") {
                    items = val;
                    //Create table of time and measured values
                    $.each(items, function (index, value) {
                        var measured = [((bt + value.t) * 1000), value.v];
                        itemsContainer.push(measured);
                    });
                }
                    //Get the base time of the measurements
                else if (key == "bt") {
                    bt = val;
                }
            });

            if (itemsContainer.length > 0) {
                ////Sort ascending
                itemsContainer.sort(citisense.graph.SortByDateTime);

                $.each(itemsContainer, function (index, value) {

                    kestrelTSensor.chart.series[0].addPoint(value, false, false);

                });

                kestrelTSensor.chart.redraw();

                //Prepare url parameters for next event
                kestrelTSensor.fromDate = kestrelTSensor.toDate + 1;
            }

            // call it again after five second
            kestrelTSensor.event = setTimeout(citisense.graph.requestlgkTData, 30000);
        },
        cache: false
    });

};

//Stop the graph from dynamically update
citisense.graph.stoplgkT = function () {

    window.clearInterval(kestrelTSensor.event);
};

//LINE GRAPH, ACOUSTIC
//Function for drawing a line graph of measured acoustic data from Ateknia software sensor stored in Sensapp, SINTEF
citisense.graph.createLineGraphAtekniaAcoustic = function (sensorID, from) {

    atekniaAcousticSensor = new graphSensor(null, from, 0, sensorID, null);

    var acChart = new Highcharts.Chart({
        chart: {
            renderTo: 'lgAAContainer',

            // Explicitly tell the width and height of a chart
            width: null,
            height: null,

            defaultSeriesType: 'line',
            events: {
                load: citisense.graph.requestlgAAData
            }
        },
        title: {
            text: 'Sound pressure (Bspl)'
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Bspl'
            },
            type: "linear"
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                lineWidth: 1,
                marker: {
                    enabled: false
                },
                color: '#FF0000'
            }
        },
        series: [{
            name: 'Measured',
            data: []
        }]
    });

    atekniaAcousticSensor.chart = acChart;

};

citisense.graph.requestlgAAData = function () {

    atekniaAcousticSensor.toDate = ((Math.round(new Date().getTime() / 1000)));

    console.log("Url:  " + acousticUrl + "databases/raw/data/" + atekniaAcousticSensor.sensorId + "/laq" + '?from=' + atekniaAcousticSensor.fromDate + '&to=' + atekniaAcousticSensor.toDate);

    $.ajax({
        url: acousticUrl + "databases/raw/data/" + atekniaAcousticSensor.sensorId + "/laq" + '?from=' + atekniaAcousticSensor.fromDate + '&to=' + atekniaAcousticSensor.toDate,

        success: function (result) {

            var items = [];
            var itemsContainer = [];

            var bt = 0;
            $.each(result, function (key, val) {
                if (key == "e") {
                    items = val;
                    //Create table of time and measured values
                    $.each(items, function (index, value) {
                        var measured = [((bt + value.t) * 1000), value.v];
                        itemsContainer.push(measured);
                    });
                }
                    //Get the base time of the measurements
                else if (key == "bt") {
                    bt = val;
                }
            });

            if (itemsContainer.length > 0) {
                ////Sort ascending
                itemsContainer.sort(citisense.graph.SortByDateTime);

                $.each(itemsContainer, function (index, value) {

                    atekniaAcousticSensor.chart.series[0].addPoint(value, false, false);

                });

                atekniaAcousticSensor.chart.redraw();

                //Prepare url parameters for next event
                atekniaAcousticSensor.fromDate = atekniaAcousticSensor.toDate + 1;

            }

            // call it again after 30 seconds
            atekniaAcousticSensor.event = setTimeout(citisense.graph.requestlgAAData, 30000);
        },
        cache: false
    });
};

//Stop the graph from dynamically update
citisense.graph.stoplgAA = function () {
    window.clearInterval(atekniaAcousticSensor.event);
};

//Sort list by Time
citisense.graph.SortByDateTime = function (a, b) {

    var aTime = a[0];
    var bTime = b[0];

    return (aTime - bTime);
};

//start and stop Kestrel ticker events
citisense.graph.startKestrelTickers = function (temperatureTick, humidityTick, windSpeedTick) {
    kestrelAppTicker = new kestrelTicker(setInterval(temperatureTick, 10000), setInterval(humidityTick, 10000), setInterval(windSpeedTick, 10000));
};

citisense.graph.stopKestrelTickers = function () {
    clearInterval(kestrelAppTicker.temperatureTickerId);
    clearInterval(kestrelAppTicker.humidityTickerId);
    clearInterval(kestrelAppTicker.windSpeedTickerId);
};

//start and stop Acoustic ticker events
citisense.graph.startAccousticTicker = function (acousticTick) {
    acousticAppTicker = new acousticTicker(setInterval(acousticTick, 10000));
};

citisense.graph.stopAcousticTickers = function () {
    clearInterval(acousticAppTicker.accousticTickerId);
};

citisense.graph.createComfortIndexGraph = function (areaId, siteId, cloudId, radiationId, timeendedHours, timeendedMinutes, age, weight, height, cloudCover) {

    var totalTemp = 0;
    var totalHumidity = 0;
    var totalWindSpeed = 0;

    //calculate totalts
    for (i = 0; i < kestrelTSensor.chart.series[0].yData.length; i++) {
        totalTemp = totalTemp + kestrelTSensor.chart.series[0].yData[i];
        //console.log(totalTemp);
    }

    for (i = 0; i < kestrelRHSensor.chart.series[0].yData.length; i++) {
        totalHumidity = totalHumidity + kestrelRHSensor.chart.series[0].yData[i];
    }

    for (i = 0; i < kestrelWSSensor.chart.series[0].yData.length; i++) {
        totalWindSpeed = totalWindSpeed + kestrelWSSensor.chart.series[0].yData[i];
    }

    var tempSensorDateLength = kestrelTSensor.chart.series[0].yData.length;
    var rhSensorDateLength = kestrelRHSensor.chart.series[0].yData.length;
    var windSensorDateLength = kestrelWSSensor.chart.series[0].yData.length;


    if (tempSensorDateLength > 0 && rhSensorDateLength > 0 && windSensorDateLength > 0) {

        var tempAvg = (totalTemp / tempSensorDateLength);
        var humidityAvg = (totalHumidity / rhSensorDateLength);
        var windSpeedAvg = (totalWindSpeed / windSensorDateLength);

        //Create time interval based on time the stop button was pushed
        //var datePoint = citisense.graph.RoundTimeHalfHour(timeendedHours, timeendedMinutes);

        //************* Testing: until all tmrt values are stored in SenSapp **************
        var datePoint = citisense.graph.RoundTimeHalfHour(4, 30);
        //*********************************************************************************

        var fromDate = datePoint - 300;
        var toDate = datePoint + 300;
        var meanRadiantTemps = new Array();
        var tmrt;

        //Find tmrt objects on areaId, siteId
        $.ajax({
            url: tmrtSensAppUrl + 'databases/raw/data/' + 'Tmrt_Area' + areaId + '/Site' + siteId + '?from=' + fromDate + '&to=' + toDate,
            success: function(result) {
                var items = [];
                checkPrevious = true;

                if (result.hasOwnProperty('e')) {

                    //Create tmrt objects
                    $.each(result, function(key, val) {
                        if (key == "e") {
                            items = val;
                            $.each(items, function(index, value) {
                                meanRadiantTemps.push(citisense.graph.createMeanRadiantTemp(value.sv));
                            });
                        }
                    });

                    //Find correct tmrt value
                    tmrt = citisense.graph.getTmrt(meanRadiantTemps, areaId, siteId, cloudId, radiationId, datePoint);

                }
                //No tmrt objects found. the calculation of index cannot be processed
                else {
                    $("#thermalIndexes").text("No tmrt objects found");
                }


                if (!tmrt || !parseFloat(tmrt)) {
                    $("#thermalIndexes").text("No tmrt found");
                }

                else {

                    var tmrtFloat = parseFloat(tmrt);
                    var index = PETCalculation(windSpeedAvg.toFixed(2), tempAvg.toFixed(2), humidityAvg.toFixed(2), tmrtFloat, age, weight, height, cloudCover);

                    $("#thermalIndexes").empty();
                    $("#thermalIndexes").append(" \
                            <div class='col-xs-6 col-sm-6 col-md-6 col-lg-6' style='text-align: center; padding-bottom: 20px'> \
                                <div class='badge'>" + index + "</div> \
                            </div> \
                            <br /> \
                            <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2'>Heat</div> \
                            <div class='col-xs-4 col-sm-4 col-md-4 col-lg-4'>" + tempAvg.toFixed(2) + " °C" + "</div> \
                            <br /> \
                            <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2'>Wind</div> \
                            <div class='col-xs-4 col-sm-4 col-md-4 col-lg-4'>" + windSpeedAvg.toFixed(2) + " m/s" + "</div> \
                            <br /> \
                            <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2'>Hum.</div> \
                            <div class='col-xs-4 col-sm-4 col-md-4 col-lg-4'>" + humidityAvg.toFixed(2) + " %" + "</div> \
                    ");

                    var chart = citisense.highchart.graphs.grapcolumnGraphThermalComfort;
                    chart.series[0].name = 'Index';
                    chart.series[0].data = [parseFloat(index)];
                    var highchartsOptions = Highcharts.setOptions(Highcharts.SkiesTheme);
                    var drawChart = new Highcharts.Chart(chart);

                }


            },
            error: function(result) {
                //Error message to user
                console.log("Tmrt String NOT found");
                console.log(result);
                $("#thermalIndexes").text("No tmrt records found");
            }
        });
    }
    else {
        $("#thermalIndexes").text("No measured data found");
    }
};

citisense.graph.createAcousticIndexGraph = function(index) {
    var chart = citisense.highchart.graphs.grapcolumnGraphAcousticComfort;
    chart.series[0].name = 'Index';
    chart.series[0].data = [parseFloat(index)];
    var highchartsOptions = Highcharts.setOptions(Highcharts.SkiesTheme);
    var drawChart = new Highcharts.Chart(chart);
};

//Round Time to nearest half hour
citisense.graph.RoundTimeHalfHour = function (hours, minutes) {

    var min = minutes;
    var hrs = hours;

    if (minutes >= 30) {
        if (minutes >= 45) hrs + 1;
        else min = 30;
    }
    else {
        if (minutes > 14) min = 30;
    }

    var dm = Math.round(new Date(Date.UTC(2014, 0, 1, hrs, min)).getTime() / 1000);

    return dm;
};


//Create meanRadiantTemp object from string with the pattern T:Cloud:Radiation:Tmrt
citisense.graph.createMeanRadiantTemp = function (value) {
    
    var strings = value.split(":");
    if (strings.length != 4) { return null; }
    return new meanRadiantTemp(strings[0], strings[1], strings[2], strings[3]);

};


citisense.graph.getTmrt = function (meanRadiantTemps, areaId, siteId, cloudId, radiationId, datePoint) {

    //Find cloud 
    var cloudResult = $.grep(meanRadiantTemps, function(e){ return e.cloud == cloudId; });

    //No matching cloud
    if(cloudResult.length == 0){
        return null;
    }

    var result = $.grep(meanRadiantTemps, function(e){ 
        return (e.cloud == cloudId && e.radiation == radiationId); 
    });


    //Check previous tmrt values for that area and site
    if(result.length == 0){

        var checkPrevious = true;
        var date = new Date(datePoint * 1000);
        var newDatePoint;
        var fromDate;
        var toDate;
        var tmrtValue;

        while (date.getUTCHours() > 0 && checkPrevious) {
            date.setMinutes(date.getMinutes() - 30);
            newDatePoint = Math.round(date.getTime() / 1000);
            fromDate = newDatePoint - 300;
            toDate = newDatePoint + 300;


            $.ajax({
                url: tmrtSensAppUrl + 'databases/raw/data/' + 'Tmrt_Area' + areaId + '/Site' + siteId + '?from=' + fromDate + '&to=' + toDate,
                async: false,
                success: function (result) {

                    if (result.hasOwnProperty('e')) {

                        var meanRadiants = new Array();

                        //Create tmrt objects
                        $.each(result, function (key, val) {
                            if (key == "e") {
                                items = val;
                                $.each(items, function (index, value) {
                                    meanRadiants.push(citisense.graph.createMeanRadiantTemp(value.sv));
                                });
                            }
                        });

                        //Check if correct radiation found on these objects
                        var newResult = $.grep(meanRadiants, function (e) {
                            return (e.cloud == cloudId && e.radiation == radiationId);
                        });

                        if (newResult.length == 1) {
                            tmrtValue = newResult[0].tmrt;
                            checkPrevious = false;
                        }

                    }
                },
                error: function (result) {
                    console.log("Tmrt String NOT found");
                }

            });
        }

        return tmrtValue;
    }
    else if (result.length == 1) {
        return result[0].tmrt;
    }
    else {
        return null;
    }
    //if not return empty string


};


