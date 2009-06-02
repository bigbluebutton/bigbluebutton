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
package org.bigbluebutton.modules.viewers.controller
{
	import org.bigbluebutton.modules.viewers.ViewersEndpointMediator;
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;
	import org.bigbluebutton.modules.viewers.ViewersModuleMediator;
	import org.bigbluebutton.modules.viewers.model.ViewersProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * The StartupCommand registers the ViewersModuleMediator with the ViewersModule
	 * It also registers a Conference object as a mediator in the facade 
	 * @author dzgonjan
	 * 
	 */	
	public class StartupCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var m:ViewersModule = notification.getBody() as ViewersModule;
			
			facade.registerMediator(new ViewersModuleMediator(m));
			facade.registerMediator(new ViewersEndpointMediator(m));
			facade.registerProxy(new ViewersProxy(m));
			sendNotification(ViewersModuleConstants.STARTED);
			LogUtil.debug("StartupCommand::" + m.username + "," + m.role);
			proxy.join();
		}
		
		private function get proxy():ViewersProxy {
			return facade.retrieveProxy(ViewersProxy.NAME) as ViewersProxy;
		}
	}
}