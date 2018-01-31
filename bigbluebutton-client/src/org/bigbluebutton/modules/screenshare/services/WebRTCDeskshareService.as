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
	import org.bigbluebutton.modules.screenshare.services.red5.Connection;

	public class WebRTCDeskshareService
	{
		private static const LOGGER:ILogger = getClassLogger(ScreenshareService);

		private var red5conn:Connection;

		private var module:ScreenshareModule;
		private var dispatcher:Dispatcher;

		private var sender:MessageSender;

		public function WebRTCDeskshareService() {
			this.dispatcher = new Dispatcher();

			red5conn = new Connection();
			sender = new MessageSender(red5conn);
			sender.queryForScreenshare();
		}

		public function handleStartModuleEvent(module:ScreenshareModule):void {
			LOGGER.debug("Deskshare Module starting");
			this.module = module;
		}

		public function getConnection():NetConnection{
			return red5conn.getConnection();
		}

		public function disconnect():void{
			red5conn.disconnect();
		}
	}
}
