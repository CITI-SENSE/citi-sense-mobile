$("#Version").text("3");

//var sensappUrl = "http://ec2-54-228-19-44.eu-west-1.compute.amazonaws.com/sensapp/";
var sensappUrl = "http://ec2-54-217-157-222.eu-west-1.compute.amazonaws.com/sensapp/";
var kestrelSensappUrl = "http://demo.sensapp.org/sensapp/databases/raw/data/";
var tmrtSensAppUrl = "http://ec2-54-228-19-44.eu-west-1.compute.amazonaws.com/sensapp/";

var citisense = {};
citisense.indexedDb = {};
citisense.indexedDb.db = null;
citisense.physical = {};
citisense.graph = {};
citisense.highchart = {};
citisense.highchart.graphs = {};

var viewModel = new AppModel();
ko.applyBindings(viewModel, $("#divApp")[0]);

var latitude = "";
var longitude = "";
var map;
var deviceId = 0;

var pictureSource;   // picture source
var destinationType; // sets the format of returned value

//var moment = require('moment');
var timer = $("#sessiontime");
var stopWatch = new Stopwatch(timer, { delay: 1 });

//$(".stopwatch").stopwatch({ delay: 1 });
$("#spanDebug").text("First...");

function onDeviceReady() {
    //$("#spanDebug").text("Device Getting Ready");

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    //var dbSize = 5 * 1024 * 1024; // 5MB
    //citisense.webdb.db = window.openDatabase("Database", "1.0", "CitiSensDb", dbSize);
    //citisense.webdb.createTables();
    //citisense.webdb.db.transaction(populateDB, errorCB, successCB);
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

    //$("#spanDebug").text("ready "+destinationType);
    //citisense.physical.calculate();

    deviceId = device.uuid;
    deviceId = 95;
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

    var googleMap = new GoogleMap();
    googleMap.initialize();

}

// onError Callback receives a PositionError object
//
function onError(error) {
    $("#spanDebug").text(error.message);
    alert('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

$(function () {
    //fix height
});

$(function () {
    //check if smartphonepicture composite sensor is present, if not create it
    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: sensappUrl + 'registry/composite/sensors/SmartphonePicture',
        contentType: 'application/json; charset=utf-8',
        success: function(result) {
            console.log("composite SmartphonePicture exists");
        },
        error: function(result) {

            var sensors = new Array();
            var tags = new SenmlTags("CITISENSE", "LGPL");
            var newComposite = new SenmlComposite("SmartphonePicture", "Smartphone pictures", tags, sensors);
            var json = ko.mapping.toJSON(newComposite);

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: sensappUrl + 'registry/composite/sensors',
                data: json,
                contentType: 'application/json; charset=utf-8',
                //async: false,
                success: function(result) {
                    console.log("composite SmartphonePicture sensor created");
                },
                error: function(result) {
                    console.log("composite SmartphonePicture sensor failed to create");
                }
            });
        }
    });
});

var SenmlComposite = function (id, descr, tags, sensors) {
    var self = this;
    self.id = id;
    self.descr = descr;
    self.tags = tags;
    self.sensors = sensors;
};

var SenmlTags = function (owner, license) {
    var self = this;
    self.owner = owner;
    self.license = license;
};