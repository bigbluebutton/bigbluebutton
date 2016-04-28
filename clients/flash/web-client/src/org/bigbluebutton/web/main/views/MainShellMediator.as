package org.bigbluebutton.web.main.views {
	import org.bigbluebutton.web.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MainShellMediator extends Mediator {
		
		[Inject]
		public var view:MainShell;
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function initialize():void {
			uiSession.participantsOpenSignal.add(onParticipantsOpenSignal);
			onParticipantsOpenSignal();
		}
		
		private function onParticipantsOpenSignal():void {
			view.participantsPanel.visible = view.participantsPanel.includeInLayout = uiSession.participantsOpen;
		}
		
		override public function destroy():void {
			uiSession.participantsOpenSignal.remove(onParticipantsOpenSignal);
			
			super.destroy();
			view = null;
		}
	}
}
