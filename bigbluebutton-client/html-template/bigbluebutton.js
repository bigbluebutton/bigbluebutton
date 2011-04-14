(function($){
	$.fn.bigbluebutton = function(options){
		
		$('body').append('<div id="speechArea" style="visibility:hidden"></div>');
		
		function sendSpeechMessage(){
			var speech = $('#speechArea');
			if (speech.html() !== ""){
				document.getElementById('BigBlueButton').sendChatMessage(speech.html());
				speech.html("");
			}
			setTimeout(sendSpeechMessage, 300);
		}
		sendSpeechMessage();
	
	}
})(jQuery);

$(function () { $.fn.bigbluebutton(); });
