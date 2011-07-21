function getUrlParameters() {
    var map = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    map[key] = value;
    });
    return map; 
}

(function($){
	
	var audio;
    	var events = new Array();
    	var params = getUrlParameters();
	var MEETINGID = params['meetingId']
    	var HOST = window.location.hostname
    	var RECORDINGS = "http://" + HOST + "/slides/" + MEETINGID
	var PRESENTATION = RECORDINGS + '/presentation/'
	var LOGO = 'logo.png';
		
	$(document).ready(function(){
		$.ajax({
			type: "GET",
			url: RECORDINGS + "/events.xml",
			dataType: "xml",
			success: preLoadImages
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

	function preLoadImages(xml){
		var presentationName;
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
			var eventName = event.attr("eventname");
			if( eventName === 'SharePresentationEvent' ){
				presentationName=event.find("presentationName").text();
			}else if( eventName === "GotoSlideEvent"){
				var time = (event.attr("timestamp") - start)/1000;
				var slide = event.find("slide").text();
				var imageObj = {
					'time' : time,
					'presentation' : presentationName,
					'name' : slide
				};
				events.push(imageObj);
				loadHiddenImage(imageObj);

			}
		});
		
		function loadHiddenImage(imgObj){

			var id = imgObj.presentation + "_" + imgObj.name;
			var duplicateImages = $('#'+id);
			if(duplicateImages.length == 0){
				var source = PRESENTATION + imgObj.presentation + "/slide-" + (parseInt(imgObj.name)+1) + ".png"; 
				var img = new Image();
				img.src = source;
				$(img).hide();
				$(img).attr('id',id);
				$(img).height(600);
				$(img).width(800);
				$('#slidesContainer').append(img);			
			}
			
		}
	}
	
	
	function onTimeUpdate(){
		var now = audio.currentTime;
		sinfo = document.getElementById('slideinfo');
        

        
		 var lastTransition = events[events.length-1].time;
		    if (lastTransition < now) {
		      var event = events[events.length-1];    
		      $('#slidesContainer img').hide();
		      $('#'+event.presentation + '_' + event.name).show();		
		      return;                
		}
        
		$.each(events, function(index, value){
			var time = value.time;
			if (events[index + 1] == null) return; //Break for last slide, to avoid null reference error
			if ((time < now && events[index + 1].time > now)) {
				var event = events[index];
				 $('#slidesContainer img').hide();
                      		 $('#'+event.presentation + '_' + event.name).show();
			} 
		});
        
        
	}
	
})(jQuery);

