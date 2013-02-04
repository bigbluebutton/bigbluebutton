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
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
  import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

  public class MessageReceiver implements IMessageListener
  {
        /* Injected by Mate */
    public var whiteboardModel:WhiteboardModel;
    
    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
    }

    public function onMessage(messageName:String, message:Object):void {
      // LogUtil.debug("WB: received message " + messageName);

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
        case "WhiteboardChangePageCommand":
          handleChangePageCommand(message);
          break; 
        case "WhiteboardChangePresentationCommand":
          handleChangePresentationCommand(message);
          break; 				
        default:
//          LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }

    private function handleChangePresentationCommand(message:Object):void {
      // LogUtil.debug("Handle Whiteboard Change Presentation Command [ " + message.presentationID + ", " + message.numberOfPages + "]");
      whiteboardModel.changePresentation(message.presentationID, message.numberOfPages);
    }

    private function handleChangePageCommand(message:Object):void {
      // LogUtil.debug("Handle Whiteboard Change Page Command [ " + message.pageNum + ", " + message.numAnnotations + "]");
      whiteboardModel.changePage(message.pageNum, message.numAnnotations);
    }

    private function handleClearCommand(message:Object):void {
      // LogUtil.debug("Handle Whiteboard Clear Command ");
      whiteboardModel.clear();
    }

    private function handleUndoCommand(message:Object):void {
      // LogUtil.debug("Handle Whiteboard Undo Command ");
      whiteboardModel.undo();
      //            dispatcher.dispatchEvent(new WhiteboardUpdate(WhiteboardUpdate.SHAPE_UNDONE));
    }

    private function handleEnableWhiteboardCommand(message:Object):void {
      //if (result as Boolean) modifyEnabledCallback(true);
      // LogUtil.debug("Handle Whiteboard Enabled Command " + message.enabled);
      whiteboardModel.enable(message.enabled);
    }
    
    private function handleNewAnnotationCommand(message:Object):void {
      // LogUtil.debug("Handle new annotation[" + message.type + ", " + message.id + ", " + message.status + "]");
      if (message.type == undefined || message.type == null || message.type == "") return;
      if (message.id == undefined || message.id == null || message.id == "") return;
      if (message.status == undefined || message.status == null || message.status == "") return;
            
      var annotation:Annotation = new Annotation(message.id, message.type, message);
      annotation.status = message.status;
      whiteboardModel.addAnnotation(annotation);
    }

    private function handleIsWhiteboardEnabledReply(message:Object):void {
      //if (result as Boolean) modifyEnabledCallback(true);
      LogUtil.debug("Whiteboard Enabled? " + message.enabled);
    }

    private function handleRequestAnnotationHistoryReply(message:Object):void {
      //LogUtil.debug("handleRequestAnnotationHistoryReply: Annotation history for [" + message.presentationID + "," + message.pageNumber + "]");
            
      if (message.count == 0) {
        LogUtil.debug("handleRequestAnnotationHistoryReply: No annotations.");
      } else {
        LogUtil.debug("handleRequestAnnotationHistoryReply: Number of annotations in history = " + message.count);
        var annotations:Array = message.annotations as Array;
        var tempAnnotations:Array = new Array();
        
        for (var i:int = 0; i < message.count; i++) {
          var an:Object = annotations[i] as Object;
          
          if (an.type == undefined || an.type == null || an.type == "") return;
          if (an.id == undefined || an.id == null || an.id == "") return;
          if (an.status == undefined || an.status == null || an.status == "") return;

          //LogUtil.debug("handleRequestAnnotationHistoryReply: annotation id=" + an.id);
                    
          var annotation:Annotation = new Annotation(an.id, an.type, an);
          annotation.status = an.status;
          tempAnnotations.push(annotation);
        }   
                
        if (tempAnnotations.length > 0) {
          whiteboardModel.addAnnotationFromHistory(message.presentationID, message.pageNumber, tempAnnotations);
        }
      }
    }
  }
}