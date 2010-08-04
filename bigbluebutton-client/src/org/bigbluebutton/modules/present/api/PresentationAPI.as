package org.bigbluebutton.modules.present.api
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.containers.Canvas;
	import mx.controls.Button;
	
	import org.bigbluebutton.common.IBbbCanvas;
	import org.bigbluebutton.modules.present.events.AddButtonToPresentationEvent;
	import org.bigbluebutton.modules.present.events.AddOverlayCanvasEvent;

	public class PresentationAPI
	{
		private static var instance:PresentationAPI;
		
		private var dispatcher:Dispatcher;
		
		public function PresentationAPI(enforcer:SingletonEnforcer)
		{
			if (enforcer == null){
				throw new Error("There can only be 1 UserManager instance");
			}
			initialize();
		}
		
		private function initialize():void{
			dispatcher = new Dispatcher();
		}
		
		/**
		 * Return the single instance of the PresentationAPI class, which is a singleton
		 */
		public static function getInstance():PresentationAPI{
			if (instance == null){
				instance = new PresentationAPI(new SingletonEnforcer());
			}
			return instance;
		}
		
		public function addOverlayCanvas(canvas:IBbbCanvas):void{
			var overlayEvent:AddOverlayCanvasEvent = new AddOverlayCanvasEvent(AddOverlayCanvasEvent.ADD_OVERLAY_CANVAS);
			overlayEvent.canvas = canvas;
			dispatcher.dispatchEvent(overlayEvent);
		}
		
		public function addButtonToToolbar(button:IPresentationButton):void{
			var buttonEvent:AddButtonToPresentationEvent = new AddButtonToPresentationEvent(AddButtonToPresentationEvent.ADD_BUTTON);
			buttonEvent.button = button;
			dispatcher.dispatchEvent(buttonEvent);
		}
	}
}
class SingletonEnforcer{}