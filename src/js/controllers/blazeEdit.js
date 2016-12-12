
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
  MapsService.draggable = true;
  MapsService.hikeClick = false;

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;

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
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.saved_url = resp.data.img_url;
        MapsService.currentHike.path = MapsService.trailPath;

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.initSearch().then(MapsService.centerMap())
        MapsService.map.setMapTypeId('terrain');

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

  function setInterval(){
      let filteredPath = MapsService.filterPath(MapsService.panel.startInt, MapsService.panel.endInt);
      MapsService.createHikePoly(filteredPath);
      MapsService.centerMap();
      MapsService.chartMark(true);
  }
}

BlazeEditController.$inject = ['MapsService', 'UsersService', '$stateParams', '$state'];
export {BlazeEditController}
