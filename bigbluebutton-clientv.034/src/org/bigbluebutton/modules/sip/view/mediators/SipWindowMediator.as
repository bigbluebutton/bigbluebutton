package org.bigbluebutton.modules.sip.view.mediators
{
	import org.bigbluebutton.modules.sip.view.SipWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class SipWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "SipWindowMediator";
		
		public function SipWindowMediator(view:SipWindow)
		{
			super(NAME, view);
		}
		
		private function get window():SipWindow{
			return viewComponent as SipWindow;
		}
		
		override public function listNotificationInterests():Array{
			return [];
		}
		
		override public function handleNotification(notification:INotification):void{
			
		}

	}
}