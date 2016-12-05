
const mapId = "blazeEditMap"

function BlazeEditController (MapsService, $stateParams, $scope) {
  let vm = this;
  const draggable = true;

  vm.placeMarker = placeMarker;
  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;
  vm.MapsService = MapsService;
  // vm.chartWidth = 600;
  // vm.chartHeight = 300;
  vm.initSearch = initSearch;


  function init () {
    // let updateInput = document.getElementById('update-pac-input')
    let trail_id = $stateParams.id
    vm.status = "Edit a Trail!"
    vm.trailTitle = "Trail Title"
    vm.MapsService.delete = false;
    vm.MapsService.insert = "backInsert";

    MapsService.getMap(mapId).then(function (map) {
      MapsService.getTrail(trail_id, map, draggable).then(function (MapInfo){
        vm.path = MapInfo.path;
        vm.trailTitle = MapInfo.title;
        vm.map = map;
        vm.map.setMapTypeId('terrain');
        $scope.$apply();
        MapsService.initSearch(vm.map)
      });
    })
  }

  init();

  function placeMarker(event){
    MapsService.placeMarker(event, vm.path, vm.map);
  }


  function editTrail(){
    vm.status = "Trail Updating...";
    MapsService.editTrail(vm.path, vm.trailTitle, $stateParams.id)
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

  function initSearch (map) {
    MapsService.searchBox(map)
  }
}

BlazeEditController.$inject = ['MapsService', '$stateParams', '$scope'];
export {BlazeEditController}
