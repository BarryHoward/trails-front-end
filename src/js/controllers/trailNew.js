const mapId = "trailNewMap"

function TrailNewController (TrailsService) {

  let vm = this;

  vm.placeMarker = placeMarker;
  vm.addNewTrail = addNewTrail;
  vm.TrailsService = TrailsService;
  vm.geocodeAddress = geocodeAddress;

  const Geocoder = new google.maps.Geocoder();

  function init () {
    vm.markers = [];
    vm.TrailsService.delete = false;
    vm.TrailsService.insert = "backInsert";
    TrailsService.getMap(mapId).then(function (map) {
      vm.map = map;
      vm.map.setMapTypeId('terrain');
      console.log(vm.map)
    })
    var infoWindow = new google.maps.InfoWindow({map: vm.map});

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        infoWindow.setPosition(pos);
        vm.map.setCenter(pos);
      }, function() {
        handleLocationError(true, infoWindow, vm.map.getCenter());
      });
    } else {
      handleLocationError(false, infoWindow, vm.map.getCenter());
    }
  }

  init();

  function geocodeAddress() {
    console.log(vm.address);
    console.log(vm.map)
    Geocoder.geocode({'address': vm.address}, function(results, status) {
          if (status === 'OK') {
            vm.map.setCenter(results[0].geometry.location);
            vm.map.setZoom(6);
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
  }

  function placeMarker(event){
    TrailsService.placeMarker(vm.markers, vm.map, event);
  }


  function addNewTrail(trailData) {
    let newTrail = {};
    newTrail.waypoints = [];
    vm.markers.forEach(function (marker) {
      let waypoint = {};
      waypoint.lat = marker.lat;
      waypoint.lng = marker.lng;
      waypoint.totalDistance = marker.totalDistance;
      newTrail.waypoints.push(waypoint);
    });
    newTrail.title = vm.trailTitle;

    TrailsService.newTrail(newTrail);
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }

}

TrailNewController.$inject = ['TrailsService'];
export { TrailNewController }
