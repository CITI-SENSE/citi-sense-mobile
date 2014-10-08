$("#Version").text("3");

//var sensappUrl = "http://ec2-54-72-154-32.eu-west-1.compute.amazonaws.com/sensapp/";
var sensappUrl = "http://ec2-54-72-155-56.eu-west-1.compute.amazonaws.com/sensapp/";
var kestrelSensappUrl = "http://ec2-54-72-154-32.eu-west-1.compute.amazonaws.com/sensapp/databases/raw/data/";
var dispatchUrl = sensappUrl + 'dispatch';
var tmrtSensAppUrl = "http://ec2-54-72-154-32.eu-west-1.compute.amazonaws.com/sensapp/";
var civicFlowUrl = "http://w.civicflow.com/task/";

var perceptionUrl = "http://ec2-54-72-154-32.eu-west-1.compute.amazonaws.com/sensapp/";
var perceptionDispUrl = perceptionUrl + 'dispatch';

var acousticUrl = "http://ec2-54-72-154-32.eu-west-1.compute.amazonaws.com/sensapp/";
var acousticDispUrl = acousticUrl + 'dispatch';
var acousticCompUrl = acousticUrl + "registry/composite/sensors";


var userID;

var citisense = {};
citisense.db = {};
citisense.physical = {};
citisense.graph = {};
citisense.highchart = {};
citisense.highchart.graphs = {};

var CreateSensors = function () {
    
    cdatabase.getSettings(function () {

        var dbSettings = cdatabase.Settings;
        userID = dbSettings.userid;

        CreatePerceptionSensor(userID);

        if (dbSettings.hasaccsensor) {
            createAcousticSensor(userID);
        }

    });

};

var CreatePerceptionSensor = function(userID) {
    //check if sensors exist
    $.get(perceptionUrl + 'registry/sensors/SmartphonePicture/image' + userID, null)
       .done(function (result) {
           console.log("image found" + userID);
       })
       .fail(function (getresult) {
           //get info for composite sensor
           $.get(perceptionUrl + 'registry/composite/sensors/SmartphonePicture', null)
               .done(function (result) {

                   console.log("picture Composite sensor found for reg of new sensors");

                   var sensors = result.sensors;

                   var senmlSchemaString = new senmlSchema("raw", "String");
                   var newSensorImage = new senmlSensor("SmartphonePicture/image" + userID, "image", senmlSchemaString);
                   var newSensorImageData = ko.mapping.toJSON(newSensorImage);
                   var newSensorLat = new senmlSensor("SmartphonePicture/gps_lat" + userID, "latitude", senmlSchemaString);
                   var newSensorLatData = ko.mapping.toJSON(newSensorLat);
                   var newSensorLong = new senmlSensor("SmartphonePicture/gps_long" + userID, "longitude", senmlSchemaString);
                   var newSensorLongData = ko.mapping.toJSON(newSensorLong);
                   var newSensorPerception = new senmlSensor("SmartphonePicture/perception" + userID, "perception", senmlSchemaString);
                   var newSensorPerceptionData = ko.mapping.toJSON(newSensorPerception);

                   sensors.push("/registry/sensors/SmartphonePicture/image" + userID);
                   sensors.push("/registry/sensors/SmartphonePicture/gps_lat" + userID);
                   sensors.push("/registry/sensors/SmartphonePicture/gps_long" + userID);
                   sensors.push("/registry/sensors/SmartphonePicture/perception" + userID);

                   var newCompositeSensorData = ko.mapping.toJSON(result);

                   //create new sensors
                   $.ajax({
                       type: 'POST',
                       url: perceptionUrl + 'registry/sensors',
                       data: newSensorImageData,
                       contentType: 'application/json; charset=utf-8',
                       success: function (result) {
                           console.log("ImageSensor created");

                           $.ajax({
                               type: 'POST',
                               url: perceptionUrl + 'registry/sensors',
                               data: newSensorLatData,
                               contentType: 'application/json; charset=utf-8',
                               success: function (result) {
                                   console.log("LatSensor created");
                                   $.ajax({
                                       type: 'POST',
                                       url: perceptionUrl + 'registry/sensors',
                                       data: newSensorLongData,
                                       contentType: 'application/json; charset=utf-8',
                                       success: function (result) {
                                           console.log("LongSensor created");
                                           $.ajax({
                                               type: 'POST',
                                               url: perceptionUrl + 'registry/sensors',
                                               data: newSensorPerceptionData,
                                               contentType: 'application/json; charset=utf-8',
                                               success: function (result) {
                                                   console.log("PerceptionSensor created");
                                                   //update composite sensor with new sensors
                                                   $.ajax({
                                                       type: 'PUT',
                                                       url: perceptionUrl + 'registry/composite/sensors/SmartphonePicture',
                                                       data: newCompositeSensorData,
                                                       contentType: 'application/json; charset=utf-8',
                                                       //dataType: 'jsonp',
                                                       success: function (result) {
                                                           console.log("CompositeSensor created");
                                                       },
                                                       error: function (result) {
                                                           console.log("CompositeSensor NOT created" + result);
                                                           self.ErrorMsg(result);
                                                           self.Loading(false);
                                                       }
                                                   });
                                               },
                                               error: function (result) {
                                                   console.log("PerceptionSensor NOT created" + result);
                                                   self.ErrorMsg(result);
                                                   self.Loading(false);
                                               }
                                           });

                                       },
                                       error: function (result) {
                                           console.log("LongSensor NOT created" + result);
                                           self.ErrorMsg(result);
                                           self.Loading(false);
                                       }
                                   });
                               },
                               error: function (result) {
                                   console.log("LatSensor NOT created" + result);
                                   self.ErrorMsg(result);
                                   self.Loading(false);
                               }
                           });
                       },
                       error: function (result) {
                           console.log("ImageSensor NOT created " + result);
                           self.ErrorMsg(result);
                           self.Loading(false);
                       }
                   });
               });
       });
};

