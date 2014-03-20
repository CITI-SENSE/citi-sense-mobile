window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

var citisensGlobal = function() {
    var self = this, yetToPopulate = false, db = null;

    //singleton impl
    if (arguments.callee._singletonInstance)
        return arguments.callee._singletonInstance;
    arguments.callee._singletonInstance = self;

    function onerror(e, path) {
        //possibilities: User denied permission or version used is less than existing in browser(VER_ERR)
        console.log("IndexDB Error: " + e.target.errorCode + " in call: " + path);
    }

    self.openDB = function(name, ver, storeName, successCallback, failCallback) {
        var req = window.indexedDB.open(name, ver);
        req.onsuccess = function(e) {
            db = e.target.result;
            if (successCallback)
                successCallback({ status: "success", fillRecords: yetToPopulate });
            //else self.readRecords();
        };
        req.onupgradeneeded = function(e) { //event called when version changes
            db = e.target.result;
            if (db.objectStoreNames.contains(storeName))
                db.deleteObjectStore(storeName);
            db.createObjectStore(storeName, { keyPath: "ID", autoIncrement: true });
            yetToPopulate = true;
        };
        req.onerror = function(e) {
            onerror(e, "openDB");
            if (failCallback) failCallback(e);
        };
    };

    self.addRecords = function(storeName, jsonData, successCallback, failCallback) {
        var tran = db.transaction([storeName], "readwrite"); //IDBTransaction.READ_WRITE ->support dropped
        tran.oncomplete = function(e) {
            if (successCallback)
                successCallback({ status: "Transaction success" }); //called last
        };
        tran.onerror = function(event) {
            onerror(e, "addRecords (Transaction failed, rollbacked).");
            if (failCallback) failCallback(e);
        };
        var store = tran.objectStore(storeName);
        jsonData.forEach(function(obj) {
            var req = store.add(obj);
            //req.onsuccess = function(e) { console.log("data added!"); }; //called first	    
            req.onerror = function(e) { console.log("one record add failed: ", e); }; //ignorable for handling
        });
    };

    self.getAllRecords = function(storeName, successCallback, failCallback) {
        var trans = db.transaction([storeName]); //"readonly" -> Default	  
        var records = [];
        trans.oncomplete = function(e) {
            if (successCallback)
                successCallback(records); //called last
        };
        trans.onerror = function(event) {
            onerror(e, "getAllRecords (Transaction failed).");
            if (failCallback) failCallback(e);
        };
        var req = trans.objectStore(storeName).openCursor();
        req.onsuccess = function(e) {
            var cursor = e.target.result;
            if (cursor) {
                //console.log(cursor.key);
                records.push(cursor.value); //cursor.value.name
                cursor.continue(); //iterates success
            }
        };
        req.onerror = function(e) { console.log("one record fetch failed: ", e); }; //ignorable for handling
    };
};

window.citisensGlobal = new citisensGlobal();