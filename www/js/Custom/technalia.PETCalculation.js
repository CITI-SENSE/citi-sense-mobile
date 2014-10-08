
/*
    CREATED BY NORWEGIAN INSTITUTE OF AIR RESEARCH
            31. January 2014
        PET calculation converted from PET_CITISENSE.f90 
*/

var vpa;
var eta = 0;

//Real subroutine inbody
var cair;
var ere;
var erel;

var h;
var rtv;

//real subroutine calcul
var acl;
var adu;
var aeff;
var c = new Array() //(0:10);
var cbare;
var cclo;
var csum;
var di;
var ed;
var enbal;
var enbal2;
var esw;
var eswdif;
var eswphy;
var eswpot;
var facl;
var fec;
var feff;
var hc;


//real
var he;
var htcl;
var r1;
var r2;
var rbare;
var rcl;
var rclo;
var rclo2;
var rdcl;
var rdsk;
var rsum;
var sw;
var swf;
var swm;
var tbody;
var tcl;
var tcore = new Array();//(1:7),
var tmrt;
var tsk;
var v;
var vb;
var vb1;
var vb2;
var vpts;
var wetsk;
var wd;
var wr;
var ws;
var wsum;
var xx;

var age = 35;       //!age (years);
var vps;
var eta = 0;
var eres;
var tex;
var vpex;

//Real
var mbody = 75;     //!weight (kilograms);
var ht = 1.75; 	    //!height (meters);
var work = 80;      //metabolic work
var icl = 0.9;	   	 //clothing
var fcl = 1.0 + 0.15 * icl;

//Real constants
var cb = 3.64 * 1000.0;
var rob = 1.06;
var p = 1013.25;
var po = 1013.25;
var emsk = 0.99;
var food = 0.0;
var evap = 2.42 * Math.pow(10.0, 6.0);
var sigm = 5.67 * Math.pow(10.0, (-8.0));
var emcl = 0.95;

//int
var count1;
var j;

//real subroutine PET
var TX;

//Other variabes
//int
var sex = 1        //!sex (male:1; female:2)
var infile_len;
var outfile_len;
var file_len;
var pfad_len;

var met;
var metbf;
var metbm;
var metf;
var metm;


var v;
var ta;
var RH;
var tmrt;


function PETCalculation(v_in, ta_in, RH_in, tmrt_in, age_in, mbody_in, ht_in, icl_in) {

    //v_in = "1.88";
    //ta_in = "24.68";
    //RH_in = "15.68";
    //tmrt_in = "10.96";


    v = parseFloat(v_in);
    ta = parseFloat(ta_in);
    RH = parseFloat(RH_in);
    tmrt = parseFloat(tmrt_in);
    age = parseInt(age_in);
    mbody = parseInt(mbody_in);
    ht = parseFloat(ht_in);
    icl = parseFloat(icl_in);

    fcl = 1.0 + 0.15 * icl;

    if (ta != -9999) {
        //!humidity
        humidity();

        //!inner body energy
        INBODY();

        //!calculation
        CALCUL();

        //!PET calculations
        var tx = PET_cal();

        return tx.toFixed(2);
        //console.log("tx " + tx.toFixed(2)); //round ip to two decimals
    }
}

