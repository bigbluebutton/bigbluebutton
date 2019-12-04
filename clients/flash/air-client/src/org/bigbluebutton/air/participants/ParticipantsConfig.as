package org.bigbluebutton.air.participants {
	import org.bigbluebutton.air.participants.views.ParticipantsMediator;
	import org.bigbluebutton.air.participants.views.ParticipantsViewBase;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class ParticipantsConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		public function configure():void {
			mediators();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(ParticipantsViewBase).toMediator(ParticipantsMediator);
		}
	}
}
