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
	import org.bigbluebutton.modules.viewers.view.JoinWindow;
	import org.bigbluebutton.modules.viewers.view.mediators.JoinWindowMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * The StartLoginCommand registers a JoinWindowMediator with the JoinWindow gui component
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class StartLoginCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var window:JoinWindow = notification.getBody() as JoinWindow;
			facade.registerMediator(new JoinWindowMediator(window));
		}

	}
}