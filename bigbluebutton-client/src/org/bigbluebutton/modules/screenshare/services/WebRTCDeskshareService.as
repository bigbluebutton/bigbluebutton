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
package org.bigbluebutton.modules.screenshare.services
{
	import com.asfusion.mate.events.Dispatcher;

	import flash.net.NetConnection;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.modules.screenshare.services.red5.WebRTCConnection;

	/**
	 * The DeskShareProxy communicates with the Red5 deskShare server application
	 * @author Snap
	 *
	 */
	public class WebRTCDeskshareService
	{
		private static const LOGGER:ILogger = getClassLogger(ScreenshareService);

		private var conn:WebRTCConnection;

		private var module:ScreenshareModule;
		private var dispatcher:Dispatcher;

		private var uri:String;
		private var room:String;

		public function WebRTCDeskshareService() {
			this.dispatcher = new Dispatcher();
		}

		public function handleStartModuleEvent(module:ScreenshareModule):void {
			LOGGER.debug("Deskshare Module starting");
			this.module = module;
			connect(module.uri, module.getRoom());
		}

		public function connect(uri:String, room:String):void {
			this.uri = uri;
			this.room = room;
			LOGGER.debug("Deskshare Service connecting to {0}", [uri]);
			conn = new WebRTCConnection(room); //to red5 deskshare

			conn.setURI(uri);
			conn.connect();
		}

		public function getConnection():NetConnection{
			return conn.getConnection();
		}

		public function disconnect():void{
			conn.disconnect();
		}
	}
}
