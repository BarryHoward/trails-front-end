function MapsService ($http, ChartsService, NgMap) {

  const SERVER = "https://trails-back-end.herokuapp.com/";

  let vm = this;
  vm.createLine = createLine;
  vm.getMap = getMap;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.getTrailList = getTrailList;
  vm.editTrail = editTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;

  const trailIcon = {
      url: "http://2.bp.blogspot.com/-i30Td7s1DOE/ViQWyk6J8XI/AAAAAAAACg8/kw4AN6Wyb-s/s1600/red_dot.png",
      size: new google.maps.Size(9, 9),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(5,5)
  };

  const pointIcon = {
    url: "http://maps.google.com/mapfiles/ms/icons/blue.png"
  }



  function getTrailList(){
    return $http.get(`${SERVER}trails`)
  }

  function getMap(id){
     return NgMap.getMap(id)
  }

  function getTrail(id, map, blaze, point, draggable){
    return new Promise(function (resolve, reject) {
        $http.get(`${SERVER}trails/${id}`).then((resp) => {
          let path = google.maps.geometry.encoding.decodePath(resp.data.path);
          if (blaze){
            path.forEach(function (waypoint) {
              loadTrailMarker(waypoint, path, map, draggable)
            });
          }
          if (point){
            $http.get(`${SERVER}trails/${id}/points`).then((resp) =>{
              var points = resp.data
              points.forEach(function (waypoint){
                loadPointMarker(waypoint, path, map, draggable)
              })
            })
          }
          createLine(path, map);
          centerMap(map, path);
          ChartsService.chart(path);
          var Trail = {path: path, title: resp.data.title}
          resolve(Trail);
        }, (reject) => {
          console.log(reject)
        })
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

  function loadTrailMarker(waypoint, path, map, draggable){
    var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: waypoint,
        icon: trailIcon,
        draggable: draggable
    });
    dragListener(marker, waypoint, path, map, false)
    deleteListener(marker, waypoint, path, map, false)
  }

  function loadPointMarker(waypoint, path, map, draggable){
    var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: {lat: waypoint.lat, lng: waypoint.lng},
        icon: pointIcon,
        draggable: draggable
    });
    dragListener(marker, waypoint, path, map, true)
    deleteListener(marker, waypoint, path, map, true)
  }

  // Listeners ---------------------------------------------------------

  function dragListener (marker, waypoint, path, map, snap){
      google.maps.event.addListener(marker, 'dragend', function (event){
        if (!snap){
          var index = path.indexOf(waypoint);
          waypoint = marker.getPosition();
          path[index] = waypoint;
          vm.line.setPath(path);
        } else {
          let insert = closestPath(marker.getPosition(), path)
          waypoint = google.maps.geometry.spherical.interpolate(path[insert[0]-1], path[insert[0]], insert[1])
          marker.setPosition(waypoint);
        }
        if(path.length > 1) {
          ChartsService.chart(path);
        }
    })
  }

  function deleteListener (marker, waypoint, path, map, snap){
      google.maps.event.addListener(marker, 'click', function (event){
        if (vm.delete){
          if (!snap){
            var index = path.indexOf(waypoint);
            path.splice(index, 1);
            vm.line.setPath(path);
          } else {
            var index = vm.markers.indexof(marker);
            vm.markers.splice(index,1);
          }
          marker.setMap(null);
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
      if ((vm.insert === "midInsert" || snap) && path.length>0){
        let insert = closestPath(waypoint, path)
        var snapWaypoint = google.maps.geometry.spherical.interpolate(path[insert[0]-1], path[insert[0]], insert[1])
        if (snap){
          waypoint = snapWaypoint;
        } else {
          path.splice(insert[0], 0, waypoint);
          vm.line.setPath(path);
        }
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
          icon: trailIcon
      });
      if (snap){
        marker.setIcon(pointIcon);
      }

      dragListener(marker, waypoint, path, map, snap)
      deleteListener(marker, waypoint, path, map, snap)
      if(path.length > 1) {
        ChartsService.chart(path);
      }
    }
  }

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