function CALCUL() {


    var count3;
    var wtsk = 0.0;
    adu = 0.203 * Math.pow(mbody, 0.425) * Math.pow(ht, 0.725);
    hc = 2.67 + (6.5 * Math.pow(v, 0.67));
    hc = hc * Math.pow((p / po), 0.55);
    feff = 0.725;
    facl = (-2.36 + 173.51 * icl - 100.76 * icl * icl + 19.28 * (Math.pow(icl, 3.0))) / 100.0;

    if (facl > 1) facl = 1.0;
    rcl = (icl / 6.45) / facl;
    if (icl >= 2.0) y = 1.0;

    if (icl > 0.6 && icl < 2.0) y = (ht - 0.2) / ht;
    if (icl <= 0.6 && icl > 0.3) y = 0.5;
    if (icl <= 0.3 && icl > 0.0) y = 0.1;

    r2 = adu * (fcl - 1. + facl) / (2. * 3.14 * ht * y);
    r1 = facl * adu / (2. * 3.14 * ht * y);

    di = r2 - r1;


    for (var j = 1; j <= 7; j++) {

        tsk = 34.
        count1 = 0
        tcl = (ta + tmrt + tsk) / 3.0;
        count3 = 1;
        enbal2 = 0.;
        breakOutCount = 0;



        //FIRST CALCULATIONS
        //endless loop
        //20
        while (true && breakOutCount < 1000) {

            breakOutCount = breakOutCount + 1;
            acl = adu * facl + adu * (fcl - 1.0);
            rclo2 = emcl * sigm * (Math.pow((tcl + 273.2), 4.0) - Math.pow((tmrt + 273.2), 4.0)) * feff;
            htcl = 6.28 * ht * y * di / (rcl * Math.log(r2 / r1) * acl);
            tsk = 1. / htcl * (hc * (tcl - ta) + rclo2) + tcl;


            //radiation balance

            aeff = adu * feff;
            rbare = aeff * (1.0 - facl) * emsk * sigm * (Math.pow((tmrt + 273.2), 4.0) - Math.pow((tsk + 273.2), 4.0));
            rclo = feff * acl * emcl * sigm * (Math.pow((tmrt + 273.2), 4.0) - Math.pow((tcl + 273.2), 4.0));
            rsum = rbare + rclo;

            //convection

            cbare = hc * (ta - tsk) * adu * (1.0 - facl);
            cclo = hc * (ta - tcl) * acl;
            csum = cbare + cclo;

            //core temperature

            c[0] = h + ere;
            c[1] = adu * rob * cb;
            c[2] = 18. - 0.5 * tsk;
            c[3] = 5.28 * adu * c[2];
            c[4] = 0.0208 * c[1];
            c[5] = 0.76075 * c[1];
            c[6] = c[3] - c[5] - tsk * c[4];
            c[7] = -c[0] * c[2] - tsk * c[3] + tsk * c[5];
            c[8] = c[6] * c[6] - 4. * c[4] * c[7];
            c[9] = 5.28 * adu - c[5] - c[4] * tsk;
            c[10] = c[9] * c[9] - 4. * c[4] * (c[5] * tsk - c[0] - 5.28 * adu * tsk);

            
            if (tsk == 36.0) tsk = 36.01;

            tcore[7] = c[0] / (5.28 * adu + c[1] * 6.3 / 3600.0) + tsk;
            tcore[3] = c[0] / (5.28 * adu + (c[1] * 6.3 / 3600.0) / (1 + 0.5 * (34.0 - tsk))) + tsk;

            if (c[10] < 0.) { }
            else {
                tcore[6] = (-c[9] - Math.pow(c[10], 0.5)) / (2. * c[4]);
                tcore[1] = (-c[9] + Math.pow(c[10], 0.5)) / (2. * c[4]);
            }

            if (c[8] < 0) { }
            else {
                tcore[2] = ((-c[6] + Math.pow(Math.abs(c[8]), 0.5)) / (2. * c[4]));
                tcore[5] = ((-c[6] - Math.pow(Math.abs(c[8]), 0.5)) / (2. * c[4]));
            }

            tcore[4] = c[0] / (5.28 * adu + c[1] * 1. / 40.0) + tsk;


            //transpiration

            tbody = 0.1 * tsk + 0.9 * tcore[j];
            swm = 304.94 * (tbody - 36.6) * adu / 3600000.0;
            vpts = 6.11 * Math.pow(10.0, (7.45 * tsk / (235. + tsk)));

            if (tbody <= 36.6) swm = 0.0;
            swf = 0.7 * swm;

            if (sex == 1) sw = swm;
            if (sex == 2) sw = swf;
            eswphy = -sw * evap;
            he = 0.633 * hc / (p * cair);
            fec = 1. / (1. + 0.92 * hc * rcl);
            eswpot = he * (vpa - vpts) * adu * evap * fec;
            wetsk = eswphy / eswpot;

            if (wetsk > 1) wetsk = 1.0;

            eswdif = eswphy - eswpot;

            if (eswdif <= 0) esw = eswpot;
            if (eswdif > 0) esw = eswphy;
            if (esw > 0) esw = 0;

            //diffusion

            rdsk = 0.79 * Math.pow(10.0, 7.0);
            rdcl = 0.0;
            ed = evap / (rdsk + rdcl) * adu * (1 - wetsk) * (vpa - vpts);

            //MAX VB

            vb1 = 34.0 - tsk;
            vb2 = tcore[j] - 36.6;

            if (vb2 < 0) vb2 = 0.0;
            if (vb1 < 0) vb1 = 0.0
            vb = (6.3 + 75. * (vb2)) / (1. + 0.5 * vb1);

            //energy balance

            enbal = h + ed + ere + esw + csum + rsum + food;


            //clothing's temperature

            if (count1 == 0) xx = 1.0;
            if (count1 == 1) xx = 0.1;
            if (count1 == 2) xx = 0.01;
            if (count1 === 3) xx = 0.001;

            if (enbal > 0.) tcl = tcl + xx;
            if (enbal < 0.) tcl = tcl - xx;

            if (enbal <= 0 && enbal2 > 0) {
                //code 30
                if (count1 == 0 || count1 == 1 || count1 == 2) {
                    count1 = count1 + 1.
                    enbal2 = 0.
                }
                else {
                    break;
                }
                //end code 30
            }
            else if (enbal >= 0 && enbal2 < 0) {
                //code 30
                if (count1 == 0 || count1 == 1 || count1 == 2) {
                    count1 = count1 + 1.
                    enbal2 = 0.
                }
                else {
                    break;
                }
                //end code 30
            }
            else {
                enbal2 = enbal;
                count3 = count3 + 1;
            }
        }



        //Break logic

        if (count1 == 3) {
            if (j == 2 || j == 5) {
                //Code 40
                if (c[8] < 0) { }
                else if (tcore[j] >= 36.6 && tsk <= 34.050) {
                    //Code 80
                    if (j != 4 && vb > 91) { }
                    else if (j == 4 && vb < 89) { }
                    else {
                        break;
                    }
                    //end code 80
                }
                else { }
            }

            if (j == 6 || j == 1) {
                //Code 50
                if (c[10] < 0) { }
                else if (tcore[j] >= 36.6 && tsk > 33.850) {
                    //Code 80
                    if (j != 4 && vb > 91) { }
                    else if (j == 4 && vb < 89) { }
                    else {
                        break;
                    }
                    //end code 80
                }
                else { }
            }

            if (j == 3) {
                //Code 60
                if (tcore[j] < 36.6 && tsk <= 34.000) {
                    //Code 80
                    if (j != 4 && vb > 91) { }
                    else if (j == 4 && vb < 89) { }
                    else {
                        break;
                    }
                    //end code 80
                }
                else { }
            }

            if (j == 7) {
                //Code 70
                if (tcore[j] < 36.6 && tsk > 34.000) {
                    //Code 80
                    if (j != 4 && vb > 91) { }
                    else if (j == 4 && vb < 89) { }
                    else {
                        break;
                    }
                    //end code 80
                }
                else { }
            }
            if (j == 4) {
                //Code 80
                if (j != 4 && vb > 91) { }
                else if (j == 4 && vb < 89) { }
                else {
                    break;
                }
                //end code 80
            }
        }

        else {
            //Code 40
            if (c[8] < 0) { }
            else if (tcore[j] >= 36.6 && tsk <= 34.050) {
                //Code 80
                if (j != 4 && vb > 91) { }
                else if (j == 4 && vb < 89) { }
                else {
                    break;
                }
                //end code 80
            }
            else { }
        }
    }
}


