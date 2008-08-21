package org.bigbluebutton.modules.presentation.model.business
{
	import flash.net.NetConnection;
	
	import org.bigbluebutton.modules.presentation.PresentationFacade;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;

	public class PresentationPlaybackProxy extends PresentationDelegate
	{
		//These are XML constants for event types
		public static const SHARING:String = "sharing";
		public static const PRESENTER:String = "presenter";
		public static const CONVERSION:String = "conversion";
		public static const SLIDE:String = "slide";
		public static const CHANGE_SLIDE:String = "change_slide";
		
		public static const SLIDES_FOLDER:String = "C:/tests/playback/MWtest/session-1/slides";
		
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
		
		
		//Playback Methods
		public function changeSlide(message:XML):void{
			var slideNum:Number = message.@value;
		}
		
		public function conversionComplete(message:XML):void{
			// Don't really need to do anything concerning conversion events at the moment
		}
		
		public function presenterAssigned(message:XML):void{
			var presenter:String = message.@name;
			var presenterID:Number = message.@userid;
		}
		
		public function startSharing(message:XML):void{
			if (message.@sharing == "true"){
				//TODO Share
			}
		}
		
		public function slideCreated(message:XML):void{
			var slideName:String = message.@name;
		}
		
	}
}