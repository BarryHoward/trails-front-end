function TrailsService ($http, $cookies, NgMap) {

  const SERVER = "https://trails-back-end.herokuapp.com/"

  let vm = this;
  vm.deleteListener = deleteListener;
  vm.drawLine = drawLine;
  vm.getMap = getMap;
  vm.loadMarker = loadMarker;
  vm.placeMarker = placeMarker;
  vm.getTrail = getTrail;
  vm.updateTrail = updateTrail;
  vm.deleteTrail = deleteTrail;
  vm.dragListener = dragListener;
  vm.newTrail = newTrail;
  vm.getElevation = getElevation;

  function getMap(id){
     return NgMap.getMap(id)
  }

  function getTrail(trail_id){
    return $http.get(`${SERVER}trails/${trail_id}`)
  }

  function loadMarker(map, markers, waypoint, draggable){
    var myLatlng = new google.maps.LatLng(waypoint.lat, waypoint.lng)
    var marker = new google.maps.Marker({
        map: map,
        draggable: draggable,
        animation: google.maps.Animation.DROP,
        position: myLatlng,
        lat: myLatlng.lat(),
        lng: myLatlng.lng()
    });
    markers.push(marker);
    if (draggable){
      vm.dragListener(marker, markers, map)
      vm.deleteListener(marker, markers, map)
    }
  }

  function dragListener (marker, markers, map){
      google.maps.event.addListener(marker, 'dragend', function (event){
        marker.lat = marker.getPosition().lat();
        marker.lng = marker.getPosition().lng();
        vm.drawLine(map, markers);
    })
  }

  function deleteListener (marker, markers, map){
      google.maps.event.addListener(marker, 'click', function (event){
        if (vm.delete){
          var index = markers.indexOf(marker);
          if (index > -1) {
            markers.splice(index, 1);
          }
          console.log(markers)
          marker.setMap(null);
          vm.drawLine(map, markers);
        }
    })
  }

  function placeMarker(markers, map, location) {
    if (!vm.delete){
      var marker = new google.maps.Marker({
          position: location.latLng,
          map: map,
          draggable: true,
          lat: location.latLng.lat(),
          lng: location.latLng.lng()
      });

      if (vm.insert){
        let dist = [];
        for (var i=0; i<markers.length; i++){
          dist[i] = google.maps.geometry.spherical.computeDistanceBetween(location.latLng, markers[i].position)
        }
        var minIndex = dist.reduce((iMax, x, i, arr) => x < arr[iMax] ? i : iMax, 0);

        if (minIndex === 0){
          markers.splice(1, 0, marker);
        } else if (minIndex === markers.length-1){
          markers.splice(markers.length-1, 0, marker)
        } else {
          let markBefore = markers[minIndex-1];
          let markMin = markers[minIndex];
          let markAfter = markers[minIndex +1];

          let beforeAngle = Math.asin((markBefore.lng - markMin.lng)/Math.sqrt(Math.pow((markBefore.lng-markMin.lng),2)+Math.pow((markBefore.lat-markMin.lat),2)));
          let afterAngle = Math.asin((markAfter.lng - markMin.lng)/Math.sqrt(Math.pow((markAfter.lng-markMin.lng),2)+Math.pow((markAfter.lat-markMin.lat),2)));
          let newAngle = Math.asin((marker.lng - markMin.lng)/Math.sqrt(Math.pow((marker.lng-markMin.lng),2)+Math.pow((marker.lat-markMin.lat),2)));

          let beforeDif = Math.PI - Math.abs(Math.PI - Math.abs(beforeAngle - newAngle));
          let afterDif = Math.PI - Math.abs(Math.PI - Math.abs(afterAngle - newAngle));

        if (beforeDif<afterDif){
          var insertIndex = minIndex;
        } else {
          var insertIndex = minIndex+1;
        }
        markers.splice(insertIndex, 0, marker);
      }


      } else {
        markers.push(marker);
      }
      vm.drawLine(map, markers);
      vm.dragListener(marker, markers, map)
      vm.deleteListener(marker, markers, map)
    }
  }


  function drawLine(map, markers) {
    if (vm.line){
      vm.line.setMap(null);
    }
    var addLine = new google.maps.Polyline({
        path: markers,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

    addLine.setMap(map);
    vm.line = addLine;
    vm.getElevation(markers);
  }

  function getElevation(markers){
     var elevator = new google.maps.ElevationService;
     elevator.getElevationAlongPath({
        'path': markers,
        'samples': 256
      }, plotElevation);

      function plotElevation(elevations, status){
        console.log(elevations, status)
      }
  }



  function updateTrail(newTrail, id) {
      return $http.patch(`${SERVER}trails/${id}`, newTrail);
  }
  function deleteTrail(id){
    console.log("delete")
    return $http.delete(`${SERVER}trails/${id}`);
  }

  function newTrail(newTrail){
      $http.post(`${SERVER}trails`, newTrail).then((resp) => {
        console.log(resp.data)
      }, (reject) => {
        console.log(reject)
      });
  }

};

TrailsService.$inject = ['$http', '$cookies', 'NgMap'];
export { TrailsService };
