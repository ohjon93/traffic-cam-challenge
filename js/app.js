// List of Seattle Traffic Cameras

"use strict";

$(document).ready(function() {
    var mapElem = document.getElementById('map');
    var mapOptions = {
        center: {
            lat: 47.6, 
            lng: -122.3 },
        zoom: 12 //0=Earth to 21=max zoom
    };
    var markers = [];

    var map = new google.maps.Map(mapElem, mapOptions);

    var infoWindow = new google.maps.InfoWindow();

    //prepares markercluster
    var cluster = new MarkerClusterer(map, markers, {
        gridSize: 35
    });

    //retrieve camera data
    $.getJSON('http://data.seattle.gov/resource/65fc-btcc.json')
        .done(function(data) {
            data.forEach(function(cam) {

                //uses icon for marker and sets it in place
                var marker = new google.maps.Marker({
                    position: {
                        lat: Number(cam.location.latitude),
                        lng: Number(cam.location.longitude)
                    },
                    map: map,
                    cam: cam,
                    icon: 'img/cam.png'
                });

                //when clicked, it'll open the info window
                google.maps.event.addListener(marker, 'click', function() {
                    var html = '<h1>' + cam.cameralabel + '</h1>'; //better with h1 text on top
                    html += '<img src="' + cam.imageurl.url + '"/>';
                    infoWindow.setContent(html);
                    infoWindow.open(map, this);
                    map.panTo(this.getPosition());
                });

                markers.push(marker);
            });

            cluster.addMarkers(markers);
        })
        .fail(function(err) {
            console.log(err);
        })
        .always(function() {
            $('#ajax-loader').fadeOut();
        });

    //close info window on map click
    google.maps.event.addListener(map, 'click', function() {
        infoWindow.close();
    });

    //filter all markers in markers array
    $('#search').bind('search keyup', function() {
        var search = this;

        //clear the cluster in preparation for a new list of visible markers
        cluster.clearMarkers();

        $.each(markers, function(idx, mkr) {
            mkr.setMap(null);
            if (mkr.cam.cameralabel.toLowerCase().indexOf(search.value.toLowerCase()) > -1) {
                mkr.setMap(map);
                cluster.addMarker(mkr);
            }
        });
    });

    $(window).resize(resizeMap);

    function resizeMap() {
        var map = $('#map');
        map.css({
            'height': window.innerHeight - map.position().top - 20 + 'px'
        });
    }

    //initialize map size
    resizeMap();
});