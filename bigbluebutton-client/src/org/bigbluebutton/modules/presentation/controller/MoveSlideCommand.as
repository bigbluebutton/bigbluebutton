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
package org.bigbluebutton.modules.presentation.controller
{
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class MoveSlideCommand extends SimpleCommand implements ICommand
	{
		
		public static const MOVE_SLIDE_COMMAND:String = "MOVE_SLIDE_COMMAND";
		
		override public function execute(notification:INotification):void
		{
			if (facade.hasProxy(PresentProxy.NAME)) {
				var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
				var m:MoveNotifier = notification.getBody() as MoveNotifier;
				
				if (p.isPresenter()) {
					// Send the move command to the viewers.
					LogUtil.debug('Calling move on proxy');
					p.move(m.newXPosition, m.newYPosition);
				} else {
					// just move this current user's slide.
					LogUtil.debug('Sending self move');
					sendNotification(PresentModuleConstants.MOVE_SLIDE, m);
				}
			} 
		}
		
	}
}