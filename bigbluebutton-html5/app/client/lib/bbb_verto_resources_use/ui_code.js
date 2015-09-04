this.makeDeskshareResolutions = function () {
	var videoConstraints = getAllPresetVideoResolutions();
	for(var i in videoConstraints) {
		v = videoConstraints[i];
		$("#deskshareResolutions").append("<input type='radio' name='deskshareQuality' id='deskshareQuality_" + i + "' value='" + i + "'>");
		$("#deskshareResolutions").append("<label for='deskshareQuality_" + i + "'>" + v.name + " " + v.constraints.minWidth + "x" + v.constraints.minHeight + "</label>");
	}
	$("#deskshareQuality_qvga").prop("checked", true);
}

this.makeWebcamResolutions = function () {
	var videoConstraints = getAllPresetVideoResolutions();
	for(var i in videoConstraints) {
		v = videoConstraints[i];
		$("#webcamResolutions").append("<input type='radio' name='webcamQuality' id='webcamQuality_" + i + "' value='" + i + "'>");
		$("#webcamResolutions").append("<label for='webcamQuality_" + i + "'>" + v.name + " " + v.constraints.minWidth + "x" + v.constraints.minHeight + "</label>");
	}
	$("#webcamQuality_qvga").prop("checked", true);
}
