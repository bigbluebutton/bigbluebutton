var myModule = angular.module('landingPage', []);



myModule.controller('MainCtrl', function($scope, $http) {
	$scope.postUsername = function(username) {
		console.log("the passed uname=" + this.username);
		jQuery.getJSON("config.json", function (json) {
			$http.post(json.settings.IP + ':' + json.settings.PORT + '/login?username=' +
			 $scope.username).success(function(res){
				console.log("SUCCESS," + res /*JSON.stringify(res)*/); //does not print
			});
		});
	}
});