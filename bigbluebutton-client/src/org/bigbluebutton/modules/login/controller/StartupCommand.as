/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.login.controller
{
	import org.bigbluebutton.modules.login.LoginEndpointMediator;
	import org.bigbluebutton.modules.login.LoginModuleConstants;
	import org.bigbluebutton.modules.login.LoginModuleMediator;
	import org.bigbluebutton.modules.login.model.LoginProxy;
	import org.bigbluebutton.modules.login.view.LoginWindowMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StartupCommand extends SimpleCommand
	{
		public function StartupCommand()
		{
			super();
		}
	
		override public function execute(note:INotification):void {
			var m:LoginModule = note.getBody() as LoginModule;
			
			LogUtil.debug('facade.registerMediator(new LoginEndpointMediator(m));');
			facade.registerMediator(new LoginEndpointMediator(m));
			LogUtil.debug('facade.registerMediator(new LoginModuleMediator(m));');
			facade.registerMediator(new LoginModuleMediator(m));
			LogUtil.debug('facade.registerMediator( new LoginWindowMediator(m) );');
			facade.registerMediator( new LoginWindowMediator(m) );
			LogUtil.debug('facade.registerProxy(new LoginProxy(m.uri));');
			facade.registerProxy(new LoginProxy(m.uri));
			LogUtil.debug('LoginModule COnnected');
			facade.sendNotification(LoginModuleConstants.STARTED);
		}
	}
}