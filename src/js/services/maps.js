function MapsService ($http, ChartsService, NgMap, icons, $rootScope) {

  const SERVER = "https://trails-back-end.herokuapp.com/";

  let vm = this;

  vm.getMap = getMap;
  vm.getTrail = getTrail;
  vm.createTrailPoly = createTrailPoly;
  vm.centerMap = centerMap;
  vm.initSearch = initSearch;
  vm.loadTrailMarker = loadTrailMarker;
  vm.loadPointMarker = loadPointMarker;
  vm.dragListener = dragListener;
  vm.deleteListener = deleteListener;
  vm.closestPath = closestPath;
  vm.placeMarker = placeMarker;

  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;
  vm.getTrailList = getTrailList;
  vm.savePoint = savePoint;
  vm.initChart = initChart;

 
  vm.waypoint = {};

  const metersFeetConversion = 3.28084;
  const metersMilesConversion = 0.000621371;
  const encoding = google.maps.geometry.encoding;
  const spherical = google.maps.geometry.spherical;




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

// -----------------------------------------------------------------------
  
  //Create line and Center map

  function createTrailPoly() {
    if (vm.trailPoly){
      vm.trailPoly.setMap(null);
    }
    var trailPoly = new google.maps.Polyline({
        path: vm.trailPath,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
    trailPoly.setMap(vm.map);
    vm.trailPoly = trailPoly;
  }

  function centerMap() {
    var latlngbounds = new google.maps.LatLngBounds();
    vm.trailPath.forEach(function (waypoint) {
      latlngbounds.extend(waypoint)
    })
    vm.map.fitBounds(latlngbounds);
  }

  function initSearch () {
    var input = document.getElementById('pac-input')
    var searchBox = new google.maps.places.SearchBox(input);
    vm.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    //Listener for selecting an autocomplete option from the dropdown
    vm.map.addListener('bounds_changed', function() {
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
    return marker;
  }

  function loadPointMarker(waypoint){
    var marker = new google.maps.Marker({
        map: vm.map,
        position: {lat: waypoint.lat, lng: waypoint.lng},
        icon: icons.pointSaved,
        draggable: true
    });
    vm.markerArray.push(marker)
    return marker;
  }

// ----------------------------------------------------------------------
  
  // Listeners 

  function dragListener (marker, scope){
      let waypoint = marker.getPosition();
      google.maps.event.addListener(marker, 'dragend', function (event){
        let newWaypoint = event.latLng;
        if (!vm.snap){
          var index = vm.trailPath.indexOf(waypoint);
          vm.trailPath[index] = newWaypoint;
          vm.trailPoly.setPath(vm.trailPath);
        } else {
          let insert = closestPath(newWaypoint)
          newWaypoint = spherical.interpolate(vm.trailPath[insert[0]-1], vm.trailPath[insert[0]], insert[1])
          marker.setPosition(newWaypoint);
          marker.setIcon(icons.pointUnsaved)
          marker.distance = insert[2];
          vm.currentMarker = marker;
          updatePanel();
        }
        if(vm.trailPath.length > 1) {
          ChartsService.chart(vm.trailPath);
        }
        scope.apply;
    })
  }

  function deleteListener (marker, scope){
      google.maps.event.addListener(marker, 'click', function (event){
        let waypoint = marker.getPosition();
        if (vm.delete){
          if (!vm.snap){
            var index = vm.trailPath.indexOf(waypoint);
            vm.trailPath.splice(index, 1);
            vm.trailPoly.setPath(vm.trailPath);
          }
          var markIndex = vm.markerArray.indexOf(marker);
          vm.markerArray.splice(markIndex, 1);
          marker.setMap(null);
          if(vm.trailPath.length > 1) {
            ChartsService.chart(vm.trailPath);
          }
          vm.currentMarker = null;
          vm.newMarkerAllow = true;
          updatePanel();
        }
        scope.apply;
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
    let A = Math.acos((Math.pow(b,2)+Math.pow(c,2)-Math.pow(a,2))/(2*b*c))
    let B = Math.acos((Math.pow(c,2)+Math.pow(a,2)-Math.pow(b,2))/(2*a*c))
    let C = Math.PI-B-A;

    if (A>B && A>C){
      pathDistances[i] = b;
      percentage[i]=0;
    } else if (B>C){
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
          vm.trailPoly.setPath(vm.trailPath);
        }

      } else if (vm.insert === "frontInsert") {
        vm.trailPath.unshift(waypoint);
        vm.trailPoly.setPath(vm.trailPath);
        markerDistance = 0;
      } else {
        vm.trailPath.push(waypoint);
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
      if (!vm.newMarkerAllow && vm.currentMarker){
        vm.currentMarker.setMap(null);
      }
      //set to unsaved icon if snap
      if (vm.snap){
        marker.setIcon(icons.pointUnsaved);
      }
      //re-chart
      if(vm.trailPath.length > 1) {
        ChartsService.chart(vm.trailPath);
      }
      marker.distance = markerDistance;
      vm.markerArray.push(marker)
      vm.currentMarker = marker;
      updatePanel();
      return marker;
    }

  }

  // ----------------------------------------------------------------------------------

    // update Panel

  function updatePanel(){

    if (vm.currentMarker){
      let waypoint = vm.currentMarker.getPosition();
      vm.panel.lat=waypoint.lat();
      vm.panel.lng=waypoint.lng();
      vm.panel.distance = vm.currentMarker.distance;
    } else {
      vm.panel.lat = "";
      vm.panel.lng = "";
      vm.panel.distance = "";
    }
      vm.trailLength = spherical.computeLength(vm.trailPath)*metersMilesConversion;
  }

// ---------------------------------------------------------------------

  // --- Button Section -------

  function newTrail (newTrail){
    return $http.post(`${SERVER}trails`, newTrail);
  }

  function editTrail (id, newTrail){
    return $http.patch(`${SERVER}trails/${id}`, newTrail);
  }

  function deleteTrail(id){
    return $http.delete(`${SERVER}trails/${id}`);
  }

  function savePoint(waypoint){
    vm.currentMarker.setIcon(icons.pointUnsaved)
    return $http.post(`${SERVER}points`, waypoint)
  }

  // ---------------------------------------------------------------------------

    //Trail List
  
  function getTrailList(){
    return $http.get(`${SERVER}trails`)
  }

  function initChart(){
    ChartsService.chart(vm.trailPath);
  }
};

MapsService.$inject = ['$http', 'ChartsService', 'NgMap', 'icons', '$rootScope'];
export { MapsService };
