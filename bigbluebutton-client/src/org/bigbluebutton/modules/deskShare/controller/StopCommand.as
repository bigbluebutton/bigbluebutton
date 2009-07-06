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
package org.bigbluebutton.modules.deskShare.controller
{
	import org.bigbluebutton.modules.deskShare.model.business.DeskShareProxy;
	import org.bigbluebutton.modules.deskShare.view.DeskShareWindowMediator;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * This command is executed when the module stops. It's purpose is to shut down the module gracefully and release all the resources 
	 * @author Snap
	 * 
	 */	
	public class StopCommand extends SimpleCommand implements ICommand
	{
		override public function execute(notification:INotification):void{
			if (facade.hasProxy(DeskShareProxy.NAME)){
				var proxy:DeskShareProxy = facade.retrieveProxy(DeskShareProxy.NAME) as DeskShareProxy;
				proxy.stop();
			}
			if (facade.hasMediator(DeskShareWindowMediator.NAME)){
				var window:DeskShareWindowMediator = facade.retrieveMediator(DeskShareWindowMediator.NAME) as DeskShareWindowMediator;
				window.stop();
			}
		}

	}
}