package org.bigbluebutton.modules.presentation.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.bigbluebutton.modules.presentation.view.components.FisheyeThumbnail;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class ThumbnailViewMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ThumbnailViewMediator";
		
		private var _thumbView:FisheyeThumbnail;
		
		public function ThumbnailViewMediator(viewComponent:FisheyeThumbnail)
		{
			super(NAME);
			_thumbView = viewComponent;
			_thumbView.addEventListener(FisheyeThumbnail.SLIDE_SELECTED, onSelectSlide);
		}
		
		private function onSelectSlide(e:Event):void {
			proxy.gotoSlide(_thumbView.fisheye.selectedIndex);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentModuleConstants.DISPLAY_SLIDE
					];
		}
		
		override public function handleNotification(notification:INotification):void {
			switch(notification.getName()){ 
				case PresentModuleConstants.DISPLAY_SLIDE:
					var slidenum:int = notification.getBody() as int;
					//_thumbWin.slideList.scrollToIndex(slidenum);
					//_thumbWin.slideList.selectedIndex = slidenum;
			}
		}

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}

	}
}