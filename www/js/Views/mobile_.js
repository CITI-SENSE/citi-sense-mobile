
function Session(name, timestarted, timeended) {
    var self = this;
    self.name = ko.observable(name);
    self.timestarted = ko.observable(timestarted);
    self.timeended = ko.observable(timeended);

    self.toJson = function () {
        return {
            "name": self.name(),
            "timestarted": self.timestarted(),
            "timeended": self.timeended()
        };
    };
};

var senmlSchema = function (backend, template) {
    var self = this;
    self.backend = backend;
    self.template = template;
};

var senmlSensor = function (id, descr, senmlSchema) {
    var self = this;
    self.id = id;
    self.descr = descr;
    self.schema = senmlSchema;
};

var senml = function (baseName, senmlData) {
    var self = this;
    self.bn = baseName;
    //self.bt = baseTime;
    self.e = senmlData;
};

var senmlData = function (unit, stringvalue, time) {
    var self = this;
    self.u = unit;
    self.sv = stringvalue;
    self.t = time;
    //self.n = name;
};

function Settings(id, hasaccsensor, hasthermsensor, thermalsensorid, accelerometerid, userid, dbtype) {
    var self = this;
    self.id = ko.observable(id);
    self.hasaccsensor = ko.observable(hasaccsensor);
    self.hasthermsensor = ko.observable(hasthermsensor);
    self.thermalsensorid = ko.observable(thermalsensorid);
    self.accelerometerid = ko.observable(accelerometerid);
    self.userid = ko.observable(userid);
    self.dbtype = ko.observable(dbtype);
};


//var senmlValueData = function (unit, value, time) {
//    var self = this;
//    self.u = unit;
//    self.v = value;
//    self.t = time;
//    //self.n = name;
//};

var ObservationType = function (value, name) {
    this.value = value;
    this.name = name;
};


//var ObservationPerception = function(value, name) {
//    this.value = value;
//    this.name = name;
//};

