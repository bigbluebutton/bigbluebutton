package org.bigbluebutton.main.api
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.main.model.User;
	import org.bigbluebutton.main.model.users.Conference;

	public class UserManager
	{
		private static var instance:UserManager = null;
		
		private var listeners:ArrayCollection;
		
		private var users:ArrayCollection;
		
		private var conference:Conference;
		
		public function UserManager(enforcer:SingletonEnforcer)
		{
			if (enforcer == null){
				throw new Error("There can only be 1 UserManager instance");
			}
			initialize();
		}
		
		private function initialize():void{
			listeners = new ArrayCollection();
			users = new ArrayCollection();
		}
		
		/**
		 * Return the single instance of the UserManager class, which is a singleton
		 */
		public static function getInstance():UserManager{
			if (instance == null){
				instance = new UserManager(new SingletonEnforcer());
			}
			return instance;
		}
		
		/**
		 * Register a class to listen to updates from the UserManager
		 */ 
		public function registerListener(listener:IUserListener):void{
			listeners.addItem(listener);
		}
		
		/**
		 * Returns an ArrayCollection of User objects, containing all users currently in the room.
		 */
		public function getUserList():ArrayCollection{
			return users;
		}
		
		/**
		 * Returns the current Presenter. Returns NULL if there is currently no presenter assigned in the room
		 */
		public function getPresenter():User{
			var j:int = 0;
			var u:User = null;
			for (var i:int = 0; i<users.length; i++){
				if ((users.getItemAt(i) as User).isPresenter) u = users.getItemAt(i) as User;
			}
			return u;
		}
		
		public function getConference():Conference{
			return this.conference;
		}
		
		internal function conferenceCreated(conference:Conference):void{
			this.conference = conference;
		}
		
		internal function participantJoined(participant:User):void{
			users.addItem(participant);
			for (var i:int = 0; i<listeners.length; i++){
				(listeners.getItemAt(i) as IUserListener).userJoined(participant);
			}
		}
		
		internal function participantLeft(participant:User):void{
			var j:int = -1;
			for (var i:int = 0; i<users.length; i++){
				if ((users.getItemAt(i) as User).userid == participant.userid) j = i;
			}
			if (j >= 0) users.removeItemAt(j);
			
			for (var k:int = 0; k<listeners.length; k++){
				(listeners.getItemAt(k) as IUserListener).userLeft(participant);
			}
		}
		
		internal function presenterChanged(userId:int):void{
			var user:User = null;
			
			for (var i:int = 0; i<users.length; i++){
				if ((users.getItemAt(i) as User).userid == userId.toString()) user = users.getItemAt(i) as User;
			}
			
			for (var k:int = 0; k<listeners.length; k++){
				(listeners.getItemAt(k) as IUserListener).presenterChanged(user);
			}
		}
	}
}

class SingletonEnforcer{}