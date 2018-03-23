package org.bigbluebutton.air.poll {
	import org.bigbluebutton.air.poll.commands.RespondToPollCommand;
	import org.bigbluebutton.air.poll.commands.RespondToPollSignal;
	import org.bigbluebutton.air.poll.views.PollButtons;
	import org.bigbluebutton.air.poll.views.PollButtonsMediator;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class PollConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			mediators();
			signals();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(PollButtons).toMediator(PollButtonsMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(RespondToPollSignal).toCommand(RespondToPollCommand);
		}
	}
}
