package org.bigbluebutton.lib.presentation.commands {
	
	import org.bigbluebutton.lib.presentation.services.LoadSlideService;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import robotlegs.bender.bundles.mvcs.Command;
	
	public class LoadSlideCommand extends Command {
		
		[Inject]
		public var slide:Slide;
		
		private var _loadSlideService:LoadSlideService;
		
		public function LoadSlideCommand() {
			super();
		}
		
		override public function execute():void {
			if (slide != null) {
				_loadSlideService = new LoadSlideService(slide);
			} else {
				trace("LoadSlideCommand: requested slide is null and cannot be loaded");
			}
		}
	}
}
