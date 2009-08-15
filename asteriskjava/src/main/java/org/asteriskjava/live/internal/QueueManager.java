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
package org.asteriskjava.live.internal;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.asteriskjava.live.AsteriskQueue;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.QueueMemberState;
import org.asteriskjava.manager.EventTimeoutException;
import org.asteriskjava.manager.ResponseEvents;
import org.asteriskjava.manager.action.QueueStatusAction;
import org.asteriskjava.manager.event.*;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

/**
 * Manages queue events on behalf of an AsteriskServer.
 *
 * @author srt
 * @version $Id: QueueManager.java 1157 2008-08-27 11:56:48Z srt $
 */
class QueueManager
{
    private final Log logger = LogFactory.getLog(this.getClass());

    private final AsteriskServerImpl server;
    private final ChannelManager channelManager;

    /**
     * A map of ACD queues by there name.
     */
    private final Map<String, AsteriskQueueImpl> queues;

    QueueManager(AsteriskServerImpl server, ChannelManager channelManager)
    {
        this.server = server;
        this.channelManager = channelManager;
        this.queues = new HashMap<String, AsteriskQueueImpl>();
    }

    void initialize() throws ManagerCommunicationException
    {
        ResponseEvents re;

        try
        {
            re = server.sendEventGeneratingAction(new QueueStatusAction());
        }
        catch (ManagerCommunicationException e)
        {
            final Throwable cause = e.getCause();

            if (cause instanceof EventTimeoutException)
            {
                // this happens with Asterisk 1.0.x as it doesn't send a
                // QueueStatusCompleteEvent
                re = ((EventTimeoutException) cause).getPartialResult();
            }
            else
            {
                throw e;
            }
        }

        for (ManagerEvent event : re.getEvents())
        {
            if (event instanceof QueueParamsEvent)
            {
                handleQueueParamsEvent((QueueParamsEvent) event);
            }
            else if (event instanceof QueueMemberEvent)
            {
                handleQueueMemberEvent((QueueMemberEvent) event);
            }
            else if (event instanceof QueueEntryEvent)
            {
                handleQueueEntryEvent((QueueEntryEvent) event);
            }
        }
    }

    void disconnected()
    {
        synchronized (queues)
        {
            for(AsteriskQueueImpl queue : queues.values())
            {
                queue.cancelServiceLevelTimer();
            }
            queues.clear();
        }
    }

    /**
     * Gets (a copy of) the list of the queues.
     *
     * @return a copy of the list of the queues.
     */
    Collection<AsteriskQueue> getQueues()
    {
        Collection<AsteriskQueue> copy;

        synchronized (queues)
        {
            copy = new ArrayList<AsteriskQueue>(queues.values());
        }
        return copy;
    }

    /**
     * Adds a queue to the internal map, keyed by name.
     *
     * @param queue the AsteriskQueueImpl to be added
     */
    private void addQueue(AsteriskQueueImpl queue)
    {
        synchronized (queues)
        {
            queues.put(queue.getName(), queue);
        }
    }

    /**
     * Called during initialization to populate the list of queues.
     *
     * @param event the event received
     */
    private void handleQueueParamsEvent(QueueParamsEvent event)
    {
        AsteriskQueueImpl queue;
        final String name;
        final Integer max;
        final String strategy;
        final Integer serviceLevel;
        final Integer weight;

        name = event.getQueue();
        max = event.getMax();
        strategy = event.getStrategy();
        serviceLevel = event.getServiceLevel();
        weight = event.getWeight();

        queue = queues.get(name);

        if (queue == null)
        {
            queue = new AsteriskQueueImpl(server, name, max, strategy, serviceLevel, weight);
            logger.info("Adding new queue " + queue);
            addQueue(queue);
        }
        else
        {
            // We should never reach that code as this method is only called for initialization
            // So the queue should never be in the queues list
            synchronized (queue)
            {
                queue.setMax(max);
                queue.setServiceLevel(serviceLevel);
                queue.setWeight(weight);
            }
        }
    }

