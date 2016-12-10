function ChartsService ($http, $cookies) {

	let vm = this;
	vm.chart = chart;
	vm.sortMarks = sortMarks;

	const metersFeetConversion = 3.28084;
	const metersMilesConversion = 0.000621371;
	const elevator = new google.maps.ElevationService;
	const spherical = google.maps.geometry.spherical;


	function chart(path, markers, start, regraph){
		return new Promise(function(chartResolve, chartReject) {
			var waypoints = []
			markers.forEach(function(marker){
				waypoints.push(marker.position)
			})
		   	vm.pathLength = spherical.computeLength(path)*metersMilesConversion;
		   	getWaypointElevations(waypoints, markers).then(function (waypointElevations) {
		    	if (regraph){
		    		getPathElevations(path, start).then(function (pathElevations) {
			    		vm.pathElevations = pathElevations;
			    		drawChart(vm.pathElevations, waypointElevations, markers, start);
			    		chartResolve();
			    	})
		    	} else {
		        	drawChart(vm.pathElevations, waypointElevations, markers, start);
		        	chartResolve();
		        }
			})
		})
	}

	function getPathElevations(path, start){
	  return new Promise(function (resolve, reject) {
	  	if (path.length >1){
		    elevator.getElevationAlongPath({
		      'path': path,
		      'samples': 200
		    }, function (elevations, status){
		    	console.log(status)
		        var pathElevations = [];
		        let minObject = elevations.reduce(function (min, newNum){
		        	if (newNum.elevation<min.elevation){
		        		return newNum;
		        	} else {
		        		return min;
		        	}
		        });
		        let maxObject = elevations.reduce(function (max, newNum){
		        	if (newNum.elevation>max.elevation){
		        		return newNum;
		        	} else {
		        		return max;
		        	}
		        });

		        vm.max_elevation = round(maxObject.elevation*metersFeetConversion, 2);
		        vm.min_elevation = round(minObject.elevation*metersFeetConversion, 2);
		        pathElevations[0]={x: start, y: elevations[0].elevation*metersFeetConversion};
		        var resolution = vm.pathLength/(elevations.length-1);
		        for (var i=1; i<elevations.length; i++){
		          pathElevations[i] = {x: start + resolution * i,
		                      y: elevations[i].elevation*metersFeetConversion}
		        }
		      resolve(pathElevations);
		    });
		} else {resolve()}
	  })
	}

	function getWaypointElevations(waypoints, markers){
	  return new Promise(function (resolve, reject) {
	    elevator.getElevationForLocations({
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


	function drawChart(pathElevations, waypointElevations, markers, start){
		var marksSorted = sortMarks(waypointElevations, markers);
		console.log(marksSorted)
		var ctx = document.getElementById('myChart');
		ctx.width = 800;
		ctx.height = 125;

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
			title: {
            display: true,
            text: 'Elevation Information',
						fontSize: 22,
						fontFamily: 'Nunito, sans-serif',
						fontColor: '#EA643C'
        },
			scales: {
				xAxes: [{
					type: 'linear',
					position: 'bottom',
					ticks: {
						min: start,
						max: start+20,
					}
				}],
				yAxes: [{
					ticks: {
						min: Math.floor(vm.min_elevation/1000)*1000,
						max: Math.ceil(vm.max_elevation/1000)*1000,
						beginAtZero: true
					}
				}],
			},
			animation: false,
			hover: {
				intersect: true,
				mode: 'point'
			}
		}

		var ctx=document.getElementById('myChart');
		ctx.width = 800;
		ctx.height = 125;
		vm.myLineChart = new Chart(ctx, {
		    type: 'bar',
		    data: data,
		    options: options
		});

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
			return markers[index].campsite;
		}
		function isParking(mark, index) {
			return markers[index].parking;
		}
		function isResupply(mark, index) {
			return markers[index].resupply;
		}
		function isRoad (mark, index) {
			return markers[index].road;
		}
		function isShelter(mark, index) {
			return markers[index].shelter;
		}
		function isView(mark, index) {
			return markers[index].view;
		}
		function isWater(mark, index) {
			return markers[index].water;
		}

		return sortedMarks;

	}

	function round(input, places){
		return Number(input.toFixed(places));
	}

}

ChartsService.$inject = ['$http', '$cookies'];
export { ChartsService };