var AppModel = function () {
    var self = this;
    var inputdateformat = "YYYY-MM-DDTHH:ss";

    self.ErrorMsg = ko.observable("");
    self.Loading = ko.observable(false);
    self.LoadingSync = ko.observable(false);

    self.StartSection = ko.observable(true);
    self.WP2Section = ko.observable(false);
    self.WP2SectionActive = ko.observable(false);
    self.WP2SectionButton = ko.observable(false);
    self.WP3Section = ko.observable(false);
    self.WP3SectionActive = ko.observable(false);
    self.WP3SectionButton = ko.observable(false);
    self.SettingsSection = ko.observable(false);
    self.PhotoSection = ko.observable(false);
    self.MapSection = ko.observable(false);
    self.NewSessionSection = ko.observable(false);
    self.ViewSessionsSection = ko.observable(false);
    self.EvolutionSection = ko.observable(false);
    self.PhysicalSection = ko.observable(false);
    self.PhysicalSectionGraph = ko.observable(false);
    self.PhysicalSectionMap = ko.observable(false);
    self.PhysicalSectionActive = ko.observable(false);
    self.PhysicalDateFrom = ko.observable(moment().subtract(6,'hours').format(inputdateformat));
    self.PhysicalDateTo = ko.observable(moment().format(inputdateformat));
    self.ResultSection = ko.observable(false);

    self.KestrelId = ko.observable('Nexus_5KOT49H');
    self.UserEmail = ko.observable('email');
    self.LastTemperature = ko.observable();
    self.LastHumidity = ko.observable();
    self.LastWindSpeed = ko.observable();
    self.LastWindSpeedDate = ko.observable();
    self.LastTemperatureDate = ko.observable();
    self.LastHumidityDate = ko.observable();
    self.AccumV = ko.observable();
    self.AccumH = ko.observable();
    self.AreaId = ko.observable();
    self.SiteId = ko.observable();
    self.CloudId = ko.observable();
    self.RadiationId = ko.observable();
    self.ComfortIndex = ko.observable();

    self.ObservationImage = ko.observable("");
    self.ObservationsNotSynced = ko.observableArray([]);
    self.ObservationTypes = ko.observableArray([
        new ObservationType(1, "traffic"),
        new ObservationType(2, "water"),
        new ObservationType(3, "wind"),
        new ObservationType(4, "birds"),
        new ObservationType(5, "public works"),
        new ObservationType(6, "other")
    ]);
    self.selectedObservationType = ko.observable("");
    self.ObservationPerceptions = ko.observableArray([
        "Pleasent",
        "Unpleasent"
    ]);
    self.selectedObservationPerception = ko.observable("");

    self.newSession = ko.observable(new Session());
    self.Sessions = ko.observableArray();
    self.tempSessions = ko.observableArray([]);
    self.SensorNoise = ko.observableArray([]);
    self.Settings = ko.observable(new Settings());

    //self.Settings().hasaccsensor.subscribe(function (value) {self.saveSettings()}, this);

    self.SessionRunning = ko.observable(false);

    self.SelectSection = function (section) {
        console.log(section);
        self.StartSection(false);
        self.PhotoSection(false);
        self.MapSection(false);
        self.NewSessionSection(false);
        self.ViewSessionsSection(false);
        self.SettingsSection(false);
        self.EvolutionSection(false);
        self.PhysicalSection(false);
        self.PhysicalSectionActive(false);
        self.PhysicalSectionGraph(false);
        self.PhysicalSectionMap(false);
        self.ResultSection(false);
        self.WP2SectionActive(false);
        self.WP3SectionActive(false);
        self.WP3Section(false);
        self.WP2Section(false);

        switch (section) {
            case 'wp2':
                self.WP2Section(true);
                self.WP2SectionActive(true);
                self.WP2SectionButton(true);
                self.WP3SectionButton(false);
                break;
            case 'wp3':
                self.WP3Section(true);
                self.WP3SectionActive(true);
                self.WP3SectionButton(true);
                self.WP2SectionButton(false);
                break;
            case 'settings':
                self.SettingsSection(true);
                self.WP3SectionButton(false);
                self.WP2SectionButton(false);
                self.getSettings();
                break;
            case 'home':
                self.StartSection(true);
                break;
            case 'map':
                self.MapSection(true);
                google.maps.event.trigger(map, 'resize');
                self.loadMapMarkers();
                break;
            case 'photo':
                self.PhotoSection(true);
                break;
            case 'newsession':
                self.NewSessionSection(true);
                break;
            case 'viewsessions':
                self.ViewSessionsSection(true);
                self.ErrorMsg(longitude);
                break;
            case 'evolution':
                self.EvolutionSection(true);
                break;
            case 'result':
                self.ResultSection(true);
                //self.CalculateComfortIndex();
                break;
            case 'physical':
                self.PhysicalSection(true);
                self.PhysicalSectionActive(true);
                break;
            case 'PhysicalSectionMap':
                self.PhysicalSection(true);
                self.PhysicalSectionActive(false);
                self.PhysicalSectionMap(true);
                var fromPhysical = moment(self.PhysicalDateFrom(), inputdateformat);//.subtract(self.PhysicalHours(), 'hours');
                var toPhysical = moment(self.PhysicalDateTo(), inputdateformat);
                self.LoadPhysicalMap(fromPhysical.unix(), toPhysical.unix());
                break;
            case 'PhysicalSectionGraph':
                self.PhysicalSection(true);
                self.PhysicalSectionActive(false);
                self.PhysicalSectionGraph(true);
                var fromPhysicalGraph = moment(self.PhysicalDateFrom(), inputdateformat);
                var toPhysicalGraph = moment(self.PhysicalDateTo(), inputdateformat);
                self.LoadPhysicalGraph(fromPhysicalGraph.unix(), toPhysicalGraph.unix());
                break;
        }

        return true;
    };


    self.loadMapMarkers = function () {
        var longitudes, latitudes, perceptions;

        $.when(
            //get longitude
            $.get(sensappUrl + 'databases/raw/data/SmartphonePicture/gps_long' + self.Settings().userid(), null)
                .done(function (resultLong) {
                    console.log(resultLong.sv);
                    longitudes = resultLong;
                }),
            //get latitude
            $.get(sensappUrl + 'databases/raw/data/SmartphonePicture/gps_lat' + self.Settings().userid(), null)
                .done(function (resultLat) {
                    console.log(resultLat.sv);
                    latitudes = resultLat;
                }),
            //get perception
            $.get(sensappUrl + 'databases/raw/data/SmartphonePicture/perception' + self.Settings().userid(), null)
                .done(function (result) {
                    console.log(result.e[0].sv);
                    perceptions = result;

                })
            ).then(function () {

                    var contentString = '';

                    var timesToRemove = new Array();

                    longitudes.e.sort(function (a, b) { return a.t - b.t; });
                    latitudes.e.sort(function (a, b) { return a.t - b.t; });
                    perceptions.e.sort(function (a, b) { return a.t - b.t; });

                console.log(longitudes);
                console.log(latitudes);
                console.log(perceptions);
                    //Find corrupted columnes based on time
                    //timesToRemove = findCorruptedTimes(longitudes.e, latitudes.e, perceptions.e);
                    timesToRemove = findCorruptedTimes(longitudes, latitudes, perceptions);


                    //Remove corrupted columns
                    for (var i = 0; i < timesToRemove.length; i++) {
                        longitudes.e = jQuery.grep(longitudes.e, function (value) {
                            return (longitudes.bt + value.t) != timesToRemove[i];
                        });
                        latitudes.e = jQuery.grep(latitudes.e, function (value) {
                            return (latitudes.bt + value.t) != timesToRemove[i];
                        });
                        perceptions.e = jQuery.grep(perceptions.e, function (value) {
                            return (perceptions.bt + value.t) != timesToRemove[i];
                        });
                    }

                    for (var i = 0; i < longitudes.e.length; i++) {

                        var pinColor = 'ffffff';
                        if (perceptions.e[i].sv == 'Pleasent') {
                            pinColor = '0e681d';
                        } else {
                            pinColor = 'FE7569';
                        }

                        var title = deviceId + '_' + i;
                        var latlng = new google.maps.LatLng(latitudes.e[i].sv, longitudes.e[i].sv);
                        addObservationMarker(map, title, latlng, pinColor, self.Settings().userid(), (longitudes.bt + longitudes.e[i].t));

                    }
                });
    };

    self.addObservation = function () {
        //self.ErrorMsg("addObservation");
        navigator.camera.getPicture(function (imageData) {
            //success
            self.ErrorMsg("addObservation success");
            self.ObservationImage("data:image/jpeg;base64," + imageData);
        },
            function () {
                self.ErrorMsg("camera failed");
                //failed
            },
            {
                quality: 50,
                destinationType: destinationType.DATA_URL,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                correctOrientation: true
            }
        );
        //self.ObservationImage("data:image/jpeg;base64,test");
    };

    self.discardObservation = function () {
        bootbox.confirm("Are you sure you want to discard your photo?", function (result) {
            if (result) {
                self.ObservationImage("");
            }
        });
    };

    self.saveObservation = function () {
        //self.Loading(true);
        self.PhotoSection(false);

        var savetime = parseInt(moment().format("X"));
        self.SaveObservationToDb(savetime);

        self.SyncObservations();
    };

    self.SaveObservationToDb = function (time) {

        if (!navigator.geolocation) {
            alert("Picture will not be stored. Geolocation not supported");
            return;
        }

        function success(position) {

            //alert(position.coords.latitude.toString() + "-"  + position.coords.longitude.toString());
            //self.ObservationImage('test');
            var senmlImageData = new senmlData("m", self.ObservationImage(), time);
            var arraySenmlImageData = new Array(senmlImageData);
            var senmlImage = new senml("SmartphonePicture/image" + self.Settings().userid(), arraySenmlImageData);
            var data = ko.mapping.toJSON(senmlImage);

            var senmlGpsLatData = new senmlData("lat", position.coords.latitude.toString(), time);
            var arraySenmlGpsLatData = new Array(senmlGpsLatData);
            var senmlGpsLat = new senml("SmartphonePicture/gps_lat" + self.Settings().userid(), arraySenmlGpsLatData);
            var dataLat = ko.mapping.toJSON(senmlGpsLat);

            var senmlGpsLongData = new senmlData("lon", position.coords.longitude.toString(), time);
            var arraysenmlGpsLongData = new Array(senmlGpsLongData);
            var senmlGpsLong = new senml("SmartphonePicture/gps_long" + self.Settings().userid(), arraysenmlGpsLongData);
            var dataLong = ko.mapping.toJSON(senmlGpsLong);

            var senmlPerceptionData = new senmlData("m", self.selectedObservationPerception(), time);
            var arraysenmlPerceptionData = new Array(senmlPerceptionData);
            var senmlPerception = new senml("SmartphonePicture/perception" + self.Settings().userid(), arraysenmlPerceptionData);
            var dataPerception = ko.mapping.toJSON(senmlPerception);

            cdatabase.insertObservation(data, dataLong, dataLat, dataPerception, time);
            self.ObservationsNotSynced.push(time);
            self.ObservationImage("");
        };

        function error() {
            alert ("Unable to retrieve your location");
        };

        navigator.geolocation.getCurrentPosition(success, error);

        //cdatabase.getObservations(1395221228, time);
        //var test = 0;
    };

    self.SyncObservations = function () {
        self.ErrorMsg("syncing");
        self.LoadingSync(true);
        self.CreateSensors();

        cdatabase.getObservationsNotSynced(function () {
            var observations = cdatabase.ObservationsNotSynced;
            var url = dispatchUrl;

            var deferreds = [];
            $.each(observations, function (index, observation) {
                var time = observation.id;
                var data = observation.image;
                var dataLong = observation.longitude;
                var dataLat = observation.latitude;
                var dataPerception = observation.perception;
                
                deferreds.push(
                    // No success handler - don't want to trigger the deferred object
                   $.ajax({
                       type: 'PUT',
                       dataType: 'JSON',
                       url: url,
                       data: data,
                       contentType: 'application/json; charset=utf-8'
                   }),
                    $.ajax({
                        type: 'PUT',
                        dataType: 'JSON',
                        url: url,
                        data: dataLat,
                        contentType: 'application/json; charset=utf-8'
                    }),
                    $.ajax({
                        type: 'PUT',
                        dataType: 'JSON',
                        url: url,
                        data: dataLong,
                        contentType: 'application/json; charset=utf-8'
                    }),
                    $.ajax({
                        type: 'PUT',
                        dataType: 'JSON',
                        url: url,
                        data: dataPerception,
                        contentType: 'application/json; charset=utf-8'
                    })
                );
            });

            //for (var i = 0; i < observations.length; i++) {
            //    self.LoadingSync(true);
            //    var time = observations[i].id;
            //    var data = observations[i].image;
            //    var dataLong = observations[i].longitude;
            //    var dataLat = observations[i].latitude;
            //    var dataPerception = observations[i].perception;

            $.when.apply($, deferreds
                    //$.ajax({
                    //    type: 'PUT',
                    //    dataType: 'JSON',
                    //    url: url,
                    //    data: data,
                    //    contentType: 'application/json; charset=utf-8',
                    //    //async: false,
                    //    success: function (result) {

                    //    },
                    //    error: function (result) {
                    //        self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                    //        self.LoadingSync(false);
                    //    }
                    //}),
                    //$.ajax({
                    //    type: 'PUT',
                    //    dataType: 'JSON',
                    //    url: url,
                    //    data: dataLat,
                    //    contentType: 'application/json; charset=utf-8',
                    //    success: function (result) {
                    //        self.ErrorMsg(dataLat);
                    //    },
                    //    error: function (result) {
                    //        self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                    //        self.LoadingSync(false);
                    //    }
                    //}),
                    //$.ajax({
                    //    type: 'PUT',
                    //    dataType: 'JSON',
                    //    url: url,
                    //    data: dataLong,
                    //    contentType: 'application/json; charset=utf-8',
                    //    success: function (result) {
                    //    },
                    //    error: function (result) {
                    //        self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                    //        self.LoadingSync(false);
                    //    }
                    //}),
                    //$.ajax({
                    //    type: 'PUT',
                    //    dataType: 'JSON',
                    //    url: url,
                    //    data: dataPerception,
                    //    contentType: 'application/json; charset=utf-8',
                    //    success: function (result) {
                    //        self.selectedObservationPerception(null);
                    //    },
                    //    error: function (result) {
                    //        self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                    //        self.LoadingSync(false);
                    //    }
                    //})
                ).then(function () {
                    self.ErrorMsg("synced");

                    cdatabase.setSyncedFlag(time);
                    self.ObservationsNotSynced.remove(time);

                    self.LoadingSync(false);
                    
                    if (self.WP2SectionButton())
                        self.SelectSection('wp2');
                    else
                        self.SelectSection('wp3');
                });
            //}
        });
    };

    self.CreateSensors = function () {
        //check if sensors exist
        $.get(sensappUrl + 'registry/sensors/SmartphonePicture/image' + self.Settings().userid(), null)
           .done(function (result) {
           })
           .fail(function (getresult) {
               //get info for composite sensor
               $.get(sensappUrl + 'registry/composite/sensors/SmartphonePicture', null)
                   .done(function (result) {

                       var sensors = result.sensors;

                       var senmlSchemaString = new senmlSchema("raw", "String");
                       var newSensorImage = new senmlSensor("SmartphonePicture/image" + self.Settings().userid(), "image", senmlSchemaString);
                       var newSensorImageData = ko.mapping.toJSON(newSensorImage);
                       var newSensorLat = new senmlSensor("SmartphonePicture/gps_lat" + self.Settings().userid(), "latitude", senmlSchemaString);
                       var newSensorLatData = ko.mapping.toJSON(newSensorLat);
                       var newSensorLong = new senmlSensor("SmartphonePicture/gps_long" + self.Settings().userid(), "longitude", senmlSchemaString);
                       var newSensorLongData = ko.mapping.toJSON(newSensorLong);
                       var newSensorPerception = new senmlSensor("SmartphonePicture/perception" + self.Settings().userid(), "perception", senmlSchemaString);
                       var newSensorPerceptionData = ko.mapping.toJSON(newSensorPerception);

                       sensors.push("/registry/sensors/SmartphonePicture/image" + self.Settings().userid());
                       sensors.push("/registry/sensors/SmartphonePicture/gps_lat" + self.Settings().userid());
                       sensors.push("/registry/sensors/SmartphonePicture/gps_long" + self.Settings().userid());
                       sensors.push("/registry/sensors/SmartphonePicture/perception" + self.Settings().userid());

                       var newCompositeSensorData = ko.mapping.toJSON(result);

                       //create new sensors
                       $.ajax({
                           type: 'POST',
                           url: sensappUrl + 'registry/sensors',
                           data: newSensorImageData,
                           contentType: 'application/json; charset=utf-8',
                           success: function (result) {
                               console.log("ImageSensor created");

                               $.ajax({
                                   type: 'POST',
                                   url: sensappUrl + 'registry/sensors',
                                   data: newSensorLatData,
                                   contentType: 'application/json; charset=utf-8',
                                   success: function (result) {
                                       console.log("LatSensor created");
                                       $.ajax({
                                           type: 'POST',
                                           url: sensappUrl + 'registry/sensors',
                                           data: newSensorLongData,
                                           contentType: 'application/json; charset=utf-8',
                                           success: function (result) {
                                               console.log("LongSensor created");
                                               $.ajax({
                                                   type: 'POST',
                                                   url: sensappUrl + 'registry/sensors',
                                                   data: newSensorPerceptionData,
                                                   contentType: 'application/json; charset=utf-8',

                                                   success: function (result) {
                                                       console.log("PerceptionSensor created");
                                                       //update composite sensor with new sensors
                                                       $.ajax({
                                                           type: 'PUT',
                                                           url: sensappUrl + 'registry/composite/sensors/SmartphonePicture',
                                                           data: newCompositeSensorData,
                                                           contentType: 'application/json; charset=utf-8',
                                                           success: function (result) {
                                                               console.log("CompositeSensor created");
                                                           },
                                                           error: function (result) {
                                                               console.log("CompositeSensor NOT created");
                                                               self.ErrorMsg(result);
                                                               self.Loading(false);
                                                           }
                                                       });
                                                   },
                                                   error: function (result) {
                                                       console.log("PerceptionSensor NOT created");
                                                       self.ErrorMsg(result);
                                                       self.Loading(false);
                                                   }
                                               });

                                           },
                                           error: function (result) {
                                               console.log("LongSensor NOT created");
                                               self.ErrorMsg(result);
                                               self.Loading(false);
                                           }
                                       });
                                   },
                                   error: function (result) {
                                       console.log("LatSensor NOT created");
                                       self.ErrorMsg(result);
                                       self.Loading(false);
                                   }
                               });
                           },
                           error: function (result) {
                               console.log("ImageSensor NOT created");
                               self.ErrorMsg(result);
                               self.Loading(false);
                           }
                       });
                   });
           });
    };

    self.LoadPhysicalGraph = function (from, to) {
        var url = sensappUrl + "databases/raw/data/PhysicalActivityCalculated/ParticipantID" + self.Settings().accelerometerid() + "?from=" + from + "&to=" + to;
        $(function () {
            $("#container_graph").physicalactivity({
                url: url,
                title: "", // optional, not displayed if not present
                subtitle: "" // optional, not displayed if not present
            });
        });
    };

    self.LoadPhysicalMap = function (from, to) {
        //physical activity, sensappUrl + "databases/raw/data/PhysicalActivityCalculated/ParticipantID" + self.Settings().accelerometerid()
        var url = sensappUrl + "databases/raw/data/PhysicalActivityCalculated/ParticipantID" + self.Settings().accelerometerid() + "?from=" + from + "&to=" + to;
        console.log(url);
        $(function () {
            $("#container_map").physicalactivity({
                url: url,
                type: "map"
            });
        });


        //var id = '0080114';
        //from = '1391505915';

        //load calculated values
        //var url = 'http://ec2-54-72-155-56.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/PhysicalActivityCalculated/ParticipantID' + id + '?from=' + from + '&to=' + to;
        //var sensordata;

        //$.get(url, null)
        //    .done(function (result) {
        //        sensordata = ko.mapping.fromJS(result);
        //        ko.mapping.fromJS(result, sensordata);
        //    });

        //var i = 0;

        //raw data and calculate too slow?
        //var url = 'http://ec2-54-72-155-56.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/ACC-x-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //console.log(url);
        //var x, y, z, lat, long;
        //var startRequestsTime = moment();
        //$.get(url, null)
        //    .done(function(result) {
        //        x = result;

        //        var url = 'http://ec2-54-72-155-56.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/ACC-y-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //        $.get(url, null)
        //            .done(function(result) {
        //                y = result;

        //                var url = 'http://ec2-54-72-155-56.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/ACC-z-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //                $.get(url, null)
        //                    .done(function(result) {
        //                        z = result;

        //                        var url = 'http://ec2-54-72-155-56.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/GPS-latitude-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //                        $.get(url, null)
        //                            .done(function(result) {
        //                                lat = result;

        //                                var url = 'http://ec2-54-72-155-56.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/GPS-longitude-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //                                $.get(url, null)
        //                                    .done(function(result) {
        //                                        console.log("downloaded data in: " + moment(moment().diff(startRequestsTime)).format("HH:mm:ss"));
        //                                        long = result;

        //                                        var accums = citisense.physical.mapPhysicalActivity(x, y, z, lat, long);
        //                                        self.AccumV(accums[0]);
        //                                        self.AccumH(accums[1]);
        //                                    });
        //                            });
        //                    });
        //            });
        //    });
    };

    self.LoadSensorNoise = function (from, to) {
        if (from != undefined) {
            console.log("undefined");

            var url = 'http://demo.sensapp.org/sensapp/databases/raw/data/Nexus_7JSS15R_Noise?from=' + from + '&to=' + to;
            console.log(url);
            $.get(url, null)
               .done(function (result) {
                   var sensordata = ko.mapping.fromJS(result);
                   ko.mapping.fromJS(result, sensordata);
                   self.SensorNoise.push(sensordata);
                   self.ErrorMsg("No errors encountered");
               })
               .fail(function (result) {
                   self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
               });
        }
    };

    self.startSession = function () {

        //create new session
        self.newSession(new Session());

        //check if kestrelid is set
        if (self.Settings().thermalsensorid() == "" || self.Settings().thermalsensorid() == undefined) {
            bootbox.alert("A Kestrel Id must be specified before start", function () { });
            return;
        }

        //check if email is set
        if (self.UserEmail() == "" || self.UserEmail() == undefined) {
            bootbox.alert("An email must be specified before start", function () { });
            return;
        }


        self.SessionRunning(true);

        //start timer
        stopWatch.start();

        //start graphs
        citisense.graph.createLineGraphKestrelWindSpeed(self.Settings().thermalsensorid() + '_Kestrel_Wind_Speed', (Math.round(new Date().getTime() / 1000)));
        citisense.graph.createLineGraphKestrelRelativeHumidity(self.Settings().thermalsensorid() + '_Kestrel_Relative_Humidity', (Math.round(new Date().getTime() / 1000)));
        citisense.graph.createLineGraphKestrelTemperature(self.Settings().thermalsensorid() + '_Kestrel_Temperature', (Math.round(new Date().getTime() / 1000)));

        //Start tickers
        citisense.graph.startKestrelTickers(self.TemperatureTick, self.HumidityTick, self.WindSpeedTick);

        var timestarted = new moment().format();
        self.newSession().timestarted(timestarted);

        //load sensor data to local db every 10 seconds
        var timelapse = 0;
        var loadSensorDataDelay = 10000;
        var timer = setTimeout(function () {
            if (self.SessionRunning() == false) {
                clearTimeout(timer);
            }
            //self.LoadSensorNoise(timestarted + timelapse);
            timelapse += loadSensorDataDelay;
        }, loadSensorDataDelay);

        //hide result button during session
        self.ResultSection(false);
    };


    self.stopSession = function () {

        self.SessionRunning(false);

        stopWatch.stop();

        //self.Settings().thermalsensorid() == "jaba";

        //Stop updating the graphs
        citisense.graph.stoplgkWS();
        citisense.graph.stoplgkRH();
        citisense.graph.stoplgkT();

        citisense.graph.stopKestrelTickers();

        self.newSession().timeended(new moment().format());

        self.tempSessions.push(self.newSession);

        self.saveToStore();

        //create new session
        //self.newSession(new Session()); Test mff: moved to startSession
        stopWatch.resetclock();

        //display result button
        self.ResultSection(true);
    };


    self.getSettings = function () {

        cdatabase.getSettings(function () {

            var dbSettings = cdatabase.Settings;

            self.Settings().id(dbSettings.id);
            self.Settings().hasaccsensor(dbSettings.hasaccsensor);
            self.Settings().hasthermsensor(dbSettings.hasthermsensor);
            self.Settings().thermalsensorid(dbSettings.thermalsensorid);
            self.Settings().accelerometerid(dbSettings.accelerometerid);
            self.Settings().userid(dbSettings.userid);
            self.Settings().dbtype(cdatabase.DbType);

            //TODO:remove
            //self.Settings().userid("95f0cb0c-091b-4cda-8e58-2fb5c2a2cdf2");
        });
    };

    self.saveSettings = function () {

        cdatabase.insertSettings(self.Settings().id(), self.Settings().hasaccsensor(), self.Settings().hasthermsensor(), self.Settings().thermalsensorid(), self.Settings().accelerometerid(), self.Settings().userid());
    };

    self.newUser = function () {
        self.Settings().userid(generateUUID());
    };

    self.CalculateComfortIndex = function () {
        citisense.graph.createComfortIndexGraph(self.AreaId(), self.SiteId(), self.CloudId(), self.RadiationId(), new moment(self.newSession().timeended()).hours(), new moment(self.newSession().timeended()).minutes());
    };


    var db = window.citisensGlobal, DBName = "citisense", DBVersion = 1, storeName = "citisenseCollection";
    self.dbSessions = ko.observableArray([]);
    self.saveToStore = function () {
        //self.showNum(2);
        if (self.tempSessions().length > 0) {
            self.dbSessions.removeAll();
            $(".refresh").show();
            db.openDB(DBName, DBVersion, storeName, successOpen);
        }
    };

    function successOpen(e) {
        //console.log(e); 
        //var sessions = [];
        //ko.utils.arrayForEach(self.tempSessions(), function (session) { sessions.push(session.toJson()); });
        //db.addRecords(storeName, sessions, successAdd);
    }

    function successAdd(e) {
        //console.log(e);
        self.tempSessions.removeAll();
        db.getAllRecords(storeName, successGet);
    }

    function successGet(data) {
        //console.log(data);
        $(".refresh").hide();
        ko.utils.arrayPushAll(self.dbSessions, data);
        //data.forEach(function(item){ self.dbRecords.push(item); });
    }

    function findCorruptedTimes(a, b, c) {

        var corruptedTimes = new Array();

        $.merge(corruptedTimes, findSubCorruptedTimes(a, b, c));
        $.merge(corruptedTimes, findSubCorruptedTimes(b, c, a));
        $.merge(corruptedTimes, findSubCorruptedTimes(c, a, b));

        return corruptedTimes;
    }

    function findSubCorruptedTimes(mainArray, subArray1, subArray2) {

        var arr = new Array();

        for (var i = 0; i < mainArray.e.length; i++) {
            //subArray1
            if ($.grep(subArray1.e, function (e) { return (subArray1.bt + e.t) === (mainArray.bt + mainArray.e[i].t) }).length == 0) {
                arr.push((mainArray.bt + mainArray.e[i].t));
            }
            else {
                //subArray2
                if ($.grep(subArray2.e, function (e) { return (subArray2.bt + e.t) === (mainArray.bt + mainArray.e[i].t) }).length == 0) {
                    arr.push((mainArray.bt + mainArray.e[i].t));
                }
            }
        }

        return arr;
    }

    /*******************************************************
                         Tickers
    *******************************************************/
    //Show last measured temperature
    this.TemperatureTick = function () {

        $.ajax({
            url: kestrelSensappUrl + self.Settings().thermalsensorid() + '_Kestrel_Temperature?limit=1',
            success: function (result) {
                var bt = 0;
                $.each(result, function (key, val) {
                    if (key == "e") {
                        $.each(val, function (index, value) {
                            var date = new Date((((bt + value.t) * 1000)));
                            self.LastTemperature(value.v + "°C");
                            self.LastTemperatureDate("(" + date.toLocaleString("en-GB") + ")");
                        });
                    }
                        //Get the base time of the measurements
                    else if (key == "bt") {
                        bt = val;
                    }
                });
            }
        });

    };

    //Last last measured relative humidity
    this.HumidityTick = function () {

        $.ajax({
            url: kestrelSensappUrl + self.Settings().thermalsensorid() + '_Kestrel_Relative_Humidity?limit=1',
            success: function (result) {
                var bt = 0;
                $.each(result, function (key, val) {
                    if (key == "e") {
                        $.each(val, function (index, value) {
                            var date = new Date((((bt + value.t) * 1000)));
                            self.LastHumidity(value.v + "%");
                            self.LastHumidityDate("(" + date.toLocaleString("en-GB") + ")");
                        });
                    }
                        //Get the base time of the measurements
                    else if (key == "bt") {
                        bt = val;
                    }
                });
            }
        });

    };


    //Last measured Wind Speed
    this.WindSpeedTick = function () {

        //var dateOptions = {weekday: "numeric", year: "numeric", month: "numeric", day: "numeric"};
        $.ajax({
            url: kestrelSensappUrl + self.Settings().thermalsensorid() + '_Kestrel_Wind_Speed?limit=1',
            success: function (result) {
                var bt = 0;
                $.each(result, function (key, val) {
                    if (key == "e") {
                        $.each(val, function (index, value) {
                            var date = new Date((((bt + value.t) * 1000)));
                            self.LastWindSpeed(value.v + "m/s");
                            self.LastWindSpeedDate("(" + date.toLocaleString("en-GB") + ")");
                        });
                    }
                        //Get the base time of the measurements
                    else if (key == "bt") {
                        bt = val;
                    }
                });
            }
        });

    };

    //startupDB();
    self.LoadSensorNoise();

    self.getSettings();

};




