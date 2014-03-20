$("#Version").text("3");

var viewModel = new AppModel();
var citisense = {};
citisense.webdb = {};

ko.applyBindings(viewModel, $("#divApp")[0]);

citisense.webdb.db = null;

citisense.location = {};
latitude = "";
var longitude = "";

var timer = $("#sessiontime");
var stopWatch = new Stopwatch(timer, { delay: 1 });

//$(".stopwatch").stopwatch({ delay: 1 });
$("#spanDebug").text("First...");

function onDeviceReady() {
    //$("#spanDebug").text("Device Getting Ready");

    var map = new GoogleMap();
    map.initialize();

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    var dbSize = 5 * 1024 * 1024; // 5MB
    citisense.webdb.db = window.openDatabase("Database", "1.0", "CitiSensNoise", dbSize);
    citisense.webdb.createTable();
    //citisense.webdb.db.transaction(populateDB, errorCB, successCB);

    //$("#spanDebug").text("ready "+destinationType);
}

document.addEventListener("deviceready", onDeviceReady, false);


// onSuccess Geolocation
//
function onSuccess(position) {
    //var element = document.getElementById('geolocation');
    //element.innerHTML = 'Latitude: ' + position.coords.latitude + '<br />' +
    //                    'Longitude: ' + position.coords.longitude + '<br />' +
    //                    'Altitude: ' + position.coords.altitude + '<br />' +
    //                    'Accuracy: ' + position.coords.accuracy + '<br />' +
    //                    'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
    //                    'Heading: ' + position.coords.heading + '<br />' +
    //                    'Speed: ' + position.coords.speed + '<br />' +
    //                    'Timestamp: ' + position.timestamp + '<br />';

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    //Google maps API initialisation
    var mapelement = document.getElementById("map");

    //Define the properties of the OSM map to be displayed
    var map = new google.maps.Map(mapelement, {
        center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
        zoom: 3,
        mapTypeId: "OSM",
        mapTypeControl: false,
        streetViewControl: false
    });

    //Define OSM map type pointing at the OpenStreetMap tile server
    map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));
}

// onError Callback receives a PositionError object
//
function onError(error) {
    $("#spanDebug").text(error.message);
    alert('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

