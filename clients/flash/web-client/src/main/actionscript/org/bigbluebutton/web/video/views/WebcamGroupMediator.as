package org.bigbluebutton.web.video.views {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class WebcamGroupMediator extends Mediator {
		
		[Inject]
		public var view:WebcamGroup;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		[Inject]
		public var params:IConferenceParameters;
		
		private var videos:ArrayCollection;
		
		override public function initialize():void {
			userSession.userList.userChangeSignal.add(userChangeHandler);
			userSession.userList.allUsersAddedSignal.add(userAddedHandler);
			userSession.userList.userRemovedSignal.add(userRemovedHandler);
			
			videos = new ArrayCollection();
			
			setupAllWebcams();
		}
		
		private function setupAllWebcams():void {
			closeAllWebcams();
			
			// find existing webcams
			var users:ArrayCollection = userSession.userList.users;
			for each (var u:User in users) {
				// TEMP CODE UNTIL VIDEOSTEAMS CODE CAN BE FIXED
				if (u.streamName.length > 0) {
					var streamNames:Array = u.streamName.split("|");
					for each (var streamName:String in streamNames) {
						startStream(u, streamName);
					}
				}
				
				
				/*
				for each (var s:String in u.streamNames) {
					startStream(u, s);
				}
				*/
			}
		}
		
		private function closeAllWebcams():void {
			for each (var video:Object in videos) {
				stopStream(null, video.streamName);
			}
		}
		
		private function userAddedHandler(user:User):void {
			
			/*
			for each (var s:String in user.streamNames) {
				startStream(user, s);
			}
			*/
		}
		
		private function userRemovedHandler(userId:String):void {
			var videosByUserId:Array = findVideosByUserId(userId);
			
			for each (var video:Object in videosByUserId) {
				stopStream(null, video.streamName);
			}
		}
		
		private function userChangeHandler(user:User, type:int):void {
			if (type == UserList.HAS_STREAM) {
				var streamNames:Array = [];
				if (user.streamName.length > 0) {
					streamNames = user.streamName.split("|");
					for each (var streamName:String in streamNames) {
						startStream(user, streamName);
					}
				}
				removeUnusedStreams(user, streamNames);
		//		view.invalidateDisplayList();
			} else {
		//	updateUser(user);
			}
			
			/*
			if (type == UserList.START_STREAM) {
				startStream(user, streamName as String);
			} else if (type == UserList.STOP_STREAM) {
				stopStream(user, streamName as String);
			}
			*/
		}
		
		private function removeUnusedStreams(user:User, streamNames:Array):void {
			var openStreams:Array = findVideosByUserId(user.userId);
			for each (var openStream:WebcamView in openStreams) {
				var active:Boolean = false;
				for each (var activeStream:String in streamNames) {
					if (openStream.streamName == activeStream) {
						active = true;
						break;
					}
				}
				if (!active) stopStream(user, openStream.streamName);
			}
		}
		
		private function startStream(user:User, streamName:String):void {
			if (findVideoByStreamName(streamName) == null) {
				var newWebcam:WebcamView = new WebcamView();
				newWebcam.closeSignal.add(handleWebcamCloseRequested);
				newWebcam.videoProfile = userSession.videoProfileManager.defaultVideoProfile;// videoProfileManager.getVideoProfileByStreamName(streamName);
				newWebcam.startStream(userSession.videoConnection.connection, user.name, streamName, user.userId);
				
				videos.addItem(newWebcam);
				view.addVideo(newWebcam);
				//user.addViewingStream(streamName);
			}
		}
		
		private function stopStream(user:User, streamName:String):void {
			var video:WebcamView = findVideoByStreamName(streamName);
			if (video != null) {
				videos.removeItem(video);
				view.removeVideo(video);
				video.close();
				
				if (user != null) {
					//user.removeViewingStream(streamName);
				}
			}
		}
		
		private function handleWebcamCloseRequested(userId:String, streamName:String):void {
			var user:User = userSession.userList.getUserByUserId(userId);
			if (user) {
				stopStream(user, streamName);
			}
		}
		
		private function findVideoByStreamName(streamName:String):WebcamView {
			for each (var video:Object in videos) {
				if ((video as WebcamView).streamName == streamName) {
					return video as WebcamView;
				}
			}
			return null;
		}
		
		private function findVideosByUserId(userId:String):Array {
			var returnedArray:Array = new Array();
			
			for each (var video:Object in videos) {
				if ((video as WebcamView).userID == userId) {
					returnedArray.push(video);
				}
			}
			return returnedArray;
		}
		
		
		override public function destroy():void {
			userSession.userList.userAddedSignal.remove(userAddedHandler);
			userSession.userList.userRemovedSignal.remove(userRemovedHandler);
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			
			closeAllWebcams();
			
			super.destroy();
			view = null;
		}
	}
}
