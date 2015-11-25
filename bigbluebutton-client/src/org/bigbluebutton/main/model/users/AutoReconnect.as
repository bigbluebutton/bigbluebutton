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
package org.bigbluebutton.main.model.users
{
  import flash.events.TimerEvent;
  import flash.utils.Timer;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;

  public class AutoReconnect
  {
    private static const LOGGER:ILogger = getClassLogger(AutoReconnect);      

    private var _backoff:Number = 2000;
    private var _reconnectCallback:Function;
    private var _reconnectParameters:Array;
    private var _retries: Number;

    public function onDisconnect(callback:Function, parameters:Array):void {
      LOGGER.debug("onDisconnect, parameters={0}", [parameters.toString()]);
      _reconnectCallback = callback;
      _reconnectParameters = parameters;
      attemptReconnect(0);
      _retries = 1;
    }

    public function onConnectionAttemptFailed():void {
	  LOGGER.warn("onConnectionAttemptFailed");
      attemptReconnect(_backoff);
      _retries = _retries + 1;
    }

    private function attemptReconnect(backoff:Number):void {
	  LOGGER.debug("attemptReconnect backoff={0}", [backoff]);
      var retryTimer:Timer = new Timer(backoff, 1);
      retryTimer.addEventListener(TimerEvent.TIMER, function():void {
		LOGGER.debug("Reconnecting");
        _reconnectCallback.apply(null, _reconnectParameters);
      });
      retryTimer.start();
      if (_backoff < 16000) _backoff = Math.max(backoff, 500) *2;
    }

    public function get Retries():Number {
      return _retries;
    }
  }
}
