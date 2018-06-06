package org.bigbluebutton.modules.present.commands
{
    import flash.events.Event;

    public class GoToPageLocalCommand extends Event {
        public static const GO_TO_PAGE_LOCAL:String = "presentation go to page command within pod";

        public var pageId:String;

        public function GoToPageLocalCommand(page:String)
        {
            super(GO_TO_PAGE_LOCAL, true, false);
            pageId = page;
        }
    }
}
