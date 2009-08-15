package org.asteriskjava.manager.action;

import org.asteriskjava.manager.event.QueueSummaryCompleteEvent;
import org.asteriskjava.manager.event.QueueSummaryEvent;
import org.asteriskjava.manager.event.ResponseEvent;

/**
 * The QueueSummaryAction retrieves the summary for one or all queues.
 * <p>
 * Available in Asterisk post-1.4.
 * <p>
 * This action has been added by
 * {@linkplain http://bugs.digium.com/view.php?id=8035}.
 * 
 * @see QueueSummaryEvent
 * @see QueueSummaryCompleteEvent
 * @author srt
 * @version $Id: QueueSummaryAction.java 1121 2008-08-16 20:54:12Z srt $
 * @since 0.3
 */
public class QueueSummaryAction extends AbstractManagerAction implements EventGeneratingAction
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = -1635765034452468357L;
    private String queue;

    /**
     * Creates a new QueueSummaryAction that retrieves the summary for all
     * queues.
     */
    public QueueSummaryAction()
    {

    }

    /**
     * Creates a new QueueSummaryAction that retrieves the summary for the given
     * queue.
     * 
     * @param queue name of the queue to retrieve the summary for.
     */
    public QueueSummaryAction(String queue)
    {
        this.queue = queue;
    }

    @Override
    public String getAction()
    {
        return "QueueSummary";
    }

    public Class<? extends ResponseEvent> getActionCompleteEventClass()
    {
        return QueueSummaryCompleteEvent.class;
    }

    /**
     * Returns the name of the queue to retrieve the summary for.
     * 
     * @return the name of the queue to retrieve the summary for or
     *         <code>null</code> to retrieve the summary for all queues.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue to retrieve the summary for.
     * 
     * @param queue the name of the queue to retrieve the summary for or
     *            <code>null</code> to retrieve the summary for all queues.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }
}
