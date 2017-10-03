package org.bigbluebutton.modules.present.events {

    import flash.events.Event;

    public class NewPresentationPodCreated extends Event {
        public static const PRESENTATION_NEW_POD_CREATED:String = "NewPresentationPodCreated";

        public var podId:String;
        public var ownerId:String;

        public function NewPresentationPodCreated(_podId:String, _ownerId:String) {
            super(PRESENTATION_NEW_POD_CREATED, true, false);
            this.podId = _podId;
            this.ownerId = _ownerId;
        }
    }
}
