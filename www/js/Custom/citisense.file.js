
function onInitFs(fs) {


    //function successCB(directoryEntry) {
    //    // do whatever you want with the directory entry
    //    var t = 0;
    //}

    //window.resolveLocalFileSystemURL(cordova.file.applicationDirectory, successCB, errorHandler);

    fs.root.getFile('CityNoise/start.txt', { create: true, exclusive: false }, function (fileEntry) {

        // Create a FileWriter object for our FileEntry (start.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function (e) {
                console.log('Write completed.');
            };

            fileWriter.onerror = function (e) {
                console.log('Write failed: ' + e.toString());
            };

            // Create a new Blob and write it to start.txt.
            var dbSettings = cdatabase.Settings;
            var blob = new Blob(["TecnaliaAcoustic" + dbSettings.userid + "/laq"], { type: 'text/plain' });

            fileWriter.write(blob);

            console.log(blob);

        }, errorHandler);

    }, errorHandler);
}

var sessionSoundComfort;
function onEndFs(fs) {

    fs.root.getFile('CityNoise/stop.txt', { create: true, exclusive: false }, function (fileEntry) {

        // Create a FileWriter object for our FileEntry (stop.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function (e) {
                console.log('Write completed.');
            };

            fileWriter.onerror = function (e) {
                console.log('Write failed: ' + e.toString());
            };

            // Create a new Blob and write it to stop.txt.
            var blob = new Blob([sessionSoundComfort], { type: 'text/plain' });

            fileWriter.write(blob);

            console.log(blob);

        }, errorHandler);

    }, errorHandler);
}

function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    }

    console.log('Error: ' + msg);
}

var noiseEventTimer;

function watchNoiseEventStart() {
    //TODO: remove test file
    //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) { fs.root.getFile('CityNoise/Event-1.txt', { create: true, exclusive: false }, function (fileEntry) { }); }, errorHandler);

    //create start file
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onInitFs, errorHandler);

    noiseEventTimer = setInterval(function () {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onNoiseEventFile, errorHandler);
    }, 3000);
}

var noiseResultTimer;

function watchNoiseEventStop(userEmail) {

    clearInterval(noiseEventTimer);

    var addcFunc = function (sSC) {
        sessionSoundComfort = sSC;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onEndFs, errorHandler);
    };

    var successFunc= function(result) {
        successSound(result, addcFunc);
    };

    var noAnswer = function (questionnaireId, userEmail) {
        alert("No Acoustic index. Questionnaire not answered.");
        sessionSoundComfort = 0;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onEndFs, errorHandler);
    };

    var errorQuestionnaire = function (questionnaireId, userEmail) {
        console.log("Error requesting " + civicFlowUrl + "responses/" + questionnaireId + "?limit=1&custom=" + userEmail);
        sessionSoundComfort = 0;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onEndFs, errorHandler);
    };

    var errorResponse = function (questionnaireId, responseId) {
        console.log("Error requesting " + civicFlowUrl + "response/" + questionnaireId + "?response_id=" + responseId);
        sessionSoundComfort = 0;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onEndFs, errorHandler);
    };

    //Get answers from questionnaires and create end.txt file
    requestQuestionnareAnswers(SOUNDENV_QUESTIONNAIRE_ID, successFunc, noAnswer, errorQuestionnaire, errorResponse, userEmail);

///test:
    //viewModel.InputAcousticIndex("9");

    //Create event that listens for a result file
    noiseResultTimer = setInterval(function() {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onNoiseResultFile, errorHandler);
    }, 1000);

}

function onNoiseResultFile(fs) {


    fs.root.getFile('CityNoise/RESULTS.dat', { create: false, exclusive: false }, function (fileEntry) {


            function gotFile(file) {
                readAsText(file);
            }

            function fail(error) {
                alert("Failed to read RESULTS.dat " + error.code);
                removeFile(fileEntry);
            }

            function readAsText(file) {
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                    console.log("Read as text");
                    
                    var array = evt.target.result.split(',');
                    for (a in array) {
                        array[a] = ((Math.round(array[a] * 100) / 100));
                        console.log("Read:" + array[a]);

                        switch (a) {
                            case "0":
                                viewModel.LAeq(array[a]);
                                break;
                            case "1":
                                viewModel.InputAcousticIndex(array[a]);
                                break;
                            case "2":
                                viewModel.LAeqMax(array[a]);
                                break;
                            case "3":
                                viewModel.LAeqMin(array[a]);
                                break;
                            default:
                                break;
                        }
                    }
                    
                    removeFile(fileEntry);
                };
                reader.readAsText(file);
            }

            function removeFile(fileEntry) {
                fileEntry.remove(function (entry) {
                    console.log("Removal succeded");

                }, function (error) {
                    console.log("Removal failed: " + error.code);
                }
                );

            }
            
            fileEntry.file(gotFile, fail);

            clearInterval(noiseResultTimer);

        });
}

