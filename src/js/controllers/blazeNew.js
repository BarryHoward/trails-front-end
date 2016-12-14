function BlazeNewController (MapsService, UsersService, $scope, $state) {

  const mapId = "blazeNewMap"
  let vm =this;

  //functions
  vm.placeMarker = placeMarker;
  vm.newTrail = newTrail;
  // vm.setInterval = setInterval;
  vm.placeLatLngMarker = placeLatLngMarker;

  //Maps Service
  vm.MapsService = MapsService;

  //params specific to page
  MapsService.delete = false;
  MapsService.insert = "backInsert";
  MapsService.snap = false;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = true;
  MapsService.trailPath = [];
  MapsService.draggable = true;
  MapsService.trailInfo = {};
  MapsService.hikeClick = false;
  MapsService.currentMarker = {};
  MapsService.currentHike ={};
  MapsService.currentHike.start = 0;
  MapsService.recalculateStatus = "Recalculate Elevations";

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
      MapsService.map.setOptions({scrollwheel: false});
      centerByLocation();
    })
  }

  function newTrail(){
    vm.status = "Trail Saving...";
    MapsService.trailInfo.saved_url = MapsService.trailInfo.img_url;
    let newTrail = MapsService.trailInfo;
    if (!newTrail.title){
      newTrail.title = "Trail";
    }
    let encodeString = encoding.encodePath(MapsService.trailPath);
    newTrail.path = encodeString;
    MapsService.newTrail(newTrail).then(function (resp){
        vm.status = "Trail Saved";
        $state.go("root.topTrails")
      }, (reject) => {
        vm.status = "Save Failed"
      })
  }

  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint, $scope)
    MapsService.clickListener(marker, waypoint, $scope)
  }

  function placeLatLngMarker(){
    let waypoint = new google.maps.LatLng(MapsService.panel.lat, MapsService.panel.lng)
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint)
    MapsService.clickListener(marker, waypoint)
  }


// Jack's savvy centering shit -----------------------------------


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


// -----------------------------------------

}

BlazeNewController.$inject = ['MapsService', 'UsersService', '$scope', '$state'];
export { BlazeNewController }