    /**
     * Called during initialization to populate the members of the queues.
     *
     * @param event the QueueMemberEvent received
     */
    private void handleQueueMemberEvent(QueueMemberEvent event)
    {
        final AsteriskQueueImpl queue = queues.get(event.getQueue());
        if (queue == null)
        {
            logger.error("Ignored QueueEntryEvent for unknown queue " + event.getQueue());
            return;
        }

        AsteriskQueueMemberImpl member = queue.getMember(event.getLocation());
        if (member == null)
        {
            member = new AsteriskQueueMemberImpl(server, queue, event.getLocation(),
                    QueueMemberState.valueOf(event.getStatus()), event.getPaused(), 
                    event.getPenalty(), event.getMembership());
        }
        queue.addMember(member);
    }

    /**
     * Called during initialization to populate entries of the queues.
     * Currently does the same as handleJoinEvent()
     *
     * @param event - the QueueEntryEvent received
     */
    private void handleQueueEntryEvent(QueueEntryEvent event)
    {
        final AsteriskQueueImpl queue = getQueueByName(event.getQueue());
        final AsteriskChannelImpl channel = channelManager
                .getChannelImplByName(event.getChannel());

        if (queue == null)
        {
            logger.error("Ignored QueueEntryEvent for unknown queue " + event.getQueue());
            return;
        }
        if (channel == null)
        {
            logger.error("Ignored QueueEntryEvent for unknown channel " + event.getChannel());
            return;
        }

        if (queue.getEntry(event.getChannel()) != null)
        {
            logger.error("Ignored duplicate queue entry during population in queue "
                    + event.getQueue() + " for channel " + event.getChannel());
            return;
        }

        // Asterisk gives us an initial position but doesn't tell us when he shifts the others
        // We won't use this data for ordering until there is a appropriate event in AMI.
        // (and refreshing the whole queue is too intensive and suffers incoherencies
        // due to asynchronous shift that leaves holes if requested too fast)
        int reportedPosition = event.getPosition();

        queue.createNewEntry(channel, reportedPosition, event.getDateReceived());
    }

    /**
     * Called from AsteriskServerImpl whenever a new entry appears in a queue.
     *
     * @param event the JoinEvent received
     */
    void handleJoinEvent(JoinEvent event)
    {
        final AsteriskQueueImpl queue = getQueueByName(event.getQueue());
        final AsteriskChannelImpl channel = channelManager.getChannelImplByName(event.getChannel());

        if (queue == null)
        {
            logger.error("Ignored JoinEvent for unknown queue " + event.getQueue());
            return;
        }
        if (channel == null)
        {
            logger.error("Ignored JoinEvent for unknown channel " + event.getChannel());
            return;
        }

        if (queue.getEntry(event.getChannel()) != null)
        {
            logger.error("Ignored duplicate queue entry in queue "
                    + event.getQueue() + " for channel " + event.getChannel());
            return;
        }

        // Asterisk gives us an initial position but doesn't tell us when he shifts the others
        // We won't use this data for ordering until there is a appropriate event in AMI.
        // (and refreshing the whole queue is too intensive and suffers incoherencies
        // due to asynchronous shift that leaves holes if requested too fast)
        int reportedPosition = event.getPosition();

        queue.createNewEntry(channel, reportedPosition, event.getDateReceived());
    }

    /**
     * Called from AsteriskServerImpl whenever an enty leaves a queue.
     *
     * @param event - the LeaveEvent received
     */
    void handleLeaveEvent(LeaveEvent event)
    {
        final AsteriskQueueImpl queue = getQueueByName(event.getQueue());
        final AsteriskChannelImpl channel = channelManager.getChannelImplByName(event.getChannel());

        if (queue == null)
        {
            logger.error("Ignored LeaveEvent for unknown queue " + event.getQueue());
            return;
        }
        if (channel == null)
        {
            logger.error("Ignored LeaveEvent for unknown channel " + event.getChannel());
            return;
        }

        final AsteriskQueueEntryImpl existingQueueEntry = queue.getEntry(event.getChannel());
        if (existingQueueEntry == null)
        {
            logger.error("Ignored leave event for non existing queue entry in queue "
                    + event.getQueue() + " for channel " + event.getChannel());
            return;
        }

        queue.removeEntry(existingQueueEntry, event.getDateReceived());
    }

