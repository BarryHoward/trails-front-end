function UsersService ($http, $cookies) {

  // const SERVER = "https://beach-house-backend.herokuapp.com/";


//   let vm = this;

//   vm.login = login;
//   vm.isLoggedIn = isLoggedIn;
//   vm.isAdmin = isAdmin;
//   vm.setOwner = setOwner;
//   vm.logout = logout;
//   vm.getHeaders = getHeaders;
//   vm.getAllOwners = getAllOwners;
//   vm.newOwner = newOwner;
//   vm.newComment = newComment;
//   vm.getAllComments = getAllComments;


//   function login (owner) {
//     return $http.post(`${SERVER}login`, owner);
//   }

//   function isLoggedIn () {
//     return $cookies.get('username') ? true : false;
//   }

//   function isAdmin () {
//     return $cookies.get('admin') === 'true';
//   }

//   function logout () {
//     $cookies.remove('username');
//     $cookies.remove('access_token');
//     $cookies.remove('admin');
//   }

//   function setOwner (data) {
//     $cookies.put('username', data.username);
//     $cookies.put('access_token', data.access_token);
//     $cookies.put('admin', data.admin);
//   }

//   function getOwner (id) {
//     return $http.get(`${SERVER}/owners/${id}`)
//   }

//   function getAllOwners (){
//     return $http.get(`${SERVER}owners`)
//   }

//   function getAllComments (){
//     return $http.get(`${SERVER}comments`)
//   }

//   function getHeaders () {
//     let token = $cookies.get('access_token');
//     return {
//       Authorization: `Bearer ${token}`
//     };
//   }

//   function newOwner (info){
//     let req = {
//       url: `${SERVER}owners`,
//       data: info,
//       method: 'POST',
//       headers: vm.getHeaders()
//     };
//     return $http(req)
//   }

//     function newComment (info){
//       let req = {
//         url: `${SERVER}comments`,
//         data: info,
//         method: 'POST',
//         headers: vm.getHeaders()
//       };
//     return $http(req)
//   }

};

UsersService.$inject = ['$http', '$cookies'];
export { UsersService };