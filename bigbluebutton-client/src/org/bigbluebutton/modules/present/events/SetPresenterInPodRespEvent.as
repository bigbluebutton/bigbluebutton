package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;

  public class SetPresenterInPodRespEvent extends Event {
    public static const SET_PRESENTER_IN_POD_RESP:String = "SET_PRESENTER_IN_POD_RESP";

    public var podId: String;
    public var nextPresenterId: String;

    public function SetPresenterInPodRespEvent(podId: String, nextPresenterId: String) {
      super(SET_PRESENTER_IN_POD_RESP, true, false);
      this.podId = podId;
      this.nextPresenterId = nextPresenterId;
    }
  }
}
