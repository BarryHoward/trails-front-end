function MapsService ($http, ChartsService, NgMap) {

  const SERVER = "https://trails-back-end.herokuapp.com/";

  let vm = this;
  vm.createLine = createLine;
  vm.getMap = getMap;
  vm.loadMarker = loadMarker;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.getTrailList = getTrailList;
  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;
  vm.initSearch = initSearch;

    var image = {
        url: "http://2.bp.blogspot.com/-i30Td7s1DOE/ViQWyk6J8XI/AAAAAAAACg8/kw4AN6Wyb-s/s1600/red_dot.png",
        size: new google.maps.Size(9, 9),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(5,5)
    };

  function initSearch (map, textInput) {
    var searchBox = new google.maps.places.SearchBox(textInput);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(textInput);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
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
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });
  }

  function getTrailList(){
    return $http.get(`${SERVER}trails`)
  }

  function getMap(id){
     return NgMap.getMap(id)
  }

  function getTrail(id, map, draggable){
      return new Promise(function (resolve, reject) {
          $http.get(`${SERVER}trails/${id}`).then((resp) => {
              let path = google.maps.geometry.encoding.decodePath(resp.data.path);
              path.forEach(function (waypoint) {
                loadMarker(waypoint, path, map, draggable)
              });
              createLine(path, map)
              centerMap(map, path);
              ChartsService.chart(path);
              var Trail = {path: path, title: resp.data.title}
              resolve(Trail);
            }, (reject) => {
                console.log(reject)
          });
        })
  }

  function createLine(path, map) {
    if (vm.line){
      vm.line.setMap(null);
    }
    var trailPoly = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
    trailPoly.setMap(map);
    vm.line = trailPoly;
    return trailPoly;
  }

  function loadMarker(waypoint, path, map, draggable){
    var marker = new google.maps.Marker({
        map: map,
        draggable: draggable,
        animation: google.maps.Animation.DROP,
        position: waypoint,
        icon: image
        // totalDistance: waypoint.totalDistance
    });
    if (draggable){
      dragListener(marker, waypoint, path, map)
      deleteListener(marker, waypoint, path, map)
    }
  }

  // Listeners ---------------------------------------------------------

  function dragListener (marker, waypoint, path, map){
      google.maps.event.addListener(marker, 'dragend', function (event){
        var index = path.indexOf(waypoint)
        waypoint = marker.getPosition()
        path.splice(index, 1);

        // vm.snap = true;

        if (vm.snap){
          let insert = closestPath(waypoint, path)
          waypoint = google.maps.geometry.spherical.interpolate(path[insert[0]-1], path[insert[0]], insert[1])
          path.splice(insert[0], 0, waypoint);
          console.log(marker)
          marker.setPosition(waypoint);
        } else {
          path.splice(index, 0, waypoint)
        }
        vm.line.setPath(path);

        // updateDist(path);
        if(path.length > 1) {
          ChartsService.chart(path);
        }
    })
  }

  function deleteListener (marker, waypoint, path, map){
      google.maps.event.addListener(marker, 'click', function (event){
        if (vm.delete){
          var index = path.indexOf(waypoint);
          if (index > -1) {
            path.splice(index, 1);
            vm.line.setPath(path);
          }
          marker.setMap(null);
  //         updateDist(path);
          if(path.length !== 1) {
            ChartsService.chart(path);
          }
        }
    })
  }

  // --------------------------------------------------------------------


function closestPath(waypoint, path){
  var pathDistances = [];
  var percentage = [];
  for (var i=0; i<path.length-1; i++){
    let a = google.maps.geometry.spherical.computeDistanceBetween(waypoint, path[i+1]);
    let b = google.maps.geometry.spherical.computeDistanceBetween(waypoint, path[i]);
    let c = google.maps.geometry.spherical.computeDistanceBetween(path[i], path[i+1]);
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
  var minIndex = pathDistances.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0) + 1;
  return [minIndex, percentage[minIndex-1]];
}

  //  Place Marker -----------------------------------------------------

  function placeMarker(event, path, map, snap) {

    var waypoint = event.latLng
    if (!vm.delete){
      // vm.snap = true;

      if (vm.insert === "midInsert" && path.length>0){
        let insert = closestPath(waypoint, path)
        var snapWaypoint = google.maps.geometry.spherical.interpolate(path[insert[0]-1], path[insert[0]], insert[1])
        if (vm.snap){
          waypoint = snapWaypoint;
        }
        path.splice(insert[0], 0, waypoint);
        vm.line.setPath(path);
      } else if (vm.insert === "frontInsert") {
        path.unshift(waypoint);
        vm.line.setPath(path);
      } else {
        path.push(waypoint);
        vm.line.setPath(path);
      }

      var marker = new google.maps.Marker({
          position: waypoint,
          map: map,
          draggable: true,
          icon: image
      });

      dragListener(marker, waypoint, path, map)
      deleteListener(marker, waypoint, path, map)
      // updateDist(path);
      if(path.length > 1) {
        ChartsService.chart(path);
      }


    }
  }


  // function updateDist (path){

  //   for (var i=0; i<path.length; i++){
  //     if (i===0){
  //       path[i].totalDistance =0;
  //     } else {
  //       var distAdded = google.maps.geometry.spherical.computeDistanceBetween(path[i-1].position, path[i].position)
  //       path[i].totalDistance = path[i-1].totalDistance + distAdded;
  //     }
  //   }
  // }

//  Place Marker -----------------------------------------------------

  // --- Button Section -------

  function newTrail (path, trailTitle){
    return new Promise(function (resolve, reject) {
      let newTrail = {};
      let path = vm.line.getPath();
      let encodeString = google.maps.geometry.encoding.encodePath(path);
      newTrail.path = encodeString;
      newTrail.title = trailTitle;
      $http.post(`${SERVER}trails`, newTrail).then((resp) => {
          resolve();
        }, (reject) => {
          console.log(reject)
        });
    })
  }

  function editTrail (path, trailTitle, id){
    return new Promise(function (resolve, reject) {
      let newTrail = {};
      let path = vm.line.getPath();
      let encodeString = google.maps.geometry.encoding.encodePath(path);
      newTrail.path = encodeString;
      newTrail.title = trailTitle;
      $http.patch(`${SERVER}trails/${id}`, newTrail).then((resp) => {
          console.log(resp)
          resolve();
        }, (reject) => {
          console.log(reject)
        });
    })
  }

  function deleteTrail(id){
    return $http.delete(`${SERVER}trails/${id}`);
  }

  // -----------------------

  // -- Jack's section ------

  function centerMap(map, path) {
    var latlngbounds = new google.maps.LatLngBounds();
    path.forEach(function (marker) {
      latlngbounds.extend(marker)
      map.fitBounds(latlngbounds);
    })
  }

  // ---------------------------
};

MapsService.$inject = ['$http', 'ChartsService', 'NgMap'];
export { MapsService };
