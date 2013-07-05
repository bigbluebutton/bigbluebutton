package org.bigbluebutton.modules.polling.managers
{
	import com.asfusion.mate.events.Dispatcher;
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.polling.views.PollingInstructionsWindow;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.common.events.CloseWindowEvent;

	import org.bigbluebutton.common.IBbbModuleWindow;

	import org.bigbluebutton.modules.polling.events.*;
	
	import org.bigbluebutton.modules.polling.service.PollingService;
	
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.Conference; 
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.main.events.ShortcutEvent;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
			
	public class PollingManager
	{	
		
		public static const LOGNAME:String = "[PollingManager] ";			
		public var toolbarButtonManager:ToolbarButtonManager;
		private var module:PollingModule;
		private var globalDispatcher:Dispatcher;
		private var service:PollingService;
		private var viewWindowManager:PollingWindowManager;
		private var isPolling:Boolean = false;
		public var pollKey:String;
		public var participants:int;
		private var conference:Conference;
		private var synchTimer:Timer;
		
		public function PollingManager() {
				LogUtil.debug(LOGNAME +" Building PollingManager");
				service = new PollingService();
			    toolbarButtonManager = new ToolbarButtonManager();
			    globalDispatcher = new Dispatcher();
			    viewWindowManager = new PollingWindowManager();
		}
		
		public function handleStartModuleEvent(module:PollingModule):void {
			LogUtil.debug(LOGNAME + "Polling Module starting");
			this.module = module;			
		}
								
		public function handleMadePresenterEvent(e:MadePresenterEvent):void{
			LogUtil.debug(LOGNAME +" Adding Polling Menu");
			toolbarButtonManager.addToolbarButton();
		}
		
		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			toolbarButtonManager.removeToolbarButton();
		}	
   }
}
