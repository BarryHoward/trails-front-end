
const mapId = "hikeMap"

function HikeController (MapsService, UsersService, $stateParams) {
  let vm = this;

  //params specific to page
  MapsService.trail_id = $stateParams.trailId;
  MapsService.user_id = $stateParams.userId;
  MapsService.draggable = false;
  MapsService.regraphElevation = true;


  MapsService.hikedArray = [];
  MapsService.markerArray = [];
  MapsService.panel={};
  MapsService.trailInfo = {};
  MapsService.currentMarker = {};
  MapsService.currentHike ={};
  MapsService.currentHike.start = 0;
  MapsService.chartOffset = 0;

  vm.loggedIn = UsersService.isLoggedIn();
  vm.status = "Hike a Trail";


  vm.MapsService = MapsService;
  vm.setInterval = setInterval;
  vm.saveHike = saveHike;
  vm.editHike = editHike;

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;

  init();

  function init(){


    MapsService.getMap(mapId).then(function (map){
      MapsService.map=map;
      MapsService.map.setMapTypeId('terrain');
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
        MapsService.initSearch().then(MapsService.centerMap())

        MapsService.getHikes().then(function(resp){
          console.log(resp.data)
          let previousHikes = resp.data;
          previousHikes.forEach(function(hike){
            hike.path = encoding.decodePath(hike.path);
            MapsService.hikedArray.push(hike);
            hike.poly = MapsService.createHikedPoly(hike.path);
          })
          if (MapsService.hikedArray.length){
            MapsService.showHikedPoly();
          } else {
            MapsService.showTrailPoly();
          }
        })

      })
    })
  }

  function saveHike(){
    vm.status = "Adding Hike...";
    MapsService.hikedArray.push(vm.currentHike);
    let newHike = MapsService.panel;
    newHike.trail_id = Number($stateParams.id)
    let encodeString = encoding.encodePath(MapsService.currentHike.path);
    newHike.path = encodeString;
    newHike.trail_id = $stateParams.trailId;

    MapsService.saveHike(newHike).then(function (resp) {
      console.log(resp)
        vm.status = "Hike Saved";
        newHike.id = resp.data.id
        MapsService.safeApply(MapsService.hikedArray.push(newHike))
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
      MapsService.filterTrailPath(Number(MapsService.panel.start), Number(MapsService.panel.end));
      MapsService.filterChartPath(Number(MapsService.panel.start), Number(MapsService.panel.end))
  }




}

HikeController.$inject = ['MapsService', 'UsersService', '$stateParams'];
export {HikeController}