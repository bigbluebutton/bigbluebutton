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
package org.bigbluebutton.modules.desktopshare.controller
{
	
	import flash.net.NetConnection;
	
	import org.bigbluebutton.modules.desktopshare.DesktopShareModule;
	import org.bigbluebutton.modules.desktopshare.model.business.DesktopShareProxy;
	import org.bigbluebutton.modules.desktopshare.view.DesktopShareModuleMediator;
	import org.bigbluebutton.modules.desktopshare.view.DesktopShareWindowMediator;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StartupCommand extends SimpleCommand implements ICommand
	{
		
		/**
		 * registers the mediator and proxy with the facade
		 * @param notification
		 * 
		 */		
		override public function execute(notification:INotification):void {
			var app:DesktopShareModule = notification.getBody() as DesktopShareModule;
			facade.registerMediator(new DesktopShareModuleMediator(app));
			facade.registerMediator(new DesktopShareWindowMediator(app.desktopShareWindow));
			facade.registerProxy(new DesktopShareProxy(app.desktopShareWindow.im,new NetConnection()));
		}
	}
}