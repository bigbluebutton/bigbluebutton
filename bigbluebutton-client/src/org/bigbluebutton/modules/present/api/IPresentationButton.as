package org.bigbluebutton.modules.present.api
{
	import org.bigbluebutton.modules.present.views.PresentationWindow;
	
	public interface IPresentationButton
	{
		function buttonAdded(buttonParent:PresentationWindow):void;
		function setButtonVisibility(visible:Boolean):void;
		function setComponentEnabled(enabled:Boolean):void;
		function presenterChanged(isPresenter:Boolean, presenterName:String):void;
	}
}