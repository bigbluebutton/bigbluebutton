package org.bigbluebutton.modules.sample_module
{
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.ModuleMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	
	/**
	 * This is a Module Mediator. It communicates between this module and the rest of BigBlueButton. 
	 * @author Denis
	 * 
	 */	
	public class SampleModuleMediator extends ModuleMediator
	{
		public static const FROM_SAMPLE_MODULE:String = "From Sample Module";
		public static const TO_SAMPLE_MODULE:String = "To Sample Module";
		
		public function SampleModuleMediator(viewComponent:SampleModule)
		{
			super(viewComponent, TO_SAMPLE_MODULE, FROM_SAMPLE_MODULE);
		}
		
		/**
		 * You list the notifications your mediator is interested in here. If one of the listed events occurs, this class will get
		 * notified of it 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					SampleFacade.TEST
					];
		}
		
		/**
		 * This is the method where the event gets handled. 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case SampleFacade.TEST:
					Alert.show(notification.getBody() as String);
					break;
			}
		}

	}
}