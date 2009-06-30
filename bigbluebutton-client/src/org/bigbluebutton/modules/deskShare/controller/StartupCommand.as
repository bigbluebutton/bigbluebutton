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
	import org.bigbluebutton.modules.deskShare.DeskShareEndpointMediator;
	import org.bigbluebutton.modules.deskShare.DeskShareModuleConstants;
	import org.bigbluebutton.modules.deskShare.DeskShareModuleMediator;
	import org.bigbluebutton.modules.deskShare.model.business.DeskShareProxy;
	import org.bigbluebutton.modules.deskShare.view.DeskShareWindowMediator;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * The StartupCommand is called when the application is created and initialized
	 * This class in turn initializes all objects this module needs in order to run 
	 * @author Snap
	 * 
	 */	
	public class StartupCommand extends SimpleCommand implements ICommand
	{
		/**
		 * The method which does all the initialization work 
		 * @param notification
		 * 
		 */		
		override public function execute(notification:INotification):void{
			var module:DeskShareModule = notification.getBody() as DeskShareModule;
			
			facade.registerMediator(new DeskShareModuleMediator(module));
			facade.registerMediator(new DeskShareEndpointMediator(module));
			facade.registerMediator(new DeskShareWindowMediator(module));
			facade.registerProxy(new DeskShareProxy(module));
			sendNotification(DeskShareModuleConstants.CONNECTED);
		}
	}
}