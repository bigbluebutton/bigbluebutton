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
package org.bigbluebutton.modules.whiteboard.controller
{
	import org.bigbluebutton.modules.whiteboard.WhiteboardEndpointMediator;
	import org.bigbluebutton.modules.whiteboard.WhiteboardModuleMediator;
	import org.bigbluebutton.modules.whiteboard.model.DrawProxy;
	import org.bigbluebutton.modules.whiteboard.view.BoardMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * The StartupCommand class extends the SimpleCommand class of the PureMVC framework.
	 * <p>
	 * Once the command is created, the execute method of the class is automaticaly called.
	 * The purpose of this class is to initialize the rest of the Whiteboard application, including the
	 * BoardMediator and the DrawProxy classes. 
	 * @author dzgonjan
	 * 
	 */	
	public class StartupCommand extends SimpleCommand
	{	
		/**
		 * The execute method that is executed upon creation of this class 
		 * @param notification the notification which triggered the SimpleCommand class.
		 * 
		 */		
		override public function execute(notification:INotification):void{
			var m:WhiteboardModule = notification.getBody() as WhiteboardModule;
			
			facade.registerMediator(new WhiteboardModuleMediator(m));
			facade.registerMediator(new WhiteboardEndpointMediator(m));
			facade.registerMediator(new BoardMediator(m));
			facade.registerProxy(new DrawProxy(m.uri));
		}

	}
}