function TopTrailsController (MapsService, UsersService) {

	let vm = this;


	function init(){
		MapsService.getTrailList().then((resp)=>{
			vm.trailList = resp.data;
		});
	};

	vm.user_id = UsersService.currentUserId();
	if (!vm.user_id){
		vm.user_id = 0;
	}
	console.log(vm.user_id);

	init();

}

TopTrailsController.$inject = ['MapsService', 'UsersService'];
export {TopTrailsController}
