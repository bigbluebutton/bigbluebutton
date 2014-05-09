var myModule = angular.module('landingPage', []);

myModule.controller('MainCtrl', function($scope, $http) {
	$scope.username = "sampleNickname";
	$scope.postUsername = function() {
		$http.post('http://192.168.0.203:4000/login', $scope.username);
		//alert("Surprise!!");
	} 
});