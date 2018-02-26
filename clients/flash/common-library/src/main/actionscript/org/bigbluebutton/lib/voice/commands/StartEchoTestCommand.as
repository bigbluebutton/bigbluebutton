package org.bigbluebutton.lib.voice.commands {
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class StartEchoTestCommand extends Command {
		private const LOG:String = "StartEchoTestCommand::";
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function execute():void {
			userSession.voiceConnection.call(false, userSession.phoneOptions.echoTestApp);
		}
	}
}
