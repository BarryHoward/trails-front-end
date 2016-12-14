
const mapId = "blazeEditMap"

function BlazeEditController (MapsService, UsersService, $stateParams, $state) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  MapsService.insert = "backInsert";
  MapsService.snap = false;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = true;
  MapsService.trailInfo = {};
  MapsService.trailPath = [];
  MapsService.draggable = true;
  MapsService.hikeClick = false;
  MapsService.currentMarker = {};
  MapsService.currentHike = {};
  MapsService.currentHike.start = 0;
  MapsService.recalculateStatus = "Recalculate Elevations";

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;
  // vm.setInterval = setInterval;
  vm.placeLatLngMarker = placeLatLngMarker;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;

  init();

  function init(){

    vm.loggedIn = UsersService.isLoggedIn();
    //initial variables
    vm.status = "Save Changes";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.getTrail(map).then(function (resp){

        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.setOffSetArray(spherical.computeLength(MapsService.trailPath));
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.saved_url = resp.data.img_url;
        MapsService.currentHike.path = MapsService.trailPath;

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.centerMap()
        MapsService.map.setMapTypeId('terrain');
        MapsService.map.setOptions({scrollwheel: false});

        //add trail Markers and add listeners;
        MapsService.trailPath.forEach(function (waypoint) {
          let marker = MapsService.loadTrailMarker(waypoint);
          MapsService.dragListener(marker, waypoint);
          MapsService.clickListener(marker, waypoint);
        });
        MapsService.initChart();

      })
    })
  }

  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint)
    MapsService.clickListener(marker, waypoint)
  }


  function editTrail(){
    vm.status = "Trail Updating...";
    let newTrail = MapsService.trailInfo;
    if (!newTrail.title){
      newTrail.title = "Trail";
    }
    let encodeString = encoding.encodePath(MapsService.trailPath);
    newTrail.path = encodeString;

    MapsService.editTrail($stateParams.id, newTrail).then(function (resp) {
        MapsService.trailInfo.saved_url = MapsService.trailInfo.img_url;
        vm.status = "Update Completed";
      }, (reject) => {
        console.log(reject)
      });
  }

  function deleteTrail(){
    MapsService.deleteTrail($stateParams.id).then((resp) => {
      vm.status = "Trail Deleted!"
      $state.go("root.topTrails")
    }, (reject) => {
        console.log(reject)
      });
  }

  function placeLatLngMarker(){
    let waypoint = new google.maps.LatLng(MapsService.panel.lat, MapsService.panel.lng)
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint)
    MapsService.clickListener(marker, waypoint)
  }
}

BlazeEditController.$inject = ['MapsService', 'UsersService', '$stateParams', '$state'];
export {BlazeEditController}
