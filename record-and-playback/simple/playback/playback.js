function getUrlParameters() {
    var map = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    map[key] = value;
    });
    return map; 
}

(function($){
	
	var slideTransitions = new Array();
    var presentations = new Array();
    var presentationName;
	var audio;
	var meetingTime;
	
    var params = getUrlParameters();
	var MEETINGID = params['meetingId']
    var HOST = window.location.hostname
    var RECORDINGS = "http://" + HOST + "/recordings/" + MEETINGID
	var PRESENTATION = RECORDINGS + '/presentation/'
	var LOGO = 'logo.png';
		
	$(document).ready(function(){
		$.ajax({
			type: "GET",
			url: RECORDINGS + "/events.xml",
			dataType: "xml",
			success: parseXml
		});
	});
	
	window.addEventListener('load', function(){
		audio = document.getElementById('audioRecording');
		audio.setAttribute('src', RECORDINGS + '/audio/audio.ogg');
		audio.setAttribute('type','audio/ogg')
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
			if (event.attr('eventname') === 'ParticipantJoinEvent'){
				start = event.attr('timestamp');
				return false; //Breaks the each() loop
			}
		});
		
		$(xml).find("event").each(function(){
			var event = $(this);
			if (event.attr('eventname') === 'EndAndKickAllEvent'){
				meetingTime = event.attr('timestamp') - start;
			}
		});

    var p = 0;
		$(xml).find("event").each(function(){
			var event = $(this);
			if (event.attr('eventname') === 'SharePresentationEvent'){
				var sharePresentationEvent = {
					name : event.find('presentationName').text(),                    
					time : (event.attr('timestamp') - start) / 1000
				};
				presentations[p] = sharePresentationEvent;
        p++;
			}
		});
		    
		var i = 0;
		$(xml).find("event").each(function(){
			var event = $(this);
			if (event.attr('eventname') === 'GotoSlideEvent'){
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
		sinfo = document.getElementById('slideinfo');
        
		var firstTransition = slideTransitions[0].time;
		if (firstTransition > now){
			$('#imgSlide').attr('src', LOGO);
			return;
		}
		
    var lastTransition = slideTransitions[slideTransitions.length-1].time;
    if (lastTransition < now) {
      var slideIndex = parseInt(slideTransitions[slideTransitions.length-1].slide) + 1; 
      var slideToShow = PRESENTATION + presentationName + '/slide-' + slideIndex + '.png';
      $('#imgSlide').attr('src', slideToShow);      
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
			
			if ((time < now && slideTransitions[index + 1].time > now)) {
				var slideIndex = parseInt(value.slide) + 1; 
				var slideToShow = PRESENTATION + presentationName + '/slide-' + slideIndex + '.png';     
				$('#imgSlide').attr('src', slideToShow);
			} 
		});
        
        
	}
	
})(jQuery);
