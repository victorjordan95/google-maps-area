var userCoords = [
    { "lat": -36.777085401369156, "lng": 144.29195762802055 }, { "lat": -36.77880407914753, "lng": 144.29131389785698 }, 
    { "lat": -36.779474353035674, "lng": 144.2938029878228 }, { "lat": -36.77768694297514, "lng": 144.29444671798638 }
];

var coords1 = [{"lat":-36.777085401369156,"lng":144.29195762802055},{"lat":-36.77880407914753,"lng":144.29131389785698},{"lat":-36.779474353035674,"lng":144.2938029878228},{"lat":-36.77768694297514,"lng":144.29444671798638}];
var coords2 = [{"lat":-36.77492302640141,"lng":144.29006897747024},{"lat":-36.7762636361922,"lng":144.2894681626509},{"lat":-36.776951119298104,"lng":144.29176413356765},{"lat":-36.775266774736686,"lng":144.29255806743606}];

regions = [
    {
        id: 1,
        name: "Zone 1",
        day: "Monday",
        color: "#FA5C43",
        coords: coords1
    },
    {
        id: 2,
        name: "Zone 2",
        day: "Monday",
        color: "#998973",
        coords: coords2
    }
];

var polyPath = [];
var gmap_polygons = [];
var infowindow = new google.maps.InfoWindow();
var map;

var TrPoly = function () {
    var poly;
    var path;
    var markers = [];
    polyPath = [];
    
    // other region info

    this.initMap = function (el) {
        map = new google.maps.Map(document.getElementById(el), {
            zoom: 15,
            center: {"lat":-36.77737633469688,"lng":144.29015579266252}, // Center the map on victoria, AUS.
            styles: [{
                stylers: [
                    { hue: "#2f563c" },
                    { saturation: -50 }
                ]
            }]
        });

        // Define the LatLng coordinates for the polygon's path.
        var samplePolyPath = [];
        // Construct the polygon.
        poly = new google.maps.Polygon({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35
        });
        poly.setMap(map);

        // Add a listener for the click event
        map.addListener("click", addLatLng);

        for (var i = 0; i < samplePolyPath.length; i++) {
            var latLng = { latLng: new google.maps.LatLng(samplePolyPath[i]) };
            addLatLng(latLng);
        }

        // Add regions to the map, and save reference to them for later
        saveInMap(regions, gmap_polygons, map, showInfo);
        
    }

    // Handles click events on a map, and adds a new point to the Polyline.
    function addLatLng(event) {
        path = poly.getPath();

        // Because path is an MVCArray, we can simply append a new coordinate
        // and it will automatically appear. 
        path.push(event.latLng);
        polyPath.push({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        });

        jQuery("#polyCoordinate").val(JSON.stringify(polyPath));
        // Add a new marker at the new plotted point on the polyline.
        var marker = new google.maps.Marker({
            position: event.latLng,
            title: "#" + path.getLength(),
            draggable: true,
            map: map,
            id: Math.random()
        });

        markers.push(marker);

        marker.addListener("drag", onDragMarker);

        marker.addListener("dblclick", deleteMarker);
    }

    function deleteMarker(event) {
        this.setMap(null);
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].id === this.id) {
                markers.splice(i, 1);
                break;
            }
        }
        renderPoly();
    }

    function clearAllMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }

    jQuery("#resetPolygon").on("click", function () {
        polyPath = [];
        jQuery("#polyCoordinate").val("");
        poly.setPath([]);
        clearAllMarkers();
    });

    function renderPoly() {
        poly.setPath([]);
        path = poly.getPath();
        polyPath = [];
        for (var i = 0; i < markers.length; i++) {
            path.push(markers[i].position);
            polyPath.push({
                lat: markers[i].position.lat(),
                lng: markers[i].position.lng()
            });
        }
        jQuery("#polyCoordinate").val(JSON.stringify(polyPath));
    }

    var onDragMarker = debounce(function (event) {
        renderPoly();

    }, 250);

    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
}

var cc = new TrPoly;
cc.initMap('map-canvas');

var saveLatLong = document.getElementById('js-saveLatLon');

saveLatLong.onclick = function() {
    console.log('Lat Lon antes de ser modificada');
    console.log(polyPath);

    var createdField = {
        id: regions.length + 1,
        name:`Zone ${regions.length+1}`,
        day: "Novo",
        color: "#FA5C43",
        coords: polyPath
    };
    regions.push(createdField);
    saveInMap(regions, gmap_polygons, map, showInfo);
    console.log(regions);
}

function saveInMap(regions, gmap_polygons, map, showInfo) {

    for (var i = 0; i < regions.length; i++) {
        console.log(regions);
        var region = new google.maps.Polygon({
            paths: regions[i].coords,
            strokeWeight: 0,
            fillColor: regions[i].color,
            fillOpacity: 0.65
        });
        region.setMap(map);

        // add infowindow
        region.infowindow = new google.maps.InfoWindow({
            content: "<b>" + regions[i].name + "</b> - " + regions[i].day,
        });
        region.infowindow.name = regions[i].name;
        google.maps.event.addListener(region, 'click', showInfo);

        // save reference
        gmap_polygons[i] = region;
    }
    
}

function showInfo(e) {
    infowindow.close();

    this.infowindow.setPosition(e.latLng);
    this.infowindow.open(map);

    infowindow = this.infowindow;
}