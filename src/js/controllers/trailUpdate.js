
const mapId = "trailUpdateMap"

function TrailUpdateController (TrailsService, $stateParams, $scope) {
  let vm = this;

  vm.placeMarker = placeMarker;
  vm.updateTrail = updateTrail;
  vm.deleteTrail = deleteTrail;
  vm.TrailsService = TrailsService;


  function init () {
    let trail_id = $stateParams.id
    vm.markers = [];
    vm.status = "Update a Trail!"
    vm.TrailsService.delete = false;
    vm.TrailsService.insert = "backInsert";

    TrailsService.getMap(mapId).then(function (map) {
      console.log("got map")

      TrailsService.getTrail(trail_id, map).then(function (MapInfo){
        vm.markers = MapInfo.markers;
        vm.trailTitle = MapInfo.title;
        vm.map = map;
        $scope.$apply();
      });
    })
  }

  init();

  function placeMarker(event){
    TrailsService.placeMarker(vm.markers, vm.map, event);
  }

  
  function updateTrail(){
    vm.status = "Trail Updating...";
    TrailsService.updateTrail(vm.markers, vm.trailTitle, $stateParams.id)
      .then(function (resp) {
        vm.status = "Update Completed";
        $scope.$apply();
      })
  }

  function deleteTrail(){
    TrailsService.deleteTrail($stateParams.id).then((resp) => {
      vm.status = "Trail Deleted!"
      $scope.$apply();
    }, (reject) => {
        console.log(reject)
      });
  }



}

TrailUpdateController.$inject = ['TrailsService', '$stateParams', '$scope'];
export {TrailUpdateController}
