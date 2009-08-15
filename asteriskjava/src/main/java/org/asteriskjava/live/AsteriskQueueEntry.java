package org.asteriskjava.live;

import java.util.Date;

/**
 * Represents a member of a queue.<p>
 * PropertyChangeEvents are fired for the following properties:
 * <ul>
 * <li>state
 * <li>position
 * <li>reportedPosition
 * </ul>
 *
 * @author gmi
 */
public interface AsteriskQueueEntry extends LiveObject
{
    String PROPERTY_STATE = "state";
    String PROPERTY_POSITION = "position";
    String PROPERTY_REPORTED_POSITION = "reportedPosition";

    int POSITION_UNDETERMINED = -1;

    /**
     * Returns the date this member joined the Queue.<p>
     * This property is immutable.
     *
     * @return the date this member joined the Queue
     */
    Date getDateJoined();

    /**
     * Returns the date this member left the queue room.<p>
     * This property is <code>null</code> as long as the user is
     * in state {@link QueueEntryState#JOINED} and set to date the
     * member left when entering {@link QueueEntryState#LEFT}.
     *
     * @return the date this member left the Queue or
     *         <code>null</code> if the user did not yet leave.
     */
    Date getDateLeft();

    /**
     * Returns the lifecycle status of this AsteriskQueueEntry.<p>
     * Initially the user is in state {@link org.asteriskjava.live.QueueEntryState#JOINED}.
     *
     * @return the lifecycle status of this AsteriskQueueEntry.
     */
    QueueEntryState getState();

    /**
     * Returns the Queue this member joined.<p>
     * This property is immutable.
     *
     * @return the Queue this entry joined.
     */
    AsteriskQueue getQueue();

    /**
     * Returns the channel associated with this entry.<p>
     * This property is immutable.
     *
     * @return the channel associated with this entry.
     */
    AsteriskChannel getChannel();

    /**
     * Returns the name of the channel associated with this entry.<p>
     * Comodity bridge, don't duplicate channel name as it can be renamed.
     *
     * @return the name of the channel associated with this entry.
     */
    String getChannelName();

    /**
     * Returns the position of this queue entry in the queue.<p>
     *
     * @return the name of the channel associated with this entry.
     */
    int getPosition();
}
