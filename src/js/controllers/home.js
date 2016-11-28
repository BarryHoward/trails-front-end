function HomeController ($state) {
  let vm = this;
  console.log("home")
};

HomeController.$inject = ['$state'];
export {HomeController};