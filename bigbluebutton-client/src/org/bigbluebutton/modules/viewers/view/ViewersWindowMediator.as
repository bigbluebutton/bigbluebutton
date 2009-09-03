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
package org.bigbluebutton.modules.viewers.view
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;
	import org.bigbluebutton.modules.viewers.model.ViewersProxy;
	import org.bigbluebutton.modules.viewers.view.components.ViewersWindow;
	import org.bigbluebutton.modules.viewers.view.events.AssignPresenterEvent;
	import org.bigbluebutton.modules.viewers.view.events.LowerHandEvent;
	import org.bigbluebutton.modules.viewers.view.events.ViewCameraEvent;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 *  The ViewersWindowMediator is a mediator class for the ViewersWindow gui component
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ViewersWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ViewersWindowMediator";
		
		public static const CHANGE_STATUS:String = "Change Status";
		public static const ASSIGN_PRESENTER_EVENT:String = "ASSIGN_PRESENTER_EVENT";
		
		private var _viewersWindow:ViewersWindow;
		private var handRaised:Boolean = false;
		
		/**
		 * The constructor. Registers this mediator with the gui component 
		 * @param view
		 * 
		 */		
		public function ViewersWindowMediator()
		{
			super(NAME);
			_viewersWindow = new ViewersWindow();
			_viewersWindow.addEventListener(CHANGE_STATUS, changeStatus);
			_viewersWindow.addEventListener(ASSIGN_PRESENTER_EVENT, onAssignPresenter);
			_viewersWindow.addEventListener(ViewersModuleConstants.VIEWER_SELECTED_EVENT, onViewerSelectedEvent);
			_viewersWindow.addEventListener(ViewCameraEvent.VIEW_CAMERA_EVENT, onViewCameraEvent);
			_viewersWindow.addEventListener(LowerHandEvent.LOWER_HAND_EVENT, onLowerHandEvent);
		}
		
		private function onViewCameraEvent(e:ViewCameraEvent):void {
			sendNotification(ViewersModuleConstants.VIEW_CAMERA, {stream:e.stream, viewedName:e.viewedName});
		}
		
		private function onViewerSelectedEvent(e:Event):void {
			if (proxy.isModerator()) {
				_viewersWindow.presentBtn.enabled = true;
				_viewersWindow.presentBtn.toolTip = "Make selected web participant the presenter.";
			}
		}
		
		private function onLowerHandEvent(e:LowerHandEvent):void {
			if (proxy.isModerator()) {
				proxy.lowerHand(e.userid);
			}
		}
		
		private function onAssignPresenter(e:AssignPresenterEvent):void {
			LogUtil.debug('Assigning presenter to ' + e.assignTo);
			sendNotification(ViewersModuleConstants.ASSIGN_PRESENTER, {assignTo:e.assignTo, name:e.name});
		}
		
		/**
		 * Lists the notifications to which this mediator listens to 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					ViewersModuleConstants.OPEN_VIEWERS_WINDOW,
					ViewersModuleConstants.CLOSE_VIEWERS_WINDOW,
					ViewersModuleConstants.BECOME_VIEWER
					];
		}
		
		/**
		 * Handles the notifications upon reception 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case ViewersModuleConstants.OPEN_VIEWERS_WINDOW:
					LogUtil.debug('Received request to OPEN_VIEWERS_WINDOW');
					handleOpenViewersWindow();
					break;
				case ViewersModuleConstants.CLOSE_VIEWERS_WINDOW:
					facade.sendNotification(ViewersModuleConstants.REMOVE_WINDOW, _viewersWindow);
					break;
				case ViewersModuleConstants.BECOME_VIEWER:
					LogUtil.debug('Sending BECOME_VIEWER_EVENT');
					break;
			}
		}
			
		private function handleOpenViewersWindow():void {
				_viewersWindow.participants = proxy.participants;
				_viewersWindow.isModerator = proxy.isModerator();
				_viewersWindow.width = 210;
		   		_viewersWindow.height = 220;
		   		_viewersWindow.title = "Web Participants";
		   		_viewersWindow.showCloseButton = false;
		   		_viewersWindow.xPosition = 0;
		   		_viewersWindow.yPosition = 0;
		   		facade.sendNotification(ViewersModuleConstants.ADD_WINDOW, _viewersWindow); 			
		}	
						
		/**
		 * Change the raisehand/lowerhand status 
		 * @param e
		 * 
		 */		
		private function changeStatus(e:Event):void{
			handRaised = !handRaised;
			proxy.raiseHand(handRaised);
		}
		
		private function get proxy():ViewersProxy {
			return facade.retrieveProxy(ViewersProxy.NAME) as ViewersProxy;
		}

	}
}