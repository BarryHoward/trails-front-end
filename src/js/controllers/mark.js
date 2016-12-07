
const mapId = "markMap"

function MarkController (MapsService, UsersService, $stateParams, $scope) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  // MapsService.insert = "backInsert";
  MapsService.newMarkerAllow = true;
  MapsService.snap = true;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = false;

  vm.MapsService = MapsService;
  vm.placeMarker = placeMarker;
  vm.savePoint = savePoint;
  vm.editPoint = editPoint;
  vm.deletePoint = deletePoint;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;

  init();


  function init(){
    vm.loggedIn = UsersService.isLoggedIn();
    //initial variables
    vm.status = "Add Points to a Trail!";

    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.getTrail(map).then(function (resp){

        //add trail Markers and add listeners;
        MapsService.getPoints().then(function(pointsResp){
          let points = pointsResp.data;
          points.forEach(function (waypoint) {
            let marker = MapsService.loadPointMarker(waypoint)
            MapsService.dragListener(marker, waypoint, $scope)
            MapsService.clickListener(marker, waypoint, $scope)
          });
          MapsService.initChart(MapsService.trailPath, MapsService.markerArray, true)
        })


        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.distance = Number(resp.data.distance.toFixed(2));
        MapsService.trailInfo.max_elevation = Number(resp.data.max_elevation.toFixed(2));
        MapsService.trailInfo.min_elevation = Number(resp.data.min_elevation.toFixed(2));

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.map.setMapTypeId('terrain');
        MapsService.centerMap();
        MapsService.initSearch();
        console.log(MapsService)


      })
    })
  }


  function placeMarker(event){
    let waypoint = event.latLng;
    let marker = MapsService.placeMarker(waypoint);
    MapsService.dragListener(marker, waypoint, $scope)
    MapsService.clickListener(marker, waypoint, $scope)
  }

  function savePoint(){
    MapsService.newMarkerAllow = true;
    MapsService.panel.trail_id = Number($stateParams.id);
    MapsService.savePoint(MapsService.panel).then((resp) => {
      // console.log(resp)
      vm.MapsService.currentMarker.id = resp.data.id;
    })
  }

  function editPoint(){
    MapsService.newMarkerAllow = true;
    MapsService.panel.id = MapsService.currentMarker.id;
    MapsService.editPoint(MapsService.panel).then((resp) => {
      // console.log(resp)

    })
  }

  function deletePoint(){
    MapsService.deletePoint().then((resp) => {
      MapsService.newMarker = true;
      let markIndex = MapsService.markerArray.indexOf(MapsService.markerArray);
      MapsService.markerArray.splice(markIndex, 1);
      MapsService.currentMarker.setMap(null); 
      MapsService.chartMark();
      MapsService.updatePanel();
    })
  }

}

MarkController.$inject = ['MapsService', 'UsersService', '$stateParams', '$scope'];
export {MarkController}
