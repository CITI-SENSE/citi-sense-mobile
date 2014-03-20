
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

    self.ErrorMsg = ko.observable("");
    self.Loading = ko.observable(false);

    self.StartSection = ko.observable(true);
    self.PhotoSection = ko.observable(false);
    self.MapSection = ko.observable(false);
    self.NewSessionSection = ko.observable(false);
    self.ViewSessionsSection = ko.observable(false);
    self.SettingsSection = ko.observable(false);
    self.EvolutionSection = ko.observable(false);
    self.PhysicalSection = ko.observable(false);
    self.ResultSection = ko.observable(false);
    
    self.KestrelId = ko.observable('GT-I9100JZO54K');
    self.UserEmail = ko.observable();
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
        self.ResultSection(false);

        switch (section) {
            case 'back':
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
            case 'settings':
                self.SettingsSection(true);
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
                var fromPhysical = moment.unix(1389190405);
                var toPhysical = moment(fromPhysical).add(60, 'hours');
                self.LoadPhysical(fromPhysical.unix(), toPhysical.unix());
                break;
        }

        return true;
    };


    self.loadMapMarkers = function () {
        var longitudes, latitudes, images;
        $.when(
            //get longitude
            $.get(sensappUrl + 'databases/raw/data/SmartphonePicture/gps_long' + deviceId, null)
                .done(function(resultLong) {
                    console.log(resultLong.sv);
                    longitudes = resultLong;
                }),
            //get latitude
            $.get(sensappUrl + 'databases/raw/data/SmartphonePicture/gps_lat' + deviceId, null)
                .done(function(resultLat) {
                    console.log(resultLat.sv);
                    latitudes = resultLat;
                }),
            //get image
            $.get(sensappUrl + 'databases/raw/data/SmartphonePicture/image' + deviceId, null)
                .done(function(result) {

                    console.log(result.e[0].sv);
                    images = result;

                    
                }).then(function() {

                    for (var i = 0; i < longitudes.e.length; i++) {
                        var contentString = '<b>test</b>';

                        var infowindow = new google.maps.InfoWindow({
                            content: contentString
                        });

                        var myLatlng = new google.maps.LatLng(parseInt(latitudes.e[i].sv), parseInt(longitudes.e[i].sv));

                        var marker = new google.maps.Marker({
                            position: myLatlng,
                            map: map,
                            title: 'Uluru (Ayers Rock)'
                        });
                        google.maps.event.addListener(marker, 'click', function() {
                            infowindow.open(map, marker);
                        });
                    }
                }));
    };

    self.addObservation = function () {
        self.ErrorMsg("addObservation");
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
                destinationType: destinationType.DATA_URL
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
        self.Loading(true);

        var url = sensappUrl + "dispatch";
        var savetime = parseInt(moment().format("X"));


        //check if sensors exist
        $.get(sensappUrl + 'registry/sensors/SmartphonePicture/image' + deviceId, null)
           .done(function (result) {
               self.ErrorMsg("sensor exists");

               //var sensorInfo = ko.mapping.fromJS(result);
               //ko.mapping.fromJS(result, sensorInfo);

               //if (sensorInfo.id == null) { }

               //var basetime = sensorInfo.creation_date();

               self.PostObservation(savetime, url);
           })
           .fail(function (getresult) {
               //get info for composite sensor
               $.get(sensappUrl + 'registry/composite/sensors/SmartphonePicture', null)
                   .done(function (result) {

                       self.ErrorMsg("creating sensors for " + deviceId);

                       var sensors = result.sensors;

                       //var senmlSchemaNumerical = new senmlSchema("raw", "Numerical");
                       var senmlSchemaString = new senmlSchema("raw", "String");
                       var newSensorImage = new senmlSensor("SmartphonePicture/image" + deviceId, "image", senmlSchemaString);
                       var newSensorImageData = ko.mapping.toJSON(newSensorImage);
                       var newSensorLat = new senmlSensor("SmartphonePicture/gps_lat" + deviceId, "latitude", senmlSchemaString);
                       var newSensorLatData = ko.mapping.toJSON(newSensorLat);
                       var newSensorLong = new senmlSensor("SmartphonePicture/gps_long" + deviceId, "longitude", senmlSchemaString);
                       var newSensorLongData = ko.mapping.toJSON(newSensorLong);
                       var newSensorPerception = new senmlSensor("SmartphonePicture/perception" + deviceId, "perception", senmlSchemaString);
                       var newSensorPerceptionData = ko.mapping.toJSON(newSensorPerception);

                       sensors.push("/registry/sensors/SmartphonePicture/image" + deviceId);
                       sensors.push("/registry/sensors/SmartphonePicture/gps_lat" + deviceId);
                       sensors.push("/registry/sensors/SmartphonePicture/gps_long" + deviceId);
                       sensors.push("/registry/sensors/SmartphonePicture/perception" + deviceId);

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
                                                               //post image data
                                                               self.PostObservation(savetime, url);
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

    self.PostObservation = function (time, url) {
        var senmlImageData = new senmlData("m", self.ObservationImage(), time);
        var arraySenmlImageData = new Array(senmlImageData);
        var senmlImage = new senml("SmartphonePicture/image" + deviceId, arraySenmlImageData);
        var data = ko.mapping.toJSON(senmlImage);
        
        var senmlGpsLatData = new senmlData("lat", latitude.toString(), time);
        var arraySenmlGpsLatData = new Array(senmlGpsLatData);
        var senmlGpsLat = new senml("SmartphonePicture/gps_lat" + deviceId, arraySenmlGpsLatData);
        var dataLat = ko.mapping.toJSON(senmlGpsLat);

        var senmlGpsLongData = new senmlData("lon", longitude.toString(), time);
        var arraysenmlGpsLongData = new Array(senmlGpsLongData);
        var senmlGpsLong = new senml("SmartphonePicture/gps_long" + deviceId, arraysenmlGpsLongData);
        var dataLong = ko.mapping.toJSON(senmlGpsLong);

        var senmlPerceptionData = new senmlData("m", self.selectedObservationPerception(), time);
        var arraysenmlPerceptionData = new Array(senmlPerceptionData);
        var senmlPerception = new senml("SmartphonePicture/perception" + deviceId, arraysenmlPerceptionData);
        var dataPerception = ko.mapping.toJSON(senmlPerception);

        $.when(
            $.ajax({
                type: 'PUT',
                dataType: 'JSON',
                url: url,
                data: data,
                contentType: 'application/json; charset=utf-8',
                //async: false,
                success: function(result) {
                    self.ObservationImage("");
                },
                error: function(result) {
                    self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                }
            }),
            $.ajax({
                type: 'PUT',
                dataType: 'JSON',
                url: url,
                data: dataLat,
                contentType: 'application/json; charset=utf-8',
                success: function(result) {
                    self.ErrorMsg(dataLat);
                },
                error: function(result) {
                    self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                }
            }),
            $.ajax({
                type: 'PUT',
                dataType: 'JSON',
                url: url,
                data: dataLong,
                contentType: 'application/json; charset=utf-8',
                success: function(result) {
                },
                error: function(result) {
                    self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                }
            }),
            $.ajax({
                type: 'PUT',
                dataType: 'JSON',
                url: url,
                data: dataPerception,
                contentType: 'application/json; charset=utf-8',
                success: function(result) {
                    self.selectedObservationPerception(null);
                },
                error: function(result) {
                    self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                }
            })
        ).then(function() {
            self.Loading(false);
            self.SelectSection('back');
        });
        
    };

    self.LoadPhysical = function(from, to) {
        var id = '0080114';
        from = '1391505915';
        
        //load calculated values
        var url = 'http://ec2-54-217-157-222.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/PhysicalActivityCalculated/ParticipantID' + id + '?from=' + from + '&to=' + to;
        var sensordata;
        
        $.get(url, null)
            .done(function (result) {
                sensordata = ko.mapping.fromJS(result);
                ko.mapping.fromJS(result, sensordata);
            });

        var i = 0;

        //raw data and calculate too slow?
        //var url = 'http://ec2-54-217-157-222.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/ACC-x-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //console.log(url);
        //var x, y, z, lat, long;
        //var startRequestsTime = moment();
        //$.get(url, null)
        //    .done(function(result) {
        //        x = result;

        //        var url = 'http://ec2-54-217-157-222.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/ACC-y-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //        $.get(url, null)
        //            .done(function(result) {
        //                y = result;

        //                var url = 'http://ec2-54-217-157-222.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/ACC-z-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //                $.get(url, null)
        //                    .done(function(result) {
        //                        z = result;

        //                        var url = 'http://ec2-54-217-157-222.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/GPS-latitude-ParticipantID' + id + '?from=' + from + '&to=' + to;
        //                        $.get(url, null)
        //                            .done(function(result) {
        //                                lat = result;

        //                                var url = 'http://ec2-54-217-157-222.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/GPS-longitude-ParticipantID' + id + '?from=' + from + '&to=' + to;
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
        if (self.KestrelId() == "" || self.KestrelId() == undefined) {
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
        citisense.graph.createLineGraphKestrelWindSpeed(self.KestrelId() + '_Kestrel_Wind_Speed', (Math.round(new Date().getTime() / 1000)));
        citisense.graph.createLineGraphKestrelRelativeHumidity(self.KestrelId() + '_Kestrel_Relative_Humidity', (Math.round(new Date().getTime() / 1000)));
        citisense.graph.createLineGraphKestrelTemperature(self.KestrelId() + '_Kestrel_Temperature', (Math.round(new Date().getTime() / 1000)));

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

        self.KestrelId() == "jaba";

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


    self.CalculateComfortIndex = function() {

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

    function startupDB() {
        db.openDB(DBName, DBVersion, storeName, function (e) { db.getAllRecords(storeName, successGet); });
    }

/*******************************************************
                     Tickers
*******************************************************/
    //Show last measured temperature
    this.TemperatureTick = function () {

        $.ajax({
            url: kestrelSensappUrl + self.KestrelId() + '_Kestrel_Temperature?limit=1',
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
            url: kestrelSensappUrl + self.KestrelId() + '_Kestrel_Relative_Humidity?limit=1',
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
            url: kestrelSensappUrl + self.KestrelId() + '_Kestrel_Wind_Speed?limit=1',
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

    startupDB();
    self.LoadSensorNoise();


};

function SaveObservation() {

}


