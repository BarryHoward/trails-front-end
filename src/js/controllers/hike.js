
const mapId = "hikeMap"

function HikeController (MapsService, UsersService, $stateParams) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.id;
  MapsService.delete = false;
  MapsService.newMarkerAllow = true;
  MapsService.snap = true;
  MapsService.draggable = false;

  MapsService.regraphElevation = true;


  vm.MapsService = MapsService;
  vm.setInterval = setInterval;
  vm.saveHike = saveHike;

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
          MapsService.initChart()
        })


        //set trail data
        MapsService.trailPath = encoding.decodePath(resp.data.path);
        MapsService.currentHike.path = MapsService.trailPath;
        MapsService.trailInfo = resp.data;
        MapsService.trailInfo.distance = Number(resp.data.distance.toFixed(2));
        MapsService.trailInfo.max_elevation = Number(resp.data.max_elevation.toFixed(2));
        MapsService.trailInfo.min_elevation = Number(resp.data.min_elevation.toFixed(2));

        //create line, center map, and initialize search bar
        MapsService.createTrailPoly();
        MapsService.map.setMapTypeId('terrain');
        MapsService.centerMap();
        MapsService.initSearch();

      })
    })
  }

  function saveHike(){
    vm.status = "Adding Hike...";
    vm.hikedArray.push(vm.currentHike);
    let newHike = MapsService.panel;
    newHike.trail_id = Number($stateParams.id)
    let encodeString = encoding.encodePath(MapsService.currentHike.path);
    newHike.path = encodeString;
    MapsService.saveHike(newHike).then(function (resp) {
      console.log(resp)
        vm.status = "Hike Saved";
      }, (reject) => {
        console.log(reject)
    })
  }

  function editHike(){
    vm.status = "Editing Hike...";
    let newHike = MapsService.panel;
    let encodeString = encoding.encodePath(MapsService.currentHike.path);
    newHike.path = encodeString;
    MapsService.editHike(newHike.id, newHike).then(function (resp) {
      console.log(resp)
        vm.status = "Hike Edited";
      }, (reject) => {
        console.log(reject)
    })
  }


  function setInterval(){
    let fullPath = MapsService.filterPath(MapsService.panel.start, MapsService.panel.end, true);
    if ((MapsService.panel.endInt - MapsService.panel.startInt)>20){
      let chartPath = MapsService.filterPath(MapsService.panel.startInt, MapsService.panel.startInt + 20, false);
      MapsService.chartHike(chartPath);
    } else {
      MapsService.chartHike(fullPath);
    }
  }




}

HikeController.$inject = ['MapsService', 'UsersService', '$stateParams'];
export {HikeController}