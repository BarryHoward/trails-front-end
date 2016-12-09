
const mapId = "hikeMap"

function HikeController (MapsService, UsersService, $stateParams) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  MapsService.newMarkerAllow = true;
  MapsService.snap = true;
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.regraphElevation = true;
  MapsService.trailInfo = {};
  MapsService.hikedTrailPoly = [];

  vm.MapsService = MapsService;
  vm.setInterval = setInterval;

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
            MapsService.dragListener(marker, waypoint)
            MapsService.clickListener(marker, waypoint)
          });
          MapsService.initChart(MapsService.trailPath, MapsService.markerArray, true)
        })


        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.currentPath = MapsService.trailPath;
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.distance = Number(resp.data.distance.toFixed(2));
        MapsService.trailInfo.max_elevation = Number(resp.data.max_elevation.toFixed(2));
        MapsService.trailInfo.min_elevation = Number(resp.data.min_elevation.toFixed(2));

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.map.setMapTypeId('terrain');
        MapsService.centerMap();
        MapsService.initSearch();


//RIGHT HERE!!!!!!!!!!
//         let filteredPath = MapsService.filterPath(4, 5);
// /// -----------------------
//         MapsService.createHikePoly(filteredPath);
//         MapsService.centerMap();
        // console.log(filteredPath)
        // filteredPath.forEach(function(waypoint){
        //   MapsService.placeMarker(waypoint);
        // })
      })
    })
  }


  function setInterval(){
    MapsService.filterPath(MapsService.panel.startInt, MapsService.panel.endInt);
  }




}

HikeController.$inject = ['MapsService', 'UsersService', '$stateParams'];
export {HikeController}