var cdatabase = new citisensedb(CreateSensors);

var latitude = "";
var longitude = "";
var map;
var deviceId = 95;

var pictureSource;   // picture source
var destinationType; // sets the format of returned value

//var moment = require('moment');
var timer = $("#sessiontime");

var stopWatch = new Stopwatch(timer, { delay: 1 });

//$(".stopwatch").stopwatch({ delay: 1 });

var beingWatched = {};

function onDeviceReady() {

    var options = { timeout: 40000, maximumAge: 40000 };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

}

//***********************************************************************************************

document.addEventListener("deviceready", onDeviceReady, false);

// onSuccess Geolocation
//
function onSuccess(position) {

    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    $("#spanDebug").text("Lat: " + latitude + "  Lon " + longitude);

    var googleMap = new GoogleMap();
    googleMap.initialize();

}

// onError Callback receives a PositionError object
//
function onError(error) {
    $("#spanDebug").text(error.message);
    alert('No gps position found \n' +
        'message: ' + error.message + '\n');
}

$(function () {
    //fix height
});

//check if smartphonepicture composite sensor is present, if not create it
//
$(function () {

    $.ajax({
        type: 'GET',
        dataType: 'jsonp',
        url: perceptionUrl + 'registry/composite/sensors/SmartphonePicture',
        contentType: 'application/json; charset=utf-8',
        async: true,
        success: function(result) {
            console.log("composite SmartphonePicture exists");
        },
        error: function(result) {
            console.log(result);

            var sensors = new Array();
            var tags = new SenmlTags("CITISENSE", "LGPL");
            var newComposite = new SenmlComposite("SmartphonePicture", "Smartphone pictures", tags, sensors);
            var json = ko.mapping.toJSON(newComposite);

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: perceptionUrl + 'registry/composite/sensors',
                data: json,
                contentType: 'application/json; charset=utf-8',
                async: true,
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

//Add Questionnaire
//
$(function () {
    $('#questionnaire').append($('<object id="questionnaire" data="civicflow_mobile_v0.9/index.html" type="text/html" style="width: 100% !important; height: 100% !important; overflow:hidden;">'));
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




