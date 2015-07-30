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
package org.bigbluebutton.modules.sharednotes.infrastructure
{
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	
	public class HTTPServerConnection extends ServerConnection
	{
		private static const LOGGER:ILogger = getClassLogger(HTTPServerConnection);      

		public static var syncURL:String = "";
		private var loader:URLLoader = new URLLoader();		// used for connecting to the server
		
		public function HTTPServerConnection(client:Client, dispatcher:IEventDispatcher)
		{
			super(client, dispatcher);
			ServerConnection.connectionType = "http";
			loader.addEventListener(Event.COMPLETE, completeHandler);
			sendConnectRequest();
		}
		
		private function completeHandler(event:Event):void {
			var loader:URLLoader = URLLoader(event.target);
			loader.close();
			
			receive(loader.data);
		}
		
		public override function send(message:String):void {
			var params : URLVariables = new URLVariables();
			params.message = message;
			var request:URLRequest = new URLRequest(syncURL);
			request.data = params;
			request.method = URLRequestMethod.POST;
			try {
				loader.load(request);
				pendingResponse = true;
			} catch (error:Error) {
				LOGGER.debug("Unable to load requested document.");
			}
		}
	}
}