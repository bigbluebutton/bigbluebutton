package org.bigbluebutton.lib.presentation.services {
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	public class PresentMessageSender {
		public var userSession:IUserSession;
		
		// The default callbacks of userSession.mainconnection.sendMessage
		private var defaultSuccessResponse:Function = function(result:String):void {
			trace(result);
		};
		
		private var defaultFailureResponse:Function = function(status:String):void {
			trace(status);
		};
		
		private var presenterViewedRegionX:Number = 0;
		
		private var presenterViewedRegionY:Number = 0;
		
		private var presenterViewedRegionW:Number = 100;
		
		private var presenterViewedRegionH:Number = 100;
		
		public function getPresentationInfo():void {
			trace("PresentMessageSender::getPresentationInfo() -- Sending [presentation.getPresentationInfo] message to server");
			userSession.mainConnection.sendMessage("presentation.getPresentationInfo", defaultSuccessResponse, defaultFailureResponse);
		}
		
		public function gotoSlide(id:String):void {
			trace("PresentMessageSender::gotoSlide() -- Sending [presentation.gotoSlide] message to server with message [page:" + String + "]");
			var message:Object = new Object();
			message["page"] = id;
			userSession.mainConnection.sendMessage("presentation.gotoSlide", defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		/***
		 * A hack for the viewer to sync with the presenter. Have the viewer query the presenter for it's x,y,width and height info.
		 */
		public function move(xOffset:Number, yOffset:Number, widthRatio:Number, heightRatio:Number):void {
			trace("PresentMessageSender::move() -- Sending [presentation.resizeAndMoveSlide] message to server with message " + "[xOffset:" + xOffset + ", yOffset:" + yOffset + ", widthRatio:" + widthRatio + ", heightRatio:" + heightRatio + "]");
			var message:Object = new Object();
			message["xOffset"] = xOffset;
			message["yOffset"] = yOffset;
			message["widthRatio"] = widthRatio;
			message["heightRatio"] = heightRatio;
			userSession.mainConnection.sendMessage("presentation.resizeAndMoveSlide", defaultSuccessResponse, defaultFailureResponse, message);
			presenterViewedRegionX = xOffset;
			presenterViewedRegionY = yOffset;
			presenterViewedRegionW = widthRatio;
			presenterViewedRegionH = heightRatio;
		}
		
		public function removePresentation(name:String):void {
			trace("PresentMessageSender::removePresentation() -- Sending [presentation.removePresentation] message to server with message [presentationID:" + name + "]");
			trace("  |- name : " + name);
			var message:Object = new Object();
			message["presentationID"] = name;
			userSession.mainConnection.sendMessage("presentation.removePresentation", defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function sendCursorUpdate(xPercent:Number, yPercent:Number):void {
			trace("PresentMessageSender::sendCursorUpdate() -- Sending [presentation.sendCursorUpdate] message to server with message [xPercent:" + xPercent + ", yPercent:" + yPercent);
			var message:Object = new Object();
			message["xPercent"] = xPercent;
			message["yPercent"] = yPercent;
			userSession.mainConnection.sendMessage("presentation.sendCursorUpdate", defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function sharePresentation(share:Boolean, presentationID:String):void {
			trace("PresentMessageSender::sharePresentation() -- Sending [presentation.sharePresentation] message to server with message [presentationID:" + presentationID + ", share:" + share);
			var message:Object = new Object();
			message["presentationID"] = presentationID;
			message["share"] = share;
			userSession.mainConnection.sendMessage("presentation.sharePresentation", defaultSuccessResponse, defaultFailureResponse, message);
		}
	}
}
