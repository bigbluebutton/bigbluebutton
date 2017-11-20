package org.bigbluebutton.modules.present.events {

    import flash.events.Event;

    public class NewPresentationPodCreated extends Event {
        public static const PRESENTATION_NEW_POD_CREATED:String = "NewPresentationPodCreated";

        public var podId:String;
        public var presenterId:String;

        public function NewPresentationPodCreated(podId:String, presenterId:String) {
            super(PRESENTATION_NEW_POD_CREATED, true, false);
            this.podId = podId;
            this.presenterId = presenterId;
        }
    }
}
