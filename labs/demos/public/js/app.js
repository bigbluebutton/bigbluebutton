var myModule = angular.module('landingPage', []);



myModule.controller('MainCtrl', function($scope, $http, $location, $window) {
	$scope.postUsername = function(username) {
		$scope.account = {
			"name": this.username,
			"password": 'oOoOoO'
		};
		jQuery.getJSON("config.json", function (json) {
			$http.post('/login', $scope.account).success(function(res) {
				alert(res.success.url);

				//TODO check if I really need $location

				//console.log(res.success.url);
				//$window.location.href = 'http://192.168.0.203:3000'; //res.success.url;
				//$window.location.href = json.settings.IP + ':' + json.settings.PORT;
			});
		}); 
	}
});


