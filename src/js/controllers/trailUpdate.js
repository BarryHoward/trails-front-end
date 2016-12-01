
const mapId = "trailUpdateMap"

function TrailUpdateController (TrailsService, $stateParams) {
  let vm = this;

  vm.getTrail = getTrail;
  vm.placeMarker = placeMarker;
  vm.updateTrail = updateTrail;
  vm.deleteTrail = deleteTrail;
  vm.TrailsService = TrailsService;


  function init () {
    let trail_id = $stateParams.id
    vm.markers = [];
    vm.status = "Update a Trail!"
    vm.TrailsService.delete = false;
    vm.TrailsService.insert = "midInsert";


    TrailsService.getMap(mapId).then(function (map) {
      vm.map = map;

      vm.getTrail(trail_id);
    })
  }

  init();


  function getTrail(id){
    TrailsService.getTrail(id).then(
      (resp) => {
        resp.data.waypoints.forEach(function (waypoint) {
          TrailsService.loadMarker(vm.map, vm.markers, waypoint, true)
        });
        TrailsService.drawLine(vm.map, vm.markers)
        TrailsService.getElevation(vm.markers);
        TrailsService.initMap(vm.map, vm.markers);
        vm.trailTitle = resp.data.trailInfo.title;
        console.log("markers", vm.markers)
      }, (reject) => {
          console.log(reject)
      });
  }

  function placeMarker(event){
    TrailsService.placeMarker(vm.markers, vm.map, event);
  }

  function updateTrail(){
    let newTrail = {};
    newTrail.waypoints = [];
    vm.markers.forEach(function (marker) {
      let waypoint = {};
      waypoint.lat = marker.lat;
      waypoint.lng = marker.lng;
      newTrail.waypoints.push(waypoint);
    });
    newTrail.title = vm.trailTitle;
    TrailsService.updateTrail(newTrail, $stateParams.id).then((resp) => {
        console.log(resp.data)
        vm.status = "Trail Updated!"
      }, (reject) => {
        console.log(reject)
      });
  }

  function deleteTrail(){
    TrailsService.deleteTrail($stateParams.id).then((resp) => {
      vm.status = "Trail Deleted!"
    }, (reject) => {
        console.log(reject)
      });
  }



}

TrailUpdateController.$inject = ['TrailsService', '$stateParams'];
export {TrailUpdateController}
