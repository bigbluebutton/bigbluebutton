package org.bigbluebutton.air.main.views.profile {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	
	public interface IProfileView extends IView {
		function get shareCameraButton():Button;
		function get shareCameraBtnLabel():String;
		function get shareMicButton():Button;
		function get shareMicBtnLabel():String;
		function get statusButton():Button;
		function get logoutButton():Button;
		function get currentState():String;
		function set currentState(value:String):void;
		function get clearAllStatusButton():Button;
		function get muteAllButton():Button;
		function get muteAllExceptPresenterButton():Button;
		function get lockViewersButton():Button;
		function get unmuteAllButton():Button;
	}
}
