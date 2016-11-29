function routerConfig ($stateProvider , $urlRouterProvider) {

  $stateProvider
     .state('root', {
       abstract: true,
       templateUrl: 'templates/root.tpl.html',
       controller: 'RootController as root'
     })

     .state('root.home', {
       url: '/home',
       templateUrl: 'templates/home.tpl.html',
       controller: 'HomeController as home'
     })
     .state('root.owners', {
      url: '/owners',
      templateUrl: 'templates/ownerList.tpl.html',
      controller: 'OwnerListController as ownList'
    })
     .state('root.ownerNew', {
      url: '/owners/new',
      templateUrl: 'templates/ownerNew.tpl.html',
      controller: 'OwnerNewController as ownNew'
     })
     .state('root.ownerInfo', {
      url: '/owners/:id',
      templateUrl: 'templates/ownerInfo.tpl.html',
      controller: 'OwnerInfoController as ownInfo'
     })
     .state('root.login', {
      url: '/login',
      templateUrl: 'templates/login.tpl.html',
      controller: 'LoginController as login'
     })

     .state('root.comments', {
      url: '/comments',
      templateUrl: 'templates/commentList.tpl.html',
      controller: 'CommentListController as comList'
     })
     .state('root.newComment', {
      url: '/comments/new',
      templateUrl: 'templates/commentNew.tpl.html',
      controller: 'CommentNewController as comNew'
      })
      .state('root.topTrails', {
        url: '/trails/top',
        templateUrl: 'templates/topTrails.tpl.html',
        controller: 'TopTrailsController as topTrails'
      })
      .state('root.trails', {
        url: '/trails',
        abstract: true,
        templateUrl: 'templates/trails.tpl.html',
        controller: 'TrailController as trail'
      })
      .state('root.trails.new', {
       url: '/new',
       templateUrl: 'templates/trails.trailNew.tpl.html',
       controller: 'TrailNewController as trailNew'
     })
     .state('root.trails.update', {
       url: '/:id/update',
       templateUrl: 'templates/trailUpdate.tpl.html',
       controller: 'TrailUpdateController as trailUpdate'
     })
    //  .state('root.trails.view', {
    //    url: '/:id/view',
    //    templateUrl: 'templates/trailView.tpl.html',
    //    controller: 'TrailViewController as trailView'
    //  })
     //

     $urlRouterProvider.otherwise('/home');
};

routerConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
export { routerConfig };
