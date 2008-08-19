package org.bigbluebutton.modules.presentation.model.business
{
	import flash.net.NetConnection;

	public class PresentationPlaybackProxy extends PresentationDelegate
	{
		public function PresentationPlaybackProxy(nc:NetConnection)
		{
			super(nc);
		}
		
		override public function connectionSuccess():void{}
		
		override public function connectionFailed(message:String):void{}
		
		override public function join(userid:Number, host:String, room:String):void{}
		
		override public function leave():void{}
		
		override public function gotoPage(page:Number):void{}
		
		/**
		 * Call to switch to a new page
		 * @param page
		 * 
		 */		
		override public function gotoPageCallback(page:Number):void{
			sendNotification(PresentationFacade.UPDATE_PAGE, page);
		}
		
		override public function zoom(slideHeight:Number, slideWidth:Number):void{}
		
		/**
		 * Call to zoom the slide in or out
		 * @param slideHeight
		 * @param slideWidth
		 * 
		 */		
		override public function zoomCallback(slideHeight:Number, slideWidth:Number):void{
			sendNotification(PresentationFacade.ZOOM_SLIDE, new ZoomNotifier(slideHeight, slideWidth));
		}
		
		override public function move(slideXPosition:Number, slideYPosition:Number):void{}
		
		/**
		 * Call to move the slide within the presentation window
		 * @param slideXPosition
		 * @param slideYPosition
		 * 
		 */		
		override public function moveCallback(slideXPosition:Number, slideYPosition:Number):void{
		   sendNotification(PresentationFacade.MOVE_SLIDE, new MoveNotifier(slideXPosition, slideYPosition));		
		}
		
		override public function maximize():void{}
		
		/**
		 * Call to maximize the presentation window
		 * 
		 */		
		override public function maximizeCallback():void{
			sendNotification(PresentationFacade.MAXIMIZE_PRESENTATION);
		}
		
		override public function restore():void{}
		
		/**
		 * Call to restore the presentation from a maximized state
		 * 
		 */		
		override public function restoreCallback():void{
			sendNotification(PresentationFacade.RESTORE_PRESENTATION);
		}
		
		override public function clear():void{}
		
		/**
		 * Call to stop the "sharing" of slides 
		 * 
		 */		
		override public function clearCallback():void{
			sendNotification(PresentationFacade.CLEAR_EVENT);
		}
		
		override public function givePresenterControl(userid:Number, name:String):void{}
		
		override public function stopSharing():void{}
		
		override public function share(sharing:Boolean):void{}
		
	}
}