(function($){
	
	var slideTransitions = new Array();
    var presentations = new Array();
    var presentationName;
	var audio;
	var meetingTime;
	
	var RECORDING = 'workspace'
	var PRESENTATION = 'workspace/presentations/'
	var LOGO = 'logo.png';
	
	//$.fn.bbb.playback = function(){
	//	
	//};
	
	$(document).ready(function(){
		$.ajax({
			type: "GET",
			url: "workspace/event.xml",
			dataType: "xml",
			success: parseXml
		});
		
	});
	
	window.addEventListener('load', function(){
		audio = document.getElementById('audioRecording');
		audio.setAttribute('src', RECORDING + '/recording.ogg');
		audio.load();
		
		audio.addEventListener('load', function(){
			audio.play();
		}, true);
		
		audio.addEventListener('timeupdate', onTimeUpdate, false);
	}, false);
	
	function parseXml(xml){
		//Find the timestamp the meeting started, so we can calculate relative offsets of events		
		var start;
		$(xml).find("event").each(function(){
			var event = $(this);
			if (event.attr('name') === 'ParticipantJoinEvent'){
				start = event.attr('timestamp');
				return false; //Breaks the each() loop
			}
		});
		
		$(xml).find("event").each(function(){
			var event = $(this);
			if (event.attr('name') === 'EndAndKickAllEvent'){
				meetingTime = event.attr('timestamp') - start;
			}
		});

        var p = 0;
		$(xml).find("event").each(function(){
			var event = $(this);
			if (event.attr('name') === 'SharePresentationEvent'){
				var sharePresentationEvent = {

					name : event.find('presentationName').text(),                    
					time : (event.attr('timestamp') - start) / 1000
				};
                alert('presentationName=' + event.find('presentationName').text());
				presentations[p] = sharePresentationEvent;
                p++;
			}
		});
		
		var i = 0;
		$(xml).find("event").each(function(){
			var event = $(this);
			if (event.attr('name') === 'GotoSlideEvent'){
				var transitionEvent = {
					slide : event.find('slide').text(),                    
					time : (event.attr('timestamp') - start) / 1000
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
		
		$.each(presentations, function(index, value){
			var time = value.time;
			
			if (time < now && presentations[index].time < now){
				presentationName = presentations[index].name				
			} 
		});        
        
		$.each(slideTransitions, function(index, value){
			var time = value.time;
			
			if (slideTransitions[index + 1] == null) return; //Break for last slide, to avoid null reference error
			
			if (time < now && slideTransitions[index + 1].time > now){
				var slideIndex = parseInt(value.slide) + 1; //A workaround for Issue 821
				var slideToShow = PRESENTATION + presentationName + '/slide-' + slideIndex + '.png';
				$('#imgSlide').attr('src', slideToShow);
                $('#slide').text = slideToShow;
			} 
		});
        
        
	}
	
})(jQuery);

