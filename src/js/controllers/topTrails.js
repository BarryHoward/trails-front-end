function TopTrailsController (MapsService, UsersService, $state) {

	let vm = this;
	vm.MapsService = MapsService;
	vm.goToBlaze = goToBlaze;
	vm.goToMark = goToMark;
	vm.goToHike = goToHike;

	vm.img_default = "http://previews.123rf.com/images/alex_star/alex_star0812/alex_star081200333/4005652-Compass-on-old-map-Stock-Photo.jpg";

	function init(){
		MapsService.getTrailList().then((resp)=>{
			vm.trailList = resp.data;
			vm.trailList.forEach(function(element){
				if (element.img_url === null){
					element.img_url = vm.img_default;
				}
			})
			console.log(vm.trailList)
		});
	};

	vm.user_id = UsersService.currentUserId();
	if (!vm.user_id){
		vm.user_id = 0;
	}

	init();

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

}

TopTrailsController.$inject = ['MapsService', 'UsersService', '$state'];
export {TopTrailsController}
