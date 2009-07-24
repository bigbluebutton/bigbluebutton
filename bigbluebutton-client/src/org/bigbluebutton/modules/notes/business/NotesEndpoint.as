package org.bigbluebutton.modules.notes.business
{
	import org.bigbluebutton.common.messaging.Endpoint;
	import org.bigbluebutton.common.messaging.EndpointMessageConstants;
	import org.bigbluebutton.common.messaging.Router;
	import org.bigbluebutton.modules.notes.views.Notes;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	
	public class NotesEndpoint
	{
		private var _module:NotesModule;
		
		private var _router:Router;
		private var _endpoint:Endpoint;		
		private static const TO_NOTES_MODULE:String = "TO_CHAT_MODULE";
		private static const FROM_NOTES_MODULE:String = "FROM_CHAT_MODULE";
		
		public function NotesEndpoint(module:NotesModule)
		{
			this._module = module;
			this._router = module.router;
			LogUtil.debug("Creating endpoint for NotesModule");
			_endpoint = new Endpoint(_router, FROM_NOTES_MODULE, TO_NOTES_MODULE, messageReceiver);	
			
			_module.notesWindow = new Notes();
			_module.notesWindow.xPosition = 200;
			_module.notesWindow.yPosition = 200;
			_module.notesWindow.showCloseButton = true;
			_module.notesWindow.title = "Shared Notes";
			sendNotesModuleStartedMessage();
		}
		
		private function messageReceiver(message : IPipeMessage):void{
			var msg : String = message.getHeader().MSG as String;
			switch(message){
				case EndpointMessageConstants.CLOSE_WINDOW:
					//Close the window here
					break;
				case EndpointMessageConstants.OPEN_WINDOW:
					break;
			}
		}
		
		private function sendNotesModuleStartedMessage():void{
			_endpoint.sendMessage(EndpointMessageConstants.MODULE_STARTED, EndpointMessageConstants.TO_MAIN_APP, _module.moduleId);
			
			_endpoint.sendMessage(EndpointMessageConstants.ADD_WINDOW, EndpointMessageConstants.TO_MAIN_APP, _module.notesWindow);
		}

	}
}