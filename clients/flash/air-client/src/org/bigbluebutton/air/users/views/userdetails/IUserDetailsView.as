package org.bigbluebutton.air.users.views.userdetails {
	
	import spark.components.Button;
	
	import org.bigbluebutton.air.common.views.IView;
	import org.bigbluebutton.lib.user.models.User;
	
	public interface IUserDetailsView extends IView {
		function set user(u:User):void;
		function set userMe(u:User):void;
		function get user():User;
		function get userMe():User;
		function update():void;
		function get showCameraButton():Button;
		function get showPrivateChat():Button;
		function get clearStatusButton():Button;
		function get makePresenterButton():Button;
		function get promoteButton():Button;
		function get lockButton():Button;
		function get unlockButton():Button;
		function updateLockButtons(isRoomLocked:Boolean):void;
	}
}
