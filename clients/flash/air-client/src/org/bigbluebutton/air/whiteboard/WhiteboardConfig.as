package org.bigbluebutton.air.whiteboard {
	
	import org.bigbluebutton.lib.whiteboard.commands.GetWhiteboardHistoryCommand;
	import org.bigbluebutton.lib.whiteboard.commands.GetWhiteboardHistorySignal;
	import org.bigbluebutton.lib.whiteboard.models.IWhiteboardModel;
	import org.bigbluebutton.lib.whiteboard.models.WhiteboardModel;
	import org.bigbluebutton.lib.whiteboard.services.IWhiteboardService;
	import org.bigbluebutton.lib.whiteboard.services.WhiteboardService;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvas;
	import org.bigbluebutton.lib.whiteboard.views.WhiteboardCanvasMediator;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class WhiteboardConfig implements IConfig {
		
		[Inject]
		public var injector:IInjector;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			singletons();
			mediators();
			signals();
		}
		
		public function singletons():void {
			injector.map(IWhiteboardService).toSingleton(WhiteboardService);
			injector.map(IWhiteboardModel).toSingleton(WhiteboardModel);
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(WhiteboardCanvas).toMediator(WhiteboardCanvasMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(GetWhiteboardHistorySignal).toCommand(GetWhiteboardHistoryCommand);
		}
	
	}
}
