package org.bigbluebutton.air.presentation.views {
	
	import org.bigbluebutton.air.common.views.IView;
	import org.bigbluebutton.lib.presentation.models.Slide;
	
	public interface IPresentationView extends IView {
		function setSlide(s:Slide):void;
		function setPresentationName(name:String):void;
	}
}
