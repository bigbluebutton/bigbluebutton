var myModule = angular.module('landingPage', []);

myModule.controller('MainCtrl', function($scope, $http) {
	//$scope.username = "antobinary";
	/*$scope.postUsername = function(username) {
		$http.post('http://192.168.0.203:4000/login?username=jojo', $scope.username);
		//alert("Surprise!!");
	}*/
	$scope.postUsername = function(username) {
		console.log("the passed uname=" + this.username);
		$http.post('http://192.168.0.203:4000/login?username=' + $scope.username).success(function(res){
			console.log("SUCCESS," + JSON.stringify(res.hi));
		});
	}
});