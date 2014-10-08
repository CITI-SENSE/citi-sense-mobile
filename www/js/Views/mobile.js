
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

var senmlGroup = function (senmlDataGroup) {
    var self = this;
    this.e = senmlDataGroup;
};

var senmlDataGroup = function (name, unit, stringvalue, time) {
    var self = this;
    self.n = name;
    self.u = unit;
    self.sv = stringvalue;
    self.t = time;
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

var ObservationType = function (value, name) {
    this.value = value;
    this.name = name;
};

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
    self.QuestionnaireSection = ko.observable(false);
    self.AcousticSection = ko.observable(false);
    self.ThermalSection = ko.observable(false);

    self.KestrelId = ko.observable('Nexus_5KOT49H');
    self.UserEmail = ko.observable('email');
    self.LastTemperature = ko.observable();
    self.LastHumidity = ko.observable();
    self.LastWindSpeed = ko.observable();
    self.LastWindSpeedDate = ko.observable();
    self.LastTemperatureDate = ko.observable();
    self.LastHumidityDate = ko.observable();
    self.LastAcoustic = ko.observable();
    self.LastAcousticDate = ko.observable();
    self.AccumV = ko.observable();
    self.AccumH = ko.observable();
    self.AreaId = ko.observable("0");
    self.SiteId = ko.observable("0");
    self.CloudId = ko.observable("0");
    self.Gender = ko.observable("1"); //Mail
    self.Height = ko.observable("175");
    self.Age = ko.observable("35");
    self.Clothing = ko.observable("0.9");
    self.Weight = ko.observable("75");
    self.RadiationId = ko.observable("0");
    self.ComfortIndex = ko.observable();
    self.InputAcousticIndex = ko.observable();
    self.LAeq = ko.observable("0");
    self.LAeqMax = ko.observable("0");
    self.LAeqMin = ko.observable("0");
    self.LAeqEvTot = ko.observable("0");
    self.LAeqEvUnpleasant = ko.observable("0");
    self.LAeqEvPleasant = ko.observable("0");
    self.DomSound1Source = ko.observable("");
    self.DomSound2Source = ko.observable("");
    self.DomSound1Perception = ko.observable("");
    self.DomSound2Perception = ko.observable("");
    self.TotSoundPerception = ko.observable("");

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
        self.QuestionnaireSection(false);

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
                self.getSettings();
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
                self.addPerceptionMarkersMap();
                break;
            case 'photo':
                self.PhotoSection(true);
                self.findObservationsNotSynced();
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
                self.ThermalSection(true);
                self.AcousticSection(false);
                break;
            case 'physical':
                self.PhysicalSection(true);
                self.PhysicalSectionActive(true);
                self.getSettings();
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
            case 'questionnaire':
                self.QuestionnaireSection(true);
                break;
            case 'acoustic':
                self.ResultSection(true);
                self.AcousticSection(true);
                self.ThermalSection(false);
                break;
            case 'thermal':
                self.ResultSection(true);
                self.AcousticSection(false);
                self.ThermalSection(true);
                break;
        }

        return true;
    };

    self.addPerceptionMarkersMap = function () {
        
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }

        //GeoLocation found
        function success(position) {

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            var googleMap = new GoogleMap();
            googleMap.initialize();
            google.maps.event.trigger(map, 'resize');

            self.loadMapMarkers();
            self.LoadingSync(false);

        };

        function error() {
            self.LoadingSync(false);
            alert("Unable to retrieve your location");
        };

        self.LoadingSync(true);
        //var options = { timeout: 17000, enableHighAccuracy: true, maximumAge: 90000 };
        var options = { timeout: 40000, maximumAge: 40000 };
        navigator.geolocation.getCurrentPosition(success, error, options);

    }

    self.loadMapMarkers = function () {

        var longitudes, latitudes, perceptions;
        console.log("load Markers");

        $.when(
            //get longitude
            $.get(perceptionUrl + 'databases/raw/data/SmartphonePicture/gps_long' + userID, null)
                .done(function (resultLong) {
                    console.log(perceptionUrl + 'databases/raw/data/SmartphonePicture/gps_long' + userID);
                    console.log("longitude " + resultLong.e[0].sv);
                    longitudes = resultLong;
                }),
            //get latitude
            $.get(perceptionUrl + 'databases/raw/data/SmartphonePicture/gps_lat' + userID, null)
                .done(function (resultLat) {
                    console.log(perceptionUrl + 'databases/raw/data/SmartphonePicture/gps_lat' + userID);
                    console.log("latitude " + resultLat.e[0].sv);
                    latitudes = resultLat;
                }),
            //get perception
            $.get(perceptionUrl + 'databases/raw/data/SmartphonePicture/perception' + userID, null)
                .done(function (result) {
                    console.log(perceptionUrl + 'databases/raw/data/SmartphonePicture/perception' + userID);
                    console.log("perception " + result.e[0].sv);
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
                    addObservationMarker(map, title, latlng, pinColor, userID, (longitudes.bt + longitudes.e[i].t));

                }

                refreshGoogleMap();
            });
    };

    self.findObservationsNotSynced = function () {

        self.ObservationsNotSynced.removeAll();

        cdatabase.getObservationsNotSynced(function () {
            var observations = cdatabase.ObservationsNotSynced;
            for (var j in observations)
                self.ObservationsNotSynced.push(observations[j].id);
        });
    };

    
    self.addObservation = function () {
        navigator.camera.getPicture(function (imageData) {
            //Success
                self.ObservationImage("data:image/jpeg;base64," + imageData);
            },
            //Failed
            function () {
                self.ErrorMsg("camera failed");
            },
            {
                quality: 50,
                destinationType: destinationType.DATA_URL,
                allowEdit: true,
                targetWidth: 800,
                targetHeight: 800,
                encodingType: Camera.EncodingType.JPEG,
                correctOrientation: true
            }
        );
    };

    self.discardObservation = function () {
        bootbox.confirm("Are you sure you want to discard your photo?", function (result) {
            if (result) {
                self.ObservationImage("");
            }
        });
    };

    self.rotateObservation = function () {
        $('#capturedimage').rotate(90);
    };

    self.saveObservation = function () {
        self.PhotoSection(false);
        var savetime = parseInt(moment().format("X"));
        self.SaveObservationToDb(savetime);
    };

    self.SaveObservationToDb = function (time) {

        if (!navigator.geolocation) {
            alert("Picture will not be stored. Geolocation not supported");
            return;
        }
        //GeoLocation found
        function success(position) {

            try {

                var senmlImageData = new senmlDataGroup("SmartphonePicture/image" + userID, "m", self.ObservationImage(), time);
                var senmlGpsLatData = new senmlDataGroup("SmartphonePicture/gps_lat" + userID, "lat", position.coords.latitude.toString(), time);
                var senmlGpsLongData = new senmlDataGroup("SmartphonePicture/gps_long" + userID, "lon", position.coords.longitude.toString(), time);
                var senmlPerceptionData = new senmlDataGroup("SmartphonePicture/perception" + userID, "m", self.selectedObservationPerception(), time);

                var arraySenmlDataGroup = new Array(senmlImageData, senmlGpsLatData, senmlGpsLongData, senmlPerceptionData);
                var senmlData = new senmlGroup(arraySenmlDataGroup);
                var data = ko.mapping.toJSON(senmlData);

                //self.ObservationsNotSynced.push(time);

                cdatabase.insertObservation(data, time, self.SyncObservations);

                self.ObservationImage("");
            }
            catch (e) {alert("Saving observation To Db failed " + callbackId + " = " + e);
            }

        };

        function error() {
            alert ("Unable to retrieve your location");
        };

        //var options = { timeout: 5000, enableHighAccuracy: true, maximumAge: 90000 };
        var options = { timeout: 40000, maximumAge: 40000 };
        navigator.geolocation.getCurrentPosition(success, error, options);

    };



    self.SyncObservations = function () {

        //self.ErrorMsg("syncing");
        self.ObservationsNotSynced.removeAll();
        self.LoadingSync(true);

        cdatabase.getObservationsNotSynced(function () {

            var observations = cdatabase.ObservationsNotSynced;
            var url = perceptionDispUrl;

            //Create array of time for marking db with sync=0/1
            //Update Number of observations not synced 
            var time = [];
            for (var j in observations){
                time.push([observations[j].id]);
                self.ObservationsNotSynced.push(observations[j].id);
            }

            //Upload perception to Sensapp
            for (var i = 0; i < observations.length; i++) {
                uploadPerception(i, time, observations[i].data, url);
            }

        });

        if (self.WP2SectionButton())
            self.SelectSection('wp2');
        else
            self.SelectSection('wp3');

    }; //End


    function uploadPerception(i, time, data, url) {

        $.ajax({
            type: 'PUT',
            dataType: 'JSON',
            url: url,
            data: data,
            cache: false,
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
                console.log("ajax success: sync == 1 on " + time[i]);
                console.log("url " + url);
                console.log("data " + data);
                cdatabase.setSyncedFlag(time[i]);
                self.ObservationsNotSynced.remove(time[i]);
                //self.ErrorMsg(self.ErrorMsg() + "-" + "Data in round " + i + " - " + time[i] + " :: ");
            },
            error: function (result) {
                self.ErrorMsg(result.status + ' :: ' + result.statusText + ' :: ' + JSON.parse(result.responseText).ExceptionMessage);
                self.LoadingSync(false);
            },
            complete: function (result) {
                //Remove progress bar when last request done
                if((i + 1) == time.length)
                    self.LoadingSync(false);
            }
        });

    }

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
        //physical activity
        var url = sensappUrl + "databases/raw/data/PhysicalActivityCalculated/ParticipantID" + self.Settings().accelerometerid() + "?from=" + from + "&to=" + to;
        console.log(url);
        $(function () {
            $("#container_map").physicalactivity({
                url: url,
                type: "map"
            });
        });

        var map = map;
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

        //Start Thermal sensor graphs and tickers
        if (self.Settings().hasthermsensor()) {

            //start graphs
            citisense.graph.createLineGraphKestrelWindSpeed(self.Settings().thermalsensorid() + '_Kestrel_Wind_Speed', (Math.round(new Date().getTime() / 1000)));
            citisense.graph.createLineGraphKestrelRelativeHumidity(self.Settings().thermalsensorid() + '_Kestrel_Relative_Humidity', (Math.round(new Date().getTime() / 1000)));
            citisense.graph.createLineGraphKestrelTemperature(self.Settings().thermalsensorid() + '_Kestrel_Temperature', (Math.round(new Date().getTime() / 1000)));

            //Start tickers
            citisense.graph.startKestrelTickers(self.TemperatureTick, self.HumidityTick, self.WindSpeedTick);
        }

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

        //Start noise event listener, acoustic sensor graphs and ticker
        if (self.Settings().hasaccsensor()) {
            //Clear acoustic prevois results
            clearAcouisticResults();
            watchNoiseEventStart();
            citisense.graph.createLineGraphAtekniaAcoustic("TecnaliaAcoustic" + self.Settings().userid(), (Math.round(new Date().getTime() / 1000)));
            //Start ticker
            citisense.graph.startAccousticTicker(self.AccousticTick);
        }

        //hide result button during session
        self.ResultSection(false);
    };

    self.stopSession = function () {

        //Testing!
        self.InputAcousticIndex("5.6");

        self.SessionRunning(false);

        stopWatch.stop();

        //Stop updating the graphs
        if (self.Settings().hasthermsensor()) {
            citisense.graph.stoplgkWS();
            citisense.graph.stoplgkRH();
            citisense.graph.stoplgkT();

            citisense.graph.stopKestrelTickers();
        }

        if (self.Settings().hasaccsensor()) {
            citisense.graph.stoplgAA();

            citisense.graph.stopAcousticTickers();

            watchNoiseEventStop(self.UserEmail().trim());
        }


        self.newSession().timeended(new moment().format());
        self.tempSessions.push(self.newSession);

        stopWatch.resetclock();

        
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

        });
    };

    self.saveSettings = function () {
        cdatabase.insertSettings(self.Settings().id(), self.Settings().hasaccsensor(), self.Settings().hasthermsensor(), self.Settings().thermalsensorid(), self.Settings().accelerometerid(), self.Settings().userid(), null);
    };

    self.newUser = function () {
        self.Settings().userid(generateUUID());
        cdatabase.insertSettings(self.Settings().id(), self.Settings().hasaccsensor(), self.Settings().hasthermsensor(), self.Settings().thermalsensorid(), self.Settings().accelerometerid(), self.Settings().userid(), CreateSensors);
    };

    self.CalculateComfortIndex = function() {

        //Numeric input
        if ($.isNumeric(self.AreaId()) && $.isNumeric(self.SiteId()) && $.isNumeric(self.CloudId()) && $.isNumeric(self.RadiationId())) {

            //Create comfort index graph
            citisense.graph.createComfortIndexGraph(self.AreaId(),
                self.SiteId(),
                self.CloudId(),
                self.RadiationId(),
                new moment(self.newSession().timeended()).hours(),
                new moment(self.newSession().timeended()).minutes(),
                self.Age(),
                self.Weight(),
                self.Height(),
                self.CloudId()
                );
        }
        else {
            alert("Input must be numeric");
        }
    };

    self.getQuestionnaireAnswers = function () {

        if (!validateEmail(self.UserEmail())) {
            alert('Invalid Email Address');
            return;
        }

        var noAnswer = function (questionnaireId, userEmail) {
            self.LoadingSync(false);
            $("#thermalIndexes").text("No answers Questionnare " + questionnaireId + " " + userEmail);
        };

        var errorQuestionnaire = function (questionnaireId, userEmail) {
            self.LoadingSync(false);
            $("#thermalIndexes").text("Error requesting " + civicFlowUrl + "responses/" + questionnaireId + "?limit=1&custom=" + userEmail);
        };

        var errorResponse = function (questionnaireId, responseId) {
            self.LoadingSync(false);
            $("#thermalIndexes").text("Error requesting " + civicFlowUrl + "response/" + questionnaireId + "?response_id=" + responseId);
        };



        requestQuestionnareAnswers(AREA_QUESTIONNAIRE_ID, successArea, noAnswer, errorQuestionnaire, errorResponse, self.UserEmail());
        requestQuestionnareAnswers(PERSONAL_QUESTIONNAIRE_ID, successPersonal, noAnswer, errorQuestionnaire, errorResponse, self.UserEmail());
        requestQuestionnareAnswers(CLOTHING_QUESTIONNAIRE_ID, successClothing, noAnswer, errorQuestionnaire, errorResponse, self.UserEmail());

    };



    self.SendIntent = function() {

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onInitFs, errorHandler);

        //CDV.WEBINTENT.sendBroadcast({
        //    action: 'hvr.hellociti.action.send',
        //    extras: {
        //        'extra': 'test'
        //    }
        //}, function () {
        //    alert('success');
        //}, function () {
        //    alert('fail');
        //});
    };

    self.sendResultsEmail = function () {
        //self.Settings().UserEmail();
        //var kestrel = kestrelWSSensor;

        window.plugin.email.isServiceAvailable(
            function (isAvailable) {
                if (!isAvailable) { alert('Service is not available'); }

                else {
                    window.plugin.email.open({
                        to: ['mff@nilu.no'],
                        cc: ['mff@nilu.no'],
                        subject: 'CITI-SENSE urls to graphs',
                        body: 'Click the below links to display graphs of your collected measurements'
                    });
                }
            }
        );

    };

    self.InputAcousticIndex.subscribe(function (newValue) {
        //Create Graph
        citisense.graph.createAcousticIndexGraph(newValue);
    });


    function clearAcouisticResults() {
        //self.InputAcousticIndex = ko.observable();
        self.LAeq("0");
        self.LAeqMax("0");
        self.LAeqMin("0");
        self.LAeqEvTot("0");
        self.LAeqEvUnpleasant("0");
        self.LAeqEvPleasant("0");
        self.DomSound1Source("");
        self.DomSound2Source("");
        self.DomSound1Perception("");
        self.DomSound2Perception("");
        self.TotSoundPerception("");
    };

