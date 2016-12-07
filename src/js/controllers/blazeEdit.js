
const mapId = "blazeEditMap"

function BlazeEditController (MapsService, UsersService, $stateParams, $scope) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  MapsService.insert = "backInsert";
  MapsService.newMarkerAllow = true;
  MapsService.snap = false;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = true;

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
    vm.status = "Edit a Trail!";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.getTrail(map).then(function (resp){
        console.log(resp)
        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.distance = Number(resp.data.distance.toFixed(2));
        MapsService.trailInfo.max_elevation = Number(resp.data.max_elevation.toFixed(2));
        MapsService.trailInfo.min_elevation = Number(resp.data.min_elevation.toFixed(2));
        MapsService.trailInfo.saved_url = resp.data.img_url;

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.centerMap();
        MapsService.initSearch();
        MapsService.map.setMapTypeId('terrain');

        //add trail Markers and add listeners;
        MapsService.trailPath.forEach(function (waypoint) {
          let marker = MapsService.loadTrailMarker(waypoint)
          MapsService.dragListener(marker, waypoint, $scope)
          MapsService.clickListener(marker, waypoint, $scope)      
        });
        MapsService.initChart(MapsService.trailPath, MapsService.markerArray)

      })
    })
  }

  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint, $scope)
    MapsService.clickListener(marker, waypoint, $scope)
  }


  function editTrail(){
    vm.status = "Trail Updating...";
    let encodeString = encoding.encodePath(MapsService.trailPath);
    let newTrail = MapsService.trailInfo;
    newTrail.path = encodeString;
    newTrail.distance = Number((spherical.computeLength(MapsService.trailPath)*metersMilesConversion).toFixed(2));;
    MapsService.trailInfo.saved_url = MapsService.trailInfo.img_url;
    MapsService.editTrail($stateParams.id, newTrail).then(function (resp) {
        // $scope.$apply(function (){vm.status = "Update Completed";});
        console.log(resp)
        vm.status = "Update Completed";
      }, (reject) => {
        console.log(reject)
      });
  }

  function deleteTrail(){
    MapsService.deleteTrail($stateParams.id).then((resp) => {
      // $scope.$apply(function(){vm.status = "Trail Deleted!"});
      vm.status = "Trail Deleted!"
    }, (reject) => {
        console.log(reject)
      });
  }
}

BlazeEditController.$inject = ['MapsService', 'UsersService', '$stateParams', '$scope'];
export {BlazeEditController}
