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

  function changeUsername () {
    vm.updatingUsername = !vm.updatingUsername;
    console.log(vm.updatingUsername);
  }

  function changeEmail () {
    vm.updatingEmail = !vm.updatingEmail;
    console.log(vm.updatingEmail);
  }

  function changeAvatar () {
    vm.updatingAvatar = !vm.updatingAvatar;
    console.log(vm.updatingAvatar);
  }

  function editUser(user){
    console.log('clicked!')
    console.log(user)
    UsersService.editUser(user).then((resp) =>{
      console.log(resp)
    }, (reject) => {
      console.log(reject)
    })
  }
}
UserProfileController.$inject = ['$state', 'UsersService', 'MapsService'];

export {UserProfileController};
