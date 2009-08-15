/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.asteriskjava.manager.event;

/**
 * A QueueParamsEvent is triggered in response to a QueueStatusAction and contains the parameters of
 * a queue.<p>
 * It is implemented in <code>apps/app_queue.c</code>
 *
 * @author srt
 * @version $Id: QueueParamsEvent.java 1292 2009-04-27 22:14:03Z srt $
 * @see org.asteriskjava.manager.action.QueueStatusAction
 */
public class QueueParamsEvent extends ResponseEvent
{
    /**
     * Serializable version identifier.
     */
    private static final long serialVersionUID = -170511596914604717L;
    private String queue;
    private Integer max;
    private String strategy;
    private Integer calls;
    private Integer holdTime;
    private Integer talkTime;
    private Integer completed;
    private Integer abandoned;
    private Integer serviceLevel;
    private Double serviceLevelPerf;
    private Integer weight;

    public QueueParamsEvent(Object source)
    {
        super(source);
    }

    /**
     * Returns the name of the queue.
     *
     * @return the name of the queue.
     */
    public String getQueue()
    {
        return queue;
    }

    /**
     * Sets the name of the queue.
     *
     * @param queue the name of the queue.
     */
    public void setQueue(String queue)
    {
        this.queue = queue;
    }

    /**
     * Returns the maximum number of people waiting in the queue or 0 for unlimited.<p>
     * This corresponds to the <code>maxlen</code> setting in <code>queues.conf</code>.
     *
     * @return the maximum number of people waiting in the queue or 0 for unlimited.
     */
    public Integer getMax()
    {
        return max;
    }

    /**
     * Sets the maximum number of people waiting in the queue.
     *
     * @param max the maximum number of people waiting in the queue or 0 for unlimited.
     */
    public void setMax(Integer max)
    {
        this.max = max;
    }

    /**
     * Returns the strategy used for this queue.<p>
     * Possible values are:<p>
     * <ul>
     * <li>ringall</li>
     * <li>roundrobin</li>
     * <li>leastrecent</li>
     * <li>fewestcalls</li>
     * <li>random</li>
     * <li>rrmemory</li>
     * </ul>
     * Available since Asterisk 1.6
     *
     * @return the strategy used for this queue.
     * @since 1.0.0
     */
    public String getStrategy()
    {
        return strategy;
    }

    /**
     * Sets the strategy used for this queue.
     *
     * @param strategy the strategy used for this queue.
     * @since 1.0.0
     */
    public void setStrategy(String strategy)
    {
        this.strategy = strategy;
    }

    /**
     * Returns the number of calls currently waiting in the queue.
     *
     * @return the number of calls currently waiting in the queue.
     */
    public Integer getCalls()
    {
        return calls;
    }

    /**
     * Sets the number of calls currently waiting in the queue.
     *
     * @param calls the number of calls currently waiting in the queue.
     */
    public void setCalls(Integer calls)
    {
        this.calls = calls;
    }

    /**
     * Returns the current average holdtime for this queue (in seconds).
     *
     * @return the current average holdtime for this queue (in seconds).
     */
    public Integer getHoldTime()
    {
        return holdTime;
    }

    /**
     * Sets the current average holdtime for this queue.
     *
     * @param holdTime the current average holdtime for this queue (in seconds).
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
     * Returns the number of completed calls.
     *
     * @return the number of completed calls.
     */
    public Integer getCompleted()
    {
        return completed;
    }

    /**
     * Sets the number of completed calls.
     *
     * @param complete the number of completed calls.
     */
    public void setCompleted(Integer complete)
    {
        this.completed = complete;
    }

    /**
     * Returns the number of abandoned calls.
     *
     * @return the number of abandoned calls.
     */
    public Integer getAbandoned()
    {
        return abandoned;
    }

    /**
     * Sets the number of abandoned calls.
     *
     * @param abandoned the number of abandoned calls.
     */
    public void setAbandoned(Integer abandoned)
    {
        this.abandoned = abandoned;
    }

    /**
     * Returns the service level (in seconds) as defined by the <code>servicelevel</code> setting
     * in <code>queues.conf</code>.
     *
     * @return the service level (in seconds).
     */
    public Integer getServiceLevel()
    {
        return serviceLevel;
    }

    /**
     * Sets the service level.
     *
     * @param serviceLevel the service level (in seconds).
     */
    public void setServiceLevel(Integer serviceLevel)
    {
        this.serviceLevel = serviceLevel;
    }

    /**
     * Returns the ratio of calls answered within the specified service level per total completed
     * calls (in percent).
     *
     * @return the ratio of calls answered within the specified service level per total completed
     *         calls (in percent).
     */
    public Double getServiceLevelPerf()
    {
        return serviceLevelPerf;
    }

    /**
     * Sets the ratio of calls answered within the specified service level per total completed
     * calls.
     *
     * @param serviceLevelPerf the ratio of calls answered within the specified service level per total completed
     *                         calls (in percent).
     */
    public void setServiceLevelPerf(Double serviceLevelPerf)
    {
        this.serviceLevelPerf = serviceLevelPerf;
    }

    /**
     * Returns the weight of this queue.<p>
     * A queue can be assigned a 'weight' to ensure calls waiting in a
     * higher priority queue will deliver its calls first. Only delays
     * the lower weight queue's call if the member is also in the
     * higher weight queue.<p>
     * Available since Asterisk 1.2
     *
     * @return the weight of this queue or <code>null</code> if not
     *         supported by your version of Asterisk
     * @since 0.2
     */
    public Integer getWeight()
    {
        return weight;
    }

    /**
     * Sets the weight of this queue.
     *
     * @param weight the weight of this queue
     * @since 0.2
     */
    public void setWeight(Integer weight)
    {
        this.weight = weight;
    }
}