function INBODY() {

    metbf = 3.19 * Math.pow(mbody, (3.0 / 4.0)) * (1. + 0.004 * (30.0 - age) + 0.018 * ((ht * 100. / (Math.pow(mbody, (1. / 3.0)))) - 42.1));
    metbm = 3.45 * Math.pow(mbody, (3. / 4.0)) * (1. + 0.004 * (30.0 - age) + 0.010 * ((ht * 100. / (Math.pow(mbody, (1. / 3.0)))) - 43.4))

    metm = work + metbm;
    metf = work + metbf;

    if (sex == 1) met = metm;
    if (sex == 2) met = metf;
    h = met * (1.0 - eta);

    //!       sensible respiration energy
    cair = 1.01 * 1000.0;
    tex = 0.47 * ta + 21.0;
    rtv = 1.44 * Math.pow(10.0, (-6.0)) * met
    eres = cair * (ta - tex) * rtv;

    //!       latent respiration energy
    vpex = 6.11 * Math.pow(10., (7.45 * tex / (235. + tex)));
    erel = 0.623 * evap / p * (vpa - vpex) * rtv;

    //!       sum of the results
    ere = eres + erel;

}

function humidity() {


    var ERR = -9999.0;

    if (ta != ERR && RH != ERR) {
        vps = 6.107 * (Math.pow(10, (7.5 * ta / (238. + ta))));
        vpa = RH * vps / 100.0
    }
    else {
        vpa = ERR;
        vps = ERR;
    }

}

