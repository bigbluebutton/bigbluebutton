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
package org.bigbluebutton.main.view
{
	import mx.controls.Button;
	
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.main.view.components.MainToolbar;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class MainToolbarMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "MainToolbarMediator";
		
		private var toolbar:MainToolbar;
		
		public function MainToolbarMediator(viewComponent:MainToolbar)
		{
			super(NAME);
			toolbar = viewComponent;
		}
		
		override public function listNotificationInterests():Array{
			return [
					MainApplicationConstants.USER_JOINED,
					MainApplicationConstants.USER_LOGGED_OUT,
					MainApplicationConstants.ADD_BUTTON,
					MainApplicationConstants.REMOVE_BUTTON			
			];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){	
				case MainApplicationConstants.USER_JOINED:
					toolbar.loggedIn(notification.getBody().username, notification.getBody().conference, notification.getBody().userrole);
					toolbar.visible = true;
					break;
				case MainApplicationConstants.USER_LOGGED_OUT:
					toolbar.visible = false;
					break;
				case MainApplicationConstants.ADD_BUTTON:
					toolbar.addedBtns.addChild(notification.getBody() as Button);
					break;
				case MainApplicationConstants.REMOVE_BUTTON:
					toolbar.removeChild(notification.getBody() as Button);
					break;
			}
		}
		
	}
}