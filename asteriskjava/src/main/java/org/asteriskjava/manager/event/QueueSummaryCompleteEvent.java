package org.asteriskjava.manager.event;

import org.asteriskjava.manager.action.QueueSummaryAction;

/**
 * A QueueSummaryCompleteEvent is triggered after the summary for all requested
 * queues has been reported in response to a QueueSummaryAction.
 * 
 * @see QueueSummaryAction
 * @see QueueSummaryEvent
 * @author srt
 * @version $Id: QueueSummaryCompleteEvent.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.3
 */
public class QueueSummaryCompleteEvent extends ResponseEvent
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = -5044247858568827143L;

    public QueueSummaryCompleteEvent(Object source)
    {
        super(source);
    }
}
