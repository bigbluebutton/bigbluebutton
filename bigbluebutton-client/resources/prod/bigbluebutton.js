(function($){
	$.fn.bigbluebutton = function(options){
		//Append other bigbluebutton scripts to the document.
		jQuery('<script src="bbb_localization.js" language="javascript"></script>').appendTo('head');
		jQuery('<script src="deployJava.js" language="javascript"></script>').appendTo('head');
		jQuery('<script src="bbb_blinker.js" language="javascript"></script>').appendTo('head');
		jQuery('<script src="bbb_deskshare.js" language="javascript"></script>').appendTo('head');
		
	}
})(jQuery);

$(function () { $.fn.bigbluebutton(); });
