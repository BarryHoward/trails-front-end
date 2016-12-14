
//-- Chart Icons dont show up on initial graph sometimes.  Other times they're slow.

function MapsService ($http, ChartsService, UsersService, NgMap, icons, $rootScope, $state) {

  const SERVER = "https://trails-back-end.herokuapp.com/";

  let vm = this;

  vm.getMap = getMap;
  vm.getTrail = getTrail;
  vm.getPoints = getPoints;
  vm.getHikes = getHikes;
  vm.createTrailPoly = createTrailPoly;
  vm.centerMap = centerMap;
  vm.initSearch = initSearch;
  vm.loadTrailMarker = loadTrailMarker;
  vm.loadPointMarker = loadPointMarker;
  vm.dragListener = dragListener;
  vm.clickListener = clickListener;
  vm.closestPath = closestPath;
  vm.placeMarker = placeMarker;

  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;
  vm.getTrailList = getTrailList;
  vm.saveHike = saveHike;
  vm.editHike = editHike;
  vm.deleteHike = deleteHike;
  vm.savePoint = savePoint;
  vm.editPoint = editPoint;
  vm.deletePoint = deletePoint;
  vm.initChart = initChart;
  vm.chartHike = chartHike;
  vm.chartMark = chartMark;
  vm.updateMarker = updateMarker;
  vm.updateHike = updateHike;
  vm.updateHikedPanel = updateHikedPanel;
  vm.updateMarkPanel = updateMarkPanel;
  vm.filterTrailPath = filterTrailPath;
  vm.filterChartPath = filterChartPath;
  vm.distToWaypoint = distToWaypoint;
  vm.createHikedPoly = createHikedPoly;
  vm.createCurrentPoly = createCurrentPoly;
  vm.showTrailPoly = showTrailPoly;
  vm.showHikedPoly = showHikedPoly;
  vm.showCurrentPoly = showCurrentPoly;
  vm.showSingleHiked = showSingleHiked;
  vm.safeApply = safeApply;
  vm.nextChart = nextChart;
  vm.prevChart = prevChart;
  vm.chooseChart = chooseChart;
  vm.setOffSetArray = setOffSetArray;
  vm.startInt = startInt;
  vm.endInt = endInt;
  vm.setInterval = setInterval;
  vm.clearCurrent = clearCurrent;
  vm.findMaxMin = findMaxMin;
  vm.goToBlaze = goToBlaze;
  vm.goToMark = goToMark;
  vm.goToHike = goToHike;


  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;
  const elevator = new google.maps.ElevationService;


  vm.hikedArray = [];
  vm.markerArray = [];
  vm.panel={};
  vm.trailInfo = {};
  vm.currentMarker = {};
  vm.currentHike ={};
  vm.currentHike.start = 0;
  vm.chartOffset = 0;
  vm.hikedTrailColor = ["#00FFFF", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF"]


// ----- Reset markers
  $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState) =>{
    console.log(toState.name)
    if (toState.name !== "root.trails.hike.modal" && fromState.name !== "root.trails.hike.modal"){
      vm.markerArray.forEach(function(marker){
        marker.setMap(null);
      })
      vm.hikedArray.forEach(function(hike){
        hike.poly.setMap(null);
      })
   }
  })

// -----------------------------------------------------------------------

  // Get map

  function getMap(id){
    return NgMap.getMap(id)
  }

// -----------------------------------------------------------------------

  // Get existing Trail

  function getTrail(){
    return $http.get(`${SERVER}trails/${vm.trail_id}`);
  }

  function getPoints(){
    return $http.get(`${SERVER}trails/${vm.trail_id}/points`);
  }

  function getHikes(){
    return $http.get(`${SERVER}hikes/users/${vm.user_id}/trails/${vm.trail_id}`)
  }
