function UserCreatedController ($state, UsersService, MapsService) {
  let vm = this;
	vm.MapsService = MapsService;
  vm.trailList = [];

	function init(){
    vm.user_id = UsersService.currentUserId();
    if (!vm.user_id){
      vm.user_id = 0;
    }
    console.log(vm.user_id);

		UsersService.getCreatedTrails(vm.user_id).then((resp)=>{
			vm.trailList = resp.data;
      console.log('vm.trailList', vm.trailList)
		});
	};



	init();



};

UserCreatedController.$inject = ['$state', 'UsersService', 'MapsService'];

export {UserCreatedController};
