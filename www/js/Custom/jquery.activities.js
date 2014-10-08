/*
 * Physical activitiy visualization widget, jQuery plugin
 *
 * Copyright(c) 2013, CITI-SENSE, U-Hopper, Andrei Tamilin
 *
 */
// avoid `console` errors in browsers that lack a console.

(function () {
    var method;
    var noop = function () { };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// questionnaire results widget
(function ($) {
    $.fn.extend({
        physicalactivity: function (settings) {
            var $this = $(this);
            var serviceUrl = 'http://citisense.u-hopper.com';
            // var serviceUrl = 'http://citisense.local';

            function PhysicalActivity(settings) {
                // unique id
                var uuid = new Date().getTime();
                var uri = serviceUrl + '/physical_activity.php';
                var chart = null;
                var map = null;

                // default settings    
                var options = {
                    uuid: uuid,
                    uri: uri,
                    url: "",
                    title: null,
                    subtitle: null,
                    acknowledgement: null,
                    type: "graph", // map
                    rtl: false,
                    async: true,
                    refresh: 0,
                    cache: false,
                    color_transparency: 0.2,
                    mets: [{
                        from: 0,
                        to: 1.5,
                        color: 'rgb(40, 255, 40)',
                        label: {
                            text: 'Sedentary'
                        }
                    }, {
                        from: 1.5,
                        to: 3,
                        color: 'rgb(255, 255, 0)',
                        label: {
                            text: 'Light'
                        }
                    }, {
                        from: 3,
                        to: 6,
                        color: 'rgb(255, 204, 203)',
                        label: {
                            text: 'Moderate'
                        }
                    }, {
                    }, {
                        from: 6,
                        to: 10,
                        color: 'rgb(255, 0, 0)',
                        label: {
                            text: 'Vigorous'
                        }
                    }
                    ],
                    before: function (el, options) {
                        if (!$('.cf-loading', el).length)
                            el.append('<div class="ssw-loading"><span></span></div>');
                        else
                            $('.ssw-loading', el).show();
                    },
                    after: function (el, options) {
                        // if ($(".next-days", el).length) {
                        // $(".next-days", el).delay(500).toggle("fast");
                        // }
                    },
                    success: function (el, jsonData, options) {
                        $('.cf-loading', el).hide();
                        visualize(el, jsonData);
                    },
                    fail: function (el, options) {
                        el.html('<div class="error"><span>' + options.msgError + '</span></div>');
                    }
                };

                // The function execute an Ajax request to get physical activity data
                var getData = function (el) {
                    //var url = options.uri + "?url=" + encodeURIComponent(options.url);
                    var url = options.url;

                    // call before method
                    options.before(el);

                    $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        async: options.async,
                        // beforeSend : options.before(el, options)
                    }).done(function (response) {
                        options.success(el, response, options);
                    }).fail(function (options) {
                        options.fail(el, options);
                    });
                };

                /** 
                 * This function displays the chart
                 * @param el a jQuery object
                 * @param jsonData a JSON object contains the chart data
                 */
                var visualize = function (el, jsonData) {
                    var bn = jsonData.bn;
                    var bt = jsonData.bt;
                    var values = jsonData.e;

                    if (options.type == "graph") {
                        var data = [];

                        var prevTimestamp = -1;
                        $.each(values, function (index, value) {
                            var timestamp = bt + Math.abs(value.t);
                            var sv = value.sv;
                            var measurements = sv.split(";");
                            var mLenth = measurements.length;

                            var met = Number(measurements[0]);

                            data.push([timestamp * 1000, met]);
                            prevTimestamp = timestamp;
                        });

                        if (chart == null) {
                            var chartOptions = $.extend(true, { chart: { renderTo: el[0].id }, }, getChartOptions(data));
                            chart = new Highcharts.Chart(chartOptions);
                        }
                        else {
                            chart.series[0].setData(data);
                        }
                    }
                    else if (options.type == "map") {
                        var path = [];
                        $.each(values, function (index, value) {
                            var timestamp = bt + Math.abs(value.t);
                            var sv = value.sv;
                            var measurements = sv.split(";");
                            var mLenth = measurements.length;

                            var met = Number(measurements[0]);
                            var lat = measurements[3];
                            var lng = measurements[2];

                            var pathElem = {
                                point: new google.maps.LatLng(lat, lng),
                                met_level: 0
                            };

                            for (var i = 0; i < options.mets.length; i++) {
                                if (met >= options.mets[i].from && met <= options.mets[i].to) {
                                    pathElem.met_level = i;
                                    break;
                                }
                            }

                            path.push(pathElem);
                        });

                        if (map == null) {
                            var center = path[0].point;
                            var myOptions = {
                                zoom: 18,
                                center: center,
                                mapTypeControl: true,
                                mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
                                navigationControl: true,
                                mapTypeId: google.maps.MapTypeId.HYBRID
                            }
                            var map = new google.maps.Map(document.getElementById(el[0].id), myOptions);

                            // fit bounds
                            var bounds = new google.maps.LatLngBounds();
                            for (var i = 0, len = path.length; i < len; i++) {
                                bounds.extend(path[i].point);
                            }
                            map.fitBounds(bounds);

                            var prevLevel = -1;
                            var coloredPath = [];
                            for (var i = 0, len = path.length; i < len; i++) {
                                var elem = path[i];
                                coloredPath.push(elem.point);

                                if (prevLevel != elem.met_level && coloredPath.length > 1) {
                                    var polyline = new google.maps.Polyline({
                                        path: coloredPath,
                                        strokeColor: options.mets[prevLevel].color,
                                        strokeOpacity: 1.0,
                                        strokeWeight: 2,
                                        editable: false
                                    });
                                    polyline.setMap(map);
                                    coloredPath = [];
                                }
                                coloredPath.push(elem.point);
                                prevLevel = elem.met_level;
                            }

                            if (coloredPath.length > 0) {
                                var polyline = new google.maps.Polyline({
                                    path: coloredPath,
                                    strokeColor: options.mets[prevLevel].color,
                                    strokeOpacity: 1.0,
                                    strokeWeight: 2,
                                    editable: false
                                });
                                polyline.setMap(map);
                            }
                        }
                        else {
                            // chart.series[0].setData(data);
                        }
                    }
                    else { }
                };

                var toRgba = function (rgb) {
                    var matchColors = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
                    var match = matchColors.exec(rgb);
                    if (match !== null) {
                        return "rgba(" + match[1] + "," + match[2] + "," + match[3] + "," + options.color_transparency + ")";
                    }
                    else
                        return rgb;
                }

                var getChartOptions = function (data) {
                    var tickPositions = [];
                    tickPositions.push(0);

                    var plotBands = [];
                    // set ticks at the bands extremes
                    if (options.mets && options.mets.length > 0) {
                        for (var i = 0; i < options.mets.length; i++) {
                            if (options.mets[i].to) {
                                tickPositions.push(options.mets[i].to);
                            }
                            var band = options.mets[i];
                            band.color = toRgba(band.color);
                            plotBands.push(band);
                        }
                    }

                    var chartOptions = {
                        chart: {
                            type: "spline"
                        },
                        credits: {
                            enabled: false
                        },
                        exporting: {
                            enabled: false
                        },
                        title: {
                            text: options.title
                        },
                        subtitle: {
                            text: options.subtitle
                        },
                        legend: {
                            enabled: false,
                            rtl: options.rtl ? true : false
                        },
                        xAxis: {
                            type: 'datetime',
                            ordinal: true,
                            // labels: {
                            // formatter: function() {
                            //     return Highcharts.dateFormat('%H:%M', this.value);
                            // }
                            // },             
                        },
                        yAxis: {
                            title: {
                                text: 'Activity Intensity'
                            },
                            min: 0,
                            max: 10,
                            minorGridLineWidth: 0,
                            gridLineWidth: 0,
                            alternateGridColor: null,
                            tickPositions: tickPositions,
                            plotBands: plotBands
                        },
                        tooltip: {
                            valueSuffix: ''
                        },
                        plotOptions: {
                            spline: {
                                lineWidth: 4,
                                states: {
                                    hover: {
                                        lineWidth: 5
                                    }
                                },
                                marker: {
                                    enabled: false
                                },
                                //                    pointInterval: 3600000, // one hour
                                //                    pointStart: Date.UTC(2009, 9, 6, 0, 0, 0)
                            }
                        },
                        series: [{
                            name: 'Intensity',
                            data: data
                        }]
                        ,
                        navigation: {
                            menuItemStyle: {
                                fontSize: '10px'
                            }
                        }
                    };
                    return chartOptions;
                };
                /**
                 * setDefaults function set the default settings
                 * @param settings JSON object
                 */
                var setDefaults = function (settings) {
                    $.extend(options, settings);
                    return this;
                };
                // set dafault settings
                setDefaults(settings || {});

                $this.addClass('citisense-widget');
                getData($this);
                if (options.refresh > 0)
                    setInterval(function () { getData($this); }, options.refresh);
            };
            // initialisation 
            return this.each(function () {
                //         console.log(window.Highcharts);
                //         if (!window.Highcharts) {
                // $.getScript(serviceUrl + "/js/vendor/highcharts/highcharts.js", function(){
                //              new PhysicalActivity(settings);
                //         console.log(window.Highcharts);
                //              return this;
                // });
                //         }
                //         else {
                new PhysicalActivity(settings);
                return this;
                // }
            });
        }
    });
})(jQuery);