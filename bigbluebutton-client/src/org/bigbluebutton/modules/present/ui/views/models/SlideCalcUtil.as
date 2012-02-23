package org.bigbluebutton.modules.present.ui.views.models
{
	import org.bigbluebutton.common.LogUtil;

	public class SlideCalcUtil
	{
		public static const HUNDRED_PERCENT:Number = 100;
		
		/**
		 * Calculate the viewed region width
		 */
		public static function calcViewedRegionWidth(ftp:Boolean, vpw:Number, cpw:Number):Number {
			if (ftp) {
				var width:Number = (vpw/cpw) * HUNDRED_PERCENT;								
				if (width > HUNDRED_PERCENT) return HUNDRED_PERCENT;				
				return width;					
			} else {
				return HUNDRED_PERCENT;		
			}
		}
		
		public static function calcViewedRegionHeight(ftp:Boolean, vph:Number, cph:Number):Number {
			var height:Number = (vph/cph) * HUNDRED_PERCENT;
			if (ftp) {								
				if (height > HUNDRED_PERCENT) return HUNDRED_PERCENT;			
			} 
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
		
		public static function calcViewedRegionX(ftp:Boolean, cpx:Number, cpw:Number):Number {
			if (ftp) {
				return (cpx * HUNDRED_PERCENT) / cpw;
			} else {
				return 0;
			}
		}
		
		public static function calcViewedRegionY(ftp:Boolean, cpy:Number, cph:Number):Number {
			return (cpy * HUNDRED_PERCENT) / cph;
		}
	}
}