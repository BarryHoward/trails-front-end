
const mapId = "trailUpdateMap"

function TrailUpdateController (MapsService, $stateParams, $scope) {
  let vm = this;
  const draggable = true;

  vm.placeMarker = placeMarker;
  vm.updateTrail = updateTrail;
  vm.deleteTrail = deleteTrail;
  vm.MapsService = MapsService;
  vm.chartWidth = 600;
  vm.chartHeight = 300;


  function init () {
    let trail_id = $stateParams.id
    vm.markers = [];
    vm.status = "Update a Trail!"
    vm.trailTitle = "Trail Title"
    vm.MapsService.delete = false;
    vm.MapsService.insert = "backInsert";

    MapsService.getMap(mapId).then(function (map) {
      MapsService.getTrail(trail_id, map, draggable).then(function (MapInfo){
        vm.markers = MapInfo.markers;
        vm.trailTitle = MapInfo.title;
        vm.map = map;
        vm.map.setMapTypeId('terrain');
        $scope.$apply();
      });
    })
  }

  init();

  function placeMarker(event){
    MapsService.placeMarker(vm.markers, vm.map, event);
  }

  
  function updateTrail(){
    vm.status = "Trail Updating...";
    MapsService.updateTrail(vm.markers, vm.trailTitle, $stateParams.id)
      .then(function (resp) {
        vm.status = "Update Completed";
        $scope.$apply();
      })
  }

  function deleteTrail(){
    MapsService.deleteTrail($stateParams.id).then((resp) => {
      vm.status = "Trail Deleted!"
      $scope.$apply();
    }, (reject) => {
        console.log(reject)
      });
  }
}

TrailUpdateController.$inject = ['MapsService', '$stateParams', '$scope'];
export {TrailUpdateController}
