package org.bigbluebutton.web.main.views {
	import org.bigbluebutton.web.main.models.IUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MainShellMediator extends Mediator {
		
		[Inject]
		public var view:MainShell;
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function initialize():void {
			uiSession.loadingChangeSignal.add(onLoadingChangeSignal);
			uiSession.participantsOpenSignal.add(onParticipantsOpenSignal);
			uiSession.chatInfoSignal.add(onChatInfoSignal);
		}
		
		private function onLoadingChangeSignal(val:Boolean, message:String):void {
			if (!val) {
				view.createPanels();
				onParticipantsOpenSignal();
				onChatInfoSignal()
			}
		}
		
		private function onParticipantsOpenSignal():void {
			view.participantsPanel.visible = view.participantsPanel.includeInLayout = uiSession.participantsOpen;
		}
		
		private function onChatInfoSignal():void {
			view.chatPanel.visible = view.chatPanel.includeInLayout = uiSession.chatInfo != null;
		}
		
		override public function destroy():void {
			uiSession.loadingChangeSignal.remove(onLoadingChangeSignal);
			uiSession.participantsOpenSignal.remove(onParticipantsOpenSignal);
			uiSession.chatInfoSignal.remove(onChatInfoSignal);
			
			super.destroy();
			view = null;
		}
	}
}
