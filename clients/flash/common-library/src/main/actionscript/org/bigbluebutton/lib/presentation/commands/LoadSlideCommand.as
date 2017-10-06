package org.bigbluebutton.lib.presentation.commands {
	
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.presentation.services.LoadSlideService;
	import org.bigbluebutton.lib.whiteboard.services.IWhiteboardService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class LoadSlideCommand extends Command {
		
		[Inject]
		public var slide:Slide;
		
		[Inject]
		public var presentationID:String;
		
		[Inject]
		public var whiteboardService:IWhiteboardService;
		
		private var _loadSlideService:LoadSlideService;
		
		public function LoadSlideCommand() {
			super();
		}
		
		override public function execute():void {
			if (slide != null) {
				if (!slide.loadRequested) {
					slide.loadRequested = true;
					_loadSlideService = new LoadSlideService(slide);
					whiteboardService.getAnnotationHistory(presentationID, slide.slideNumber);
				} else {
					trace("LoadSlideCommand: load request has already been received, ignoring the repeat request");
				}
			} else {
				trace("LoadSlideCommand: requested slide is null and cannot be loaded");
			}
		}
	}
}
