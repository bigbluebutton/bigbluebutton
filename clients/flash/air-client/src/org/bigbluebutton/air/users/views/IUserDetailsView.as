package org.bigbluebutton.air.users.views {
	
	import org.bigbluebutton.air.common.views.IView;
	import org.bigbluebutton.lib.user.models.User;
	
	import spark.components.Button;
	
	public interface IUserDetailsView extends IView {
		function set user(u:User):void
		function get user():User
		function update():void
		function get showCameraButton():Button
		function get showPrivateChat():Button
	}
}
