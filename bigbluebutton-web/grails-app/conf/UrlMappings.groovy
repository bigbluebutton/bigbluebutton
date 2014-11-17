class UrlMappings {

	static mappings = {
		"/presentation/upload"(controller:"presentation") {
			action = [GET:'show', POST:'upload', DELETE:'delete']
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

		"/presentation/$conference/$room/$presentation_name/pngs"(controller:"presentation") {
			action = [GET:'numberOfPngs']
		}

		"/presentation/$conference/$room/$presentation_name/png/$id"(controller:"presentation") {
			action = [GET:'showPngImage']
		}
	  
		"/presentation/$conference/$room/$presentation_name/textfiles"(controller:"presentation") {
			action = [GET:'numberOfTextfiles']
		}
  
		"/presentation/$conference/$room/$presentation_name/textfiles/$id"(controller:"presentation") {
			action = [GET:'showTextfile']
		}
      
		"/api/setConfigXML"(controller:"api") {
			action = [POST:'setConfigXML']
		}

		"/api/setPollXML"(controller:"api") {
			action = [POST:'setPollXML']
		}

		"/api/getMeetings"(controller:"api") {
			action = [GET:'getMeetingsHandler']
		}
		
		"/api/getRecordings"(controller:"api") {
			action = [GET:'getRecordingsHandler']
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
