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
package org.bigbluebutton.modules.login.model
{
	import org.bigbluebutton.modules.login.LoginModuleConstants;
	import org.bigbluebutton.modules.login.model.services.LoginService;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
		
	public class LoginProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "LoginProxy";
		
		private var uri:String;		
		private var loginService:LoginService;
		
		public function LoginProxy(uri:String)
		{
			super(NAME);
			this.uri = uri;
		}
		
		public function login(fullname:String, conference:String, password:String):void {
			LogUtil.debug(NAME + "::logging in " + fullname + " to " + conference);
			loginService = new LoginService();
			loginService.addLoginResultListener(loginListener);
			loginService.load(uri, fullname, conference, password);

		}
		
		public function stop():void {
			// USer is issuing a disconnect.
//			manualDisconnect = true;
//			chatService.disconnect();
		}
		
		private function loginListener(success:Boolean, result:Object):void {
			if (success) {
				LogUtil.debug(NAME + '::Sending LoginModuleConstants.LOGIN_SUCCESS');
				sendNotification(LoginModuleConstants.LOGIN_SUCCESS, result);
			} else {
				LogUtil.debug(NAME + '::Sending LoginModuleConstants.LOGIN_FAILED');
				sendNotification(LoginModuleConstants.LOGIN_FAILED, result);
			}
		}
	}
}