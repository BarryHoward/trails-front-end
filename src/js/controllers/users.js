function UsersController (MapsService, UsersService, $state) {
  let vm = this;
  vm.MapsService = MapsService;
  vm.hikedTrailList = [];
  vm.createdTrailList = [];
  vm.user = {};

  function init(){
    vm.user_id = UsersService.currentUserId();
    if (!vm.user_id){
      vm.user_id = 0;
    }

    UsersService.getUser(vm.user_id).then(function (resp) {
      vm.user = resp.data;
      console.log('vm.user', vm.user)

    });

    UsersService.getHikedTrails(vm.user_id).then((resp)=>{
      vm.hikedTrailList = resp.data;
    });

    UsersService.getCreatedTrails(vm.user_id).then((resp)=>{
      vm.createdTrailList = resp.data;
    });
  };



  init();


};


UsersController.$inject = ['MapsService', 'UsersService', '$state'];
export {UsersController}
