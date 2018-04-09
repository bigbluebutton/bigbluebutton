package org.bigbluebutton.air.main.views
{
	import robotlegs.bender.bundles.mvcs.Mediator;

	public class UserInactivityViewMediator extends Mediator
	{
		[Inject]
		public var view:UserInactivityView;
		
		
		override public function initialize():void {
			trace("************ UserInactivityView:: INIT **************");
			view.okButton.visible = true;
		}
		
		override public function destroy():void {
			trace("************ UserInactivityView:: destroy **************");
		}
	}
}