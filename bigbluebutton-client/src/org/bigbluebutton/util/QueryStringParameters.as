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
package org.bigbluebutton.util {
	import flash.external.ExternalInterface;

	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;

	public class QueryStringParameters {
		private static const LOGGER:ILogger = getClassLogger(QueryStringParameters);

		private var params:Array = [];

		private var _sessionToken:String = null;

		public function collectParameters():void {
			try {
				var url:String = ExternalInterface.call("window.location.search.substring", 1);
				//var url:String = "host.pl?logouturl=http://www.google.com&host=rtmp://192.168.0.120/deskShare&room=6e87dfef-9f08-4f80-993f-c0ef5f7b999b&width=1024&height=768";
				// Remove everything before the question mark, including the question mark
				var paramPattern:RegExp = /.*\?/;
				url = url.replace(paramPattern, "");

				// Create an array of name=value Strings.
				params = url.split("&");

			} catch (e:Error) {
				LOGGER.error(e.toString());
			}
		}

		public function getParameter(key:String):String {
			var value:String = "";

			for (var i:int = 0; i < params.length; i++) {
				var tempA:Array = params[i].split("=");
				//LOGGER.debug("{0} {1}", [String(tempA[0]).toUpperCase(), String(tempA[1]).toUpperCase()]);

				if (String(tempA[0]).toUpperCase() == key.toUpperCase()) {
					value = String(tempA[1])
				}
			}
			return value;
		}

		public function getSessionToken():String {
			if (StringUtils.isEmpty(_sessionToken)) {
				collectParameters();
				_sessionToken = getParameter("sessionToken");
			}
			return _sessionToken;
		}
	}
}
