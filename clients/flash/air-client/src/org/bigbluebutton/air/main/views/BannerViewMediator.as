package org.bigbluebutton.air.main.views
{
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	
	import robotlegs.bender.bundles.mvcs.Mediator;

	public class BannerViewMediator extends Mediator
	{
		[Inject]
		public var view:BannerView;
		
		[Inject]
		public var confParams:IConferenceParameters;
		
		override public function initialize():void {
			confParams.confParamsLoadedSignal.add(onConfParameLoadedSignal);
		}
		
		private function onConfParameLoadedSignal():void {
			if (confParams.bannerText != null) {
				view.visible = true;
				view.includeInLayout = true;
				view.stateLabel.text = confParams.bannerText;
				if (confParams.bannerColor != null) {
					view.setStyle('backgroundColor', confParams.bannerColor);
				}
				
			}
			
		}
	}
}