citisense.physical.mapPhysicalActivity = function (x, y, z, lat, long) {
    var timer = moment();
    var strX = x.e[0].sv;
    var strY = y.e[0].sv;
    var strZ = z.e[0].sv;
    var timeFromFirstToLast = x.e[0].t - x.e[1].t;

    for (var i = 1; i < x.e.length; i++) {
        if (timeFromFirstToLast < 10) {
            strX += "; " + x.e[i].sv;
            strY += "; " + x.e[i].sv;
            strZ += "; " + x.e[i].sv;
            timeFromFirstToLast = x.e[0].t - x.e[i].t;
        }
    }

    var accum = citisense.physical.calculate(strX, strY, strZ, timeFromFirstToLast);
    console.log("end calculations: " + moment(moment().diff(timer)).format("HH:mm:ss"));
    return accum;
};

citisense.physical.calculate = function (strX, strY, strZ, timeFromFirstToLastSeconds) {
    //var strX = '-1.7482452; -1.6377869; -1.9359283; -1.0309753; -3.275116; -1.7719116; -1.9338379; -1.7310028; -1.7238464; -1.3331604; -1.5964203; -1.4807129; -1.2275848; -1.2979584; -1.1880951; -1.2254791; -1.3943939; -1.1085205; -1.4248962; -1.5919952; -1.999176; -2.0478516; -1.8915863; -2.3813934; -2.384964; -2.0219574; -2.062683; -2.1463928; -2.5291595; -2.395218';
    //var strY = '9.0889435; 8.91568; 8.71019; 8.861252; 8.846039; 8.813065; 8.751282; 8.784058; 8.671341; 8.747208; 8.702301; 8.818207; 8.857285; 8.84314; 9.06781; 8.995697; 8.990082; 8.9579315; 8.989471; 8.919785; 8.819275; 9.072815; 9.382706; 9.306839; 9.223572; 9.332733; 9.241058; 9.059128; 9.142548; 9.035675';
    //var strZ = '0.8991699; 0.9891968; 0.9126282; 0.90689087; 1.0189209; 0.9997406; 1.03479; 0.83099365; 0.9193878; 0.89024353; 0.9763794; 0.90083313; 0.95466614; 0.9730377; 0.7853241; 0.74879456; 0.83636475; 0.9058838; 1.0521545; 1.251236; 1.1255646; 1.1884766; 1.2304993; 1.1180878; 1.2790222; 1.3302307; 1.4219971; 1.4354248; 1.4480591; 1.514801';

    var gravity = 9.80665;

    var measurmentsX = $.map(strX.split('; '), function (value) { return +value; });
    var measurmentsY = $.map(strY.split('; '), function (value) { return +value; });
    var measurmentsZ = $.map(strZ.split('; '), function (value) { return +value; });

    var sumOfMeasurmentsX = sumOfMeasurments(measurmentsX);
    var sumOfMeasurmentsY = sumOfMeasurments(measurmentsY);
    var sumOfMeasurmentsZ = sumOfMeasurments(measurmentsZ);
    var formula1ResultX = formula1(sumOfMeasurmentsX, measurmentsX.length);
    var formula1ResultY = formula1(sumOfMeasurmentsY, measurmentsY.length);
    var formula1ResultZ = formula1(sumOfMeasurmentsZ, measurmentsZ.length);

    var formula2ResultsX = formula2(formula1ResultX, measurmentsX);
    var formula2ResultsY = formula2(formula1ResultY, measurmentsY);
    var formula2ResultsZ = formula2(formula1ResultZ, measurmentsZ);

    var formula3Result = formula3(formula1ResultX, formula1ResultY, formula1ResultZ);

    var formula4Results = formula4(formula1ResultX, formula1ResultY, formula1ResultZ, formula2ResultsX, formula2ResultsY, formula2ResultsZ);

    var formula5ResultsX = formula5(formula4Results, formula3Result, formula1ResultX);
    var formula5ResultsY = formula5(formula4Results, formula3Result, formula1ResultY);
    var formula5ResultsZ = formula5(formula4Results, formula3Result, formula1ResultZ);

    var formula6Result = formula6(formula5ResultsX, formula5ResultsY, formula5ResultsZ);

    var formula7AResult = formula7A(formula6Result, timeFromFirstToLastSeconds, gravity);
    var formula7BResult = formula7B(formula2ResultsX, formula2ResultsY, formula2ResultsZ, formula5ResultsX, formula5ResultsY, formula5ResultsZ, timeFromFirstToLastSeconds, gravity);

    return [formula7AResult, formula7BResult];

    function sumOfMeasurments(measurments) {
        var sum = 0;
        for (var i = 0; i < measurments.length; i++) {
            sum += measurments[i];
        }
        return sum;
    }

    function formula1(sumOfMeasurments, numberOfMeasurments) {

        return (1 / numberOfMeasurments) * sumOfMeasurments;
    };

    function formula2(formula1Result, measurments) {
        var formula2Results = [];
        for (var i = 0; i < measurments.length; i++) {
            formula2Results.push(formula1Result - measurments[i]);
        }
        return formula2Results;
    };

    function formula3(formula1XResult, formula1YResult, formula1ZResult) {
        return (formula1XResult * formula1XResult) + (formula1YResult * formula1YResult) + (formula1ZResult * formula1ZResult)
    };

    function formula4(formula1XResult, formula1YResult, formula1ZResult, formula2XResults, formula2YResults, formula2ZResults) {
        var results = [];
        for (var i = 0; i < formula2XResults.length; i++) {
            results.push((formula1XResult * formula2XResults[i]) + (formula1YResult * formula2YResults[i]) + (formula1ZResult * formula2ZResults[i]))
        }
        return results;
    }

    function formula5(formula4Results, formula3Result, formula1Result) {
        var results = [];
        for (var i = 0; i < formula4Results.length; i++) {
            results.push((formula4Results[i] / formula3Result) * formula1Result);
        }
        return results;
    };

    function formula6(formula5ResultsX, formula5ResultsY, formula5resultsZ) {
        var results = [];
        for (var i = 0; i < formula5ResultsX.length; i++) {
            results.push((formula5ResultsX[i] * formula5ResultsX[i]) + (formula5ResultsY[i] * formula5ResultsY[i]) + (formula5resultsZ[i] * formula5resultsZ[i]));
        }
        return results;
    };

    function formula7A(formula6Results, timeFromFirstToLastSeconds, gravity) {
        var sum = 0;
        for (var i = 0; i < formula6Results.length; i++) {
            sum += Math.sqrt(formula6Results[i])
        }
        return (sum / (formula6Results.length / timeFromFirstToLastSeconds) / gravity);
    };

    function formula7B(formula2ResultsX, formula2ResultsY, formula2ResultsZ, formula5ResultsX, formula5ResultsY, formula5ResultsZ, timeFromFirstToLastSeconds, gravity) {
        var sum = 0;
        for (var i = 0; i < formula2ResultsX.length; i++) {
            var x = formula2ResultsX[i] - formula5ResultsX[i];
            var y = formula2ResultsY[i] - formula5ResultsY[i];
            var z = formula2ResultsZ[i] - formula5ResultsZ[i];
            sum += Math.sqrt(((x * x) + (y * y) + (z * z)))
        }
        return (sum / (formula2ResultsX.length / timeFromFirstToLastSeconds) / gravity);
    };

};