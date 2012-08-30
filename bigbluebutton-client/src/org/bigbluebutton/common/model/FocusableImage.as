package org.bigbluebutton.common.model
{
	import mx.controls.Image;
	import mx.managers.IFocusManagerComponent
	
	// This extended Image class allows for an image to be focused. This means that an 
	// accessibilityName/Description can be added and read by a screen reader.
	public class FocusableImage extends Image implements IFocusManagerComponent
	{
		public function FocusableImage()
		{
			super();
			
			focusEnabled = true;
			hasFocusableChildren = true;
			mouseFocusEnabled = true;
			tabFocusEnabled = true;
			tabIndex = -1
		}
	}
}