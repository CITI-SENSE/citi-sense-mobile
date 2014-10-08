var AREA_QUESTIONNAIRE_ID = "61";
var PERSONAL_QUESTIONNAIRE_ID = "69";
var CLOTHING_QUESTIONNAIRE_ID = "63";
var SOUNDENV_QUESTIONNAIRE_ID = "62";

var AREA_RESPONSE_ID = "699";
var SITE_RESPONSE_ID = "700";
var CLOUDINESS_RESPONSE_ID = "1069";
var RADIATION_RESPONSE_ID = "701";

var AGE_RESPONSE_ID = "1020"; 
var GENDER_RESPONSE_ID = "1021"; 
var HEIGHT_RESPONSE_ID = "1022"; 
var WEIGHT_RESPONSE_ID = "1023";

var CL1_RESPONSE_ID = "928";
var CL2_RESPONSE_ID = "929";
var CL3_RESPONSE_ID = "930";
var CL4_RESPONSE_ID = "931";
var CL5_RESPONSE_ID = "932";

var SOUNDSOURCE1_RESPONSE_ID = "1071";
var SOUNDSOURCE2_RESPONSE_ID = "1073";
var COMFSOUND1_RESPONSE_ID = "1072";
var COMFSOUND2_RESPONSE_ID = "1074";
var TOTSOUNDCOMF_RESPONSE_ID = "1076";

var AREA_RESPONSE_IDs = [AREA_RESPONSE_ID, SITE_RESPONSE_ID, CLOUDINESS_RESPONSE_ID, RADIATION_RESPONSE_ID];
var PERSONAL_RESPONSE_IDs = [AGE_RESPONSE_ID, GENDER_RESPONSE_ID, HEIGHT_RESPONSE_ID, WEIGHT_RESPONSE_ID];
var CLOTHING__RESPONSE_IDs = [CL1_RESPONSE_ID, CL2_RESPONSE_ID, CL3_RESPONSE_ID, CL4_RESPONSE_ID, CL5_RESPONSE_ID];
var COMFSOUND__RESPONSE_IDs = [COMFSOUND1_RESPONSE_ID, COMFSOUND2_RESPONSE_ID, SOUNDSOURCE1_RESPONSE_ID, SOUNDSOURCE2_RESPONSE_ID, TOTSOUNDCOMF_RESPONSE_ID];

var sessionSoundComfort = 0;

function requestQuestionnareAnswers(questionnaireId, success, noAnswers, errorQuestionnaire, errorResponse, userEmail) {
    //Find responseId for user
    $.ajax({
        url: civicFlowUrl + "responses/" + questionnaireId + "?limit=1&custom=" + userEmail,
        dataType: 'JSON',
        success: function (result) {
            $.each(result, function (key, val) {
                if (key == "responses") {
                    if (val.length < 1) {
                        noAnswers(questionnaireId, userEmail);
                        //self.LoadingSync(false);
                        //$("#thermalIndexes").text("No answers Questionnare " + questionnaireId + " " + self.UserEmail());
                    }
                    $.each(val, function (index, value) {
                        var responseId = value.response_id;
                        //Get user responses on spesific questionnaire
                        $.ajax({
                            url: civicFlowUrl + "response/" + questionnaireId + "?response_id=" + responseId,
                            dataType: 'JSON',
                            success: function (result) {
                                success(result);
                            },
                            error: function (result) {
                                errorResponse(questionnaireId, responseId);
                                //self.LoadingSync(false);
                                //$("#thermalIndexes").text("Error requesting " + civicFlowUrl + "response/" + questionnaireId + "?response_id=" + responseId);
                            }
                        });

                    });
                }
            });
        },
        error: function (result) {
            errorQuestionnaire(questionnaireId, userEmail);
            //self.LoadingSync(false);
            //$("#thermalIndexes").text("Error requesting " + civicFlowUrl + "responses/" + questionnaireId + "?limit=1&custom=" + self.UserEmail());
        }
    });
}

//Sound information
function successSound(result, addFunc) {

    var answer_value;
    var answer_value_custom;
    var comfsound1_index = 0;
    var comfsound2_index = 0;

    $.each(result, function (key, val) {

        if (key == "questions") {
             
            $.each(val, function (index, value) {

                if (COMFSOUND__RESPONSE_IDs.indexOf(value.id) > -1) {

                    if ($.isArray(value.answer)) {
                        $.each(value.answer, function (pos, answer) {
                            answer_value = answer.value;
                            answer_value_custom = answer["value-custom"];
                        });
                    } else {
                        answer_value = value.answer.value;
                    }

                    switch (value.id) {
                        case COMFSOUND1_RESPONSE_ID:
                            comfsound1_index = parseInt(answer_value_custom);
                            if (comfsound1_index > 3) {
                                viewModel.DomSound1Perception("Pleasant");
                            }
                            else if (comfsound1_index < 3) {
                                viewModel.DomSound1Perception("Unpleasant");
                            } else {
                                viewModel.DomSound1Perception("Neautral");
                            }
                            break;
                        case COMFSOUND2_RESPONSE_ID:
                            comfsound2_index = parseInt(answer_value_custom);
                            if (comfsound2_index > 3) {
                                viewModel.DomSound2Perception("Pleasant");
                            }
                            else if (comfsound2_index < 3) {
                                viewModel.DomSound2Perception("Unpleasant");
                            } else {
                                viewModel.DomSound2Perception("Neautral");
                            }
                            break;
                        case SOUNDSOURCE1_RESPONSE_ID:
                            viewModel.DomSound1Source(answer_value);
                            break;
                        case SOUNDSOURCE2_RESPONSE_ID:
                            viewModel.DomSound2Source(answer_value);
                            break;
                        case TOTSOUNDCOMF_RESPONSE_ID:
                            var totcomf = parseInt(answer_value_custom);
                            if (totcomf > 3) {
                                viewModel.TotSoundPerception("Pleasant");
                            }
                            else if (totcomf < 3) {
                                viewModel.TotSoundPerception("Unpleasant");
                            } else {
                                viewModel.TotSoundPerception("Neautral");
                            }
                            break;
                            
                        default:
                            break;
                    }
                }
            });
        }
    });

    var sSI = (comfsound1_index + 1) + comfsound2_index;

    if (sSI < 6) {
        sessionSoundComfort = -1;
    }
    else if (sSI > 8) {
        sessionSoundComfort = 1;
    } 
    else {
        sessionSoundComfort = 0;
    }

    addFunc(sessionSoundComfort);


};