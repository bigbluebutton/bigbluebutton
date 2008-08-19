package org.bigbluebutton.modules.playback.controller
{
	import org.bigbluebutton.modules.playback.PlaybackModule;
	import org.bigbluebutton.modules.playback.PlaybackModuleMediator;
	import org.bigbluebutton.modules.playback.model.XMLProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class StartupPlaybackCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var app:PlaybackModule = notification.getBody() as PlaybackModule;
			
			facade.registerMediator(new PlaybackModuleMediator(app));
		}

	}
}