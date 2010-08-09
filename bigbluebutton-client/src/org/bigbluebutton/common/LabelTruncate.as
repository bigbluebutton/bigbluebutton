package org.bigbluebutton.common
{
	import mx.controls.Label;

	/**
	 * An extension for mx.controls.Label to truncate the text and show
	 * a tooltip with the full-length content. This sub-class is meant to be
	 * used when the regular truncateToFit does result in a "null" appendix
	 * on the string instead of the "...". In order for this to work, I used
	 * the following parameters in my mxml: 
	 * 
	 *  - truncateToFit = false
	 *  - maxWidth = set
	 *  - width = set
	 * 
	 * 
	 * @author Tomi Niittumäki // Feijk Industries 2010
	 * @NOTE: Feel free to use! :)
	 */
	public class LabelTruncate extends Label{
		
		// define the truncation indicator eg. ...(more) etc.
		private const TRUNCATION_INDICATOR:String = new String("...");
		
		/**
		 * Constructor
		 */
		public function LabelTruncate(){
			super();
		}
		
		/**
		 * The overriding method, which forces the textField to truncate
		 * its content with the method truncateToFit(truncationIndicator:String)
		 * and then supers the tooltip to be the original full-length text.
		 */
		override protected function updateDisplayList(unscaledWidth:Number, 
													  unscaledHeight:Number):void{
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			//trace("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!: "+textField.text);
			textField.truncateToFit(TRUNCATION_INDICATOR);
			super.toolTip = text;
		}
		
	}
}