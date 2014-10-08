

var createAcousticSensor = function (userID) {

    //check if composite sensors exist
    $.get(acousticUrl + 'registry/composite/sensors/TecnaliaAcoustic' + userID, null)
        .done(function(result) {
            console.log("TecnaliaAcoustic" + userID + " composite sensor exists");
        })
        .fail(function(getresult) {

            var senmlSchemaNumeric = new senmlSchema("raw", "Numerical");
            var newSensorLaq = new senmlSensor("TecnaliaAcoustic" + userID + "/laq", "LAQ value", senmlSchemaNumeric);
            var newSensorLaqData = ko.mapping.toJSON(newSensorLaq);
            var newSensorIndexResult = new senmlSensor("TecnaliaAcoustic" + userID + "/index_result", "Index Result", senmlSchemaNumeric);
            var newSensorIndexResultData = ko.mapping.toJSON(newSensorIndexResult);
            var newSensorEvent = new senmlSensor("TecnaliaAcoustic" + userID + "/event", "Event", senmlSchemaNumeric);
            var newSensorEventData = ko.mapping.toJSON(newSensorEvent);

            var asyncLaqSensor = $.ajax({
//ajax call 1
                type: 'POST',
                url: acousticUrl + 'registry/sensors',
                data: newSensorLaqData,
                contentType: 'application/json; charset=utf-8',
                success: function(result) {
                    console.log("Laq sensor created");
                }
            });

            var asyncIndexResultSensor = $.ajax({
//ajax call 2
                type: 'POST',
                url: acousticUrl + 'registry/sensors',
                data: newSensorIndexResultData,
                contentType: 'application/json; charset=utf-8',
                success: function(result) {
                    console.log("Index_Result Sensor created");
                }
            });


            var asyncIndexEvent = $.ajax({
//ajax call 3
                type: 'POST',
                url: acousticUrl + 'registry/sensors',
                data: newSensorEventData,
                contentType: 'application/json; charset=utf-8',
                success: function(result) {
                    console.log("Event Sensor created");
                }
            });

            $.when(asyncLaqSensor, asyncIndexResultSensor, asyncIndexEvent).done(function(result1, result2, result3) {

                var sensors = new Array();
                sensors.push("/registry/sensors/TecnaliaAcoustic" + userID + "/laq");
                sensors.push("/registry/sensors/TecnaliaAcoustic" + userID + "/index_result");
                sensors.push("/registry/sensors/TecnaliaAcoustic" + userID + "/event");

                var tags = new SenmlTags("CITISENSE", "LGPL");
                var newComposite = new SenmlComposite("TecnaliaAcoustic" + userID, "Acoustic sensor", tags, sensors);
                var json = ko.mapping.toJSON(newComposite);

                $.ajax({
                    type: 'POST',
                    url: acousticUrl + 'registry/composite/sensors',
                    data:json,
                    contentType: 'application/json; charset=utf-8',
                    success: function(result) {
                        console.log("Composite TecnaliaAcoustic" + userID + " created");
                    },
                    error: function(result) {
                        console.log("Composite TecnaliaAcoustic" + userID + "sensor failed to create");
                    }
                });

            });
        });
};

