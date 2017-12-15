$(function () {
	setTimeout(function(){
		   $('#BigBlueButton').focus();
	},2000);
});

function startFlashFocus() {
	f = $('#BigBlueButton')[0]
	f.tabIndex = 0;
	f.focus();
}

function stopFlashFocus() {
	$('#enterFlash')[0].focus();
}

// http://stackoverflow.com/questions/5916900/detect-version-of-browser
navigator.sayswho= (function(){
    var ua= navigator.userAgent, 
        N= navigator.appName, 
        tem, 
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i) || [];
    M= M[2]? [M[1], M[2]]:[N, navigator.appVersion, '-?'];
    if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
    return M;
})();