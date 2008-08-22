package org.bigbluebutton.modules.presentation.view.playback
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.presentation.model.business.PresentationPlaybackProxy;
	import org.bigbluebutton.modules.presentation.model.vo.Slide;
	import org.bigbluebutton.modules.presentation.view.ThumbnailView;
	import org.bigbluebutton.modules.presentation.view.ThumbnailViewMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	
	public class ThumbnailPlaybackMediator extends ThumbnailViewMediator
	{
		public function ThumbnailPlaybackMediator(view:ThumbnailView)
		{
			super(view);
		}
		
		override protected function sendPageNumber(e:Event):void{
			thumbnailView.myLoader.percentHeight = 100;
			thumbnailView.myLoader.percentWidth = 100;
			thumbnailView.myLoader.x = 1;
			thumbnailView.myLoader.y = 1;
			
			var pageNum : uint = thumbnailView.slideList.selectedIndex;
			proxy.gotoPage(pageNum);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentationPlaybackProxy.CHANGE_SLIDE,
					PresentationPlaybackProxy.SLIDES_CREATED
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PresentationPlaybackProxy.CHANGE_SLIDE:
					var slide:Slide = notification.getBody() as Slide;
					//Alert.show(slide.source);
					
					thumbnailView.selectedSlide.source = slide.source;
					thumbnailView.selectedSlide.name = slide.name;
					
					//thumbnailView.myLoader.source = slide.source;
					
					//thumbnailView.myLoader.load(slide.source);
					break;
				case PresentationPlaybackProxy.SLIDES_CREATED:
					thumbnailView.slideList.dataProvider = notification.getBody() as ArrayCollection;
					break;
			}
		}

	}
}