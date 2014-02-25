var poke = angular.module('poke', ['ui.router'])
	.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/');
		$stateProvider
		.state('home', {
			url: '/',
			templateUrl: '/templates/home.html',
			controller: 'HomeCtrl'
		});
	})
	.controller('HomeCtrl', function($scope, $http){
		console.log("Using HomeCtrl");

		//Initialize Location, probably turn this into a service or something.
		if(navigator.geolocation){ //This probably works because we're targeting mobile, which should have good support for this.
			navigator.geolocation.getCurrentPosition(
				function(pos){ //Handle success
					$scope.geoPosition = pos;
				},
				function(error){ //Handle failure
					if(error.code == 1){
						alert("You need to allow this app to access your location, otherwise it won't work!");
					}else{
						alert("Sorry, try reloading the page, we couldn't find your location.");
					}
				}
			);
		}else{
			alert("You ain't got no geolocation, get a better phone or browser so you can use this app.");
		}

	})
;