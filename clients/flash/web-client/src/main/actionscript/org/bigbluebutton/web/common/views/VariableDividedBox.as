package org.bigbluebutton.web.common.views {
	import mx.containers.DividedBox;
	import mx.core.UIComponent;
	import mx.core.mx_internal;
	
	use namespace mx_internal;
	
	public class VariableDividedBox extends DividedBox {
		private var _previousWidth:Number;
		private var _previousHeight:Number;
		
		public function VariableDividedBox() {
			super();
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			if (isVertical() ? unscaledHeight != _previousHeight : unscaledWidth != _previousWidth) {
				preLayoutAdjustment();
			}
			
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			_previousWidth = unscaledWidth;
			_previousHeight = unscaledHeight;
		}
		
		private function preLayoutAdjustment():void {
			var vertical:Boolean = isVertical();
			
			var n:int = numChildren;
			var child:UIComponent;
			for (var i:int = 0; i < n; i++) {
				child = UIComponent(getChildAt(i));
				if (child is IPanelAdjustable && !IPanelAdjustable(child).adjustable) {
					if (vertical) {
						child.height = child.height;
					} else {
						child.width = child.width;
					}
				}
			}
		}
	}
}
