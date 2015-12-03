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

// cookie name, cookie value, cookie expiration
// http://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
    }
    return "";
}

// get zip code that user entered via the url
var zipcode = getParameterByName('zipcode');

// if no zipcode was entered, grab it from the cookie
if (!zipcode) {
    zipcode = getCookie('zipcode');
}
// else, the user set a zipcode, so store it in the cookie
else {
    setCookie('zipcode', zipcode, 14);
}

// if there's still no zipcode, fall back to some default fallback
if (!zipcode) {
    zipcode = 90210;
}

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

            if (lat === 0 || lng === 0) {
                return;
            }

            console.log(event);

            
            // if there's no event url, try to put one together from data
            
            if (!event.event_url) {
            	event.event_url ='http://meetup.com/' + event.group.urlname + '/events/' + event.id;
            	console.log(event.event_url);
            }


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