// -----------------------------------------------------------------------

  //Create line and Center map



  function centerMap() {
    var latlngbounds = new google.maps.LatLngBounds();
    vm.currentHike.path.forEach(function (waypoint) {
      latlngbounds.extend(waypoint)
    })
    vm.map.fitBounds(latlngbounds);
  }

  function initSearch () {
    return new Promise(function(resolve) {
      var input = document.getElementById('pac-input')
      var searchBox = new google.maps.places.SearchBox(input);
      vm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      google.maps.event.trigger(vm.map, "resize");
      //Listener for selecting an autocomplete option from the dropdown
      vm.map.addListener('bounds_changed', function() {
        google.maps.event.trigger(vm.map, "resize");
        searchBox.setBounds(vm.map.getBounds());
      });
      // get place information when the user makes a selection (may leave this out because it's not displaying anything currently)
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
          return;
        }
        // For each place, get the name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          if (place.geometry.viewport) {
            // Set the viewport if available. This makes the map display more mobile-friendly. Only for geocodes.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        vm.map.fitBounds(bounds);
      });
      resolve();
    });
  }

// ------------------------------------------------------------------------

  // Load Markers

  function loadTrailMarker(waypoint){
    var marker = new google.maps.Marker({
        map: vm.map,
        position: waypoint,
        icon: icons.blaze,
        draggable: true
    });
    vm.markerArray.push(marker)
    return marker;
  }

  function loadPointMarker(waypoint){
    let position = new google.maps.LatLng(waypoint.lat, waypoint.lng)
    let insert = closestPath(position)
    var marker = new google.maps.Marker({
        map: vm.map,
        position: position,
        icon: icons.pointSaved,
        draggable: vm.draggable
    });
    marker.title = waypoint.title;
    marker.description = waypoint.description;
    marker.img_url = waypoint.img_url;
    marker.shelter = waypoint.shelter;
    marker.campsite = waypoint.campsite;
    marker.water = waypoint.water;
    marker.view = waypoint.view;
    marker.road = waypoint.road;
    marker.parking = waypoint.parking;
    marker.resupply = waypoint.resupply;
    marker.distance = insert[2]
    marker.id = waypoint.id;
    vm.markerArray.push(marker)
    return marker;
  }

// ----------------------------------------------------------------------

  // Listeners

  function dragListener (marker, waypoint){
      google.maps.event.addListener(marker, 'dragend', function (event){
        if (!vm.snap){
          var index = vm.trailPath.indexOf(waypoint);
          waypoint = marker.getPosition();
          vm.trailPath[index] = waypoint;
          vm.trailPoly.setPath(vm.trailPath);
          vm.currentMarker = marker;
          console.log(vm.currentMarker)
          updateMarkPanel(true);
        } else {
          waypoint = marker.getPosition();
          let insert = closestPath(waypoint);
          waypoint = spherical.interpolate(vm.trailPath[insert[0]-1], vm.trailPath[insert[0]], insert[1])
          marker.setPosition(waypoint);
          marker.setIcon(icons.pointUnsaved);
          marker.distance = round(insert[2], 2);
          vm.currentMarker = marker;
          updateMarkPanel(true);
        }
        if(vm.trailPath.length > 1) {
          chartMark();
        }
    })
  }

  function clickListener (marker, waypoint){
      google.maps.event.addListener(marker, 'click', function (event){
        if (!vm.hikeClick){
          waypoint = marker.getPosition();
          vm.pointSaveStatus = "Save Point"
          vm.pointEditStatus = "Edit Point"
          vm.pointDeleteStatus = "Delete Point"
          if (vm.delete){
            if (!vm.snap){
              var index = vm.trailPath.indexOf(waypoint);
              vm.trailPath.splice(index, 1);
              vm.trailPoly.setPath(vm.trailPath);
            }
            var markIndex = vm.markerArray.indexOf(marker);
            vm.markerArray.splice(markIndex, 1);
            marker.setMap(null);
            if (vm.trailPath.length > 1) {
              chartMark();
            }
            vm.currentMarker = {};
            updateMarkPanel(true)
          } else {
            vm.currentMarker = marker;
            updateMarkPanel(true)
          }
        } else {
          vm.currentMarker = marker;
          $state.go("root.trails.hike.modal", {'id': marker.id})
        }


    })
  }

