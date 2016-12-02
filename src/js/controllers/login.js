function LoginController (UsersService, $state) {
  let vm = this;
  vm.login = login;

  function login(userInfo) {
    console.log('I got clicked!')
    console.log(userInfo)
    UsersService.login(userInfo).then(
      (resp) => {
        $state.go('root.home')
        console.log(resp)
      },
      (errors) => {
        console.log(errors)
      }
    );
  };

};
LoginController.$inject = ['UsersService', '$state']
export {LoginController}
