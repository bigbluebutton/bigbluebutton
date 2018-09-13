package org.bigbluebutton.air.main.views {
	import flash.display.DisplayObjectContainer;
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	
	import spark.components.Button;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.HorizontalLayout;
	import spark.layouts.VerticalLayout;
	
	public class MobileAlert extends MobilePopUp {
		
		private var _closeButton:Button;
		
		public function MobileAlert() {
			_closeButton = new Button();
			_closeButton.label = "OK";
			_closeButton.addEventListener(MouseEvent.CLICK, onCloseButtonClick);
		}
		
		private function onCloseButtonClick(e:MouseEvent):void {
			this.close();
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			if (instance == chrome) {
				VerticalLayout(chrome.layout).padding = getStyle("padding");
			}
			
			if (instance == contentGroup) {
				var contentGroupLayout:HorizontalLayout = new HorizontalLayout();
				contentGroupLayout.horizontalAlign = HorizontalAlign.CENTER;
				contentGroupLayout.padding = getStyle("padding");
				contentGroup.layout = contentGroupLayout;
				contentGroup.addElement(_closeButton);
			}
		}
		
		public static function show(text:String = "", title:String = "", modal:Boolean = true):void {
			var alert:MobileAlert = new MobileAlert();
			alert.text = text;
			alert.title = title;
			alert.open(FlexGlobals.topLevelApplication as DisplayObjectContainer, modal);
		}
	}
}
