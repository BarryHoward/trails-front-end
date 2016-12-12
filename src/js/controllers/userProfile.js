function UserProfileController ($state, UsersService, MapsService) {
  let vm = this;
  vm.changeUsername = changeUsername;
  vm.updatingUsername = false;
  vm.updatingEmail = false;
  vm.updatingAvatar = false;

  function changeUsername () {
    vm.updatingUsername = !vm.updatingUsername;
    console.log(vm.updatingUsername);
    return updatingUsername;
  }

  function changeEmail () {
    vm.updatingEmail = !vm.updatingEmail;
    console.log(vm.updatingEmail);
    return updatingEmail;
  }

  function changeAvatar () {
    vm.updatingAvatar = !vm.updatingAvatar;
    console.log(vm.updatingAvatar);
    return updatingAvatar;
  }
}
UserProfileController.$inject = ['$state', 'UsersService', 'MapsService'];

export {UserProfileController};
