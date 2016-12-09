package org.bigbluebutton.air.participants {
	import org.bigbluebutton.air.participants.views.TopToolbarMediatorParticipants;
	import org.bigbluebutton.air.participants.views.TopToolbarParticipants;
	import org.bigbluebutton.lib.main.views.TopToolbarBase;
	
	import robotlegs.bender.extensions.matching.TypeMatcher;
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
			mediatorMap.mapMatcher(new TypeMatcher().allOf(TopToolbarBase, TopToolbarParticipants)).toMediator(TopToolbarMediatorParticipants);
		}
	}
}
