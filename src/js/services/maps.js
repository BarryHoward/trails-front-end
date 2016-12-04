function MapsService ($http, ChartsService, NgMap) {

  const SERVER = "https://trails-back-end.herokuapp.com/";

  let vm = this;
  vm.createLine = createLine;
  vm.getMap = getMap;
  vm.loadMarker = loadMarker;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.getTrailList = getTrailList;
  vm.updateTrail = updateTrail;
  vm.deleteTrail = deleteTrail;
  vm.newTrail = newTrail;

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
  }

  function loadMarker(waypoint, path, map, draggable){
    var marker = new google.maps.Marker({
        map: map,
        draggable: draggable,
        animation: google.maps.Animation.DROP,
        position: waypoint,
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
        path.splice(index, 0, waypoint)
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


  //  Place Marker -----------------------------------------------------

  function placeMarker(event, path, map) {
    console.log(path)

    var waypoint = event.latLng
    if (!vm.delete){
      var marker = new google.maps.Marker({
          position: waypoint,
          map: map,
          draggable: true,
      });

      if (vm.insert === "midInsert" && path.length>0){
        var insertIndex = midInsert(waypoint, path);
        path.splice(insertIndex, 0, waypoint);
        vm.line.setPath(path);
      } else if (vm.insert === "frontInsert") {
        path.unshift(waypoint);
        vm.line.setPath(path);
      } else {
        path.push(waypoint);
        vm.line.setPath(path);
      }
      dragListener(marker, waypoint, path, map)
      deleteListener(marker, waypoint, path, map)
      // updateDist(path);
      if(path.length > 1) {
        ChartsService.chart(path);
      }
    }
  }

  function midInsert(waypoint, path){
      let dist = [];
      for (var i=0; i<path.length; i++){
        dist[i] = google.maps.geometry.spherical.computeDistanceBetween(waypoint, path[i])
      }
      let minIndex = dist.reduce((iMax, x, i, arr) => x < arr[iMax] ? i : iMax, 0);
      var insertIndex;
      if (minIndex === 0){
        insertIndex = 1;
        return insertIndex;
      } else if (minIndex === path.length-1){
        insertIndex = path.length-1;
        return insertIndex;
      } else {
        let markBefore = path[minIndex-1];
        let markMin = path[minIndex];
        let markAfter = path[minIndex +1];

        let beforeV = {y: markBefore.lat() - markMin.lat(), x: markBefore.lng() - markMin.lng()}
        let afterV = {y: markAfter.lat() - markMin.lat(), x: markAfter.lng() - markMin.lng()}
        let newV = {y: waypoint.lat() - markMin.lat(), x: waypoint.lng() - markMin.lng()}

        let beforeA = Math.asin(beforeV.y/(Math.sqrt(Math.pow(beforeV.x, 2)+ Math.pow(beforeV.y, 2))));
        let afterA = Math.asin(afterV.y/(Math.sqrt(Math.pow(afterV.x, 2)+ Math.pow(afterV.y, 2))));
        let newA = Math.asin(newV.y/(Math.sqrt(Math.pow(newV.x, 2)+ Math.pow(newV.y, 2))));
        if (beforeV.x<0){
            beforeA = Math.PI - beforeA;
        }
        if (afterV.x<0){
            afterA = Math.PI - afterA;
        }
        if (newV.x<0){
            newA = Math.PI - newA;
        }          

        let beforeDif = Math.min((2 * Math.PI) - Math.abs(beforeA - newA), Math.abs(beforeA - newA))
        let afterDif = Math.min((2 * Math.PI) - Math.abs(afterA - newA), Math.abs(afterA - newA))

        if (beforeDif<afterDif){
          insertIndex = minIndex;
        } else {
          insertIndex = minIndex+1;
        }
         return insertIndex;
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

  function updateTrail (path, trailTitle, id){
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
