package org.bigbluebutton.modules.playback.controller
{
	import org.bigbluebutton.common.Constants;
	import org.bigbluebutton.main.MainApplicationFacade;
	import org.bigbluebutton.modules.playback.model.RecordingProxy;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class StartRecordingCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
//			var conf:Conference = MainApplicationFacade.getInstance().getConference();
//			var uri:String ='rtmp://' + Constants.red5Host + '/vcr/';
			
//			facade.registerProxy(new RecordingProxy(uri));
		}

	}
}