import angular from "angular";
import 'angular-ui-router';
import 'angular-cookies';
import 'ngMap';
import 'chart.js';
import 'angular-chart.js';

import {routerConfig} from "./routes";

import {RootController} from "./controllers/root";
import {HomeController} from "./controllers/home";
import {TopTrailsController} from "./controllers/topTrails";
import {LoginController} from './controllers/login';
import {RegisterController} from './controllers/register';
import {TrailController} from "./controllers/trail";

//Trail Controllers
import {BlazeNewController} from "./controllers/blazeNew";
import {BlazeEditController} from "./controllers/blazeEdit";
import {MarkController} from "./controllers/mark";
import {HikeController} from "./controllers/hike";
import {ModalController} from "./controllers/modal";

//User Controllers
import {UsersController} from "./controllers/users";
import {UserHomeController} from "./controllers/userHome";
import {UserCreatedController} from "./controllers/userCreated";
import {UserHikedController} from "./controllers/userHiked";

//Services
import {UsersService} from "./services/users";
import {MapsService} from "./services/maps";
import {ChartsService} from "./services/charts";

//Models
import {icons} from "./models/icons";


angular.module('app', ['ngMap', 'ui.router', 'ngCookies', 'chart.js'])
	.config(routerConfig)

	.controller('RootController', RootController)
	.controller('HomeController', HomeController)
	.controller('TopTrailsController', TopTrailsController)
	.controller('LoginController', LoginController)
	.controller('RegisterController', RegisterController)
	.controller('TrailController', TrailController)

	.controller('BlazeNewController', BlazeNewController)
	.controller('BlazeEditController', BlazeEditController)
	.controller('MarkController', MarkController)
	.controller('HikeController', HikeController)
	.controller('ModalController', ModalController)

	.controller('UsersController', UsersController)
	.controller('UserHomeController', UserHomeController)
	.controller('UserCreatedController', UserCreatedController)
	.controller('UserHikedController', UserHikedController)

	.service('UsersService', UsersService)
	.service('MapsService', MapsService)
	.service('ChartsService', ChartsService)

	.constant('icons', icons)
