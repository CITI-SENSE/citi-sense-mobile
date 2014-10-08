function GoogleMap() {

    this.initialize = function () {
        var height = $("body").height() - 100;

        $("#mapsection").css('height', height);

        return showMap();

    };
    
    var showMap = function() {
        var mapOptions = {
            zoom: 13,
            center: new google.maps.LatLng(latitude, longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map($("div#map")[0], mapOptions);
        console.log(map);

        return map;
    };
}

function addObservationMarker(map, markertitle, latlng, pinColor, userid, time) {

    var date = moment.unix(time);

    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34));
    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(40, 37),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 35));
    
    var infoWin = new google.maps.InfoWindow({ content: moment(date).format() });
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        title: markertitle,
        icon: pinImage,
        shadow: pinShadow
    });
    google.maps.event.addListener(marker, 'click', function () {
        infoWin.open(map, marker);
        $.get(perceptionUrl + 'databases/raw/data/SmartphonePicture/image' + userid + "?from=" + time + "&to=" + time, null)
            .done(function(result) {
                console.log("adding marker" + result.e[0].sv);
                infoWin.setContent('<img src="' + result.e[0].sv + '" width="100" height="100" />');
            });
    });
}

function refreshGoogleMap() {
    google.maps.event.trigger(map, 'resize');
}