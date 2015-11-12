package org.bigbluebutton.air.presentation.views {
	
	import flash.display.StageOrientation;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.system.LoaderContext;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.lib.presentation.models.Slide;
	
	public class PresentationView extends PresentationViewBase implements IPresentationView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function onClick(e:MouseEvent):void {
			//buttonTestSignal.dispatch();
		}
		
		public function setPresentationName(name:String):void {
			FlexGlobals.topLevelApplication.pageName.text = name;
		}
		
		public function setSlide(s:Slide):void {
			if (s != null) {
				var context:LoaderContext = new LoaderContext();
				context.allowCodeImport = true;
				slide.loaderContext = context;
				slide.source = s.SWFFile.source;
			} else {
				slide.source = null;
			}
		}
		
		public function securityError(e:Event):void {
			trace("PresentationView.as Security error : " + e.toString());
		}
		
		override public function rotationHandler(rotation:String):void {
			switch (rotation) {
				case StageOrientation.ROTATED_LEFT:
					slide.rotation = -90;
					break;
				case StageOrientation.ROTATED_RIGHT:
					slide.rotation = 90;
					break;
				case StageOrientation.UPSIDE_DOWN:
					slide.rotation = 180;
					break;
				case StageOrientation.DEFAULT:
				case StageOrientation.UNKNOWN:
				default:
					slide.rotation = 0;
			}
		}
		
		public function dispose():void {
		}
	}
}
