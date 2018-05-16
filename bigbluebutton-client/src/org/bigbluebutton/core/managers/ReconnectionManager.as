/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.display.DisplayObject;
  import flash.events.TimerEvent;
  import flash.utils.Dictionary;
  import flash.utils.Timer;
  
  import mx.collections.ArrayCollection;
  import mx.core.FlexGlobals;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.PopUpUtil;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.ClientStatusEvent;
  import org.bigbluebutton.main.events.LogoutEvent;
  import org.bigbluebutton.main.model.users.AutoReconnect;
  import org.bigbluebutton.main.views.ReconnectionPopup;
  import org.bigbluebutton.util.ConnUtil;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class ReconnectionManager
  {
	private static const LOGGER:ILogger = getClassLogger(ReconnectionManager);      

    private var _connections:Dictionary = new Dictionary();
    private var _reestablished:ArrayCollection = new ArrayCollection();
    private var _reconnectTimer:Timer = new Timer(10000, 1);
    private var _reconnectTimeout:Timer = new Timer(15000, 1);
    private var _dispatcher:Dispatcher = new Dispatcher();
    private var _canceled:Boolean = false;

    public function ReconnectionManager() {
      _reconnectTimer.addEventListener(TimerEvent.TIMER_COMPLETE, reconnect);
      _reconnectTimeout.addEventListener(TimerEvent.TIMER_COMPLETE, timeout);
    }
    
    private function reconnect(e:TimerEvent = null):void {
      if (_connections.hasOwnProperty(ConnUtil.BIGBLUEBUTTON_CONNECTION)) {
        reconnectHelper(ConnUtil.BIGBLUEBUTTON_CONNECTION);
      } else {
        for (var type:String in _connections) {
          reconnectHelper(type);
        }
      }
      if (!_reconnectTimeout.running)
        _reconnectTimeout.start();
    }

    private function timeout(e:TimerEvent = null):void {
      _dispatcher.dispatchEvent(new BBBEvent(BBBEvent.CANCEL_RECONNECTION_EVENT));
      _dispatcher.dispatchEvent(new LogoutEvent(LogoutEvent.USER_LOGGED_OUT));
    }

    private function reconnectHelper(type:String):void {
      var obj:Object = _connections[type];
      obj.reconnect = new AutoReconnect();
      obj.reconnect.onDisconnect(obj.callback, obj.callbackParameters);
    }

    public function onDisconnected(type:String, callback:Function, parameters:Array):void {
      if (!_canceled) {
		var logData:Object = UsersUtil.initLogData();
		logData.connection = type;
        logData.tags = ["connection"];
		logData.logCode = "conn_mgr_conn_disconnected";
		LOGGER.info(JSON.stringify(logData));
		
        var obj:Object = new Object();
        obj.callback = callback;
        obj.callbackParameters = parameters;
        _connections[type] = obj;

        if (!_reconnectTimer.running) {
			PopUpUtil.createModalPopUp(FlexGlobals.topLevelApplication as DisplayObject, ReconnectionPopup, true);

          _reconnectTimer.reset();
          _reconnectTimer.start();
        }
      }
    }

    public function onConnectionAttemptFailed(type:String):void {
	  var logData:Object = UsersUtil.initLogData();
	  logData.connection = type; 
      logData.tags = ["connection"];
	  logData.logCode = "conn_mgr_reconnect_failed";
	  LOGGER.info(JSON.stringify(logData));
	  
      if (_connections.hasOwnProperty(type)) {
        _connections[type].reconnect.onConnectionAttemptFailed();
      }
    }

    private function get connectionDictEmpty():Boolean {
      for (var key:Object in _connections) {
        return false;
      }
      return true;
    }
    
    public function onConnectionAttemptSucceeded(type:String):void {
	  var logData:Object = UsersUtil.initLogData();
	  logData.connection = type;
      logData.tags = ["connection"];
	  logData.logCode = "conn_mgr_reconnect_succeeded";
	  LOGGER.info(JSON.stringify(logData));
	  
      ConnUtil.dispatchReconnectionSucceededEvent(type);
      delete _connections[type];
			
      if (type == ConnUtil.BIGBLUEBUTTON_CONNECTION) {
        reconnect();
      }

      _reestablished.addItem(type);
      if (connectionDictEmpty) {
        var msg:String = connectionReestablishedMessage();

        ConnUtil.connectionSuccessEvent(msg);

        _reconnectTimeout.reset();
		PopUpUtil.removePopUp(ReconnectionPopup);
	  }
    }

    public function onCancelReconnection():void {
      _canceled = true;

      for (var type:Object in _connections) delete _connections[type];

	  PopUpUtil.removePopUp(ReconnectionPopup);
	}

    private function connectionReestablishedMessage():String {
      var msg:String = "";
      for each (var conn:String in _reestablished) {
				msg += ConnUtil.connectionReestablishedMsg(conn)
        msg += " ";
      }
      _reestablished.removeAll();
      return msg;
    }
  }
}
