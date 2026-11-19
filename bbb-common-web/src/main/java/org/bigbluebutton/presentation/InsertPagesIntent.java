package org.bigbluebutton.presentation;

/**
 * What makes an upload an insert of pages into an existing presentation (the target): the target, the
 * position the client asked for with the totalPages it read with it, whether the client asks to be taken
 * to the first inserted page, and the current page of the target when bbb-apps-akka accepted the request.
 * bbb-web only carries it: the order of the pages and the position are decided by bbb-apps-akka.
 */
public record InsertPagesIntent(String targetId, int position, int seenTotalPages, boolean navigate,
                                String requestPageId) {

    /** No intent: the upload is not an insert. */
    public static final InsertPagesIntent NONE = new InsertPagesIntent("", 0, 0, false, "");

    public boolean isInsert() {
        return targetId != null && !targetId.isEmpty();
    }
}
