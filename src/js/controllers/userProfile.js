function UserProfileController ($state, UsersService, MapsService) {
  let vm = this;
  vm.updatingUsername = false;
  vm.updatingEmail = false;
  vm.updatingAvatar = false;
  vm.changeUsername = changeUsername;
  vm.changeEmail = changeEmail;
  vm.changeAvatar = changeAvatar;
  vm.UsersService = UsersService;
  vm.user_id = UsersService.currentUserId();
  vm.editUser = editUser;

  init();

  function init(){
      UsersService.getUser(vm.user_id).then(function (resp) {
      vm.user = resp.data;
      console.log('vm.user', vm.user)

    });
  }

  function changeUsername () {
    if (vm.updatingUsername){
      editUser();
    }
    vm.updatingUsername = !vm.updatingUsername;
  }

  function changeEmail () {
    if (vm.updatingEmail){
      editUser();
    }
    vm.updatingEmail = !vm.updatingEmail;
  }

  function changeAvatar () {
    if (vm.updatingAvatar){
      editUser();
    }
    vm.updatingAvatar = !vm.updatingAvatar;
  }

  function editUser(){
    UsersService.editUser(vm.user).then((resp) =>{
      console.log(resp)
    }, (reject) => {
      console.log(reject)
    })
  }


}
UserProfileController.$inject = ['$state', 'UsersService', 'MapsService'];

export {UserProfileController};
