package org.bigbluebutton.modules.polling.managers
{

	import com.asfusion.mate.events.Dispatcher;	
	import flash.events.IEventDispatcher;	
	import org.bigbluebutton.modules.polling.events.GetPollsEvent;
	import org.bigbluebutton.modules.polling.model.PollingModel;
			
	public class PollManager
	{	
		
		public static const LOG:String = "[PollManager] - ";	
		
    // Injected by Mate
    public var model:PollingModel;
    public var dispatcher:IEventDispatcher;
    
		public function PollManager()
		{

		}
		
    public function handleStartModuleEvent(module:PollingModule):void {
      
    }
    
    public function handleInitPollModuleEvent():void {
      dispatcher.dispatchEvent(new GetPollsEvent());
    }
   }
}
