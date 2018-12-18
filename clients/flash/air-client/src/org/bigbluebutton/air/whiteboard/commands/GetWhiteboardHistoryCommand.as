package org.bigbluebutton.air.whiteboard.commands {
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.whiteboard.services.IWhiteboardService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class GetWhiteboardHistoryCommand extends Command {
		[Inject]
		public var whiteboardService:IWhiteboardService;
		
		[Inject]
		public var whiteboardId:String;
		
		override public function execute():void {
			whiteboardService.getAnnotationHistory(whiteboardId);
		}
	}
}
