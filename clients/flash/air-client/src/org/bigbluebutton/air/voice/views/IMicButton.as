package org.bigbluebutton.air.voice.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	public interface IMicButton extends IView {
		function setVisibility(val:Boolean):void;
		function get muted():Boolean;
		function set muted(value:Boolean):void;
	}
}
