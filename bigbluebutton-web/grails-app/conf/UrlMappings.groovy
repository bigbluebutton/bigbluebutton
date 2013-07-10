/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
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
	  
	  "/presentation/$conference/$room/$presentation_name/textfiles"(controller:"presentation") {
		    action = [GET:'numberOfTextfiles']
	  }
  
	  "/presentation/$conference/$room/$presentation_name/textfile/$id"(controller:"presentation") {
		   action = [GET:'showTextfile']
      }
      
	  "/api/setConfigXML"(controller:"api") {
		  action = [POST:'setConfigXML']
	 }

     "/api/setPollXML"(controller:"api") {
         action = [POST:'setPollXML']
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
