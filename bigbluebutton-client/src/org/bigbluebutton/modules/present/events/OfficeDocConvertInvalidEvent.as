package org.bigbluebutton.modules.present.events {
    import flash.events.Event;

    public class OfficeDocConvertInvalidEvent extends Event {
        public static const OFFICE_DOC_CONVERT_INVALID:String = "presentation office doc convert aborted event";

        public function OfficeDocConvertInvalidEvent() {
            super(OFFICE_DOC_CONVERT_INVALID, true, false);
        }
    }
}
