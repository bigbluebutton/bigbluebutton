package org.bigbluebutton.modules.present.events {

    import flash.events.Event;

    public class PresentationPodRemoved extends Event {
        public static const PRESENTATION_POD_REMOVED:String = "PresentationPodRemoved";

        public var podId:String;
        public var ownerId:String;

        public function PresentationPodRemoved(_podId:String, _ownerId:String) {
            super(PRESENTATION_POD_REMOVED, true, false);
            this.podId = _podId;
            this.ownerId = _ownerId;
        }
    }
}
