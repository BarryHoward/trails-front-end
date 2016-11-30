
const mapId = "trailUpdateMap"

function TrailUpdateController (TrailsService, $stateParams) {
  let vm = this;

  vm.getTrail = getTrail;
  vm.placeMarker = placeMarker;
  vm.updateTrail = updateTrail;

  
  function init () {
    let trail_id = $stateParams.id
    vm.markers = [];

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
          TrailsService.loadMarker(vm.map, vm.markers, waypoint)
        });
        TrailsService.drawLine(vm.map, vm.markers)
        vm.trailTitle = resp.data.trailInfo.title;
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
    TrailsService.updateTrail(newTrail, $stateParams.id)
  }



}

TrailUpdateController.$inject = ['TrailsService', '$stateParams'];
export {TrailUpdateController}
