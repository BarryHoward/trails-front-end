function UserHikedController (UsersService, MapsService) {
  let vm = this;
	vm.MapsService = MapsService;
  vm.trailList = [];

	function init(){
    vm.user_id = UsersService.currentUserId();
    if (!vm.user_id){
      vm.user_id = 0;
    }

		UsersService.getHikedTrails(vm.user_id).then((resp)=>{
      console.log(resp)
			vm.trailList = resp.data;
      console.log('vm.trailList', vm.trailList)
		});
	};



	init();



};

UserHikedController.$inject = ['UsersService', 'MapsService'];

export {UserHikedController};
