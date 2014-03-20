function GoogleMap() {

    this.initialize = function () {
        var height = $("body").height() - 100;

        $("#mapsection").css('height', height);

        return showMap();

    };
    
    var showMap = function() {
        var mapOptions = {
            zoom: 10,
            center: new google.maps.LatLng(latitude, longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map($("div#map")[0], mapOptions);
        console.log(map);

        return map;
    };
}