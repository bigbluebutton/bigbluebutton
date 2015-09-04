/*
	JSON definitions of all preset screen resolutions verto/bigBlueButton will
	support
*/
var videoConstraints = [];
// BigBlueButton low
videoConstraints["low"] = {
	"name": "Low quality",
	"constraints": {
		"minWidth": 160,
		"minHeight": 120,
		"maxWidth": 160,
		"maxHeight": 120,
		"minFrameRate": 10,
		"vertoBestFrameRate": 10
	}
};
// BigBlueButton medium
videoConstraints["medium"] = {
	"name": "Medium quality",
	"constraints": {
		"minWidth": 320,
		"minHeight": 240,
		"maxWidth": 320,
		"maxHeight": 240,
		"minFrameRate": 10,
		"vertoBestFrameRate": 10
	}
};
// BigBlueButton high
videoConstraints["high"] = {
	"name": "High quality",
	"constraints": {
		"minWidth": 640,
		"minHeight": 480,
		"maxWidth": 640,
		"maxHeight": 480,
		"minFrameRate": 15,
		"vertoBestFrameRate": 15
	}
};
// verto defaults
videoConstraints["qvga"] = {
	"name": "QVGA",
	"constraints": {
		"minWidth": 320,
		"minHeight": 240,
		"maxWidth": 320,
		"maxHeight": 240,
		"minFrameRate": 15,
		"vertoBestFrameRate": 30
	}
};
videoConstraints["vga"] = {
	"name": "VGA",
	"constraints": {
		"minWidth": 640,
		"minHeight": 480,
		"maxWidth": 640,
		"maxHeight": 480,
		"minFrameRate": 15,
		"vertoBestFrameRate": 30
	}
};
videoConstraints["qvga_wide"] = {
	"name": "QVGA WIDE",
	"constraints": {
		"minWidth": 320,
		"minHeight": 180,
		"maxWidth": 320,
		"maxHeight": 180,
		"minFrameRate": 15,
		"vertoBestFrameRate": 30
	}
};
videoConstraints["vga_wide"] = {
	"name": "VGA WIDE",
	"constraints": {
		"minWidth": 640,
		"minHeight": 360,
		"maxWidth": 640,
		"maxHeight": 360,
		"minFrameRate": 15,
		"vertoBestFrameRate": 30
	}
};
videoConstraints["hd"] = {
	"name": "HD",
	"constraints": {
		"minWidth": 1280,
		"minHeight": 720,
		"maxWidth": 1280,
		"maxHeight": 720,
		"minFrameRate": 15,
		"vertoBestFrameRate": 30
	}
};
videoConstraints["hhd"] = {
	"name": "HHD",
	"constraints": {
		"minWidth": 1920,
		"minHeight": 1080,
		"maxWidth": 1920,
		"maxHeight": 1080,
		"minFrameRate": 15,
		"vertoBestFrameRate": 30
	}
};
videoConstraints["WUXGA"] = {
	"name": "WUXGA",
	"constraints": {
		"minWidth": 1920,
		"minHeight": 1200,
		"maxWidth": 1920,
		"maxHeight": 1200,
		"minFrameRate": 15,
		"vertoBestFrameRate": 30
	}
};

this.videoConstraints = videoConstraints;

/*
	Returns the above array of all preset, supported resolutions
*/
this.getAllPresetVideoResolutions = function () {
	return videoConstraints;
}

/*
	Initiates the verto instance and verto will query all available hardware
	Returns all resolutions the webcam device can support
*/
this.getAvailableResolutions = function (callback) {
	$.verto.init({}, function(){
		callback($.FSRTC.validRes);
	});
}

/*
	Will first assemble results from 'getAvailableResolutions'
	Then return the lowest supported resolution, highest supported, and the
	median resolution to stand in place for a 'low', 'medium', and 'high'
*/
this.getAdjustedResolutions = function (callback) {
	getAvailableResolutions(
		function(allResSupported){
			var adjustedResolutions = []; // store selected resolutions
			// the median in the group. Round down
			var median = allResSupported.length === 0 ? 0 : parseInt(allResSupported.length/2);
			// the highest supported
			var top = allResSupported.length === 0 ? 0 : allResSupported.length-1;
			adjustedResolutions["low"] = {"height": allResSupported[0][1], "width": allResSupported[0][0]};
			adjustedResolutions["medium"] = {"height": allResSupported[median][1], "width": allResSupported[median][0]};
			adjustedResolutions["high"] = {"height": allResSupported[top][1], "width": allResSupported[top][0]};
			callback(adjustedResolutions);
		}
	);
}
