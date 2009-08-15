package org.asteriskjava.live;

/**
 * You can register an AsteriskQueueListener with an
 * {@link org.asteriskjava.live.AsteriskQueue} to be notified about new calls in
 * and out of the queue, member state changes and exceeding service levels.
 *
 * @author gmi
 * @since 0.3
 */
public interface AsteriskQueueListener
{
    /**
     * Called whenever an entry appears in the queue.
     *
     * @param entry the new entry.
     */
    void onNewEntry(AsteriskQueueEntry entry);

    /**
     * Called whenever an entry leaves the queue.
     *
     * @param entry the entry that leaves the queue.
     */
    void onEntryLeave(AsteriskQueueEntry entry);

    /**
     * Called whenever a member changes his state.
     *
     * @param member the member that changes his state.
     * @since 0.3.1
     */
    void onMemberStateChange(AsteriskQueueMember member);

    /**
     * @param entry
     */
    void onEntryServiceLevelExceeded(AsteriskQueueEntry entry);
    
    /**
     * Called whenever a new member is added to the queue.
     *
     * @param member the new member.
     */
    void onMemberAdded(AsteriskQueueMember member);

    /**
     * Called whenever a member is removed from this queue.
     *
     * @param member the member that has been removed from the queue.
     */
    void onMemberRemoved(AsteriskQueueMember member);
}