//var dialogRunning = false;
function onNoiseEventFile(fs) {

    fs.root.getDirectory("CityNoise", { create: true }, function (dirEntry) {

        var files = [];

        function success(entries) {

            for (var i = 0; i < entries.length; i++) {
                if (entries[i].name.indexOf("Event-") > -1) {
                    files.push(entries[i].name);
                    console.log("Read file name " + entries[i].name);
                }
            }

            console.log("Finished reading files");

            //Remove files
            for (x in files) {
                //'Event-<index>.txt'
                fs.root.getFile('CityNoise/' + files[x], { create: false, exclusive: false }, function (fileEntry) {

                    //Test move files

                    fs.root.getDirectory("CityNoise", { create: false }, function(dirEntry) {
                        fileEntry.moveTo(dirEntry, files[x].replace("Event", "Old"), function () { console.log(x + ": file renamed " + files[x].replace("Event", "Old")) }, function () { console.log("file NOT renamed") });
                    }, errorHandler);
    //                function moveFile(entry) {
    //                    fs.root.getDirectory("CityNoise", { create: false }, function(dirEntry) {],
    //function() {
    //}
    //                    });

                    // move the file to a new directory and rename it
                    //window.resolveLocalFileSystemURI(fs.root.nativeURL);
                        
                    //}

                    ////delete file
                    //fileEntry.remove(function (entry) {
                    //    console.log("Removal succeded");

                    //}, function (error) {
                    //    console.log("Removal failed: " + error.code);
                    //}
                    //);
                });
            }


            console.log("Finished moving");
            dialogNoiseInput(files, fs);
        }



        function fail(error) {
            alert("Failed to list directory contents: " + error.code);
        }

        // Get a directory reader
        var directoryReader = dirEntry.createReader();

        // Get a list of all the entries in the directory
        directoryReader.readEntries(success, fail);


    });

}

function dialogNoiseInput(files, fs) {

    //if (!dialogRunning) {

        //dialogRunning = true;

        for (x in files) {
            //Update count events with new events 
            viewModel.LAeqEvTot(parseInt(viewModel.LAeqEvTot()) + 1);

            //'Event-<index>.txt'
            fs.root.getFile('CityNoise/' + files[x], { create: false, exclusive: false }, function (fileEntry) {

                //get index from file name
                var r = /\d+/;
                var index = files[x].match(r);


                //dialog to user
                bootbox.dialog({
                    message: $(".form-content").html(),
                    title: "Noise " + index + "-" + x,
                    buttons: {
                        success: {
                            label: "Save",
                            className: "btn-success",
                            callback: function () {

                                var noisePerception = $("input[name='noisePerceptionSelect']:checked").val();
                                var noiseSource = $("input[name='noiseSourceSelect']:checked").val();

                                fs.root.getFile('CityNoise/RESPONSEVENT-' + index + '-' + noisePerception + '.txt', { create: true, exclusive: false }, function (fileEntry) {

                                    // Create a FileWriter object for our FileEntry
                                    fileEntry.createWriter(function (fileWriter) {

                                        fileWriter.onwriteend = function (e) {
                                            console.log('RESPONSEVENT Write completed.');
                                        };

                                        fileWriter.onerror = function (e) {
                                            console.log('RESPONSEVENT Write failed: ' + e.toString());
                                        };

                                        // Create a new Blob and write it to file.
                                        var blob = new Blob([new Date().getTime() + ',' + noiseSource + ',' + noisePerception], { type: 'text/plain' });

                                        //Update count events with new events 
                                        if (noisePerception === "0")
                                            viewModel.LAeqEvPleasant(parseInt(viewModel.LAeqEvPleasant()) + 1);
                                        else if (noisePerception === "1")
                                            viewModel.LAeqEvUnpleasant(parseInt(viewModel.LAeqEvUnpleasant()) + 1);

                                        fileWriter.write(blob);

                                        console.log(blob);

                                    }, errorHandler);

                                }, errorHandler);

                                ////delete file
                                //fileEntry.remove(function (entry) {
                                //    console.log("Removal succeded");

                                //}, function (error) {
                                //    console.log("Removal failed: " + error.code);
                                //}
                                //);

                            }
                        }
                    }
                });

                //fileEntry.file(function(file) {
                //    var reader = new FileReader();

                //    reader.onloadend = function(e) {
                //        console.log("Text is: " + this.result);
                //    }

                //    reader.readAsText(file);
                //});

            }, errorHandler);
        }
    //}
    //dialogRunning = false;

}


