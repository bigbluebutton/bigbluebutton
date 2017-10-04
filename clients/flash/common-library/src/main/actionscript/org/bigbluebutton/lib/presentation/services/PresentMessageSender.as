package org.bigbluebutton.lib.presentation.services {
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	public class PresentMessageSender {
		public var userSession:IUserSession;
		
		public var conferenceParameters:IConferenceParameters;
		
		// The default callbacks of userSession.mainconnection.sendMessage
		private var defaultSuccessResponse:Function = function(result:String):void {
			trace(result);
		};
		
		private var defaultFailureResponse:Function = function(status:String):void {
			trace(status);
		};
		
		public function getPresentationInfo():void {
			trace("PresentMessageSender::getPresentationInfo() -- Sending [GetPresentationInfoReqMsg] message to server");
			var message:Object = {
				header: {name: "GetPresentationInfoReqMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {userId: conferenceParameters.internalUserID}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function setCurrentPage(presentationId: String, pageId: String):void {
			trace("PresentMessageSender::setCurrentPage() -- Sending [SetCurrentPagePubMsg] message to server with message [page:" + pageId + "]");
			var message:Object = {
				header: {name: "SetCurrentPagePubMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {presentationId: presentationId, pageId: pageId}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function move(presentationId: String, pageId: String, xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void {
			trace("PresentMessageSender::move() -- Sending [ResizeAndMovePagePubMsg] message to server with message " + "[xOffset:" + xOffset + ", yOffset:" + yOffset + ", widthRatio:" + widthRatio + ", heightRatio:" + heightRatio + "]");
			var message:Object = {
				header: {name: "ResizeAndMovePagePubMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {presentationId: presentationId, pageId: pageId, xOffset: xOffset, yOffset: yOffset, widthRatio: widthRatio, heightRatio: heightRatio}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function removePresentation(presentationId:String):void {
			trace("PresentMessageSender::removePresentation() -- Sending [RemovePresentationPubMsg] message to server with message [presentationId:" + presentationId + "]");
			var message:Object = {
				header: {name: "RemovePresentationPubMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {presentationId: presentationId}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function setCurrentPresentation(presentationId:String):void {
			trace("PresentMessageSender::setCurrentPresentation() -- Sending [SetCurrentPresentationPubMsg] message to server with message [presentationId:" + presentationId + "]");
			var message:Object = {
				header: {name: "SetCurrentPresentationPubMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {presentationId: presentationId}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
	}
}
