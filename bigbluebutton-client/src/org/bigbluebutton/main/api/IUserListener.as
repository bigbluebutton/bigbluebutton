package org.bigbluebutton.main.api
{
	import org.bigbluebutton.main.model.User;

	public interface IUserListener
	{
		/**
		 * Called when a new user has joined
		 */
		function userJoined(user:User):void;
		
		/**
		 * Called when a user has left
		 */
		function userLeft(user:User):void;
		
		/**
		 * Called when the presenter has changed
		 */
		function presenterChanged(newPresenter:User):void;
	}
}