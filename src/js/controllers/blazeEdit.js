
const mapId = "blazeEditMap"

function BlazeEditController (MapsService, $stateParams, $scope) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  MapsService.insert = "backInsert";
  MapsService.newMarkerAllow = true;
  MapsService.snap = false;
  MapsService.markerArray = [];
  MapsService.panel={};

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
    //initial variables
    vm.status = "Edit a Trail!";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.getTrail(map).then(function (resp){
        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.trailTitle = resp.data.title;
        MapsService.trailDistance = spherical.computeLength(MapsService.trailPath);

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.centerMap();
        MapsService.initSearch();

        //add trail Markers and add listeners;
        MapsService.trailPath.forEach(function (waypoint) {
          let marker = MapsService.loadTrailMarker(waypoint)
          MapsService.dragListener(marker, waypoint, $scope)
          MapsService.clickListener(marker, waypoint, $scope)
        });
        MapsService.initChart(MapsService.trailPath)
      })
    })
  }

  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint, $scope)
    MapsService.clickListener(marker, wayoint, $scope)
  }


  function editTrail(){
    vm.status = "Trail Updating...";
    let newTrail = {};
    let encodeString = encoding.encodePath(MapsService.trailPath);
    newTrail.path = encodeString;
    newTrail.title = MapsService.trailTitle;
    newTrail.length = spherical.computeLength(MapsService.trailPath)*metersMilesConversion;
    newTrail.description = vm.trailDescription;
    newTrail.image_url = vm.trailImage_url;
    MapsService.editTrail($stateParams.id, newTrail).then(function (resp) {    
        // $scope.$apply(function (){vm.status = "Update Completed";});
        vm.status = "Update Completed";
      })
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

BlazeEditController.$inject = ['MapsService', '$stateParams', '$scope'];
export {BlazeEditController}
