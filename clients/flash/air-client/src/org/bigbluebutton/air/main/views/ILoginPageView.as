package org.bigbluebutton.air.main.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Label;
	
	public interface ILoginPageView extends IView {
		function get currentState():String
		function set currentState(value:String):void
		function get messageText():Label
	}
}
