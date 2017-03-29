/*
 * Acorn Media Player - jQuery plugin 1.6
 *
 * Copyright (C) 2012 Ionut Cristian Colceriu
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * www.ghinda.net
 * contact@ghinda.net
 *
 */
 
(function($) {
	$.fn.acornMediaPlayer = function(options) {
		/*
		 * Define default plugin options
		 */
		var defaults = {
			theme: 'access',
			nativeSliders: false,
			volumeSlider: 'horizontal',
			captionsOn: false
		};
		options = $.extend(defaults, options);
		
		/* 
		 * Function for generating a unique identifier using the current date and time
		 * Used for generating an ID for the media elmenet when none is available
		 */
		var uniqueID = function() {
			var currentDate = new Date();
			return currentDate.getTime();
		};
		
		/* 
		 * Detect support for localStorage
		 */
		function supports_local_storage() {
			try {
				return 'localStorage' in window && window.localStorage !== null;
			} catch(e){
				return false;
			}
		}
		
		/*
		 * Get the volume value from localStorage
		 * If no value is present, define as maximum
		 */
		var volume = (supports_local_storage) ? localStorage.getItem('acornvolume') : 1;
		if(!volume) {
			volume = 1;
		}
		
		/* 
		 * Main plugin function
		 * It will be called on each element in the matched set
		 */
		var acornPlayer = function() {
			// set the acorn object, will contain the needed DOM nodes and others
			var acorn = {
				$self: $(this)
			};
			
			var loadedMetadata; // Is the metadata loaded
			var seeking; // The user is seeking the media
			var wasPlaying; // Media was playing when the seeking started
			var fullscreenMode; // The media is in fullscreen mode
			var captionsActive; // Captions are active
			
			/* Define all the texts used
			 * This makes it easier to maintain, make translations, etc.
			*/
			var text = {
				play: 'Play',
				playTitle: 'Start the playback',
				pause: 'Pause',
				pauseTitle: 'Pause the playback',
				mute: 'Mute',
				unmute: 'Unmute',
				fullscreen: 'Fullscreen',
				fullscreenTitle: 'Toggle fullscreen mode',
				swap: 'Swap',
				swapTitle: 'Toggle video and presention swap',
				volumeTitle: 'Volume control',
				seekTitle: 'Video seek control',
				captions: 'Captions',
				captionsTitle: 'Show captions',
				captionsChoose: 'Choose caption',
				transcript: 'Transcript',
				transcriptTitle: 'Show transcript'
			};
			
			// main wrapper element
			var $wrapper = $('<div class="acorn-player" role="application"></div>').addClass(options.theme);

			/*
			 * Define attribute tabindex on the main element to make it readchable by keyboard
			 * Useful when "aria-describedby" is present
			 *
			 * It makes more sense for screen reader users to first reach the actual <video> or <audio> elment and read of description of it,
			 * than directly reach the Media Player controls, without knowing what they control.
			 */
			acorn.$self.attr('tabindex', '0');		
			
			/*
			 * Check if the main element has an ID attribute
			 * If not present, generate one
			 */
			acorn.id = acorn.$self.attr('id');
			if(!acorn.id) {
				acorn.id = 'acorn' + uniqueID();
				acorn.$self.attr('id', acorn.id);
			}
			
			/* 
			 * Markup for the fullscreen button
			 * If the element is not <video> we leave if blank, as the button if useless on <audio> elements
			 */
			var fullscreenBtnMarkup = (acorn.$self.is('video')) ? '<button class="acorn-fullscreen-button" title="' + text.fullscreenTitle + '" aria-controls="' + acorn.id + '" tabindex="3">' + text.fullscreen + '</button>' : '';
			
			/* 
			 * Markup for the swap button
			 * If the element is not <video> we leave if blank, as the button if useless on <audio> elements
			 */
			var swapBtnMarkup = (acorn.$self.is('video')) ? '<button class="acorn-swap-button" title="' + text.swapTitle + '" aria-controls="' + acorn.id + '" tabindex="4" >' + text.swap + '</button>' : '';
			

			/*
			 * Complete markup
			 */
			var template = '<div class="acorn-controls">' +
								'<button class="acorn-play-button" title="' + text.playTitle + '" aria-controls="' + acorn.id + '" tabindex="1">' + text.play + '</button>' +
								'<input type="range" class="acorn-seek-slider" title="' + text.seekTitle + '" value="0" min="0" max="150" step="0.1" aria-controls="' + acorn.id + '" tabindex="2" />' +
								'<span class="acorn-timer">00:00</span>' +
								'<div class="acorn-volume-box">' +
									'<button class="acorn-volume-button" title="' + text.mute + '" aria-controls="' + acorn.id + '" tabindex="5" >' + text.mute + '</button>' +
									'<input type="range" class="acorn-volume-slider" title="' + text.volumeTitle + '" value="1" min="0" max="1" step="0.05" aria-controls="' + acorn.id + '" tabindex="6" />' +
								'</div>' +
								swapBtnMarkup +
								fullscreenBtnMarkup +
								'<button class="acorn-caption-button" title="' + text.captionsTitle + '"  aria-controls="' + acorn.id + '">' + text.captions + '</button>' +
								'<div class="acorn-caption-selector"></div>' +
								'<button class="acorn-transcript-button" title="' + text.transcriptTitle + '">' + text.transcript + '</button>' +
							'</div>';

			var captionMarkup = '<div class="acorn-caption"></div>';
			var transcriptMarkup = '<div class="acorn-transcript" role="region" aria-live="assertive"></div>';				
			
			/*
			 * Append the HTML markup
			 */
			
			// append the wrapper
			acorn.$self.after($wrapper);
			
			// For iOS support, I have to clone the node, remove the original, and get a reference to the new one.
			// This is because iOS doesn't want to play videos that have just been `moved around`.
			// More details on the issue: http://bugs.jquery.com/ticket/8015
			$wrapper[0].appendChild( acorn.$self[0].cloneNode(true) );
			
			acorn.$self.trigger('pause');
			acorn.$self.remove();
			acorn.$self = $wrapper.find('video, audio');
			
			// append the controls and loading mask
			acorn.$self.after(template).after('<div class="loading-media"></div>');
			
			/*
			 * Define the newly created DOM nodes
			 */
			acorn.$container = acorn.$self.parent('.acorn-player');
			
			acorn.$controls = $('.acorn-controls', acorn.$container);
			acorn.$playBtn = $('.acorn-play-button', acorn.$container);
			acorn.$seek = $('.acorn-seek-slider', acorn.$container);
			acorn.$timer = $('.acorn-timer', acorn.$container);
			acorn.$volume = $('.acorn-volume-slider', acorn.$container);
			acorn.$volumeBtn = $('.acorn-volume-button', acorn.$container);
			acorn.$fullscreenBtn = $('.acorn-fullscreen-button', acorn.$container);				
			acorn.$swapBtn = $('.acorn-swap-button', acorn.$container);	
			/*
			 * Append the markup for the Captions and Transcript
			 * and define newly created DOM nodes for these
			 */
			acorn.$controls.after(captionMarkup);
			acorn.$container.after(transcriptMarkup);
			
			acorn.$transcript = acorn.$container.next('.acorn-transcript');
			acorn.$transcriptBtn = $('.acorn-transcript-button', acorn.$container);
		
			acorn.$caption = $('.acorn-caption', acorn.$container);
			acorn.$captionBtn = $('.acorn-caption-button', acorn.$container);
			acorn.$captionSelector = $('.acorn-caption-selector', acorn.$container);
			
			/*
			 * Use HTML5 "data-" attributes to set the original Width&Height for the <video>
			 * These are used when returning from Fullscreen Mode
			 */
			acorn.$self.attr('data-width', acorn.$self.width());
			acorn.$self.attr('data-height', acorn.$self.height());
			
			/*
			 * Time formatting function
			 * Takes the number of seconds as a parameter and return a readable format "minutes:seconds"
			 * Used with the number of seconds returned by "currentTime"
			 */
			var timeFormat = function(sec) {
				var m = Math.floor(sec/60)<10?"0" + Math.floor(sec/60):Math.floor(sec/60);
				var s = Math.floor(sec-(m*60))<10?"0" + Math.floor(sec-(m*60)):Math.floor(sec-(m*60));
				return m + ":" + s;
			};
			
			/*
			 * PLAY/PAUSE Behaviour			 
			 *
			 * Function for the Play button
			 * It triggers the native Play or Pause events
			 */
			var playMedia = function() {
				if(!acorn.$self.prop('paused')) {
					acorn.$self.trigger('pause');
				} else {
					//acorn.$self.trigger('play');
					acorn.$self[0].play();
				}
				
				// We return false to stop the followup click event on tablets
				return false; 
			};
			
			/* 
			 * Functions for native playback events (Play, Pause, Ended)
			 * These are attached to the native media events.
			 *
			 * Even if the user is still using some form of native playback control (such as using the Context Menu)
			 * it will not break the behviour of our player.
			 */
			var startPlayback = function() {
				acorn.$playBtn.text(text.pause).attr('title', text.pauseTitle);
				acorn.$playBtn.addClass('acorn-paused-button');

				// if the metadata is not loaded yet, add the loading class
				if (!loadedMetadata) $wrapper.addClass('show-loading');
			};
			
			var stopPlayback = function() {
				acorn.$playBtn.text(text.play).attr('title', text.playTitle);
				acorn.$playBtn.removeClass('acorn-paused-button');
			};
			
			/*
			 * SEEK SLIDER Behaviour
			 * 
			 * Updates the Timer and Seek Slider values
			 * Is called on each "timeupdate"
			 */
			var seekUpdate = function() {
				var currenttime = acorn.$self.prop('currentTime');
				acorn.$timer.text(timeFormat(currenttime));	
				
				// If the user is not manualy seeking
				if(!seeking) {
					// Check type of sliders (Range <input> or jQuery UI)
					if(options.nativeSliders) {
						acorn.$seek.attr('value', currenttime);
					} else {
						acorn.$seek.slider('value', currenttime);
					}
				}
			};
			
			/*
			 * Time formatting function
			 * Takes the number of seconds as a paramenter
			 * 
			 * Used with "aria-valuetext" on the Seek Slider to provide a human readable time format to AT
			 * Returns "X minutes Y seconds"
			 */
			var ariaTimeFormat = function(sec) {
				var m = Math.floor(sec/60)<10?"" + Math.floor(sec/60):Math.floor(sec/60);
				var s = Math.floor(sec-(m*60))<10?"" + Math.floor(sec-(m*60)):Math.floor(sec-(m*60));
				var formatedTime;
									
				var mins = 'minutes';
				var secs = 'seconds';
				
				if(m == 1) {
					min = 'minute';
				}
				if(s == 1) {
					sec = 'second';
				}
				
				if(m === 0) {
					formatedTime = s + ' ' + secs;
				} else {						
					formatedTime = m + ' ' + mins + ' ' + s + ' ' + secs;
				}				
				
				return formatedTime;
			};
			
			/* 
			 * jQuery UI slider uses preventDefault when clicking any element
			 * so it stops the Blur event from being fired.
			 * This causes problems with the Caption Selector.
			 * We trigger the Blur event manually.
			 */
			var blurCaptionBtn = function() {
				acorn.$captionBtn.trigger('blur');				
			};
			
			/*
			 * Triggered when the user starts to seek manually
			 * Pauses the media during seek and changes the "currentTime" to the slider's value
			 */
			var startSeek = function(e, ui) {					
				if(!acorn.$self.attr('paused')) {
					wasPlaying = true;
				}
				acorn.$self.trigger('pause');
				seeking = true;
				
				var seekLocation;
				if(options.nativeSliders) {
					seekLocation = acorn.$seek.val();
				} else {
					seekLocation = ui.value;
				}
				
				acorn.$self[0].currentTime = seekLocation;
				
				// manually blur the Caption Button
				blurCaptionBtn();
			};
			
			/*
			 * Triggered when user stoped manual seek
			 * If the media was playing when seek started, it triggeres the playback,
			 * and updates ARIA attributes
			 */
			var endSeek = function(e, ui) {
				if(wasPlaying) {
					acorn.$self.trigger('play');
					wasPlaying = false;
				}
				seeking = false;			
				var sliderUI = $(ui.handle);
				sliderUI.attr("aria-valuenow", parseInt(ui.value, 10));
				sliderUI.attr("aria-valuetext", ariaTimeFormat(ui.value));
			};
			
			/*
			 * Transforms element into ARIA Slider adding attributes and "tabindex"
			 * Used on jQuery UI sliders
			 * 
			 * Will not needed once the jQuery UI slider gets built-in ARIA 
			 */ 
			var initSliderAccess = function (elem, opts) {
				var accessDefaults = {
				 'role': 'slider',
				 'aria-valuenow': parseInt(opts.value, 10),
				 'aria-valuemin': parseInt(opts.min, 10),
				 'aria-valuemax': parseInt(opts.max, 10),
				 'aria-valuetext': opts.valuetext
				};
				elem.attr(accessDefaults);        
			};
			
			/*
			 * Init jQuery UI slider
			 */
			var initSeek = function() {
				
				// get existing classes
				var seekClass = acorn.$seek.attr('class');
				
				// create the new markup
				var	divSeek = '<div class="' + seekClass + '" title="' + text.seekTitle + '"></div>';
				acorn.$seek.after(divSeek).remove();
				
				// get the newly created DOM node
				acorn.$seek = $('.' + seekClass, acorn.$container);
				
				// create the buffer element
				var bufferBar = '<div class="ui-slider-range acorn-buffer"></div>';
				acorn.$seek.append(bufferBar);
				
				// get the buffer element DOM node
				acorn.$buffer = $('.acorn-buffer', acorn.$container);					
				
				// set up the slider options for the jQuery UI slider
				var sliderOptions = {
					value: 0,
					step: 1,
					orientation: 'horizontal',
					range: 'min',
					min: 0,
					max: 100
				}; 
				// init the jQuery UI slider
				acorn.$seek.slider(sliderOptions);
			
			};
			 
			/*
			 * Seek slider update, after metadata is loaded
			 * Attach events, add the "duration" attribute and generate the jQuery UI Seek Slider
			 */
			var updateSeek = function() {
				// Get the duration of the media
				var duration = acorn.$self[0].duration;			
				
				// Check for the nativeSliders option
				if(options.nativeSliders) {
					acorn.$seek.attr('max', duration);
					acorn.$seek.bind('change', startSeek);
					
					acorn.$seek.bind('mousedown', startSeek);						
					acorn.$seek.bind('mouseup', endSeek);
					
				} else {
					
					// set up the slider options for the jQuery UI slider
					var sliderOptions = {
						value: 0,
						step: 1,
						orientation: 'horizontal',
						range: 'min',
						min: 0,
						max: duration,
						slide: startSeek,
						stop: endSeek
					}; 
					// init the jQuery UI slider
					acorn.$seek.slider('option', sliderOptions);
					
					// add valuetext value to the slider options for better ARIA values
					sliderOptions.valuetext = ariaTimeFormat(sliderOptions.value);
					// accessify the slider
					initSliderAccess(acorn.$seek.find('.ui-slider-handle'), sliderOptions);
					
					// manully blur the Caption Button when clicking the handle
					$('.ui-slider-handle', acorn.$seek).click(blurCaptionBtn);
					
					// set the tab index
					$('.ui-slider-handle', acorn.$seek).attr("tabindex", "2");

					// show buffering progress on progress
					acorn.$self.bind('progress', showBuffer);
				}
				

				$wrapper.removeClass('show-loading');
				// remove the loading element
				//acorn.$self.next('.loading-media').remove();
				
			};
			
			/*
			 * Show buffering progress
			 */
			var showBuffer = function(e) {
				var max = parseInt(acorn.$self.prop('duration'), 10);
				var tr = this.buffered;
				if(tr && tr.length) {
					var buffer = parseInt(this.buffered.end(0)-this.buffered.start(0), 10);
					var bufferWidth = (buffer*100)/max;
					
					acorn.$buffer.css('width', bufferWidth + '%');
				}				
			};
			
			/*
			 * VOLUME BUTTON and SLIDER Behaviour
			 *
			 * Change volume using the Volume Slider
			 * Also update ARIA attributes and set the volume value as a localStorage item
			 */
			var changeVolume = function(e, ui) {
				// get the slider value
				volume = ui.value;
				// set the value as a localStorage item
				localStorage.setItem('acornvolume', volume);
				
				// check if the volume was muted before
				if(acorn.$self.prop('muted')) {
					acorn.$self.prop('muted', false);
					acorn.$volumeBtn.removeClass('acorn-volume-mute');
					acorn.$volumeBtn.text(text.mute).attr('title', text.mute);
				}
				
				// set the new volume on the media
				acorn.$self.prop('volume', volume);
				
				// set the ARIA attributes
				acorn.$volume.$handle.attr("aria-valuenow", Math.round(volume*100));
				acorn.$volume.$handle.attr("aria-valuetext", Math.round(volume*100) + ' percent');
				// manually trigger the Blur event on the Caption Button
				blurCaptionBtn();
			};
			
			/*
			 * Mute and Unmute volume
			 * Also add classes and change label on the Volume Button
			 */
			var muteVolume = function() {					
				if(acorn.$self.prop('muted') === true) {						
					acorn.$self.prop('muted', false);
					if(options.nativeSliders) {
						acorn.$volume.val(volume);
					} else {
						acorn.$volume.slider('value', volume);
					}
					
					acorn.$volumeBtn.removeClass('acorn-volume-mute');
					acorn.$volumeBtn.text(text.mute).attr('title', text.mute);
				} else {
					acorn.$self.prop('muted', true);
					
					if(options.nativeSliders) {
						acorn.$volume.val('0');
					} else {
						acorn.$volume.slider('value', '0');
					}
					
					acorn.$volumeBtn.addClass('acorn-volume-mute');
					acorn.$volumeBtn.text(text.unmute).attr('title', text.unmute);
				}
			};
			
			/*
			 * Init the Volume Button and Slider
			 *
			 * Attach events, create the jQuery UI Slider for the Volume Slider and add ARIA support
			 */
			var initVolume = function() {
				if(options.nativeSliders) {
					acorn.$volume.bind('change', function() {
						acorn.$self.prop('muted',false);
						volume = acorn.$volume.val();
						acorn.$self.prop('volume', volume);
					});
				} else {
					var volumeClass = acorn.$volume.attr('class');
				
					var	divVolume = '<div class="' + volumeClass + '" title="' + text.volumeTitle + '"></div>';
					acorn.$volume.after(divVolume).remove();
					
					acorn.$volume = $('.' + volumeClass, acorn.$container);
					
					var volumeSliderOptions = {
						value: volume,
						orientation: options.volumeSlider,
						range: "min",
						max: 1,
						min: 0,
						step: 0.1,
						animate: false,
						slide: changeVolume
					};
					
					acorn.$volume.slider(volumeSliderOptions);
					
					acorn.$volume.$handle = acorn.$volume.find('.ui-slider-handle');
					
					// change and add values to volumeSliderOptions for better values in the ARIA attributes
					volumeSliderOptions.max = 100;
					volumeSliderOptions.value = volumeSliderOptions.value * 100;
					volumeSliderOptions.valuetext = volumeSliderOptions.value + ' percent';
					initSliderAccess(acorn.$volume.$handle, volumeSliderOptions);
					acorn.$volume.$handle.attr("tabindex", "6");
					
					// show the volume slider when it is tabbed into
					acorn.$volume.$handle.focus(function(){
						if (!acorn.$volume.parent().is(":hover")) {
							acorn.$volume.addClass("handle-focused");
						}
					});
					acorn.$volume.$handle.blur(function(){
						acorn.$volume.removeClass("handle-focused");
					});
					// manully blur the Caption Button when clicking the handle
					$('.ui-slider-handle', acorn.$volume).click(blurCaptionBtn);
				}
				
				acorn.$volumeBtn.click(muteVolume);
			};
			
			/*
			 * FULLSCREEN Behviour
			 * 
			 * Resize the video while in Fullscreen Mode
			 * Attached to window.resize 
			 */
			var resizeFullscreenVideo = function() {
				acorn.$self.attr({
					'width': $(window).width(),
					'height': $(window).height()
				});
			};
			
			/* 
			 * Enter and exit Fullscreen Mode
			 * 
			 * Resizes the Width & Height of the <video> element
			 * and add classes to the controls and wrapper
			 */
			var goFullscreen = function() {
				if(fullscreenMode) {
					if(acorn.$self[0].webkitSupportsFullscreen) {
						acorn.$self[0].webkitExitFullScreen();
					} else {
						$('body').css('overflow', 'auto');
					
						var w = acorn.$self.attr('data-width');
						var h = acorn.$self.attr('data-height');
					
						acorn.$self.removeClass('fullscreen-video').attr({
							'width': w,
							'height': h
						});
						
						$(window).unbind('resize');
						
						acorn.$controls.removeClass('fullscreen-controls');
					}
					
					fullscreenMode = false;
					
				} else {						
					if(acorn.$self[0].webkitSupportsFullscreen) {
						acorn.$self[0].webkitEnterFullScreen();
					} else if (acorn.$self[0].mozRequestFullScreen) {
						acorn.$self[0].mozRequestFullScreen();
						acorn.$self.attr('controls', 'controls');
						document.addEventListener('mozfullscreenchange', function() {
							console.log('screenchange event found');
							if (!document.mozFullScreenElement) {
								acorn.$self.removeAttr('controls');
								//document.removeEventListener('mozfullscreenchange');
							}
						});
					} else {
						$('body').css('overflow', 'hidden');
					
						acorn.$self.addClass('fullscreen-video').attr({
							width: $(window).width(),
							height: $(window).height()
						});
						
						$(window).resize(resizeFullscreenVideo);
						
						acorn.$controls.addClass('fullscreen-controls');
					}
					
					fullscreenMode = true;
					
				}
			};	
			
			/* 
			 * Swap the video and presentation areas
			 * 
			 * Resizes and moves based on hard coded numbers
			 * Uses css to move it 
			 */

			var goSwap = function() {
                                acorn.$self.trigger('swap');
			}

			/* 
			 * CAPTIONS Behaviour
			 *		
			 * Turning off the captions
			 * When selecting "None" from the Caption Selector or when the caption fails to load
			 */			
			var captionBtnActiveClass = 'acorn-caption-active';
			var captionBtnLoadingClass = 'acorn-caption-loading';
			var transcriptBtnActiveClass = 'acorn-transcript-active';
			
			var captionRadioName = 'acornCaptions' + uniqueID();
			 
			var captionOff = function() {
				for (var i = 0; i < acorn.$track.length; i++) {
					var track = acorn.$track[i];
					track.track.mode = "disabled";
				}
				
				acorn.$captionBtn.removeClass(captionBtnActiveClass);
			};
			
			/*
			 * Initialize the Caption Selector
			 * Used when multiple <track>s are present
			 */
			var initCaptionSelector = function() {
				// calculate the position relative to the parent controls element
				var setUpCaptionSelector = function() {
					var pos = acorn.$captionBtn.offset();
					var top = pos.top - acorn.$captionSelector.outerHeight(true);
					var left = pos.left - ((acorn.$captionSelector.outerWidth(true) - acorn.$captionBtn.outerWidth(true))/2);
					
					var parentPos = acorn.$controls.offset();
					
					left = left - parentPos.left;
					top = top - parentPos.top;
					
					acorn.$captionSelector.css({
							'top': top,
							'left': left
						});
				};
				
				acorn.$fullscreenBtn.click(setUpCaptionSelector);
				$(window).resize(function() {
					setUpCaptionSelector();		
				});
				
				setUpCaptionSelector();
				
				/*
				 * Show and hide the caption selector based on focus rather than hover.
				 * This benefits both touchscreen and AT users.
				 */
				var hideSelector; // timeout for hiding the Caption Selector				
				var showCaptionSelector = function() {
					if(hideSelector) {
						clearTimeout(hideSelector);
					}
					acorn.$captionSelector.show();
				};
				var hideCaptionSelector = function() {
					hideSelector = setTimeout(function() {
						acorn.$captionSelector.hide();						
					}, 200);
				};
				
				/* Little TEMPORARY hack to focus the caption button on click
				   This is because Webkit does not focus the button on click */
				acorn.$captionBtn.click(function() {
					$(this).focus();
				});
				
				acorn.$captionBtn.bind('focus', showCaptionSelector);
				acorn.$captionBtn.bind('blur', hideCaptionSelector);
				
				$('input[name=' + captionRadioName + ']', acorn.$container).bind('focus', showCaptionSelector);
				$('input[name=' + captionRadioName + ']', acorn.$container).bind('blur', hideCaptionSelector);
				
				/*
				 * Make the Caption Selector focusable and attach events to it
				 * If we wouldn't do this, when we'd use the scroll on the Caption Selector, it would dissapear
				 */
				acorn.$captionSelector.attr('tabindex', '-1');
				acorn.$captionSelector.bind('focus', showCaptionSelector);
				acorn.$captionSelector.bind('blur', hideCaptionSelector);
			};
			
			/*
			 * Current caption loader
			 * Loads a SRT file and uses it as captions
			 * Takes the url as a parameter
			 */
			var loadCaption = function(url) {
				// Iterate through the available captions, and disable all but the selected one
				for (var i = 0; i < acorn.$track.length; i++) {
					var track = acorn.$track[i];
					if (track.getAttribute('src') == url) {
						track.track.mode = "showing";

						// TODO transcript markup?
						// show the Transcript Button						
						//acorn.$transcriptBtn.show();
						
						/* 
						 * Generate the markup for the transcript
						 * Markup based on Bruce Lawson's “Accessible HTML5 Video with JavaScripted captions”
						 * http://dev.opera.com/articles/view/accessible-html5-video-with-javascripted-captions/
						 */
						//var transcriptText = '';
						//$(captions).each(function() {
						//	transcriptText += '<span data-begin="' + parseInt(this.start, 10) + '" data-end=' + parseInt(this.end, 10) + '>' + this.content.replace("'","") + '</span>';
						//});
						// append the generated markup
						//acorn.$transcript.html(transcriptText);
					} else {
						track.track.mode = "disabled";
					}
				}
				captionsActive = true;
				acorn.$captionBtn.addClass(captionBtnActiveClass);
			};
			
			/*			 
			 * Show or hide the Transcript based on the presence of the active class
			 */
			var showTranscript = function() {
				if($(this).hasClass(transcriptBtnActiveClass)) {
					acorn.$transcript.hide();						
				} else {
					acorn.$transcript.show();
				}
				$(this).toggleClass(transcriptBtnActiveClass);
			};

			/*
			 * Caption loading and initialization
			 */
			var initCaption = function() {
				// Check if we have browser support for captions
				if (typeof(TextTrack) === "undefined") {
					return;
				}

				// get all <track> elements
				acorn.$track = $('track', acorn.$self);
				
				// if there is at least one <track> element, show the Caption Button
				if(acorn.$track.length) {
					acorn.$captionBtn.show();
				}
				
				// check if there is more than one <track> element
				// if there is more than one track element we'll create the Caption Selector
				if(acorn.$track.length>1) {
					// set a different "title" attribute
					acorn.$captionBtn.attr('title', text.captionsChoose);
					
					// markup for the Caption Selector
					var captionList = '<ul><li><label><input type="radio" name="' + captionRadioName + '" checked="true" />None</label></li>';					
					acorn.$track.each(function() {
						var tracksrc = $(this).attr('src');
						captionList += '<li><label><input type="radio" name="' + captionRadioName + '" data-url="' + $(this).attr('src') + '" />' + $(this).attr('label') + '</label></li>';
					});
					captionList += '</ul>';
					
					// append the generated markup
					acorn.$captionSelector.html(captionList);
					
					// change selected caption
					var changeCaption = function() {
						// get the original <track> "src" attribute from the custom "data-url" attribute of the radio input
						var tracksrc = $(this).attr('data-url');
						if(tracksrc) {
							loadCaption(tracksrc);						
						} else {
							// if there's not "data-url" attribute, turn off the caption
							captionOff();
						}
					};
					
					// attach event handler
					$('input[name=' + captionRadioName + ']', acorn.$container).change(changeCaption);
				
					// initialize Caption Selector
					initCaptionSelector();
					
					// load first caption if captionsOn is true
					var firstCaption = acorn.$track.first().attr('src');
					if(options.captionsOn) {
						loadCaption(firstCaption);
						$('input[name=' + captionRadioName + ']', acorn.$container).removeAttr('checked');
						$('input[name=' + captionRadioName + ']:eq(1)', acorn.$container).attr('checked', 'true');
					};
				} else if(acorn.$track.length) {
					// if there's only one <track> element
					// load the specific caption when activating the Caption Button
					var tracksrc = acorn.$track.attr('src');
					
					acorn.$captionBtn.bind('click', function() {		
						if($(this).hasClass(captionBtnActiveClass)) {
							captionOff();
						} else {
							loadCaption(tracksrc);
						}
					});

					// load default caption if captionsOn is true
					if(options.captionsOn) loadCaption(tracksrc);					
				}
				
				// attach event to Transcript Button
				acorn.$transcriptBtn.bind('click', showTranscript);
			};
			
			/*
			 * Initialization self-invoking function
			 * Runs other initialization functions, attaches events, removes native controls
			 */
			var init = function() {
				// attach playback handlers
				acorn.$playBtn.bind( 'touchstart click', playMedia);
				acorn.$self.bind( 'touchstart click' , playMedia);

				acorn.$self.bind('play', startPlayback);
				acorn.$self.bind('pause', stopPlayback);
				acorn.$self.bind('ended', stopPlayback);
				
				// update the Seek Slider when timeupdate is triggered
				acorn.$self.bind('timeupdate', seekUpdate);
				
				// bind Fullscreen Button
				acorn.$fullscreenBtn.click(goFullscreen);
				
				// bind Swap Button
				acorn.$swapBtn.click(goSwap);

				// initialize volume controls
				initVolume();				
				
				// add the loading class
				$wrapper.addClass('');
				
				if(!options.nativeSliders) initSeek();
				
				// once the metadata has loaded
				acorn.$self.bind('loadedmetadata', function() {
					/* I use an interval to make sure the video has the right readyState
					 * to bypass a known webkit bug that causes loadedmetadata to be triggered
					 * before the duration is available
					 */

					var t = window.setInterval(function() {
								if (acorn.$self[0].readyState > 0) {
									loadedMetadata = true;
									updateSeek();
									
									clearInterval(t);
								}
							}, 500);
					
					initCaption();					
				});
			
				// trigger update seek manualy for the first time, for iOS support
				updateSeek();
				
				// remove the native controls
				acorn.$self.removeAttr('controls');
				
				if(acorn.$self.is('audio')) {
					/*
					 * If the media is <audio>, we're adding the 'audio-player' class to the element.
					 * This is because Opera 10.62 does not allow the <audio> element to be targeted by CSS
					 * and this can cause problems with themeing.
					 */
					acorn.$container.addClass('audio-player');
				}
			}();
		
		};
		
		// iterate and reformat each matched element
		return this.each(acornPlayer);
	};

})(jQuery);
