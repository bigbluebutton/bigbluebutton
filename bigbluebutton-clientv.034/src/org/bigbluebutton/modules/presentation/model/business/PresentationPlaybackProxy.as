package org.bigbluebutton.modules.presentation.model.business
{
	import flash.net.NetConnection;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.presentation.PresentationFacade;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;
	import org.bigbluebutton.modules.presentation.model.vo.Slide;

	public class PresentationPlaybackProxy extends PresentationDelegate
	{
		//These are XML constants for event types
		public static const SHARING:String = "sharing";
		public static const PRESENTER:String = "presenter";
		public static const CONVERSION:String = "conversion";
		public static const SLIDES_CREATED:String = "slides_created";
		public static const CHANGE_SLIDE:String = "change_slide";
		
		public static const SLIDES_FOLDER:String = "C:/tests/playback/MWtest/session-1/slides/";
		public var slides:ArrayCollection;
		
		public function PresentationPlaybackProxy(nc:NetConnection)
		{
			super(nc);
			slides = new ArrayCollection();
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
			var slide:Slide = slides[slideNum-1] as Slide;
			slide.name = message.@value;
			
			//Alert.show(slides[slideNum]);
			sendNotification(CHANGE_SLIDE, slide);
		}
		
		public function conversionComplete(message:XML):void{
			// Don't really need to do anything concerning conversion events at the moment
		}
		
		public function presenterAssigned(message:XML):void{
			var presenter:String = message.@name;
			var presenterID:Number = message.@userid;
			sendNotification(PRESENTER, presenter);
		}
		
		public function startSharing(message:XML):void{
			if (message.@sharing == "true"){
				//TODO Share
			}
		}
		
		public function slidesCreated(message:XML):void{
			var list:XMLList = message.presentation;
			var item:XML;
			
			for each(item in list){
				var slide:Slide = new Slide();
				slide.source = SLIDES_FOLDER + item.@name;
				slides.addItem(slide);
			}
			
			sendNotification(SLIDES_CREATED, slides);
		}
		
	}
}