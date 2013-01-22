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