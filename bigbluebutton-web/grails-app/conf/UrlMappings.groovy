class UrlMappings {
    static mappings = {
//    	"/presentation/$presentation_name"(controller:"presentation") {
 //     	  println 'executing /presentation/default mapping'
 //       	action = [GET:'show', POST:'upload', DELETE:'delete']
 //       }
      "/presentation/upload"(controller:"presentation") {
    	  println 'executing /presentation/default mapping'
      	action = [GET:'show', POST:'upload', DELETE:'delete']
      }
      
      "/presentation/$presentation_name/slides"(controller:"presentation") {
      		action = [GET:'numberOfSlides']
      }
      
      "/presentation/$presentation_name/slide/$id"(controller:"presentation") {
      		action = [GET:'showSlide']
      }
      
      "/presentation/$presentation_name/thumbnails"(controller:"presentation") {
      		action = [GET:'numberOfThumbnails']
      }
      
      "/presentation/$presentation_name/thumbnail/$id"(controller:"presentation") {
      		action = [GET:'showThumbnail']
      }
      
      "/$controller/$action?/$id?"{
    	  println "${controller} ${action} mapping"
	      constraints {
			 // apply constraints here
		  }
	  }
	  "500"(view:'/error')
	  
	  "/" (controller: 'conference', action: 'list')
	}
}
