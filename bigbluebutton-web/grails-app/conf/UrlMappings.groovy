class UrlMappings {

	static mappings = {
		"/presentation/upload"(controller:"presentation") {
			action = [POST:'upload']
		}

		"/presentation/checkPresentation"(controller:"presentation") {
			action = [GET:'checkPresentationBeforeUploading']
		}

		"/presentation/test-convert"(controller:"presentation") {
			action = [GET:'testConversion']
		}
      
		"/presentation/$conference/$room/$presentation_name/slides"(controller:"presentation") {
			action = [GET:'numberOfSlides']
		}
      
		"/presentation/$conference/$room/$presentation_name/slide/$id"(controller:"presentation") {
			action = [GET:'showSlide']
		}
      
		"/presentation/$conference/$room/$presentation_name/thumbnails"(controller:"presentation") {
			action = [GET:'numberOfThumbnails']
		}
      
		"/presentation/$conference/$room/$presentation_name/thumbnail/$id"(controller:"presentation") {
			action = [GET:'showThumbnail']
		}

		"/presentation/$conference/$room/$presentation_name/svgs"(controller:"presentation") {
			action = [GET:'numberOfSvgs']
		}

		"/presentation/$conference/$room/$presentation_name/svg/$id"(controller:"presentation") {
			action = [GET:'showSvgImage']
		}
	  
		"/presentation/$conference/$room/$presentation_name/textfiles"(controller:"presentation") {
			action = [GET:'numberOfTextfiles']
		}
  
		"/presentation/$conference/$room/$presentation_name/textfiles/$id"(controller:"presentation") {
			action = [GET:'showTextfile']
		}

		"/presentation/$conference/$room/$presentation_name/download"(controller:"presentation") {
			action = [GET:'downloadFile']
		}
      
		"/api/setConfigXML"(controller:"api") {
			action = [POST:'setConfigXML']
		}

		"/api/setPollXML"(controller:"api") {
			action = [POST:'setPollXML']
		}

		"/api/getMeetings"(controller:"api") {
			action = [GET:'getMeetingsHandler', POST:'getMeetingsHandler']
		}

		"/api/getSessions"(controller:"api") {
			action = [GET:'getSessionsHandler', POST:'getSessionsHandler']
		}

		"/api/getRecordings"(controller:"api") {
			action = [GET:'getRecordingsHandler', POST:'getRecordingsHandler']
		}

		"/api/updateRecordings"(controller:"api") {
			action = [GET:'updateRecordingsHandler', POST:'updateRecordingsHandler']
		}

		"/api/getRecordingTextTracks"(controller:"recording") {
			action = [GET:'getRecordingTextTracks']
		}

		"/api/putRecordingTextTrack"(controller:"recording") {
			action = [POST:'putRecordingTextTrack']
		}

		"/$controller/$action?/$id?(.${format})?"{
			constraints {
				// apply constraints here
			}
		}

		"/"(controller:"api") {
			action = [GET:'index']
		}
		
		"500"(view:'/error')
	}
}
