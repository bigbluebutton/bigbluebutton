class UrlMappings {
    static mappings = {
//    	"/presentation/$presentation_name"(controller:"presentation") {
 //     	  println 'executing /presentation/default mapping'
 //       	action = [GET:'show', POST:'upload', DELETE:'delete']
 //       }
      "/presentation/upload"(controller:"presentation") {
      		action = [GET:'show', POST:'upload', DELETE:'delete']
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
      
      "/conference-session/$action?/$id?"(controller:"publicScheduledSession") 
      
      "/schedule/$action?/$id?"(controller:"scheduledSession") {
//    	  action = [GET:'show', POST:'create', DELETE:'delete']
      }
      
      "/$controller/$action?/$id?"{
	      constraints {
			 // apply constraints here
		  }
	  }
	  "500"(view:'/error')
	  
	  "/" (controller: 'conference', action: 'list')
	}
}
