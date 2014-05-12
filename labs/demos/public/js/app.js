var myModule = angular.module('landingPage', []);

myModule.controller('MainCtrl', function($scope, $http) {
	$scope.postUsername = function(username) {
		console.log("the passed uname=" + this.username);
		$http.post('http://192.168.0.203:4000/login?username=' + $scope.username).success(function(res){
			console.log("SUCCESS," + JSON.stringify(res.hi));
		});
	}
});