    /**
     * Challange a QueueMemberStatusEvent.
     * Called from AsteriskServerImpl whenever a member state changes.
     *
     * @param event that was triggered by Asterisk server.
     */
    void handleQueueMemberStatusEvent(QueueMemberStatusEvent event)
    {
        AsteriskQueueImpl queue = getQueueByName(event.getQueue());

        if (queue == null)
        {
            logger.error("Ignored QueueMemberStatusEvent for unknown queue " + event.getQueue());
            return;
        }

        AsteriskQueueMemberImpl member = queue.getMemberByLocation(event.getLocation());
        if (member == null)
        {
            logger.error("Ignored QueueMemberStatusEvent for unknown member " + event.getLocation());
            return;
        }

        member.stateChanged(QueueMemberState.valueOf(event.getStatus()));
        member.penaltyChanged(event.getPenalty());
        queue.fireMemberStateChanged(member);
    }

    void handleQueueMemberPausedEvent(QueueMemberPausedEvent event) {
        AsteriskQueueImpl queue = getQueueByName(event.getQueue());

        if (queue == null)
        {
            logger.error("Ignored QueueMemberPausedEvent for unknown queue " + event.getQueue());
            return;
        }

        AsteriskQueueMemberImpl member = queue.getMemberByLocation(event.getLocation());
        if (member == null)
        {
            logger.error("Ignored QueueMemberPausedEvent for unknown member " + event.getLocation());
            return;
        }

        member.pausedChanged(event.getPaused());
    }
    
    void handleQueueMemberPenaltyEvent(QueueMemberPenaltyEvent event)
    {
        AsteriskQueueImpl queue = getQueueByName(event.getQueue());

        if (queue == null)
        {
            logger.error("Ignored QueueMemberStatusEvent for unknown queue " + event.getQueue());
            return;
        }

        AsteriskQueueMemberImpl member = queue.getMemberByLocation(event.getLocation());
        if (member == null)
        {
            logger.error("Ignored QueueMemberStatusEvent for unknown member " + event.getLocation());
            return;
        }

        member.penaltyChanged(event.getPenalty());
    }

    /**
     * Retrieves a queue by its name.
     *
     * @param queueName name of the queue.
     * @return the requested queue or <code>null</code> if there is no queue with the given name.
     */
    private AsteriskQueueImpl getQueueByName(String queueName)
    {
        AsteriskQueueImpl queue;

        synchronized (queues)
        {
            queue = queues.get(queueName);
        }
        if (queue == null)
        {
            logger.error("Requested queue '" + queueName + "' not found!");
        }
        return queue;
    }

    /**
     * Challange a QueueMemberAddedEvent.
     *
     * @param event - the generated QueueMemberAddedEvent.
     */
    public void handleQueueMemberAddedEvent(QueueMemberAddedEvent event)
    {
        final AsteriskQueueImpl queue = queues.get(event.getQueue());
        if (queue == null)
        {
            logger.error("Ignored QueueMemberAddedEvent for unknown queue " + event.getQueue());
            return;
        }

        AsteriskQueueMemberImpl member = queue.getMember(event.getLocation());
        if (member == null)
        {
            member = new AsteriskQueueMemberImpl(server, queue, event.getLocation(),
                    QueueMemberState.valueOf(event.getStatus()), event.getPaused(),
                    event.getPenalty(), event.getMembership());
        }

        queue.addMember(member);
    }

    /**
     * Challange a QueueMemberRemovedEvent.
     *
     * @param event - the generated QueueMemberRemovedEvent.
     */
    public void handleQueueMemberRemovedEvent(QueueMemberRemovedEvent event)
    {
        final AsteriskQueueImpl queue = queues.get(event.getQueue());
        if (queue == null)
        {
            logger.error("Ignored QueueMemberRemovedEvent for unknown queue " + event.getQueue());
            return;
        }

        final AsteriskQueueMemberImpl member = queue.getMember(event.getLocation());
        if (member == null)
        {
            logger.error("Ignored QueueMemberRemovedEvent for unknown agent name: "
                    + event.getMemberName() + " location: " + event.getLocation()
                    + " queue: " + event.getQueue());
            return;
        }

        queue.removeMember(member);
    }
}
