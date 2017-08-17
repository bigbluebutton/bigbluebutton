package org.bigbluebutton.skins {
	import flash.display.GradientType;

	import mx.skins.Border;
	import mx.skins.halo.HaloColors;
	import mx.utils.ColorUtil;

	public class ScrollThumbSkin extends Border {

		//--------------------------------------------------------------------------
		//
		//  Overridden properties
		//
		//--------------------------------------------------------------------------

		//----------------------------------
		//  measuredWidth
		//----------------------------------

		/**
		 *  @private
		 */
		override public function get measuredWidth():Number {
			return 8;
		}

		//----------------------------------
		//  measuredHeight
		//----------------------------------

		/**
		 *  @private
		 */
		override public function get measuredHeight():Number {
			return 10;
		}

		//--------------------------------------------------------------------------
		//
		//  Overridden methods
		//
		//--------------------------------------------------------------------------

		/**
		 *  @private
		 */
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);

			// User-defined styles.
			var thumbColor:uint = getStyle("thumbColor");
			var cornerRadius:Number = getStyle("cornerRadius");

			graphics.clear();

			var fillAlpha:Number = 1;

			if (name == "trackDisabledSkin")
				fillAlpha = .2;

			// fill
			drawRoundRect(0, 0, w, h, cornerRadius, thumbColor, fillAlpha);

		}
	}
}
