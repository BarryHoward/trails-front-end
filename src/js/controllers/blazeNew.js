function BlazeNewController (MapsService, UsersService, $scope, $state) {

  const mapId = "blazeNewMap"
  let vm =this;

  //functions
  vm.placeMarker = placeMarker;
  vm.newTrail = newTrail;

  //Maps Service
  vm.MapsService = MapsService;

  //params specific to page
  MapsService.delete = false;
  MapsService.insert = "backInsert";
  MapsService.newMarkerAllow = true;
  MapsService.snap = false;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = true;
  MapsService.trailPath = [];
  MapsService.trailInfo = {};

  //Constants
  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;
  const Geocoder = new google.maps.Geocoder();

  init();




  function init(){
    //initial variables
    vm.loggedIn = UsersService.isLoggedIn();
    vm.status = "Create Trail";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.createTrailPoly();
      MapsService.initSearch();
      MapsService.map.setMapTypeId('terrain');
      centerByLocation();
    })
  }

  function newTrail(){
    vm.status = "Trail Saving...";
    MapsService.trailInfo.saved_url = MapsService.trailInfo.img_url;
    let newTrail = MapsService.trailInfo;
    let encodeString = encoding.encodePath(MapsService.trailPath);
    newTrail.path = encodeString;
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


  function centerByLocation(infoWindow){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        MapsService.map.setCenter(pos);
      })
    }
  }

  // function clearOldMarkers(){
  //   let array = document.getElementsByClassName("gmnoprint");
  //   for (var i=0; i<array.length; i++){
  //     console.log(array[i])
  //     let node = array[i]
  //     console.log(node.getElementsbyTagName("img"))
  //   }
  // }

// -----------------------------------------

}

BlazeNewController.$inject = ['MapsService', 'UsersService', '$scope', '$state'];
export { BlazeNewController }
