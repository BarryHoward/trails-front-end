const mapId = "viewMap";

function ViewController (MapsService, $stateParams, $scope) {
  let vm = this;
  const blaze = false;
  const point = true;
  const draggable = false;

  init();

  function init () {
    let trail_id = $stateParams.id
    vm.status = "View a Trail!"

    MapsService.getMap(mapId).then(function (map) {
      MapsService.getTrail(trail_id, map, blaze, point, draggable).then(function (MapInfo){
        vm.path = MapInfo.path;
        vm.trailTitle = MapInfo.title;
        vm.map = map;
        vm.map.setMapTypeId('terrain');
        $scope.$apply();
      });
    })
  }

}

ViewController.$inject = ['MapsService', '$stateParams', '$scope'];
export {ViewController}