// -----------------------------------------------------------------------

  //Closest Path (snap function)

function closestPath(waypoint){
  var pathDistances = [];
  var percentage = [];
  for (var i=0; i<vm.trailPath.length-1; i++){
    let a = spherical.computeDistanceBetween(waypoint, vm.trailPath[i+1]);
    let b = spherical.computeDistanceBetween(waypoint, vm.trailPath[i]);
    let c = spherical.computeDistanceBetween(vm.trailPath[i], vm.trailPath[i+1]);
    let A = Math.acos(Math.min((Math.pow(b,2)+Math.pow(c,2)-Math.pow(a,2))/(2*b*c), 1));
    let B = Math.acos(Math.min((Math.pow(c,2)+Math.pow(a,2)-Math.pow(b,2))/(2*a*c), 1));
    let C = Math.PI-B-A;

    if (A > (Math.PI/2)){
      pathDistances[i] = b;
      percentage[i]=0;
    } else if (B > (Math.PI/2)){
      pathDistances[i] = a;
      percentage[i]=1;
    } else {
      pathDistances[i] = a*Math.sin(B);
      percentage[i]=Math.sqrt(Math.pow(b,2) - Math.pow(pathDistances[i],2))/c;
    }
  }
  let minIndex = pathDistances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0) + 1;
  let finalPercentage = percentage[minIndex-1];
  let path1 = vm.trailPath.slice(0, [minIndex]);
  let path2 = vm.trailPath.slice(0, [minIndex+1]);
  let distance = (spherical.computeLength(path1)+ (spherical.computeLength(path2) - spherical.computeLength(path1))*finalPercentage)
  * metersMilesConversion;

  return [minIndex, finalPercentage, distance];
}

  // --------------------------------------------------------------

    //Place marker

  function placeMarker(waypoint) {
    if (!vm.delete){
      var markerDistance;
      //change path and change waypoint if snap
      if ((vm.insert === "midInsert" || vm.snap) && vm.trailPath.length>0){
        var insert = closestPath(waypoint)
        markerDistance = insert[2];
        if (vm.snap){
          var snapWaypoint = spherical.interpolate(vm.trailPath[insert[0]-1], vm.trailPath[insert[0]], insert[1])
          waypoint = snapWaypoint;
        } else {
          vm.trailPath.splice(insert[0], 0, waypoint);
          vm.currentHike.path = vm.trailPath;
          vm.trailPoly.setPath(vm.trailPath);
        }

      } else if (vm.insert === "frontInsert") {
        vm.trailPath.unshift(waypoint);
        vm.currentHike.path = vm.trailPath;
        vm.trailPoly.setPath(vm.trailPath);
        markerDistance = 0;
      } else {
        vm.trailPath.push(waypoint);
        vm.currentHike.path = vm.trailPath;
        vm.trailPoly.setPath(vm.trailPath);
        markerDistance = spherical.computeLength(vm.trailPath)*metersMilesConversion;
      }
      //create marker
      var marker = new google.maps.Marker({
          position: waypoint,
          map: vm.map,
          draggable: true,
          icon: icons.blaze
      });
      //set to unsaved icon if snap
      if (vm.snap){
        marker.setIcon(icons.pointUnsaved);
      }
      //re-chart
      if(vm.trailPath.length > 1) {
        chartMark();
      }
      marker.distance = round(markerDistance, 2);
      vm.markerArray.push(marker)
      vm.currentMarker = marker;
      updateMarkPanel(true);
      return marker;
    }

  }

  // ----------------------------------------------------------------------------------

    // update Panel/Marker

  function updateMarkPanel(mark){

    safeApply(function(){
      if (Object.keys(vm.currentMarker).length && mark){
        vm.point
        let waypoint = vm.currentMarker.getPosition();
        vm.panel.lat = waypoint.lat();
        vm.panel.lng = waypoint.lng();
        vm.panel.title = vm.currentMarker.title;
        vm.panel.description = vm.currentMarker.description;
        vm.panel.img_url = vm.currentMarker.img_url;
        vm.panel.distance = vm.currentMarker.distance;
        vm.panel.shelter = vm.currentMarker.shelter;
        vm.panel.campsite = vm.currentMarker.campsite;
        vm.panel.water = vm.currentMarker.water;
        vm.panel.view = vm.currentMarker.view;
        vm.panel.road = vm.currentMarker.road;
        vm.panel.parking = vm.currentMarker.parking;
        vm.panel.resupply = vm.currentMarker.resupply;
      } else if (vm.currentHike && !mark){
        vm.panel = vm.currentHike
      } else {
        vm.panel = {};
      }
    })
  }



  function updateMarker(){
      if (vm.currentMarker){
        vm.currentMarker.lat = vm.panel.lat;
        vm.currentMarker.lng = vm.panel.lng;
        vm.currentMarker.title = vm.panel.title;
        vm.currentMarker.description = vm.panel.description;
        vm.currentMarker.img_url = vm.panel.img_url;
        vm.currentMarker.distance = vm.panel.distance;
        vm.currentMarker.shelter = vm.panel.shelter;
        vm.currentMarker.campsite = vm.panel.campsite;
        vm.currentMarker.water = vm.panel.water;
        vm.currentMarker.view = vm.panel.view;
        vm.currentMarker.road = vm.panel.road;
        vm.currentMarker.parking = vm.panel.parking;
        vm.currentMarker.resupply = vm.panel.resupply;
      } else {
        vm.currentMarker = {};
      }
  }

  function updateHike(){
    if (Object.keys(vm.currentHike).length){
      vm.currentHike.title = vm.panel.title;
      vm.currentHike.description = vm.panel.description;
      vm.currentHike.start = Number(vm.panel.start);
      vm.currentHike.end = Number(vm.panel.end);
      vm.currentHike.start_date = vm.panel.start_date;
      vm.currentHike.end_date = vm.panel.end_date;
    } else {
      vm.currentHike = {};
    }
  }

  function updateHikedPanel(){
      safeApply(function(){
      if (Object.keys(vm.currentHike).length){
        vm.panel.title = vm.currentHike.title;
        vm.panel.description = vm.currentHike.description;
        vm.panel.start = vm.currentHike.start;
        vm.panel.end = vm.currentHike.end;
        if (vm.currentHike.start_date){
          vm.panel.start_date = new Date(vm.currentHike.start_date);
        } else { vm.panel.start_date = null}
        if (vm.currentHike.end_date){
          vm.panel.end_date = new Date(vm.currentHike.end_date);
        } else { vm.panel.end_date = null}
        vm.panel.distance = vm.currentHike.end - vm.currentHike.start;
      } else {
        vm.panel = {};
      }
    })

  }

