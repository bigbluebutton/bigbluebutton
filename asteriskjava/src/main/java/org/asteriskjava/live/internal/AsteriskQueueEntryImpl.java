package org.asteriskjava.live.internal;

import java.util.Date;

import org.asteriskjava.live.AsteriskQueueEntry;
import org.asteriskjava.live.QueueEntryState;

/**
 * Default implementation of the AsteriskQueueEntry interface.
 *
 * @author gmi
 */
class AsteriskQueueEntryImpl extends AbstractLiveObject implements AsteriskQueueEntry
{
    private final AsteriskQueueImpl queue;
    private final AsteriskChannelImpl channel;
    private final Date dateJoined;

    private Date dateLeft;
    private QueueEntryState state;

    // the position as given by asterisk in the queue entry or join event.
    // we cannot work reliably with it because asterisk doesn't tell us when it shifts the entries.
    private int reportedPosition;

    // The position of this entry in our representation of the queue. Will be set
    // and maintained by the respective queue when the entry is added/removed/shifted
    private int position = POSITION_UNDETERMINED;

    AsteriskQueueEntryImpl(AsteriskServerImpl server, AsteriskQueueImpl queue,
                           AsteriskChannelImpl channel, int reportedPosition, Date dateJoined)
    {
        super(server);
        this.queue = queue;
        this.channel = channel;
        this.dateJoined = dateJoined;
        this.state = QueueEntryState.JOINED;
        this.reportedPosition = reportedPosition;
    }

    public String getChannelName()
    {
        return channel.getName();
    }

    public AsteriskQueueImpl getQueue()
    {
        return queue;
    }

    public AsteriskChannelImpl getChannel()
    {
        return channel;
    }

    public Date getDateJoined()
    {
        return dateJoined;
    }

    public Date getDateLeft()
    {
        return dateLeft;
    }

    /**
     * Sets the status to {@link QueueEntryState#LEFT} and dateLeft to the given date.
     *
     * @param dateLeft the date this member left the queue.
     */
    void left(Date dateLeft)
    {
        QueueEntryState oldState;
        synchronized (this)
        {
            oldState = this.state;
            this.dateLeft = dateLeft;
            this.state = QueueEntryState.LEFT;
        }
        firePropertyChange(PROPERTY_STATE, oldState, state);
    }

    public QueueEntryState getState()
    {
        return state;
    }

    /**
     * Gets the position as reported by Asterisk when the entry was created.
     * Currently we don't update this property as the entry shifts through the queue,
     * see getPosition() instead.
     *
     * @return the position of the entry in the respective queue, starting at 1
     */
    public int getReportedPosition()
    {
        return reportedPosition;
    }

    /**
     * Gets the position in the queue based on the queue's internal list
     * <p/>
     * As Asterisk doesn't send events when it shifts entries in the queue
     * we'll base our positions on our internal queue entries ordered list.
     * It should be coherent as entries are always added at the end of the queue
     * and we don't mind if it is different from asterisk's view as long as the
     * relative order stays the same. Most of the time the position will be the same
     * but right after asterisk removes an entry it could differ as the shift occurs
     * asynchronously in asterisk queues. As a consequence we might have temporary holes
     * in the asterisk numbering.
     *
     * @return the position of the entry in the respective queue, starting at 1
     */
    public int getPosition()
    {
        return position;
    }

    void setPosition(int position)
    {
        int oldPosition = this.position;
        this.position = position;
        firePropertyChange(PROPERTY_POSITION, oldPosition, position);
    }

    void setReportedPosition(int reportedPosition)
    {
        int oldPosition = this.reportedPosition;
        this.reportedPosition = reportedPosition;
        firePropertyChange(PROPERTY_REPORTED_POSITION, oldPosition, reportedPosition);
    }

    @Override
    public String toString()
    {
        StringBuffer sb;
        int systemHashcode;

        sb = new StringBuffer("AsteriskQueueEntry[");

        synchronized (this)
        {
            sb.append("dateJoined=").append(getDateJoined()).append(",");
            sb.append("postition=").append(getPosition()).append(",");
            sb.append("dateLeft=").append(getDateLeft()).append(",");
            systemHashcode = System.identityHashCode(this);
        }
        if (channel != null)
        {
            sb.append("channel=AsteriskChannel[");
            synchronized (channel)
            {
                sb.append("id='").append(channel.getId()).append("',");
                sb.append("name='").append(channel.getName()).append("'],");
            }
        }
        else
        {
            sb.append("channel=null,");
        }
        sb.append("systemHashcode=").append(systemHashcode);
        sb.append("]");

        return sb.toString();
    }
}
