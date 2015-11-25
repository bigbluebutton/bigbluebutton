/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.modules.videoconf.services.messaging
{
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.modules.videoconf.business.VideoProxy;

	public class MessageReceiver implements IMessageListener {
		private static const LOG:String = "VideoConf::MessageReceiver - ";

		private var proxy:VideoProxy;

		public function MessageReceiver(proxy:VideoProxy) {
			BBB.initConnectionManager().addMessageListener(this);
			this.proxy = proxy;
		}

		public function onMessage(messageName:String, message:Object):void {
//			switch (messageName) {
//				case "getStreamPathReply":
//					handleGetStreamPathReply(message);
//					break;
//			}
		}

		private function handleGetStreamPathReply(msg:Object):void {
			var map:Object = JSON.parse(msg.msg);
			var streamName:String = map.streamName;
			var streamPath:String = map.streamPath;

			proxy.handleStreamPathReceived(streamName, streamPath);
		}
	}
}
