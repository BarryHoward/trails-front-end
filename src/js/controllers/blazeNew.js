const mapId = "blazeNewMap"

function BlazeNewController (MapsService, $scope) {

  let vm = this;

  vm.placeMarker = placeMarker;
  vm.addNewTrail = addNewTrail;
  vm.MapsService = MapsService;
  vm.geocodeAddress = geocodeAddress;
  vm.someFunction = someFunction;

  const Geocoder = new google.maps.Geocoder();

  function init () {
    let input = document.getElementById('new-pac-input')
    vm.MapsService.delete = false;
    vm.MapsService.insert = "backInsert";
    MapsService.getMap(mapId).then(function (map) {
      vm.map = map;
      vm.path=[];
      vm.map.setMapTypeId('terrain');
      MapsService.createLine(vm.path, vm.map);
      MapsService.initSearch(vm.map, input)
    })
    var infoWindow = new google.maps.InfoWindow({map: vm.map});
    vm.someFunction(infoWindow);
  }

  init();

  function addNewTrail(){
    vm.status = "Saving Trail...";
    MapsService.newTrail(vm.path, vm.trailTitle)
      .then(function (resp) {
        vm.status = "Trail Saved";
        $scope.$apply();
      })
  }

  function placeMarker(event){
    MapsService.placeMarker(event, vm.path, vm.map);
  }


// Jack's weird centering shit -----------------------------------


  function someFunction(infoWindow){
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

  function geocodeAddress() {
    Geocoder.geocode({'address': vm.address}, function(results, status) {
          if (status === 'OK') {
            vm.map.setCenter(results[0].geometry.location);
            vm.map.setZoom(6);
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
  }

  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }

// -----------------------------------------

}

BlazeNewController.$inject = ['MapsService', '$scope'];
export { BlazeNewController }
