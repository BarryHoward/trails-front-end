function BlazeNewController (MapsService, UsersService, $scope, $state) {

  const mapId = "blazeNewMap"
  let vm =this;

  //params specific to page
  MapsService.delete = false;
  MapsService.insert = "backInsert";
  MapsService.newMarkerAllow = true;
  MapsService.snap = false;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.trailPath = [];
  MapsService.regraphElevation = true;
  MapsService.trailInfo ={};

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.newTrail = newTrail;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;
  const Geocoder = new google.maps.Geocoder();



  init();




  function init(){
    //initial variables
    vm.loggedIn = UsersService.isLoggedIn();
    vm.status = "Make a trail!";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
        MapsService.createTrailPoly();
        MapsService.initSearch();
        MapsService.map.setMapTypeId('terrain');
        var infoWindow = new google.maps.InfoWindow({map: MapsService.map});
        someFunction(infoWindow);
    })
  }

  function newTrail(){
    vm.status = "Trail Saving...";
    MapsService.trailInfo.saved_url = MapsService.trailInfo.img_url;
    let newTrail = MapsService.trailInfo;
    let encodeString = encoding.encodePath(MapsService.trailPath);
    newTrail.path = encodeString;
    newTrail.distance = Number((spherical.computeLength(MapsService.trailPath)*metersMilesConversion).toFixed(2));;
    MapsService.newTrail(newTrail).then(function (resp) {
        vm.status = "Trail Saved";
        $state.go("root.topTrails")
      })
  }

  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint, $scope)
    MapsService.clickListener(marker, waypoint, $scope)
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
        MapsService.map.setCenter(pos);
      }, function() {
        handleLocationError(true, infoWindow, MapsService.map.getCenter());
      });
    } else {
      handleLocationError(false, infoWindow, MapsService.map.getCenter());
    }
  }

  function geocodeAddress() {
    Geocoder.geocode({'address': vm.address}, function(results, status) {
          if (status === 'OK') {
            MapsService.map.setCenter(results[0].geometry.location);
            MapsService.map.setZoom(6);
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

BlazeNewController.$inject = ['MapsService', 'UsersService', '$scope', '$state'];
export { BlazeNewController }
