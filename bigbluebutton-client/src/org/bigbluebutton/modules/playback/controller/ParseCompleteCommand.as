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
package org.bigbluebutton.modules.playback.controller
{
	import org.bigbluebutton.modules.playback.controller.notifiers.ParseNotifier;
	import org.bigbluebutton.modules.playback.model.MessagingMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class ParseCompleteCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var note:ParseNotifier = notification.getBody() as ParseNotifier;
			var moduleName:String = note.moduleName;
			var list:XMLList = note.list;
			var startTime:Number = note.startTime;
			
			facade.registerMediator(new MessagingMediator(list, moduleName, startTime));
		}

	}
}