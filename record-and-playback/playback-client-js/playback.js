(function($){
	
	var slideTransitions = new Array();
	var audio;
	var meetingTime;
	
	var RECORDING = 'testmeeting'
	var PRESENTATION = 'testmeeting/ecosystem'
	var LOGO = 'logo.png';
	
	//$.fn.bbb.playback = function(){
	//	
	//};
	
	$(document).ready(function(){
		$.ajax({
			type: "GET",
			url: "testmeeting/manifest.xml",
			dataType: "xml",
			success: parseXml
		});
		
	});
	
	window.addEventListener('load', function(){
		audio = document.getElementById('audioRecording');
		audio.setAttribute('src', RECORDING + '/testmeeting.ogg');
		audio.load();
		
		audio.addEventListener('load', function(){
			audio.play();
		}, true);
		
		audio.addEventListener('timeupdate', onTimeUpdate, false);
	}, false);
	
	function parseXml(xml){
		//Find the timestamp the meeting started, so we can calculate relative offsets of events.
		var start;
		$(xml).find("participants").each(function(){
			var participant = $(this);
			if (participant.attr('event') === 'join'){
				start = participant.attr('timestamp');
				return false; //Breaks the each() loop
			}
		});
		
		$(xml).find("participants").each(function(){
			var participant = $(this);
			if (participant.attr('event') === 'leave_all'){
				meetingTime = participant.attr('timestamp') - start;
			}
		});
		
		var i = 0;
		$(xml).find("presentation").each(function(){
			var element = $(this);
			if (element.attr('event') === 'update_slide'){
				var transitionEvent = {
					slide : element.attr('slide'),
					time : (element.attr('timestamp') - start) / 1000
				};
				slideTransitions[i] = transitionEvent;
				i++;
			}
		});
		
	}
	
	function onTimeUpdate(){
		var now = audio.currentTime;
		
		var firstTransition = slideTransitions[0].time;
		if (firstTransition > now){
			$('#imgSlide').attr('src', LOGO);
			return;
		}
		
		$.each(slideTransitions, function(index, value){
			var time = value.time;
			
			if (slideTransitions[index + 1] == null) return; //Break for last slide, to avoid null reference error
			
			if (time < now && slideTransitions[index + 1].time > now){
				var slideIndex = parseInt(value.slide) + 1; //A workaround for Issue 821
				var slideToShow = PRESENTATION + '/slide-' + slideIndex + '.png';
				$('#imgSlide').attr('src', slideToShow);
			} 
		});
	}
	
})(jQuery);
