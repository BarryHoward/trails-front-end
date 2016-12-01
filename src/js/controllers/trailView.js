const mapId = "trailViewMap";

function TrailViewController (TrailsService, $stateParams) {
  let vm = this;

  vm.getTrail = getTrail;
  function init () {
    let trail_id = $stateParams.id
    vm.markers = [];

    TrailsService.getMap(mapId).then(function (map) {
      vm.map = map;
      console.log(vm.map)
      vm.getTrail(trail_id);
    })
  }

  init();

  function getTrail(id){
    TrailsService.getTrail(id).then(
      (resp) => {
        resp.data.waypoints.forEach(function (waypoint) {
          TrailsService.loadMarker(vm.map, vm.markers, waypoint, false)
        });
        TrailsService.drawLine(vm.map, vm.markers)
        TrailsService.getElevation(vm.markers);
        vm.trailTitle = resp.data.trailInfo.title;
      }, (reject) => {
          console.log(reject)
      });
  }
}

TrailViewController.$inject = ['TrailsService', '$stateParams'];
export {TrailViewController}
