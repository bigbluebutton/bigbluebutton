package org.bigbluebutton.air.main.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	
	public interface IProfileView extends IView {
		function get userNameButton():Button;
		function get shareCameraButton():Button;
		function get shareCameraBtnLabel():String;
		function get shareMicButton():Button;
		function get shareMicBtnLabel():String;
		function get raiseHandBtnLabel():String;
		function get raiseHandButton():Button;
		function get logoutButton():Button;
	}
}
