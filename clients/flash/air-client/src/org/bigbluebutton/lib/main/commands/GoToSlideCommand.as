package org.bigbluebutton.lib.main.commands {
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class GoToSlideCommand extends Command {
		
		[Inject]
		public var presentationService:IPresentationService;
		
		[Inject]
		public var presentationId:String;
		
		[Inject]
		public var pageId:String;
		
		override public function execute():void {
			trace("GoToSlideCommand.execute()");
			presentationService.setCurrentPage("DEFAULT_PRESENTATION_POD", presentationId, pageId);
		}
	}
}
