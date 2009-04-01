/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.join.model
{
	import org.bigbluebutton.modules.join.JoinModuleConstants;
	import org.bigbluebutton.modules.join.model.service.JoinService;
	import org.bigbluebutton.modules.login.LoginModuleConstants;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
		
	public class JoinProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "JoinProxy";
		
		private var uri:String;		
		private var joinService:JoinService;
		
		public function JoinProxy(uri:String)
		{
			super(NAME);
			this.uri = uri;
		}
		
		public function join():void {
			LogUtil.debug(NAME + "::joning in ");
			joinService = new JoinService();
			joinService.addJoinResultListener(joinListener);
			joinService.load(uri);

		}
		
		public function stop():void {
			// USer is issuing a disconnect.
//			manualDisconnect = true;
//			chatService.disconnect();
		}
		
		private function joinListener(success:Boolean, result:Object):void {
			if (success) {
				LogUtil.debug(NAME + '::Sending JoinModuleConstants.JOIN_SUCCESS');
				sendNotification(JoinModuleConstants.JOIN_SUCCESS, result);
			} else {
				LogUtil.debug(NAME + '::Sending JoinModuleConstants.JOIN_FAILED');
				sendNotification(JoinModuleConstants.JOIN_FAILED, result);
			}
		}
	}
}