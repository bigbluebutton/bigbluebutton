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
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.bigbluebutton.main.model.PortTestProxy;
	import org.bigbluebutton.main.view.components.LoggedOutWindow;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.main.view.components.ModuleStoppedWindow;
	import org.bigbluebutton.main.view.events.StartModuleEvent;
	import org.bigbluebutton.modules.phone.views.components.ToolbarButton;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
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
		
		private var phoneButton:ToolbarButton;
		private var phoneRegistered:Boolean = false;
		
		
		      
		public function MainApplicationShellMediator( viewComponent:MainApplicationShell )
		{
			super( NAME, viewComponent );	
			viewComponent.toolbar.addEventListener(MainApplicationConstants.LOGOUT_EVENT, onLogoutEventHandler);
			viewComponent.addEventListener(StartModuleEvent.START_MODULE_RETRY_EVENT, onRestartModuleEvent);
		}
		
		private function addWindowMessageHandler(event:OpenWindowEvent):void {
			trace("Received ADD WINDOW EVENT");
		}
		
		private function displayWindow(window:IBbbModuleWindow):void {
			shell.mdiCanvas.windowManager.add(window as MDIWindow);
			shell.mdiCanvas.windowManager.absPos(window as MDIWindow, window.xPosition, window.yPosition);
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
					MainApplicationConstants.APP_MODEL_INITIALIZED,
					MainApplicationConstants.PORT_TEST_FAILED,
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
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){	
				case MainApplicationConstants.APP_MODEL_INITIALIZED:
					shell.appVersion = modulesProxy.getVersion();
					shell.numberOfModules = modulesProxy.getNumberOfModules();					
					testRTMPConnection();
					break;
				case MainApplicationConstants.PORT_TEST_FAILED:
					var portTestResult:Object = notification.getBody();
					if (portTestResult["protocol"] == "RTMP") {
						testRTMPTConnection()
					} else {
						shell.statusProgress.text = "Sorry, we cannot connect to the server.";
					}
					break;
				case MainApplicationConstants.ADD_WINDOW_MSG:
					var win:IBbbModuleWindow = notification.getBody() as IBbbModuleWindow;
					displayWindow(win);										
					break;			
				case MainApplicationConstants.REMOVE_WINDOW_MSG:
					var rwin:IBbbModuleWindow = notification.getBody() as IBbbModuleWindow;
					//LogUtil.debug(NAME + "::removing window " + (rwin as MDIWindow).name);
					shell.mdiCanvas.windowManager.remove(rwin as MDIWindow);						
					break;
				case MainApplicationConstants.USER_LOGGED_OUT:
					handleUserLoggedOut();
//					if (red5phoneAdded) {
//						red5phoneAdded = false;
//						shell.mdiCanvas.windowManager.remove(red5PhoneWindow as MDIWindow);
//					}
					break;
				case MainApplicationConstants.USER_JOINED:
					/**
			 		 * Workaround to pass in username for sip registration.
			 		*/
					//red5PhoneWindow.sipusername = modulesProxy.username;
					shell.statusInfo.text = "";
					shell.statusProgress.text = "";
					shell.statusInfo2.text = "";
					trace("User has joined");
//					if (!red5phoneAdded) {
//						red5phoneAdded = true;
//						phoneButton = new ToolbarButton();			
//						phoneButton.addEventListener(PhoneModuleConstants.START_PHONE_EVENT, onStartPhoneEvent);	
//						trace("Adding red5phone button");
//						var uid:String = String( Math.floor( new Date().getTime() ) );		
//						red5Manager = new Red5Manager(uid, "Ricahrd ALam", '600', "rtmp://192.168.0.136/sip");
//						sendNotification(MainApplicationConstants.ADD_BUTTON, phoneButton);						
//					}
					break;
				case MainApplicationConstants.USER_LOGGED_IN:
					shell.statusInfo.text = "";
					shell.statusProgress.text = "";
					shell.statusInfo2.text = "";
					break;
				case MainApplicationConstants.MODULE_STOPPED:
					var info:Object = notification.getBody();
				//	handleModuleStopped(info.moduleId, info.errors);
					break;
				case MainApplicationConstants.LOADED_MODULE:
					shell.statusInfo.text += ResourceUtil.getInstance().getString('bbb.mainshell.statusInfo.loaded',[notification.getBody()]);
					
					// Should do this properly.
					//if (notification.getBody() == "ViewersModule") {
					//	shell.loadedModules.text = "";
					//	shell.loadProgress.text = "";
					//}
					break;
				case MainApplicationConstants.MODULE_LOAD_PROGRESS:
					var mod:String = notification.getBody().name as String;
					var prog:Number = notification.getBody().progress as Number;
					
					shell.statusProgress.text = ResourceUtil.getInstance().getString('bbb.mainshell.statusProgress.loaded',[mod, prog]);
					break;
			}
		}
				
		private function testRTMPConnection():void {
			var host:String = modulesProxy.getPortTestHost();
			var app:String = modulesProxy.getPortTestApplication();
			shell.statusInfo.text = ResourceUtil.getInstance().getString('bbb.mainshell.statusInfo.testRTMPConnection');
			shell.statusInfo2.text =  ResourceUtil.getInstance().getString('bbb.mainshell.statusInfo2.testRTMPConnection');
			shell.statusProgress.text = ResourceUtil.getInstance().getString('bbb.mainshell.statusProgress.testRTMPConnection', [host, app]);
			portTestProxy.connect("RTMP", host, "1935", app);
		}
		
		private function testRTMPTConnection():void {
			var host:String = modulesProxy.getPortTestHost();
			var app:String = modulesProxy.getPortTestApplication();
			shell.statusProgress.text = ResourceUtil.getInstance().getString('bbb.mainshell.statusProgress.testRTMPTConnection', [host, app]);
			portTestProxy.connect("RTMPT", host, "", "bigbluebutton");
		}
		
		private function handleUserLoggedOut():void {

				var t:LoggedOutWindow = LoggedOutWindow(PopUpManager.createPopUp( shell.mdiCanvas, LoggedOutWindow, false));

				var point1:Point = new Point();
            	// Calculate position of TitleWindow in Application's coordinates. 
            	point1.x = 400;
            	point1.y = 300;                
            	point1 = shell.localToGlobal(point1);
           	 	t.x = point1.x + 25;
            	t.y = point1.y + 25;	
       
/*     	
            	var pageURL:String = mx.core.Application.application.url.split("/")[2];
            	var url:URLRequest = new URLRequest("http://" + pageURL + "/bigbluebutton/conference-session/signOut");
            	LogUtil.debug("Log out url: " + pageURL);
				navigateToURL(url, '_self');
*/			
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
		
		private function get portTestProxy():PortTestProxy {
			return facade.retrieveProxy(PortTestProxy.NAME) as PortTestProxy;
		}
	}
}