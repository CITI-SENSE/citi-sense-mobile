var pictureSource;   // picture source
var destinationType; // sets the format of returned value

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    $("#spanDebug").text("camera Getting Ready");

    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;

    $("#spanDebug").text("camera ready " + destinationType);
}

// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
    // Uncomment to view the base64-encoded image data
    // console.log(imageData);

    // Get image handle
    //
    var smallImage = document.getElementById('capturedimage');

    // Unhide image elements
    //
    smallImage.style.display = 'block';

    // Show the captured photo
    // The inline CSS rules are used to resize the image
    //
    smallImage.src = "data:image/jpeg;base64," + imageData;

    $("#divCaptured").show();
    $("#btnCapturePhoto").hide();
}

//$("#btnDiscard").click(function () {
//    bootbox.confirm("Are you sure you want to discard your photo?", function(result) {
//        if (result) {
//            $("#divCaptured").hide();
//            $("#btnCapturePhoto").show();

//            $("#capturedimage").src = "";
//        }
//    });
//});

// Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
    // Uncomment to view the image file URI
    // console.log(imageURI);

    // Get image handle
    //
    var largeImage = document.getElementById('capturedimage');

    // Unhide image elements
    //
    largeImage.style.display = 'block';

    // Show the captured photo
    // The inline CSS rules are used to resize the image
    //
    largeImage.src = imageURI;
}

// A button will call this function
//
function capturePhoto() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 50,
        destinationType: destinationType.DATA_URL
    });
    $("#spanDebug").text("capturePhoto");
}

// A button will call this function
//
function capturePhotoEdit() {
    $("#spanDebug").text("capturePhotoEdit first");
    // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
        quality: 20, allowEdit: true,
        destinationType: destinationType.DATA_URL
    });
    $("#spanDebug").text("capturePhotoEdit");
}

// A button will call this function
//
function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.FILE_URI,
        sourceType: source
    });

    $("#spanDebug").text("getPhoto");
}

// Called if something bad happens.
//
function onFail(message) {
    $("#spanDebug").text(message);
    alert('Failed because: ' + message);
}