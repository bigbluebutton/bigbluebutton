package org.bigbluebutton.modules.present.ui.views.models
{
	import org.bigbluebutton.common.LogUtil;

	public class SlideCalcUtil
	{
		public static const HUNDRED_PERCENT:Number = 100;
		// After lots of trial and error on why synching doesn't work properly, I found I had to 
		// multiply the coordinates by 2. There's something I don't understand probably on the
		// canvas coordinate system. (ralam feb 22, 2012)
		public static const MYSTERY_NUM:int = 2;
		
		/**
		 * Calculate the viewed region width
		 */
		public static function calcViewedRegionWidth(vpw:Number, cpw:Number):Number {
			var width:Number = (vpw/cpw) * HUNDRED_PERCENT;								
			if (width > HUNDRED_PERCENT) return HUNDRED_PERCENT;				
			return width;					
		}
		
		public static function calcViewedRegionHeight(vph:Number, cph:Number):Number {
			var height:Number = (vph/cph) * HUNDRED_PERCENT;							
			if (height > HUNDRED_PERCENT) return HUNDRED_PERCENT;			
			return height;		
		}		
		
		public static function calcCalcPageSizeWidth(ftp:Boolean, vpw:Number, vrw:Number):Number {
			if (ftp) {
				return (vpw/vrw) * HUNDRED_PERCENT;		
			} else {
				return vpw;	
			}			
		}
		
		public static function calcCalcPageSizeHeight(ftp:Boolean, vph:Number, vrh:Number, cpw:Number, cph:Number, opw:Number, oph:Number):Number {
			if (ftp) {
				return (vph/vrh) * HUNDRED_PERCENT;			
			} else {
				return (cpw/opw) * oph;		
			}
		}		
		
		public static function calcViewedRegionX(cpx:Number, cpw:Number):Number {
			return (cpx * HUNDRED_PERCENT) / cpw;
		}
		
		public static function calcViewedRegionY(cpy:Number, cph:Number):Number {
			return (cpy * HUNDRED_PERCENT) / cph;
		}
		
		public static function calculateViewportX(vpw:Number, pw:Number):Number {
			if (vpw == pw) {
				return 0;
			} else {
				return (pw - vpw) / MYSTERY_NUM;
			}
		}
		
		public static function calculateViewportY(vph:Number, ph:Number):Number {			
			if (vph == ph) {
				return 0;
			} else {
				return (ph - vph) / MYSTERY_NUM;
			}
		}
	}
}