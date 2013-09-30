/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.whiteboard.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.modules.present.events.PresentationEvent;
  import org.bigbluebutton.modules.whiteboard.events.PageEvent;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;
  import org.bigbluebutton.modules.whiteboard.events.WhiteboardPresenterEvent;
  import org.bigbluebutton.modules.whiteboard.models.WhiteboardModel;

  public class WhiteboardService
  {
    public var sender:MessageSender;
    public var receiver:MessageReceiver;
    public var whiteboardModel:WhiteboardModel;

    public function getAnnotationHistory():void
    {
      var cp:Object = whiteboardModel.getCurrentPresentationAndPage();
      if (cp != null) {
        sender.requestAnnotationHistory(cp.presentationID, cp.currentPageNumber);
      }
    }
    
    public function modifyEnabled(e:WhiteboardPresenterEvent):void {
      sender.modifyEnabled(e);
    }

    public function changePage(pageNum:Number):void {
      pageNum += 1;
      if (isPresenter) {
        LogUtil.debug("PRESENTER Switch to page [" + pageNum + "]");
        sender.changePage(pageNum);	
      } else {
        LogUtil.debug("Switch to page [" + pageNum + "]"); 
        whiteboardModel.changePage(pageNum, 0);
      }
    }

    public function toggleGrid():void {
      sender.toggleGrid();
    }

    public function undoGraphic():void {
      sender.undoGraphic()
    }

    public function clearBoard():void {
      sender.clearBoard();
    }

    public function sendText(e:WhiteboardDrawEvent):void {
      sender.sendText(e);
    }

    public function sendShape(e:WhiteboardDrawEvent):void {
      sender.sendShape(e);
    }

    public function checkIsWhiteboardOn():void {
      sender.checkIsWhiteboardOn();
    }

    public function setActivePresentation(e:PresentationEvent):void {
      if (isPresenter) {
 //               LogUtil.debug("PRESENTER Switch to presentation [" + e.presentationName + "," + e.numberOfPages + "]");
        sender.setActivePresentation(e);
      } else {
 //               LogUtil.debug("Switch to presentation [" + e.presentationName + "," + e.numberOfPages + "]");
        whiteboardModel.changePresentation(e.presentationName, e.numberOfPages);
      }
    }

        /** Helper method to test whether this user is the presenter */
        private function get isPresenter():Boolean {
            return UserManager.getInstance().getConference().amIPresenter;
        }
	}
}