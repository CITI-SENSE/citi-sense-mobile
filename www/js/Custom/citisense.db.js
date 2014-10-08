var dbObsStoreName = 'observation';
var dbSetStoreName = 'settings';

var dbschema = {
    stores: [{
        name: dbObsStoreName,
        keyPath: 'id',
        autoIncrement: false,
        indexes: [{
            keyPath: 'sync'
        }]
    },
    {
        name: dbSetStoreName,
        keyPath: 'id',
        autoIncrement: false
    },
    ]
};

var citisensedb = function (createSensors) {

    var self = this;
    var dbName = 'citisensev2';
    var db = new ydn.db.Storage(dbName, dbschema);

    self.ObservationsNotSynced = [];
    self.Observations = [];
    self.Settings; 
    self.DbType;

    console.log(db);

    self.initialize = function () {

        db.executeSql("SELECT * FROM " + dbSetStoreName + " WHERE id= 'citisenseapp'").then(function (results) {
            if (!results[0]) {
                self.insertSettings('citisenseapp', true, true, 'Nexus_5KOT49H', '6031090114', generateUUID(), createSensors);
            }
            else {
                createSensors();
            }

        }, function (e) {
            throw e;
        });

    };

    self.insertObservation = function (datajson, time, syncObservations) {
        var record = { id: time, sync: 0, data: datajson};
        var req = db.put(dbObsStoreName, record);
        req.done(function (key) {
            syncObservations();
            console.log(key);
        });
        req.fail(function (e) {
            alert("Observation storing failed");
            throw e;
        });
    };

    //self.insertObservation = function(imagejson, longjson, latjson, perceptionjson, time, syncObservations) {
    //    var record = { id: time, sync: 0, image: imagejson, longitude:longjson, latitude:latjson, perception:perceptionjson };
    //    var req = db.put(dbObsStoreName, record);
    //    req.done(function (key) {
    //        syncObservations();
    //        console.log(key);
    //    });
    //    req.fail(function (e) {
    //        alert("Observation storing failed");
    //        throw e;
    //    });
    //};

    self.getObservations = function(fromtime, totime, done) {
        db.executeSql('SELECT * FROM ' + dbObsStoreName + ' WHERE id<' + totime + ' AND id>' + fromtime).then(function (results) {
            console.log(results);
            self.Observations = results;
            done();
        }, function (e) {
            throw e;
        });
    };

    self.getObservationsNotSynced = function (done) {
        db.executeSql('SELECT * FROM ' + dbObsStoreName + ' WHERE sync=0').then(function (results) {
            console.log(results);
            self.ObservationsNotSynced = results;
            done();
        }, function(e) {
            throw e;
        });
    };

    self.setSyncedFlag = function (time) {
        db.executeSql('SELECT * FROM ' + dbObsStoreName + ' WHERE id=' + time).then(function (results) {
            var record = results[0];
            
            record.sync = 1;
            var req = db.put(dbObsStoreName, record);
            req.done(function (key) {
                console.log(".db synced " + time + "key: " + key);
            });
            req.fail(function (e) {
                throw e;
            });

        }, function (e) {
            throw e;
        });

        //var record = { id: time, sync: 1, observation: json };
        
    };

    self.insertSettings = function (id, hasaccsensor, hasthermsensor, thermalsensorid, accelerometerid, userid, createSensors) {
        var record = { id: id, hasaccsensor: hasaccsensor, hasthermsensor: hasthermsensor, thermalsensorid: thermalsensorid, accelerometerid: accelerometerid, userid: userid };
        var req = db.put(dbSetStoreName, record);
        req.done(function (key) {
            alert("Settings saved");
            if (createSensors) {
                createSensors();
            }
            console.log(key);
        });
        req.fail(function (e) {
            throw e;
        });
    };

    self.getSettings = function(done) {
        db.executeSql("SELECT * FROM " + dbSetStoreName + " WHERE id= 'citisenseapp'").then(function(results) {
            self.Settings = results[0];
            self.DbType = db.getType();
            done();
        }, function(e) {
            throw e;
        });
    };

    self.initialize();
};

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};