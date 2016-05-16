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

package org.bigbluebutton.modules.deskshare.services.red5
{
	import com.asfusion.mate.events.Dispatcher;

	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.net.NetConnection;
	import flash.net.ObjectEncoding;
	import flash.net.Responder;
	import flash.utils.Timer;

	import mx.utils.ObjectUtil;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.managers.ReconnectionManager;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.deskshare.events.WebRTCViewStreamEvent;

	public class WebRTCConnection {
	private static const LOGGER:ILogger = getClassLogger(Connection);

		private var nc:NetConnection;
		private var uri:String;
		private var retryTimer:Timer = null;
		private var retryCount:int = 0;
		private const MAX_RETRIES:int = 5;
		private var responder:Responder;
		private var width:Number;
		private var height:Number;
		private var room:String;
		private var logoutOnUserCommand:Boolean = false;
		private var reconnecting:Boolean = false;
		private var wasPresenterBeforeDisconnect:Boolean = false;

		private var dispatcher:Dispatcher = new Dispatcher();

		public function WebRTCConnection(room:String) {
			this.room = room;

			responder = new Responder(
				function(result:Object):void {
					if (result != null && (result.publishing as Boolean)){
						width = result.width as Number;
						height = result.height as Number;
						LOGGER.debug("Desk Share stream is streaming [{0},{1}]", [width, height]);
						var event:WebRTCViewStreamEvent = new WebRTCViewStreamEvent(WebRTCViewStreamEvent.START);
						event.videoWidth = width;
						event.videoHeight = height;
						dispatcher.dispatchEvent(event); //TODO why?
					} else {
						LOGGER.debug("No deskshare stream being published");
						var connEvent:ConnectionEvent = new ConnectionEvent();
						connEvent.status = ConnectionEvent.NO_DESKSHARE_STREAM;
						dispatcher.dispatchEvent(connEvent); //TODO why?
					}
				},
				function(status:Object):void{
					var checkFailedEvent:ConnectionEvent = new ConnectionEvent();
					checkFailedEvent.status = ConnectionEvent.FAIL_CHECK_FOR_DESKSHARE_STREAM;
					dispatcher.dispatchEvent(checkFailedEvent);
					LOGGER.debug("Error while trying to call remote mathod on server");
				}
			);
		}

		public function connect(retry:Boolean = false):void {
			nc = new NetConnection();
			nc.proxyType = "best";
			nc.objectEncoding = ObjectEncoding.AMF0;
			nc.client = this;

			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, debugAsyncErrorHandler);
			nc.addEventListener(NetStatusEvent.NET_STATUS, debugNetStatusHandler);
			nc.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);

			if (getURI().length == 0){
				LOGGER.error("please provide a valid URI connection string. URI Connection String missing");
				return;
			} else if (nc.connected){
				LOGGER.error("You are already connected to {0}", [getURI()]);
				return;
			}

			LOGGER.debug("Trying to connect to [{0}] retry=[{1}]", [getURI(), retry]);
			if (! (retryCount > 0)) {
				var ce:ConnectionEvent = new ConnectionEvent();
				ce.status = ConnectionEvent.CONNECTING;

				dispatcher.dispatchEvent(ce);
			}

			nc.connect(getURI(), UsersUtil.getInternalMeetingID());
		}

		private function connectTimeoutHandler(e:TimerEvent):void {
			LOGGER.debug("Connection attempt to [{0}] timedout. Retrying.", [getURI()]);
			retryTimer.stop();
			retryTimer = null;

			nc.close();
			nc = null;

			var ce:ConnectionEvent = new ConnectionEvent();;

			retryCount++;
			if (retryCount < MAX_RETRIES) {
				ce.status = ConnectionEvent.CONNECTING_RETRY;
				ce.retryAttempts = retryCount;
				dispatcher.dispatchEvent(ce);

				connect(false);
			} else {
				ce.status = ConnectionEvent.CONNECTING_MAX_RETRY;
				dispatcher.dispatchEvent(ce);
			}
		}

		public function close():void{
			nc.close();
		}

		public function setURI(p_URI:String):void{
			uri = p_URI;
		}

		public function getURI():String{
			return uri;
		}

		public function onBWCheck(... rest):Number {
			return 0;
		}

		public function onBWDone(... rest):void {
			var p_bw:Number;
			if (rest.length > 0) p_bw = rest[0];
			// your application should do something here
			// when the bandwidth check is complete
			LOGGER.debug("bandwidth = {0} Kbps.", [p_bw]);
		}

		private function netStatusHandler(event:NetStatusEvent):void {
			LOGGER.debug("Connected to [" + getURI() + "]. [" + event.info.code + "]");

			if (retryTimer) {
				retryCount = 0;
				LOGGER.debug("Cancelling retry timer.");
				retryTimer.stop();
				retryTimer = null;
			}

			var ce:ConnectionEvent = new ConnectionEvent();

			switch(event.info.code){
				case "NetConnection.Connect.Failed":
					if (reconnecting) {
						var attemptFailedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_FAILED_EVENT);
						attemptFailedEvent.payload.type = ReconnectionManager.DESKSHARE_CONNECTION;
						dispatcher.dispatchEvent(attemptFailedEvent);
					}
					ce.status = ConnectionEvent.FAILED;

					dispatcher.dispatchEvent(ce);
				break;

				case "NetConnection.Connect.Success":
					ce.status = ConnectionEvent.SUCCESS;
					if (reconnecting) {
						reconnecting = false;
						if (wasPresenterBeforeDisconnect) {
							wasPresenterBeforeDisconnect = false;
							// stopSharingDesktop(room, room) //TODO
						}

						var attemptSucceeded:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_CONNECTION_ATTEMPT_SUCCEEDED_EVENT);
						attemptSucceeded.payload.type = ReconnectionManager.DESKSHARE_CONNECTION;
						dispatcher.dispatchEvent(attemptSucceeded);
					}

					// request desktop sharing info (as a late joiner)
					LOGGER.debug("Sending [desktopSharing.requestDeskShareInfo] to server.");
					var _nc:ConnectionManager = BBB.initConnectionManager();
					_nc.sendMessage("desktopSharing.requestDeskShareInfo",
						function(result:String):void { // On successful result
							LOGGER.debug(result);
						},
						function(status:String):void { // status - On error occurred
					LOGGER.error(status);
						}
					);

					dispatcher.dispatchEvent(ce);
				break;

				case "NetConnection.Connect.Rejected":
					ce.status = ConnectionEvent.REJECTED;
					dispatcher.dispatchEvent(ce);
				break;

				case "NetConnection.Connect.Closed":
					LOGGER.debug("Deskshare connection closed.");
					ce.status = ConnectionEvent.CLOSED;
					if (UsersUtil.amIPresenter()) {
						// Let's keep our presenter status before disconnected. We can't
						// tell the other user's to stop desktop sharing as our connection is broken. (ralam july 24, 2015)
						wasPresenterBeforeDisconnect = true;

					} else {
						// stopViewing(); //TODO
					}

					if (!logoutOnUserCommand) {
						reconnecting = true;

						var disconnectedEvent:BBBEvent = new BBBEvent(BBBEvent.RECONNECT_DISCONNECTED_EVENT);
						disconnectedEvent.payload.type = ReconnectionManager.DESKSHARE_CONNECTION;
						disconnectedEvent.payload.callback = connect;
						disconnectedEvent.payload.callbackParameters = [];
						dispatcher.dispatchEvent(disconnectedEvent);
					}
				break;

				case "NetConnection.Connect.InvalidApp":
					ce.status = ConnectionEvent.INVALIDAPP;
					dispatcher.dispatchEvent(ce);
				break;

				case "NetConnection.Connect.AppShutdown":
					ce.status = ConnectionEvent.APPSHUTDOWN;
					dispatcher.dispatchEvent(ce);
				break;

				case "NetConnection.Connect.NetworkChange":
					LOGGER.info("Detected network change. User might be on a wireless and temporarily dropped connection. Doing nothing. Just making a note.");
					break;

				default :
					// I dispatch DISCONNECTED incase someone just simply wants to know if we're not connected'
					// rather than having to subscribe to the events individually
					ce.status = ConnectionEvent.DISCONNECTED;
					dispatcher.dispatchEvent(ce);
					break;
			}
		}

		private function securityErrorHandler(event:SecurityErrorEvent):void{
			var ce:ConnectionEvent = new ConnectionEvent();
			ce.status = ConnectionEvent.SECURITYERROR;
			dispatcher.dispatchEvent(ce);
		}

		/**
		 * Check if anybody is publishing the stream for this room
		 * This method is useful for clients which have joined a room where somebody is already publishing
		 *
		 */
		private function checkIfStreamIsPublishing(room: String):void{
			LOGGER.debug("checking if desk share stream is publishing");
			var event:ConnectionEvent = new ConnectionEvent();
			event.status = ConnectionEvent.CHECK_FOR_DESKSHARE_STREAM;
			dispatcher.dispatchEvent(event); // TODO anton send to akka-bbb-apps

			nc.call("deskshare.checkIfStreamIsPublishing", responder, room);
		}

		public function disconnect():void{
			logoutOnUserCommand = true;
			if (nc != null) nc.close();
		}

		public function connectionSuccessHandler():void{
			LOGGER.debug("Successully connection to {0}", [uri]);

			checkIfStreamIsPublishing(room);
		}

		private function debugNetStatusHandler(e:NetStatusEvent):void {
		LOGGER.debug("netStatusHandler target={0} info={1}", [e.target, ObjectUtil.toString(e.info)]);
		}

		private function debugAsyncErrorHandler(e:AsyncErrorEvent):void {
		LOGGER.debug("asyncErrorHandler target={0} info={1}", [e.target, e.text]);
		}

		public function getConnection():NetConnection{
			return nc;
		}

		public function connectionFailedHandler(e:ConnectionEvent):void{
			LOGGER.error("connection failed to {0} with message {1}", [uri, e.toString()]);
		}

		public function connectionRejectedHandler(e:ConnectionEvent):void{
		LOGGER.error("connection rejected to {0} with message {1}", [uri, e.toString()]);
		}
	}
}