function PET_cal() {

    //implicit NONE - what is this?

    var cbare;
    var cclo;
    var csum;
    var ed;

    var enbal;
    var enbal2;
    var ere;
    var erel;
    var eres;

    var hc;
    var rbare;
    var rclo;
    var rsum;

    var tex;
    var vpex;
    var xx;

    var count1;

    tx = ta;
    enbal2 = 0.0;
    count1 = 0;

    breakOutCount = 0;

    //150   

    while (count1 != 4 && breakOutCount < 1000) {

        breakOutCount = breakOutCount + 1;

        hc = 2.67 + 6.5 * Math.pow(0.1, 0.67);

        hc = hc * Math.pow((p / po), 0.55);

        // radiation balance
        aeff = adu * feff;
        rbare = aeff * (1.0 - facl) * emsk * sigm * (Math.pow((tx + 273.2), 4.0) - Math.pow((tsk + 273.2), 4.0));
        rclo = feff * acl * emcl * sigm * (Math.pow((tx + 273.2), 4.0) - Math.pow((tcl + 273.2), 4.0));
        rsum = rbare + rclo;

        //convection
        cbare = hc * (tx - tsk) * adu * (1.0 - facl);
        cclo = hc * (tx - tcl) * acl;
        csum = cbare + cclo;

        //diffusion
        ed = evap / (rdsk + rdcl) * adu * (1.0 - wetsk) * (12.0 - vpts);

        //respiration
        tex = 0.47 * tx + 21.0;
        eres = cair * (tx - tex) * rtv;
        vpex = 6.11 * Math.pow(10.0, (7.45 * tex / (235. + tex)));
        erel = 0.623 * evap / p * (12.0 - vpex) * rtv;
        ere = eres + erel;

        //energy balance
        enbal = h + ed + ere + esw + csum + rsum;

        //iteration concerning Ta
        if (count1 == 0) xx = 1.0;
        if (count1 == 1) xx = 0.1;
        if (count1 == 2) xx = 0.01;
        if (count1 == 3) xx = 0.001;
        if (enbal > 0.0) tx = tx - xx;
        if (enbal < 0.0) tx = tx + xx;

        if ((enbal <= 0.0 && enbal2 > 0.0)) {
            count1 = count1 + 1;
            if (count1 == 4)
                break;
        }


        else if ((enbal >= 0.0 && enbal2 < 0.0)) {
            count1 = count1 + 1;
            if (count1 == 4)
                break;
        }

        else {
            enbal2 = enbal;
        }
    }


    return tx;

}