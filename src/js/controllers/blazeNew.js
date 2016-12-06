


// function BlazeEditController (MapsService, $stateParams, $scope) {
//   let vm = this;

//   //params specific to page
//   MapsService.trail_id = $stateParams.id;
//   MapsService.delete = false;
//   MapsService.insert = "backInsert";
//   MapsService.newMarkerAllow = true;
//   MapsService.snap = false;
//   MapsService.markerArray = [];
//   MapsService.panel={};

//   vm.MapsService = MapsService;
//   vm.placeMarker = placeMarker;
//   vm.newTrail = newTrail;

//   const metersFeetConversion = 3.28084;
//   const metersMilesConversion = 0.000621371;
//   const encoding = google.maps.geometry.encoding;
//   const spherical = google.maps.geometry.spherical;

//   init();

//   function init(){
//     //initial variables
//     vm.status = "Make a Trail!";

//     MapsService.getMap(mapId).then(function (map){
//       MapsService.map=map;
//         MapsService.createTrailPoly();
//         MapsService.initSearch();
//     })
//   }

//   function placeMarker(event){
//     let waypoint = event.latLng;
//     let marker = MapsService.placeMarker(waypoint);
//     MapsService.dragListener(marker, waypoint, $scope)
//     MapsService.clickListener(marker, waypoint, $scope)
//   }


//   function newTrail(){
//     vm.status = "Trail Updating...";
//     let newTrail = {};
//     let encodeString = encoding.encodePath(MapsService.trailPath);
//     newTrail.path = encodeString;
//     newTrail.title = MapsService.trailTitle;
//     newTrail.length = spherical.computeLength(MapsService.trailPath)*metersMilesConversion;
//     newTrail.description = vm.trailDescription;
//     newTrail.image_url = vm.trailImage_url;
//     MapsService.newTrail($stateParams.id, newTrail).then(function (resp) {
//         vm.status = "Update Completed";
//         $scope.$apply();
//       })
//   }
// }

// BlazeEditController.$inject = ['MapsService', '$stateParams', '$scope'];
// export {BlazeEditController}





function BlazeNewController (MapsService, $scope) {

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

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.newTrail = newTrail;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;
  const Geocoder = new google.maps.Geocoder();

  function init(){
    //initial variables
    vm.status = "Make a Trail!";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
        MapsService.createTrailPoly();
        MapsService.initSearch();
        MapsService.map.setMapTypeId('terrain');
        var infoWindow = new google.maps.InfoWindow({map: MapsService.map});
        someFunction(infoWindow);
    })
  }
  init();

  function newTrail(){
    vm.status = "Trail Saving...";
    let newTrail = {};
    let encodeString = encoding.encodePath(MapsService.trailPath);
    newTrail.path = encodeString;
    newTrail.title = MapsService.trailTitle;
    newTrail.length = spherical.computeLength(MapsService.trailPath)*metersMilesConversion;
    newTrail.description = vm.trailDescription;
    newTrail.image_url = vm.trailImage_url;
    MapsService.newTrail(newTrail).then(function (resp) {
        vm.status = "Trail Saved";
        $scope.$apply();
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

BlazeNewController.$inject = ['MapsService', '$scope'];
export { BlazeNewController }
