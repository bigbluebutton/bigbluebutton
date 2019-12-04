package org.bigbluebutton.modules.present.events {

    import flash.events.Event;

    public class PresentationPodRemoved extends Event {
        public static const PRESENTATION_POD_REMOVED:String = "PresentationPodRemoved";

        public var podId:String;

        public function PresentationPodRemoved(podId:String) {
            super(PRESENTATION_POD_REMOVED, true, false);
            this.podId = podId;
        }
    }
}