//Area information
    function successArea(result) {

        self.LoadingSync(true);
        var answer_value;
        var answer_value_custom;

        $.each(result, function (key, val) {

            if (key == "questions") {

                $.each(val, function (index, value) {

                    if (AREA_RESPONSE_IDs.indexOf(value.id) > -1) {

                        if ($.isArray(value.answer)) {
                            $.each(value.answer, function (pos, answer) {
                                answer_value = answer.value;
                                answer_value_custom = answer["value-custom"];
                            });
                        } else {
                            answer_value = value.answer.value;
                        }

                        switch (value.id) {
                            case AREA_RESPONSE_ID:
                                self.AreaId(answer_value_custom === "" ? "0" : answer_value_custom);
                                break;
                            case SITE_RESPONSE_ID:
                                self.SiteId(answer_value);
                                break;
                            case CLOUDINESS_RESPONSE_ID:
                                var procentCloudines = Number(answer_value) / 10;
                                self.CloudId(procentCloudines > 8 ? 8 : Math.round(procentCloudines));
                                break;
                            case RADIATION_RESPONSE_ID:
                                self.RadiationId(answer_value_custom == '1' ? 1 : 0);
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
        });
        self.LoadingSync(false);
    };

    //Questioannaire 69 = Personal Information
    function successPersonal(result) {

        self.LoadingSync(true);
        var answer_value;
        var answer_value_custom;

        $.each(result, function (key, val) {

            if (key == "questions") {

                $.each(val, function (index, value) {

                    if (PERSONAL_RESPONSE_IDs.indexOf(value.id) > -1) {

                        if ($.isArray(value.answer)) {
                            $.each(value.answer, function (pos, answer) {
                                answer_value = answer.value;
                                answer_value_custom = answer["value-custom"];
                            });
                        } else {
                            answer_value = value.answer.value;
                        }

                        switch (value.id) {
                            case AGE_RESPONSE_ID:
                                self.Age(answer_value);
                                break;
                            case GENDER_RESPONSE_ID:
                                self.Gender(answer_value_custom);
                                break;
                            case HEIGHT_RESPONSE_ID:
                                var height = Number(answer_value) / 100;
                                self.Height(height.toFixed(2));
                                break;
                            case WEIGHT_RESPONSE_ID:
                                self.Weight(answer_value);
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
        });
        self.LoadingSync(false);
    };

    //Questionnaire 63 = Clothing Information
    function successClothing(result) {

        self.LoadingSync(true);
        var answer_value;
        var answer_value_custom;

        var cl1, cl2, cl3, cl4, cl5;

        $.each(result, function (key, val) {

            if (key == "questions") {

                $.each(val, function (index, value) {

                    if (CLOTHING__RESPONSE_IDs.indexOf(value.id) > -1) {

                        if ($.isArray(value.answer)) {
                            $.each(value.answer, function (pos, answer) {
                                answer_value = answer.value;
                                answer_value_custom = answer["value-custom"];
                            });
                        } else {
                            answer_value = value.answer.value;
                        }

                        switch (value.id) {
                            case CL1_RESPONSE_ID:
                                cl1 = parseFloat(answer_value_custom.replace(',', '.'));
                                break;
                            case CL2_RESPONSE_ID:
                                cl2 = parseFloat(answer_value_custom.replace(',', '.'));
                                break;
                            case CL3_RESPONSE_ID:
                                cl3 = parseFloat(answer_value_custom.replace(',', '.'));
                                break;
                            case CL4_RESPONSE_ID:
                                cl4 = parseFloat(answer_value_custom.replace(',', '.'));
                                break;
                            case CL5_RESPONSE_ID:
                                cl5 = parseFloat(answer_value_custom.replace(',', '.'));
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
        });

        var clothing = (0.03 + (cl1 + cl2 + cl3 + cl4 + cl5));
        if (clothing < 0.25) clothing = 0.25;
        else if (clothing > 1.25) clothing = 1.25;

        self.Clothing(clothing);

        self.LoadingSync(false);
    };
    /*******************************************************
                     Helper functions
    *******************************************************/

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

    function validateEmail(email) {

        //check if email is set
        if (email == "" || email == undefined) {
            return false;
        }

        var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
        if (reg.test(email)) {
            return true;
        }
        else {
            return false;
        }
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

    //Show last measured temperature
    this.AccousticTick = function () {

        $.ajax({
            url: acousticUrl + "databases/raw/data/" + "TecnaliaAcoustic" + self.Settings().userid() + '/laq?limit=1',
            success: function (result) {
                var bt = 0;
                $.each(result, function (key, val) {
                    if (key == "e") {
                        $.each(val, function (index, value) {
                            var date = new Date((((bt + value.t) * 1000)));
                            self.LastAcoustic((Math.round(value.v * 100) / 100) + "");
                            self.LastAcousticDate("(" + date.toLocaleString("en-GB") + ")");
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

    //self.getSettings();


};




