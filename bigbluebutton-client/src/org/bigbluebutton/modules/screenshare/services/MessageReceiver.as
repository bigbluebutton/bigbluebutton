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
package org.bigbluebutton.modules.screenshare.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.toaster.Toaster;
  import org.bigbluebutton.common.toaster.message.ToastIcon;
  import org.bigbluebutton.common.toaster.message.ToastType;
  import org.bigbluebutton.modules.screenshare.events.IsSharingScreenEvent;
  import org.bigbluebutton.modules.screenshare.events.ScreenShareClientPingMessage;
  import org.bigbluebutton.modules.screenshare.events.ScreenSharePausedEvent;
  import org.bigbluebutton.modules.screenshare.events.ShareStartRequestResponseEvent;
  import org.bigbluebutton.modules.screenshare.events.ShareStartedEvent;
  import org.bigbluebutton.modules.screenshare.events.ShareStoppedEvent;
  import org.bigbluebutton.modules.screenshare.model.ScreenshareModel;
  import org.bigbluebutton.modules.screenshare.services.red5.Connection;
  import org.bigbluebutton.modules.screenshare.services.red5.IMessageListener;
  import org.bigbluebutton.util.i18n.ResourceUtil;
  
  public class MessageReceiver implements IMessageListener
  {
    private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
    
    private var conn: Connection;
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public function MessageReceiver(conn: Connection) {
      this.conn = conn;
      this.conn.addMessageListener(this);
    }

    public function onMessage(messageName:String, message:Object):void {
      //LOGGER.debug(" Received message " + messageName);

      switch (messageName) {
        case "isSharingScreenRequestResponse":
          handleIsSharingScreenRequestResponse(message);
          break;
        case "startShareRequestResponse":
          handleStartShareRequestResponse(message);
          break;
        case "screenShareStartedMessage":
          handleScreenShareStartedMessage(message);
          break;
        case "screenShareStoppedMessage":
          handleScreenShareStoppedMessage(message);
          break;  
        case "screenSharePausedMessage":
          handleScreenSharePausedMessage(message);
          break;
        case "startShareRequestRejectedResponse":
          handleStartShareRequestRejectedResponse(message);
          break;
        case "screenShareClientPingMessage":
          handleScreenShareClientPingMessage(message);
          break;
        default:
//          LogUtil.warn("Cannot handle message [" + messageName + "]");
      }
    }
    
    private function handleScreenShareClientPingMessage(message:Object):void {
      //LOGGER.debug("handleScreenShareClientPingMessage " + message.msg);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("meetingId") && map.hasOwnProperty("session") && map.hasOwnProperty("timestamp")) {
        if (ScreenshareModel.getInstance().session == map.session) {
            //LOGGER.debug("handleScreenShareClientPingMessage - sending ping for session=[" + map.session + "]"); 
            var sharePingEvent: ScreenShareClientPingMessage = new ScreenShareClientPingMessage(map.session, map.timestamp);
            dispatcher.dispatchEvent(sharePingEvent);             
        }
      } 
    }
    
    private function handleScreenSharePausedMessage(message:Object):void {
      LOGGER.debug("handleScreenSharePausedMessage " + message.msg);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("meetingId") && map.hasOwnProperty("session")) {
        var sharePausedEvent: ScreenSharePausedEvent = new ScreenSharePausedEvent(map.session);
        dispatcher.dispatchEvent(sharePausedEvent); 
      } 
    }

    private function handleStartShareRequestRejectedResponse(message:Object):void {
      LOGGER.debug("handleStartShareRequestRejectedResponse " + message.msg);      
      var shareFailedEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(null, null, null, false, null);
      dispatcher.dispatchEvent(shareFailedEvent);         
    }
    
    private function handleStartShareRequestResponse(message:Object):void {
      LOGGER.debug("handleStartShareRequestResponse " + message.msg);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("authToken") && map.hasOwnProperty("jnlp") && map.hasOwnProperty("streamId") && map.hasOwnProperty("session")) {
        var shareSuccessEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(map.authToken, map.jnlp, map.streamId, true, map.session);
        dispatcher.dispatchEvent(shareSuccessEvent); 
      } else {
        var shareFailedEvent: ShareStartRequestResponseEvent = new ShareStartRequestResponseEvent(null, null, null, false, null);
        dispatcher.dispatchEvent(shareFailedEvent);         
      }
    }

    private function handleScreenShareStartedMessage(message:Object):void {
      LOGGER.debug("handleScreenShareStartedMessage " + message.msg);      
      var map:Object = JSON.parse(message.msg);
      if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
        map.hasOwnProperty("height") && map.hasOwnProperty("url")) {
        var shareStartedEvent: ShareStartedEvent = new ShareStartedEvent(map.streamId, map.width,
            map.height, map.url);
        dispatcher.dispatchEvent(shareStartedEvent); 
		Toaster.toast(ResourceUtil.getInstance().getString("bbb.notification.screenShare.started"), ToastType.INFO, ToastIcon.DESKTOP);
      }
    }

    private function handleScreenShareStoppedMessage(message:Object):void {
      LOGGER.debug("handleScreenShareStoppedMessage " + message.msg);      
      var map:Object = JSON.parse(message.msg);      
      if (map.hasOwnProperty("session") && map.hasOwnProperty("reason")) {
          if (ScreenshareModel.getInstance().session == map.session) {
            var streamEvent: ShareStoppedEvent = new ShareStoppedEvent(map.session, map.reason);
            dispatcher.dispatchEvent(streamEvent);   
          }
      }
    }
       
    private function handleIsSharingScreenRequestResponse(message:Object):void {
      LOGGER.debug("handleIsSharingScreenRequestResponse " + message.msg);
      var map:Object = JSON.parse(message.msg);
      if (map.hasOwnProperty("sharing") && map.sharing) {
        if (map.hasOwnProperty("streamId") && map.hasOwnProperty("width") &&
          map.hasOwnProperty("height") && map.hasOwnProperty("url") && map.hasOwnProperty("session")) {
          var shareEvent: IsSharingScreenEvent = new IsSharingScreenEvent(map.streamId, map.width,
            map.height, map.url, map.session);
          dispatcher.dispatchEvent(shareEvent); 
        }
      }
    }
  }
}