package org.bigbluebutton.air.presentation.commands {
	
	import org.bigbluebutton.air.presentation.models.Slide;
	import org.bigbluebutton.air.presentation.services.LoadSlideService;
	
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class LoadSlideCommand extends Command {
		
		[Inject]
		public var slide:Slide;
		
		[Inject]
		public var presentationID:String;
		
		private var _loadSlideService:LoadSlideService;
		
		public function LoadSlideCommand() {
			super();
		}
		
		override public function execute():void {
			if (slide != null) {
				if (!slide.loadRequested) {
					slide.loadRequested = true;
					_loadSlideService = new LoadSlideService(slide);
				} else {
					trace("LoadSlideCommand: load request has already been received, ignoring the repeat request");
				}
			} else {
				trace("LoadSlideCommand: requested slide is null and cannot be loaded");
			}
		}
	}
}
