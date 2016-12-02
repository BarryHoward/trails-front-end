function RegistrationController (UsersService, $state) {
  let vm = this;

  vm.create = create;

  function create (newUserInfo) {
      UsersService.newUser(newUserInfo).then(
        (resp) => {
          $state.go('root.login')
        },
        (errors) => {
          console.log(errors)
        }
      )
  }
}
RegistrationController.$inject = ['UsersService', '$state'];
export {RegistrationController}
