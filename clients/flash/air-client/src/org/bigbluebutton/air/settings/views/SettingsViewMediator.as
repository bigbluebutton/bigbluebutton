package org.bigbluebutton.air.settings.views {
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class SettingsViewMediator extends Mediator {
		
		[Inject]
		public var view:SettingsView;
		
		public function SettingsViewMediator() {
		}
	}
}
