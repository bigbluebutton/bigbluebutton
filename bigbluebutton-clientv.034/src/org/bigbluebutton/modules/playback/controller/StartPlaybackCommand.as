package org.bigbluebutton.modules.playback.controller
{
	import org.bigbluebutton.modules.playback.model.ParsingMediator;
	import org.bigbluebutton.modules.playback.model.SoundPlaybackMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class StartPlaybackCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var xml:XML = notification.getBody() as XML;
			facade.registerMediator(new ParsingMediator(xml));
			facade.registerMediator(new SoundPlaybackMediator(xml.par.audio.@src));
		}

	}
}