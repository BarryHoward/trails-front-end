const mapId = "trailViewMap";

function TrailViewController (MapsService, $stateParams, $scope) {
  let vm = this;
  const draggable = false;

  init();

  function init () {
    let trail_id = $stateParams.id
    vm.markers = [];
    vm.status = "View a Trail!"

    MapsService.getMap(mapId).then(function (map) {
      MapsService.getTrail(trail_id, map, draggable).then(function (MapInfo){
        vm.markers = MapInfo.markers;
        vm.trailTitle = MapInfo.title;
        vm.map = map;
        $scope.$apply();
      });
    })
  }

}

TrailViewController.$inject = ['MapsService', '$stateParams', '$scope'];
export {TrailViewController}