// ---------------------------------------------------------------------

  // --- Button Section -------

  function newTrail (newTrail){
      let req = {
      url: `${SERVER}trails`,
      data: newTrail,
      method: 'POST',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function editTrail (id, newTrail){
    let req = {
      url: `${SERVER}trails/${id}`,
      data: newTrail,
      method: 'PATCH',
      headers: UsersService.getHeaders()
    };

    return $http(req);
  }

  function deleteTrail(id){
    let req = {
      url: `${SERVER}trails/${id}`,
      method: 'DELETE',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function deletePoint(){
    let req = {
      url: `${SERVER}points/${vm.currentMarker.id}`,
      method: 'DELETE',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function savePoint(waypoint){
    updateMarker();
    chartMark();
    vm.currentMarker.setIcon(icons.pointSaved)
    let req = {
      url: `${SERVER}points`,
      data: waypoint,
      method: 'POST',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function editPoint(waypoint){
    updateMarker();
    chartMark();
    vm.currentMarker.setIcon(icons.pointSaved)
    let req = {
      url: `${SERVER}points/${vm.currentMarker.id}`,
      data: waypoint,
      method: 'PATCH',
      headers: UsersService.getHeaders()
    };
    return $http(req);
  }

  function saveHike(hike){
    let req = {
      url: `${SERVER}hikes`,
      data: hike,
      method: 'POST',
      headers: UsersService.getHeaders()
    }
    return $http(req);
  }

  function editHike(id, hike){
    let req = {
      url: `${SERVER}hikes/${id}`,
      data: hike,
      method: 'PATCH',
      headers: UsersService.getHeaders()
    }
    return $http(req);
  }

  function deleteHike(id){
    let req = {
      url:`${SERVER}hikes/${id}`,
      method: 'DELETE',
      headers: UsersService.getHeaders()
    }
    return $http(req);
  }

  // ---------------------------------------------------------------------------

    //Trail List

  function getTrailList(){
    return $http.get(`${SERVER}trails`)
  }

  function initChart(){
    vm.currentHike.start = 0;
    vm.currentHike.end = spherical.computeLength(vm.trailPath)*metersMilesConversion;
    filterChartPath();

  }

  function chartMark(overide){
    vm.trailInfo.distance = round(spherical.computeLength(vm.trailPath)*metersMilesConversion, 2);

    safeApply(function(){
      vm.panel.end= vm.trailInfo.distance;
      vm.panel.start = 0;
      updateHike();
    })
    setOffSetArray(spherical.computeLength(vm.trailPath))
    filterChartPath();
    console.log(vm.trailInfo.distance)
    safeApply(function(){
      if (vm.trailInfo.distance <= 20){
        vm.trailInfo.min_elevation = ChartsService.min_elevation;
        vm.trailInfo.max_elevation = ChartsService.max_elevation;
      }
    })

    updateMarker();
  }

  function chartHike(path, start, overide){
    ChartsService.chart(path, vm.filteredMarkerArray, start, (vm.regraphElevation || overide), vm.trailInfo.min_elevation, vm.trailInfo.max_elevation).then(function(){
    })
  }

  function round(input, places){
    return Number(input.toFixed(places));
  }

  function safeApply(fn) {
    var phase = $rootScope.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      $rootScope.$apply(fn);
    }
  };

  // ----------------- Filtering -------------------------------------------------


  function filterTrailPath(){
    var start =  Number(vm.panel.start);
    var end = Number(vm.panel.end);
    if (start<=0 && end>=spherical.computeLength(vm.trailPath)*metersMilesConversion){
      vm.currentHike.path = vm.trailPath;
      vm.panel.start = 0;
      vm.panel.end = round(spherical.computeLength(vm.trailPath)*metersMilesConversion,2);
      showTrailPoly();
    } else {
      let filteredPath = vm.trailPath.filter(function(element, index){
        let waypointDistance = spherical.computeLength(vm.trailPath.slice(0, index+1))*metersMilesConversion;
        return (start<=waypointDistance && waypointDistance <=end)
      })
      filteredPath.unshift(distToWaypoint(start));
      filteredPath.push(distToWaypoint(end));
      vm.currentHike.path = filteredPath;
      if (!vm.currentHike.id){
        createCurrentPoly(filteredPath);
        showCurrentPoly();
      } else {
        showSingleHiked(vm.currentHike.id);
      }
    }
    centerMap();
    updateHike();
  }

  function updateShownChart(){
    vm.showChart = [];
    for (var i=-2; i<=2; i++){
      if (vm.chartOffset+i>=0 && vm.chartOffset+i<vm.offSetArray.length){
        vm.showChart.push(vm.chartOffset+i)
      }
    }
  }

  function nextChart(){
    if (vm.chartOffset+1<vm.offSetArray.length){
      vm.chartOffset++;
      filterChartPath();
      updateShownChart();
    }
  }
  function prevChart(){
    if (vm.chartOffset-1>=0){
      vm.chartOffset--;
      updateShownChart()
      filterChartPath();
    }
  }

  function chooseChart(number){
    vm.chartOffset = number;
    updateShownChart()
    filterChartPath();
  }

  function setOffSetArray(length){
    vm.offSetArray = [];
    let number = Math.floor(length*metersMilesConversion/20);
    for (var i=0; i<=number; i++){
      vm.offSetArray.push(i);
    }
    updateShownChart()

  }

  function filterChartPath(){
    var start =  Number(vm.currentHike.start);
    var end = Number(vm.currentHike.end);

    vm.panel.start = start;
    vm.panel.end = end;
    var chartStart = start + 20*vm.chartOffset;
    var chartEnd = Math.min(end, (start + 20 + 20*vm.chartOffset))
    let chartPath = vm.trailPath.filter(function(element, index){
      let waypointDistance = spherical.computeLength(vm.trailPath.slice(0, index+1))*metersMilesConversion;
      return (chartStart<=waypointDistance && waypointDistance<=chartEnd)
    })

    vm.filteredMarkerArray = vm.markerArray.filter(function (element){
      return (element.distance>=start && element.distance<=end)
    })

    chartPath.unshift(distToWaypoint(chartStart));
    chartPath.push(distToWaypoint(chartEnd));
    chartHike(chartPath, chartStart);
  }

  function distToWaypoint(distance){
    let trail = vm.trailPath;
    let trailLength = spherical.computeLength(trail)*metersMilesConversion;
    if (distance<=0){
      vm.panel.start = 0;
      return trail[0];
    } else if (distance >= trailLength){
      vm.panel.end = trailLength;
      return trail[trail.length-1];
    } else{
      for (var i=0; i<trail.length; i++){
          let trailDist = spherical.computeLength(trail.slice(0, i+1))*metersMilesConversion;
          if (trailDist>=distance){
            let dist1 = spherical.computeLength(trail.slice(0, i))*metersMilesConversion;
            let dist2 = distance;
            let dist3 = trailDist;
            let percentage = (dist2 - dist1)/(dist3-dist1);
            return spherical.interpolate(trail[i-1], trail[i], percentage);
          }
      }
    }
  }

  //  Show Poly ----------------------------------


  function showTrailPoly(){
    if (vm.currentHike.poly){
      vm.currentHike.poly.setOptions({visible: false});
    }
    vm.hikedArray.forEach(function(hike){
      hike.poly.setOptions({visible: false})
    })
    vm.trailPoly.setOptions({visible: true, strokeColor: '#FF0000', strokeOpacity: 1.0, strokeWeight: 3})
  }

  function showHikedPoly(){
    if (vm.currentHike.poly){
      vm.currentHike.poly.setOptions({visible: false});
    }
    vm.hikedArray.forEach(function (hike){
      hike.poly.setOptions({visible: true})
    })
    vm.trailPoly.setOptions({visible: true, strokeColor: '#000000', strokeOpacity: 0.4, strokeWeight: 3});
  }

  function showSingleHiked(id){
    if (vm.currentHike.poly){
      vm.currentHike.poly.setOptions({visible: false});
    }
    vm.hikedArray.forEach(function (hike){
      if (hike.id === id){
        hike.poly.setOptions({visible: true})
      } else {
      hike.poly.setOptions({visible: false})
      }
    })

    vm.trailPoly.setOptions({visible: true, strokeColor: '#000000', strokeOpacity: 0.4, strokeWeight: 3});
  }

  function showCurrentPoly(){
    vm.currentHike.poly.setOptions({strokecolor: "#FF00FF", strokeOpacity: 1.0, strokeWeight: 4});
    vm.hikedArray.forEach(function(hike){
      hike.poly.setOptions({visible: false})
    })
    vm.trailPoly.setOptions({visible: true, strokeColor: '#000000', strokeOpacity: 0.4, strokeWeight: 3});
  }

  // Create Poly -----------------------------

  function createTrailPoly() {
    if (vm.trailPoly){
      vm.trailPoly.setMap(null);
    }
    var trailPoly = new google.maps.Polyline({
        path: vm.trailPath,
        // geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
    trailPoly.setMap(vm.map);
    vm.trailPoly = trailPoly;
    vm.currentHike.poly = trailPoly;
  }

  function createCurrentPoly(path){
    if (path[0] && path[1]){
        var hikePoly = new google.maps.Polyline({
          path: vm.currentHike.path,
          // geodesic: true,
          strokeColor: "#FF00FF",
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
        hikePoly.setMap(vm.map);
        if (vm.currentHike.poly && vm.currentHike.poly !== vm.trailPoly) {
          vm.currentHike.poly.setMap(null);
        }
        vm.currentHike.poly = hikePoly;

    }
  }

  function createHikedPoly(path){
    let index = vm.hikedArray.length-1;
    index = index % vm.hikedTrailColor.length;
    let color  = vm.hikedTrailColor[index]
    if (path[0] && path[1]){
        var hikePoly = new google.maps.Polyline({
          path: path,
          // geodesic: true,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
        hikePoly.setMap(vm.map);
        return hikePoly;
    }

  }

  function startInt(){
    vm.panel.start = 0;
  }

  function endInt(){
    vm.panel.end = spherical.computeLength(vm.trailPath) * metersMilesConversion;
  }

  function setInterval(){
    console.log("set interval")
    vm.chartOffset = 0;
    filterTrailPath(Number(vm.panel.start), Number(vm.panel.end));
    filterChartPath(Number(vm.panel.start), Number(vm.panel.end));
    if (vm.currentHike.poly){
      vm.currentHike.poly.setPath(vm.currentHike.path)
    }
      setOffSetArray(spherical.computeLength(vm.currentHike.path));
  }


  function clearCurrent(){
    vm.showTrailPoly();
    vm.currentHike = {};
    vm.currentHike.path = vm.trailPath;
    vm.centerMap();
    vm.updateHikedPanel();
    vm.initChart();
    vm.setOffSetArray(spherical.computeLength(vm.trailPath));
  }

  function findMaxMin(){
    var trailLength = spherical.computeLength(vm.trailPath)*metersMilesConversion;
    var queries = Math.ceil(trailLength/40);
    var initElev;
    elevator.getElevationForLocations({
      'locations': [vm.trailPath[0]]},
      function (elevations, status){
        initElev = elevations[0].elevation*metersFeetConversion;
        maxMinRecurse(queries, 0, initElev, initElev)
      }
    )
  }

  function maxMinRecurse(queries, i, min_elevation, max_elevation){
    safeApply(function(){
      vm.recalculateStatus = (i/(queries+1))*100 + "% complete."
      })
    if (i<=queries){
      let start = i*40;
      let end = (i+1)*40;
      var filteredPath = vm.trailPath.filter(function(element, index){
        let waypointDistancePrev = spherical.computeLength(vm.trailPath.slice(0, index))*metersMilesConversion;
        let waypointDistanceNext = spherical.computeLength(vm.trailPath.slice(0, index+2))*metersMilesConversion;
        return (start<=waypointDistanceNext && waypointDistancePrev <=end)
      })
      if (filteredPath.length>1){
        elevator.getElevationAlongPath({'path': filteredPath, 'samples': 200},
          function (elevations, status){
            for (var j=0; j<elevations.length; j++){
              let elevation = elevations[j].elevation*metersFeetConversion;
              if (elevation > max_elevation){
                max_elevation = elevation;
              }
              if (elevation <min_elevation){
                min_elevation = elevation;
              }
            }

          }
        )
      }
      window.setTimeout(function(){maxMinRecurse(queries, i+1, min_elevation, max_elevation)}, 2000);
    } else {
      safeApply(function(){
        vm.recalculateStatus = "Elevations Updated"
        vm.trailInfo.max_elevation = round(max_elevation, 2);
        vm.trailInfo.min_elevation = round(min_elevation, 2);
      })
    }
  }


  function goToBlaze(id, user_id){
    if (user_id === UsersService.currentUserId()){
      $state.go('root.trails.blazeEdit', {id: id});
    }
  }
  function goToMark(id, user_id){
    if (user_id === UsersService.currentUserId()){
      $state.go('root.trails.mark', {id: id});
    }
  }
  function goToHike(id){
    $state.go('root.trails.hike', {trailId: id, userId: UsersService.currentUserId()})
  }
};




MapsService.$inject = ['$http', 'ChartsService', 'UsersService', 'NgMap', 'icons', '$rootScope', '$state'];
export { MapsService };
