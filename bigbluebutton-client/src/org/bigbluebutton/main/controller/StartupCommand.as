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
package org.bigbluebutton.main.controller
{
	import org.bigbluebutton.main.MainApplicationMediator;
	import org.bigbluebutton.main.MainEndpointMediator;
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.bigbluebutton.main.model.PortTestProxy;
	import org.bigbluebutton.main.view.MainApplicationShellMediator;
	import org.bigbluebutton.main.view.MainToolbarMediator;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	/**
	 * 
	 * Registers the main mediator with the main facade
	 * 
	 */    
	public class StartupCommand extends SimpleCommand implements ICommand
	{	
		override public function execute(note:INotification):void
		{
			var app:MainApplicationShell = note.getBody() as MainApplicationShell;
			facade.registerMediator( new MainApplicationShellMediator( app ) );		
			facade.registerMediator( new MainToolbarMediator(app.toolbar));	
			facade.registerMediator(new MainApplicationMediator());
			var med:MainEndpointMediator = new MainEndpointMediator();
			facade.registerMediator(med);
			LogUtil.debug("StartupCommand mode=" + app.mode);
			facade.registerProxy(new ModulesProxy(med.router, app.mode));
			facade.registerProxy(new PortTestProxy());
		}		
	}
}