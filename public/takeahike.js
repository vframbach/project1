var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 37.78,
            lng: -122.44
        },
        zoom: 12
    });
}

// look in url for zipcode
// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//save zip code that user entered via the url
var zipcode = getParameterByName('zipcode');

$(function() {
    var source = $('#meetup-results-template').html();
    var template = Handlebars.compile(source);

    // show markers on map based on latitude and longitude of meetup location
    // if none listed, get latitude and longitude of group, if available
    $.get('/api/events', {
        zipcode: zipcode
    }, function(data) {
    	var infowindow = new google.maps.InfoWindow();
        //console.log(data.events[0].venue.lon);
        var bounds = new google.maps.LatLngBounds();
        data.events.forEach(function(event) {
            var lat;
            var lng;
            if (event.venue) {
                lat = event.venue.lat;
                lng = event.venue.lon;
            } else if (event.group) {
                lat = event.group.group_lat;
                lng = event.group.group_lon;
            } else {
                return;
            }
            console.log(event);

            
            // not every event has a venue. if no venue, skips over address and city
            var venueString = '';
            if (event.venue) {
                venueString = '<p>' + event.venue.address_1 + '</p>' +
                              '<p>' + event.venue.city  + '</p>';
            }

            // when marker is clicked, event info is shown in info window
            var contentString = '<div id="content">' +
                '<div id="siteNotice">' +
                '</div>' +
                '<h4 id="firstHeading" class="firstHeading">'+ event.name + '</h4>' +
                '<div id="bodyContent">' +
                '<p>' + event.group.name + '</p>' +
                venueString +
                '<a href="'+ event.event_url + '" target="_blank">' +
                'Go to website</a> ' +
                '</div>' +
                '</div>';

            var marker = new google.maps.Marker({
                position: {
                    lat: lat,
                    lng: lng
                },
                map: map
            });

            // map location adjusts to where markers are
            bounds.extend(marker.position);

            marker.addListener('click', function() {
            	infowindow.close();
            	infowindow.setContent(contentString);
                infowindow.open(map, marker);
            });
        });
        map.fitBounds(bounds);

        var takeahikeHtml = template({
            events: data.events
        });
        $('.meetup-results').html(takeahikeHtml);
    });
});