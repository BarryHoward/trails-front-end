import angular from "angular";
import {routerConfig} from "./routes";
import 'angular-ui-router';
import 'angular-cookies';
import 'ngMap';

import {RootController} from "./controllers/root";
import {HomeController} from "./controllers/home";

import {TrailController} from "./controllers/trail";
import {TrailNewController} from "./controllers/trailNew";

import {OwnerService} from "./services/owner";



angular.module('app', ['ngMap', 'ui.router', 'ngCookies'])
	.config(routerConfig)
	.controller('RootController', RootController)
	.controller('HomeController', HomeController)
	.controller('TrailController', TrailController)
	.controller('TrailNewController', TrailNewController)
	.service('OwnerService', OwnerService)
