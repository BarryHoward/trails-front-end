function ChartsService ($http, $cookies) {

	let vm = this;
	vm.chart = chart;
	vm.sortMarks = sortMarks;

	const metersFeetConversion = 3.28084;
	const metersMilesConversion = 0.000621371;


	function chart(path, markers, regraph){
		console.log(regraph)
		var waypoints = []
		markers.forEach(function (marker){
			waypoints.push(marker.position)
		})
	    vm.elevator = new google.maps.ElevationService;
	    var pathElevations = [];
	    var waypointElevations = [];
	   	vm.pathLength = google.maps.geometry.spherical.computeLength(path)
	   	getWaypointElevations(waypoints, markers).then(function (waypointElevations) {
	    	if (regraph){
	    		getPathElevations(path).then(function (pathElevations) {
		    		vm.pathElevations = pathElevations;
		    		drawChart(vm.pathElevations, waypointElevations, markers);
		    	})
	    	} else {
	        	drawChart(vm.pathElevations, waypointElevations, markers);
	        }
		})
	}

	function getPathElevations(path){
	  return new Promise(function (resolve, reject) {
	  	if (path.length >1){
		    vm.elevator.getElevationAlongPath({
		      'path': path,
		      'samples': 200
		    }, function (elevations, status){
		    	console.log(status)
		        var pathElevations = [];
		        pathElevations[0]={x: 0, y: elevations[0].elevation*metersFeetConversion};
		        var resolution = vm.pathLength/(elevations.length-1)* metersMilesConversion;
		        for (var i=1; i<elevations.length; i++){
		          pathElevations[i] = {x: resolution * i,
		                      y: elevations[i].elevation*metersFeetConversion}
		        }
		      resolve(pathElevations);
		    });
		} else {resolve();}
	  })
	}

	function getWaypointElevations(waypoints, markers){

	  return new Promise(function (resolve, reject) {
	    vm.elevator.getElevationForLocations({
	    'locations': waypoints, //change this to the set when we have it
	  }, function (elevations, status){
	      var waypointElevations = [];
	      for (var i=0; i<waypoints.length; i++){
	      waypointElevations[i] = {x: markers[i].distance,
	                  y: elevations[i].elevation*metersFeetConversion}
	    }
	      resolve(waypointElevations);
	  });
	 })
	}


	function drawChart(pathElevations, waypointElevations, markers){
		var marksSorted = sortMarks(waypointElevations, markers);

		const campgroundImg = new Image();
		const waterImg = new Image();
		const parkingImg = new Image();
		const roadImg = new Image();
		const shelterImg = new Image();
		const viewImg = new Image();
		const resupplyImg = new Image();

		campgroundImg.src = 'images/png/tent.png';
		waterImg.src = 'images/png/water-drop.png';
		parkingImg.src = 'images/png/parking.png';
		roadImg.src = 'images/png/road.png';
		shelterImg.src = 'images/png/shelter.png';
		viewImg.src = 'images/png/binoculars.png';
		resupplyImg.src = 'images/png/list.png';

		if(vm.myLineChart){
			vm.myLineChart.destroy();
	    }

		var data = {
		    datasets: [
			{
				type: 'line',
				label: 'Campsite',
		        data: marksSorted.campsite,
		        fill: false,
		        borderColor: 'rgba(255,255,255,0)',
		        pointBorderColor: 'rgba(255, 0, 0, 1)',
		        pointBackgroundColor: 'rgba(255, 0, 0, 1)',
				pointStyle: campgroundImg,
		    },

			{
				type: 'line',
				label: 'Water Source',
		        data: marksSorted.water,
		        fill: false,
		        borderColor: 'rgba(255,255,255,0)',
		        pointBorderColor: 'rgba(255, 0, 0, 1)',
		        pointBackgroundColor: 'rgba(255, 0, 0, 1)',
				pointStyle: waterImg,
		    },

			{
				type: 'line',
				label: 'Parking',
				data: marksSorted.parking,
				fill: false,
				borderColor: 'rgba(255,255,255,0)',
				pointBorderColor: 'rgba(255, 0, 0, 1)',
				pointBackgroundColor: 'rgba(255, 0, 0, 1)',
				pointStyle: parkingImg,
			},
			{
				type: 'line',
				label: 'Resupply',
				data: marksSorted.resupply,
				fill: false,
				borderColor: 'rgba(255,255,255,0)',
				pointBorderColor: 'rgba(255, 0, 0, 1)',
				pointBackgroundColor: 'rgba(255, 0, 0, 1)',
				pointStyle: resupplyImg,

			},
			{
				type: 'line',
				label: 'Road',
				data: marksSorted.road,
				fill: false,
				borderColor: 'rgba(255,255,255,0)',
				pointBorderColor: 'rgba(255, 0, 0, 1)',
				pointBackgroundColor: 'rgba(255, 0, 0, 1)',
				pointStyle: roadImg,

			},
			{
				type: 'line',
				label: 'Shelter',
				data: marksSorted.shelter,
				fill: false,
				borderColor: 'rgba(255,255,255,0)',
				pointBorderColor: 'rgba(255, 0, 0, 1)',
				pointBackgroundColor: 'rgba(255, 0, 0, 1)',
				pointStyle: shelterImg,

			},
			{
				type: 'line',
				label: 'View',
				data: marksSorted.view,
				fill: false,
				borderColor: 'rgba(255,255,255,0)',
				pointBorderColor: 'rgba(255, 0, 0, 1)',
				pointBackgroundColor: 'rgba(255, 0, 0, 1)',
				pointStyle: viewImg,

			},
			{
				type: 'line',
		        label: 'Elevation',
		        data: pathElevations,
		        fill: true,
		        pointBorderColor: 'rgba(0, 0, 0, 0)',
		        pointBackgroundColor: 'rgba(0, 0, 0, 0)',
		        backgroundColor : 'rgba(155,122,61, .8)',

		     },
		    ]
		}

		var options = {
			scales: {
				xAxes: [{
					type: 'linear',
					position: 'bottom',
					ticks: {
						min: 0,
						max: 20,
						beginAtZero: true
					}
				}],
				yAxes: [{
					ticks: {
						min: 0,
						max: 6600,
						beginAtZero: true
					}
				}],
			},
			// hover: {
			// 	intersect: true,
			// 	mode: 'point'
			// }
		}
		
		var ctx=document.getElementById('myChart');
		ctx.width = 800;
		ctx.height = 125;
		vm.myLineChart = new Chart(ctx, {
		    type: 'bar',
		    data: data,
		    options: options
		})

	}


	function sortMarks (waypoints, markers) {
		let sortedMarks = {};
		sortedMarks.campsite = waypoints.filter(isCampsite);
		sortedMarks.parking = waypoints.filter(isParking);
		sortedMarks.resupply = waypoints.filter(isResupply);
		sortedMarks.road = waypoints.filter(isRoad);
		sortedMarks.shelter = waypoints.filter(isShelter);
		sortedMarks.view = waypoints.filter(isView);
		sortedMarks.water = waypoints.filter(isWater);

		function isCampsite(mark, index) {
			return markers[index].campsite === true;
		}
		function isParking(mark, index) {
			return markers[index].parking === true;
		}
		function isResupply(mark, index) {
			return markers[index].resupply === true;
		}
		function isRoad (mark, index) {
			return markers[index].road === true;
		}
		function isShelter(mark, index) {
			return markers[index].shelter === true;
		}
		function isView(mark, index) {
			return markers[index].view === true;
		}
		function isWater(mark, index) {
			return markers[index].water === true;
		}

		return sortedMarks;

	}

}

ChartsService.$inject = ['$http', '$cookies'];
export { ChartsService };
