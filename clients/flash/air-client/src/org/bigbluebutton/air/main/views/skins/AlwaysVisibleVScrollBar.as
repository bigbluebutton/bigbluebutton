package org.bigbluebutton.air.main.views.skins {
	import spark.components.VScrollBar;
	
	/**
	 * A Scroller with interactionMode="touch" fades the scrollbars away
	 * after they are shown for a brief period of time.  This class
	 * overrides that behavior to never fade away the VScrollBar.
	 *
	 * http://flexponential.com/2011/07/30/controlling-scroll-bar-visibility-in-a-mobile-scroller/
	 */
	public class AlwaysVisibleVScrollBar extends VScrollBar {
		override public function set alpha(value:Number):void {
		}
		
		override public function set visible(value:Boolean):void {
		}
		
		override public function set includeInLayout(value:Boolean):void {
		}
		
		override public function set scaleX(value:Number):void {
		}
		
		override public function set scaleY(value:Number):void {
		}
	}
}
