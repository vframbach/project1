var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 9
    });
}

// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var zipcode = getParameterByName('zipcode');


$.get('/api/events', function (data) {
	//console.log(data.events[0].venue.lon);
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
		new google.maps.Marker({
			position: {
				lat: lat,
				lng: lng
			},
			map: map
		});
	});
});