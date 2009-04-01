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
	import flash.events.Event;
	import flash.geom.Point;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.main.view.components.ModuleStoppedWindow;
	import org.bigbluebutton.main.view.events.StartModuleEvent;
	import org.bigbluebutton.modules.red5phone.view.components.Red5PhoneWindow;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	
/**
*   This is the Mediator class for MainApplicationShell view compom\nent
*/	
	public class MainApplicationShellMediator extends Mediator
	{
		public static const NAME:String = 'MainApplicationShellMediator';
		public static const OPEN_CHAT_MODULE:String = 'openChatModule';
		public static const OPEN_LOG_MODULE:String = 'openLogModule';
		public static const LOGOUT:String = "Logout";
		public static const START_WEBCAM:String = "Start Webcam";

		private var mshell:MainApplicationShell;
		      
		public function MainApplicationShellMediator( viewComponent:MainApplicationShell )
		{
			super( NAME, viewComponent );	
			viewComponent.toolbar.addEventListener(MainApplicationConstants.LOGOUT_EVENT, onLogoutEventHandler);
			viewComponent.addEventListener(StartModuleEvent.START_MODULE_RETRY_EVENT, onRestartModuleEvent);
		}
							
		protected function get shell():MainApplicationShell
		{
			return viewComponent as MainApplicationShell;
		}
		
		
		private function onLogoutEventHandler(e:Event):void {
			sendNotification(MainApplicationConstants.LOGOUT);			
		}
		
		private function onRestartModuleEvent(e:StartModuleEvent):void {
			sendNotification(MainApplicationConstants.RESTART_MODULE, e.moduleName);
		}
		
		override public function listNotificationInterests():Array{
			return [
					MainApplicationConstants.ADD_WINDOW_MSG,
					MainApplicationConstants.REMOVE_WINDOW_MSG,
					MainApplicationConstants.USER_JOINED,
					MainApplicationConstants.USER_LOGGED_IN,
					MainApplicationConstants.USER_LOGGED_OUT,
					MainApplicationConstants.LOADED_MODULE,
					MainApplicationConstants.MODULE_STOPPED,
					MainApplicationConstants.MODULE_LOAD_PROGRESS
					];
		}
		
		private var red5phoneAdded:Boolean = false;
		private var red5PhoneWindow:Red5PhoneWindow = new Red5PhoneWindow();
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){	
				case MainApplicationConstants.ADD_WINDOW_MSG:
					var win:IBbbModuleWindow = notification.getBody() as IBbbModuleWindow;
					//LogUtil.debug(NAME + "::putting window in " + win.xPosition + " " + win.yPosition);
					shell.mdiCanvas.windowManager.add(win as MDIWindow);
					shell.mdiCanvas.windowManager.absPos(win as MDIWindow, win.xPosition, win.yPosition);										
					break;			
				case MainApplicationConstants.REMOVE_WINDOW_MSG:
					var rwin:IBbbModuleWindow = notification.getBody() as IBbbModuleWindow;
					//LogUtil.debug(NAME + "::removing window " + (rwin as MDIWindow).name);
					shell.mdiCanvas.windowManager.remove(rwin as MDIWindow);						
					break;
				case MainApplicationConstants.USER_LOGGED_OUT:
					//if (red5phoneAdded) {
					//	red5phoneAdded = false;
					//	shell.mdiCanvas.windowManager.remove(red5PhoneWindow as MDIWindow);
					//}
					break;
				case MainApplicationConstants.USER_JOINED:
					 /**
			 			 * Workaround to pass in username for sip registration.
			 			*/
						red5PhoneWindow.sipusername = modulesProxy.username;
					break;
				case MainApplicationConstants.USER_LOGGED_IN:
					shell.loadedModules.text = "";
					shell.loadProgress.text = "";
					//if (!red5phoneAdded) {
					//	red5phoneAdded = true;
					//	shell.mdiCanvas.windowManager.add(red5PhoneWindow as MDIWindow);
					//	shell.mdiCanvas.windowManager.absPos(red5PhoneWindow as MDIWindow, red5PhoneWindow.xPosition, red5PhoneWindow.yPosition);						
					//}	
					break;
				case MainApplicationConstants.MODULE_STOPPED:
					var info:Object = notification.getBody();
					handleModuleStopped(info.moduleId, info.errors);
					break;
				case MainApplicationConstants.LOADED_MODULE:
					shell.loadedModules.text += notification.getBody() + "(loaded) ";
					
					// Should do this properly.
					//if (notification.getBody() == "ViewersModule") {
					//	shell.loadedModules.text = "";
					//	shell.loadProgress.text = "";
					//}
					break;
				case MainApplicationConstants.MODULE_LOAD_PROGRESS:
					var mod:String = notification.getBody().name as String;
					var prog:Number = notification.getBody().progress as Number;
					
					shell.loadProgress.text = "Loading: " + mod + " " + prog + "% loaded.";
					break;
			}
		}
		
		private function handleModuleStopped(moduleName:String, errors:Array):void {
				var t:ModuleStoppedWindow = ModuleStoppedWindow(PopUpManager.createPopUp( shell.mdiCanvas, ModuleStoppedWindow, false));
				t.addEventListener(StartModuleEvent.START_MODULE_RETRY_EVENT, onRestartModuleEvent);								
				t.displayErrors(moduleName, errors);
				
				var point1:Point = new Point();
            	// Calculate position of TitleWindow in Application's coordinates. 
            	point1.x = 200;
            	point1.y = 400;                
            	point1 = shell.localToGlobal(point1);
           	 	t.x = point1.x + 25;
            	t.y = point1.y + 25;				
		}
		
		private function get modulesProxy():ModulesProxy {
			return facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
		}
	}
}