/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
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
      
      "/$controller/$action?/$id?"{
	      constraints {
			 // apply constraints here
		  }
	  }
	  "500"(view:'/error')
	  
	  "/" (controller: 'conference', action: 'list')
	  
	}
}
