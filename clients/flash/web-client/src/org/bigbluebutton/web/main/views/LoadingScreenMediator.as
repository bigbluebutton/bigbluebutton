package org.bigbluebutton.web.main.views {
	import flash.net.URLRequest;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.lib.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.web.main.models.IUISession;
	import org.bigbluebutton.web.main.services.JoinService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class LoadingScreenMediator extends Mediator {
		
		[Inject]
		public var view:LoadingScreen;
		
		[Inject]
		public var joinMeetingSignal:JoinMeetingSignal;
		
		[Inject]
		public var uiSession:IUISession;
		
		override public function initialize():void {
			uiSession.loadingChangeSignal.add(onLoadingChange);
			onLoadingChange(uiSession.loading, uiSession.loadingMessage);
			var tempURL:String = "bigbluebutton://mconf-live-lab.nuvem.ufrgs.br/bigbluebutton/api/join?fullName=User+4104611&meetingID=random-2907170&password=mp&redirect=true&checksum=6802cefed9a9cce7fa9d9e1abcd54a66765c6133";
			// Call join service
			var joinSubservice:JoinService = new JoinService();
			joinSubservice.successSignal.add(joinSuccess);
			joinSubservice.failureSignal.add(joinFailure);
			joinSubservice.join(tempURL);
		}
		
		private function onLoadingChange(loading:Boolean, message:String):void {
			view.stateLabel.text = message;
			view.visible = loading;
		}
		
		private function joinSuccess(urlRequest:URLRequest, responseURL:String):void {
			joinMeetingSignal.dispatch(responseURL);
		}
		
		private function joinFailure(reason:String):void {
			uiSession.setLoading(true, reason);
		}
		
		override public function destroy():void {
			super.destroy();
			uiSession.loadingChangeSignal.remove(onLoadingChange);
			//view.dispose();
			view = null;
		}
	}
}
