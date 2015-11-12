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
package org.bigbluebutton.modules.present.services.messaging
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;
  
  public class MessageSender {
    
	private static const LOGGER:ILogger = getClassLogger(MessageSender);
    
    /**
     * Send an event to the server to update the presenter's cursor view on the client 
     * @param xPercent
     * @param yPercent
     * 
     */		
    public function sendCursorUpdate(xPercent:Number, yPercent:Number):void{
      var message:Object = new Object();
      message["xPercent"] = xPercent;
      message["yPercent"] = yPercent;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.sendCursorUpdate", 
        function(result:String):void { // On successful result
		  //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );		      
    }
    
    /**
     * Sends an event to the server to update the clients with the new slide position 
     * @param slideXPosition
     * @param slideYPosition
     * 
     */		
    public function move(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void{
      var message:Object = new Object();
      message["xOffset"] = xOffset;
      message["yOffset"] = yOffset;
      message["widthRatio"] = widthRatio;
      message["heightRatio"] = heightRatio;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.resizeAndMoveSlide", 
        function(result:String):void { // On successful result
          //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );	
    }
    
    public function sharePresentation(share:Boolean, presentationID:String):void {
      var message:Object = new Object();
      message["presentationID"] = presentationID;
      message["share"] = share;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.sharePresentation", 
        function(result:String):void { // On successful result
		  //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );
    }
    
    public function goToPage(id: String):void {
      var message:Object = new Object();
      message["page"] = id;      
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.gotoSlide", 
        function(result:String):void { // On successful result
		  //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );
    }
    
    public function getPresentationInfo():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.getPresentationInfo", 
        function(result:String):void { // On successful result
		  //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        }
      );
      
    }
    
    public function removePresentation(name:String):void {
      var message:Object = new Object();
      message["presentationID"] = name;          

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.removePresentation", 
        function(result:String):void { // On successful result
		  //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        },
        message
      );
    }
    
    public function clearPresentation() : void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.clear", 
        function(result:String):void { // On successful result
		  //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        }
      );		
    }
    
    public function queryPresenterForSlideInfo():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("presentation.getSlideInfo", 
        function(result:String):void { // On successful result
		  //LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
		  LOGGER.error(status); 
        }
      );
    }
  }
}