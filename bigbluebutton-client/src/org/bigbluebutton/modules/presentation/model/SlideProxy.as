package org.bigbluebutton.modules.presentation.model
{
	import flash.utils.ByteArray;
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class SlideProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "SlideProxy";
		
		private var _slides:Object;
		
		public function SlideProxy()
		{
			super(NAME);
			_slides = new Object();
		}
		
		public function load(slide:Slide):void {
			_slides[slide.slideNumber] = slide;
			slide.load(slideLoadListener);
		}
		
		public function clear():void {
			_slides = null;
			_slides = new Object();
		}
		
		private function slideLoadListener(slideNum:Number, slide:ByteArray):void {
			sendNotification(PresentModuleConstants.SLIDE_LOADED, {slideNum:slideNum, slide:slide});
		}
	}
}