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
package org.bigbluebutton.modules.whiteboard.services
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

  public class MessageReceiver implements IMessageListener
  {
	private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
    
        /* Injected by Mate */
    public var whiteboardModel:WhiteboardModel;
    
    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
    }

    public function onMessage(messageName:String, message:Object):void {
      // trace("WB: received message " + messageName);

      switch (messageName) {
        case "WhiteboardRequestAnnotationHistoryReply":
          handleRequestAnnotationHistoryReply(message);
          break;
        case "WhiteboardIsWhiteboardEnabledReply":
          handleIsWhiteboardEnabledReply(message);
          break;
        case "WhiteboardEnableWhiteboardCommand":
          handleEnableWhiteboardCommand(message);
          break;    
        case "WhiteboardNewAnnotationCommand":
          handleNewAnnotationCommand(message);
          break;  
        case "WhiteboardClearCommand":
          handleClearCommand(message);
          break;  
        case "WhiteboardUndoCommand":
          handleUndoCommand(message);
          break;  			
        default:
//          LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }

    private function handleClearCommand(message:Object):void {
      var map:Object = JSON.parse(message.msg);      
      
      if (map.hasOwnProperty("whiteboardId")) {
        whiteboardModel.clear(map.whiteboardId);
      }
      
    }

    private function handleUndoCommand(message:Object):void {
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("whiteboardId")) {
        whiteboardModel.undo(map.whiteboardId);
      }
    }

    private function handleEnableWhiteboardCommand(message:Object):void {
      var map:Object = JSON.parse(message.msg);
            
      whiteboardModel.enable(map.enabled);
    }
    
    private function handleNewAnnotationCommand(message:Object):void {
      var map:Object = JSON.parse(message.msg);
      var shape:Object = map.shape as Object;
      var an:Object = shape.shape as Object;
      
      var annotation:Annotation = new Annotation(shape.id, shape.type, an);
      annotation.status = shape.status;
      whiteboardModel.addAnnotation(annotation);
    }

    private function handleIsWhiteboardEnabledReply(message:Object):void {
      var map:Object = JSON.parse(message.msg);
    }

    private function handleRequestAnnotationHistoryReply(message:Object):void {
      var map:Object = JSON.parse(message.msg);      
   
      if (map.count != 0) {
        var annotations:Array = map.annotations as Array;
        var tempAnnotations:Array = new Array();
        
        for (var i:int = 0; i < map.count; i++) {
          var an:Object = annotations[i] as Object;
          var shape:Object = an.shapes as Object;                    
          var annotation:Annotation = new Annotation(an.id, an.type, shape);
          annotation.status = an.status;
          tempAnnotations.push(annotation);
        }   
                
        if (tempAnnotations.length > 0) {
          whiteboardModel.addAnnotationFromHistory(map.whiteboardId, tempAnnotations);
        }
      }
    }
  }
}
