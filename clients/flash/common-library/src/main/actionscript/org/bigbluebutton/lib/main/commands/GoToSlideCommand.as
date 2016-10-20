package org.bigbluebutton.lib.main.commands {
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class GoToSlideCommand extends Command {
		
		[Inject]
		public var presentationService:IPresentationService;
		
		[Inject]
		public var slide:String;
		
		override public function execute():void {
			trace("GoToSlideCommand.execute()");
			presentationService.gotoSlide(slide);
		}
	}
}
