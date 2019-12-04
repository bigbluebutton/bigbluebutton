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
  import com.asfusion.mate.events.Dispatcher;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.events.PerformRttTraceEvent;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.whiteboard.models.Annotation;

  public class MessageReceiver implements IMessageListener
  {
	private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
    
  private var _dispatcher:Dispatcher = new Dispatcher();
  
    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
    }

    public function onMessage(messageName:String, message:Object):void {
      // trace("WB: received message " + messageName);

      switch (messageName) {
        case "GetWhiteboardAnnotationsRespMsg":
          handleGetWhiteboardAnnotationsRespMsg(message);
          break;
        case "ModifyWhiteboardAccessEvtMsg":
          handleModifyWhiteboardAccessEvtMsg(message);
          break;
        case "SendWhiteboardAnnotationEvtMsg":
          handleSendWhiteboardAnnotationEvtMsg(message);
          break;  
        case "ClearWhiteboardEvtMsg":
          handleClearWhiteboardEvtMsg(message);
          break;
        case "UndoWhiteboardEvtMsg":
          handleUndoWhiteboardEvtMsg(message);
          break;
        case "SendCursorPositionEvtMsg":
          handleSendCursorPositionEvtMsg(message);
          break;
        case "ServerToClientLatencyTracerMsg":
          handleServerToClientLatencyTracerMsg(message);
          break;
        case "DoLatencyTracerMsg":
          handleDoLatencyTracerMsg(message);
          break;
        default:
//          LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }

    private function handleClearWhiteboardEvtMsg(message:Object):void {
      if (message.body.hasOwnProperty("whiteboardId") && message.body.hasOwnProperty("fullClear") 
        && message.body.hasOwnProperty("userId")) {
        LiveMeeting.inst().whiteboardModel.clear(message.body.whiteboardId, message.body.fullClear, message.body.userId);
      }
    }

    private function handleUndoWhiteboardEvtMsg(message:Object):void {
      if (message.body.hasOwnProperty("whiteboardId") && message.body.hasOwnProperty("annotationId")) {
        LiveMeeting.inst().whiteboardModel.removeAnnotation(message.body.whiteboardId, message.body.annotationId);
      }
    }

    private function handleModifyWhiteboardAccessEvtMsg(message:Object):void {
      LiveMeeting.inst().whiteboardModel.accessModified(message.body.whiteboardId, message.body.multiUser);
    }
    
    private function handleSendWhiteboardAnnotationEvtMsg(message:Object):void {
      var receivedAnnotation:Object = message.body.annotation;
      
      var annotation:Annotation = new Annotation(receivedAnnotation.id, receivedAnnotation.annotationType, receivedAnnotation.annotationInfo);
      annotation.status = receivedAnnotation.status;
      annotation.userId = receivedAnnotation.userId;
      LiveMeeting.inst().whiteboardModel.addAnnotation(annotation);
    }

    private function handleGetWhiteboardAnnotationsRespMsg(message:Object):void {
      var whiteboardId:String = message.body.whiteboardId;
      var multiUser:Boolean = message.body.multiUser as Boolean;
      var annotations:Array = message.body.annotations as Array;
      var tempAnnotations:Array = new Array();
      
      for (var i:int = 0; i < annotations.length; i++) {
        var an:Object = annotations[i] as Object;
        var annotation:Annotation = new Annotation(an.id, an.annotationType, an.annotationInfo);
        annotation.status = an.status;
        annotation.userId = an.userId;
        tempAnnotations.push(annotation);
      }
      
      LiveMeeting.inst().whiteboardModel.addAnnotationFromHistory(whiteboardId, tempAnnotations);
      LiveMeeting.inst().whiteboardModel.accessModified(whiteboardId, multiUser);
    }
    
    private function handleSendCursorPositionEvtMsg(message:Object):void {
      var userId:String = message.header.userId as String;
      var whiteboardId:String = message.body.whiteboardId as String;
      var xPercent:Number = message.body.xPercent as Number;
      var yPercent:Number = message.body.yPercent as Number;

      LiveMeeting.inst().whiteboardModel.updateCursorPosition(whiteboardId, userId, xPercent, yPercent);
    }
    
    private function handleServerToClientLatencyTracerMsg(message:Object):void {
      var userId:String = message.body.senderId as String;
      var timestamp:Number = message.body.timestampUTC as Number;
      
      LiveMeeting.inst().whiteboardModel.lastTraceReceivedTimestamp = timestamp;
    }
    
    private function handleDoLatencyTracerMsg(message:Object):void {
      _dispatcher.dispatchEvent(new PerformRttTraceEvent()); 
    }
  }
}
