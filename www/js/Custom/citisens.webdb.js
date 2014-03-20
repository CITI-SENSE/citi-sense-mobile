//// Populate the database 
////
//function populateDB(tx) {
//    //tx.executeSql('DROP TABLE IF EXISTS NoiseLevel');
//    tx.executeSql('CREATE TABLE IF NOT EXISTS Observation (id unique, image, description, experience, latitude, longitude)');
//    //tx.executeSql('INSERT INTO DEMO (id, data) VALUES (1, "First row")');
//    //tx.executeSql('INSERT INTO DEMO (id, data) VALUES (2, "Second row")');
//}

//function saveObservation(tx) {
    
//}

//// Transaction error callback
////
//function errorCB(tx, err) {
//    alert("Error processing SQL: " + err);
//}

//// Transaction success callback
////
//function successCB() {
//    //alert("success!");
//}



citisense.webdb.onError = function(tx, e) {
    alert("there has been an error: " + e.message);
};

citisense.webdb.onInsertSuccess = function (tx, r) {
    if (!r.rowsAffected) {
        // Previous insert failed. Bail.
        console.log('No rows affected!');
        return false;
    }
    console.log(r.insertId);
    citisense.webdb.currentSessionId = r.insertId;
};

citisense.webdb.createTables = function() {
    var db = citisense.webdb.db;
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE observation');
        tx.executeSql('DROP TABLE sessionTimeSerie');
        //tx.executeSql('DROP TABLE sessionTimeSerieValue');
        tx.executeSql('CREATE TABLE IF NOT EXISTS observation (id INTEGER PRIMARY KEY ASC, image TEXT, description TEXT, added_on DATETIME, experience TEXT, latitude TEXT, longitude TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS sessionTimeSerie (id INTEGER PRIMARY KEY ASC, description TEXT, started DATETIME, stopped DATETIME)');
        //tx.executeSql('CREATE TABLE IF NOT EXISTS sessionTimeSerieValue (id INTEGER PRIMARY KEY ASC, sessionId INTEGER, recordedtime DATETIME, latitude TEXT, longitude TEXT)');
    });
};

citisense.webdb.addObservation = function(image, description, experience, latitude, longitude) {
    var db = citisense.webdb.db;
    
    db.transaction(function (tx) {
        var addedOn = new Date();
        tx.executeSql("INSERT INTO observation(image, description, added_on, experience, latitude, longitude) VALUES (?,?,?,?,?,?)",
            [image, description, addedOn, experience, latitude, longitude],
            citisense.webdb.onInsertSuccess,
            citisense.webdb.onError);
    });
};

citisense.webdb.addSessionTimeSerie = function (description, latitude, longitude) {
    var db = citisense.webdb.db;

    db.transaction(function (tx) {
        var addedOn = new Date();
        tx.executeSql("INSERT INTO sessionTimeSerie(description, added_on, latitude, longitude) VALUES (?,?,?,?)",
            [description, addedOn, latitude, longitude],
            citisense.webdb.onSuccess,
            citisense.webdb.onError);
    });
};

citisense.webdb.addSessionTimeSerieValue = function (description, latitude, longitude) {
    var db = citisense.webdb.db;

    db.transaction(function (tx) {
        var addedOn = new Date();
        tx.executeSql("INSERT INTO sessionTimeSerieValue(description, added_on, latitude, longitude) VALUES (?,?,?,?)",
            [description, addedOn, latitude, longitude],
            citisense.webdb.onSuccess,
            citisense.webdb.onError);
    });
};

citisense.webdb.getAllObservations = function(renderFunc) {
    var db = citisense.webdb.db;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM observation", [], renderFunc,
            citisense.webdb.onError);
    });
};

citisense.webdb.getAllSessions = function (renderFunc) {
    var db = citisense.webdb.db;
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM sessionTimeSerie", [], renderFunc,
            citisense.webdb.onError);
    });
};