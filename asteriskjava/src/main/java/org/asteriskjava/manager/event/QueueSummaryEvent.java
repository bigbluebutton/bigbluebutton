package org.asteriskjava.manager.event;

import org.asteriskjava.manager.action.QueueSummaryAction;

/**
 * A QueueSummaryEvent is triggered in response to a QueueSummaryAction and
 * contains a summary of the current state of a queue.
 * <p/>
 * Available in Asterisk post-1.4.
 * <p/>
 * It is implemented in <code>apps/app_queue.c</code>
 *
 * @author srt
 * @version $Id: QueueSummaryEvent.java 1290 2009-04-10 23:23:24Z srt $
 * @see QueueSummaryCompleteEvent
 * @see QueueSummaryAction
 * @since 0.3
 */
public class QueueSummaryEvent extends ResponseEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 2596498558463681457L;
    private String queue;
    private Integer loggedIn;
    private Integer available;
    private Integer callers;
    private Integer holdTime;
    private Integer talkTime;
    private Integer longestHoldTime;

    public QueueSummaryEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of queue.
     *
     * @return the name of queue.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of queue.
     *
     * @param queue the name of queue.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the number of members logged in.
     *
     * @return the number of members logged in.
     */
    public Integer getLoggedIn()
    {
        return loggedIn;
    }

    /**
     * Sets the number of members logged in.
     *
     * @param loggedIn the number of members logged in.
     */
    public void setLoggedIn(Integer loggedIn)
    {
        this.loggedIn = loggedIn;
    }

    /**
     * Returns the number of members logged in and not in a call.
     * <p/>
     * This is the number of queue members currently available for calls.
     *
     * @return the number of members logged in and not in a call.
     */
    public Integer getAvailable()
    {
        return available;
    }

    /**
     * Sets the number of members logged in and not in a call.
     *
     * @param available the number of members logged in and not in a call.
     */
    public void setAvailable(Integer available)
    {
        this.available = available;
    }

    /**
     * Returns the number of callers currently waiting in the queue.
     *
     * @return the number of callers currently waiting in the queue.
     */
    public Integer getCallers()
    {
        return callers;
    }

    /**
     * Sets the number of callers currently waiting in the queue.
     *
     * @param callers the number of callers currently waiting in the queue.
     */
    public void setCallers(Integer callers)
    {
        this.callers = callers;
    }

    /**
     * Returns the current avarage hold time for this queue based on an exponential average.
     *
     * @return the current avarage hold time for this queue.
     */
    public Integer getHoldTime()
    {
        return holdTime;
    }

    /**
     * Sets the current avarage hold time for this queue based on an exponential average.
     *
     * @param holdTime the current avarage hold time for this queue.
     */
    public void setHoldTime(Integer holdTime)
    {
        this.holdTime = holdTime;
    }

    /**
     * Returns the current avarage talk time for this queue based on an exponential average.
     *
     * @return the current avarage talk time for this queue.
     * @since 1.0.0
     */
    public Integer getTalkTime()
    {
        return talkTime;
    }

    /**
     * Sets the current avarage talk time for this queue based on an exponential average.
     *
     * @param talkTime the current avarage talk time for this queue.
     * @since 1.0.0
     */
    public void setTalkTime(Integer talkTime)
    {
        this.talkTime = talkTime;
    }

    /**
     * Returns the longest hold time of the a queue entry currently in the queue.
     *
     * @return the longest hold time of the a queue entry currently in the queue.
     * @since 1.0.0
     */
    public Integer getLongestHoldTime()
    {
        return longestHoldTime;
    }

    /**
     * Sets the longest hold time of the a queue entry currently in the queue.
     *
     * @param longestHoldTime the longest hold time of the a queue entry currently in the queue.
     * @since 1.0.0
     */
    public void setLongestHoldTime(Integer longestHoldTime)
    {
        this.longestHoldTime = longestHoldTime;
    }
}
