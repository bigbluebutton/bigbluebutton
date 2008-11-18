package org.bigbluebutton.modules.video.view
{
	import org.bigbluebutton.modules.video.VideoModuleConstants;
	import org.bigbluebutton.modules.video.view.components.ToolbarButton;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class ToolbarButtonMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ToolbarButtonMediator";
		
		private var button:ToolbarButton;
		
		public function ToolbarButtonMediator()
		{
			super(NAME);
			button = new ToolbarButton();
		}
		
		override public function listNotificationInterests():Array
		{
			return [
				VideoModuleConstants.SETUP_COMPLETE
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case VideoModuleConstants.SETUP_COMPLETE:
					trace(NAME + ":Got VideoModuleConstants.SETUP_COMPLETE");
					facade.sendNotification(VideoModuleConstants.ADD_BUTTON, button);
				break;
			}
		}
		
	}
}