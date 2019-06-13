var map;

var ViewModel = function() {
    var self = this;

    // Create a new blank array for all the listing markers.
    this.markers = [];

    this.initMap = function() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -5.877468, lng: -35.177542},
            zoom: 18,
            styles: style,
            mapTypeControl: false
        });

        // Set InfoWindow variable
        this.largeInfowindow = new google.maps.InfoWindow();

        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            this.position = locations[i].location;
            this.title = locations[i].title;

            // Create a marker per location, and put into markers array.
            this.marker = new google.maps.Marker({
                position: this.position,
                title: this.title,
                animation: google.maps.Animation.DROP,
                id: i
            });
            // Push the marker to our array of markers.
            this.markers.push(this.marker);

            // Create an onclick event to open an infowindow at each marker.
            this.marker.addListener('click', function() {
                self.populateInfoWindow(this);
            });
            // Put the marker on map
            this.marker.setMap(map);
        }
    };

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    this.populateInfoWindow = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);

        infowindow = self.largeInfowindow
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // BING images API
            $.ajax({
                url: "https://api.cognitive.microsoft.com/bing/v7.0/images/search?q=" + marker.title,
                beforeSend: function(xhrObj){
                    // Request headers
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","[KEY]");
                },
                type: "GET",
                // Request body
                data: "",
                dataType: "json",
            })
            .done(function(data) {
                // Insert content and data into info window
                infowindow.setContent(
                    '<div><h4>' + marker.title + '</h4></div>' +
                    '<div>' +
                    '<img src="' + data.value[0].thumbnailUrl + 'alt="' + marker.title + ' image" class="img-infoWindow">' +
                    '<img src="' + data.value[1].thumbnailUrl + 'alt="' + marker.title + ' image" class="img-infoWindow">' +
                    '<img src="' + data.value[2].thumbnailUrl + 'alt="' + marker.title + ' image" class="img-infoWindow">' +
                    '</div>'
                );
            })
            .fail(function() {
                alert("BING API error, refresh and try again.");
            });

            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
        marker.setAnimation(null);
    };
    // Call the map initialization
    this.initMap();

    // Observable to capture typed location
    this.enterLocation = ko.observable("");

    // Display only filtered locations
    this.searchBar = ko.computed(function() {
        var filter = [];
        for (var i = 0; i < this.markers.length; i++) {
            if (this.markers[i].title.toLowerCase().includes(this.enterLocation().toLowerCase())) {
                filter.push(this.markers[i]);
                self.markers[i].setVisible(true);
            } else {
                self.markers[i].setVisible(false);
            }
        }
        return filter;
    }, this);
};

function mapFail() {
    alert("Google Maps API error, refresh and try again.");
};

function start() {
    ko.applyBindings(new ViewModel());
}
