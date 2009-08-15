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

import org.asteriskjava.live.*;
import org.asteriskjava.manager.response.ManagerResponse;
import org.asteriskjava.manager.response.ManagerError;
import org.asteriskjava.manager.action.QueuePenaltyAction;
import org.asteriskjava.manager.action.QueuePauseAction;

/**
 * Default implementation of a queue member.
 *
 * @author <a href="mailto:patrick.breucking{@nospam}gonicus.de">Patrick Breucking</a>
 * @version $Id: AsteriskQueueMemberImpl.java 1159 2008-08-27 17:52:12Z srt $
 * @see AsteriskQueueMember
 * @since 0.3.1
 */
class AsteriskQueueMemberImpl extends AbstractLiveObject implements AsteriskQueueMember
{
    private AsteriskQueue queue;
    private QueueMemberState state;
    private String location;
    private Integer penalty;
    private boolean paused;
    private String membership;

    /**
     * Creates a new queue member.
     *
     * @param server     server this channel belongs to.
     * @param queue      queue this member is registered to.
     * @param location   location of member.
     * @param state      state of this member.
     * @param paused     <code>true</code> if this member is currently paused, <code>false</code> otherwise.
     * @param penalty    penalty of this member.
     * @param membership "dynamic" if the added member is a dynamic queue member, "static"
     *                   if the added member is a static queue member.
     */
    AsteriskQueueMemberImpl(final AsteriskServerImpl server,
                            final AsteriskQueueImpl queue, String location,
                            QueueMemberState state, boolean paused,
                            Integer penalty, String membership)
    {
        super(server);
        this.queue = queue;
        this.location = location;
        this.state = state;
        this.penalty = penalty;
        this.paused = paused;
        this.membership = membership;
    }

    public AsteriskQueue getQueue()
    {
        return queue;
    }

    public String getLocation()
    {
        return location;
    }

    public QueueMemberState getState()
    {
        return state;
    }

    public boolean getPaused()
    {
        return isPaused();
    }

    public boolean isPaused()
    {
        return paused;
    }

    public void setPaused(boolean paused) throws ManagerCommunicationException, NoSuchInterfaceException
    {
        sendPauseAction(new QueuePauseAction(location, queue.getName(), paused));
    }

    public void setPausedAll(boolean paused) throws ManagerCommunicationException, NoSuchInterfaceException
    {
        sendPauseAction(new QueuePauseAction(location, paused));
    }

    private void sendPauseAction(QueuePauseAction action) throws ManagerCommunicationException, NoSuchInterfaceException
    {
        final ManagerResponse response = server.sendAction(action);

        if (response instanceof ManagerError)
        {
            //Message: Interface not found
            if (action.getQueue() != null)
            {
                //Message: Interface not found
                throw new NoSuchInterfaceException("Unable to change paused state for '" + action.getInterface() + "' on '" +
                        action.getQueue() + "': " + response.getMessage());
            }
            else
            {
                throw new NoSuchInterfaceException("Unable to change paused state for '" + action.getInterface() +
                        "' on all queues: " + response.getMessage());
            }
        }
    }

    public String getMembership()
    {
        return membership;
    }

    public boolean isStatic()
    {
        return membership != null && "static".equals(membership);
    }

    public boolean isDynamic()
    {
        return membership != null && "dynamic".equals(membership);
    }

    public Integer getPenalty()
    {
        return penalty;
    }

    public void setPenalty(int penalty) throws IllegalArgumentException, ManagerCommunicationException, InvalidPenaltyException
    {
        if (penalty < 0)
        {
            throw new IllegalArgumentException("Penalty must not be negative");
        }

        final ManagerResponse response = server.sendAction(
                new QueuePenaltyAction(location, penalty, queue.getName()));
        if (response instanceof ManagerError)
        {
            throw new InvalidPenaltyException("Unable to set penalty for '" + location + "' on '" +
                    queue.getName() + "': " + response.getMessage());
        }
    }

    @Override
    public String toString()
    {
        final StringBuffer sb;

        sb = new StringBuffer("AsteriskQueueMember[");
        sb.append("location='").append(location).append("'");
        sb.append("state='").append(state).append("'");
        sb.append("paused='").append(paused).append("'");
        sb.append("membership='").append(membership).append("'");
        sb.append("queue='").append(queue.getName()).append("'");
        sb.append("systemHashcode=").append(System.identityHashCode(this));
        sb.append("]");

        return sb.toString();
    }

    synchronized void stateChanged(QueueMemberState state)
    {
        QueueMemberState oldState = this.state;
        this.state = state;
        firePropertyChange(PROPERTY_STATE, oldState, state);
    }

    synchronized void penaltyChanged(Integer penalty)
    {
        Integer oldPenalty = this.penalty;
        this.penalty = penalty;
        firePropertyChange(PROPERTY_PENALTY, oldPenalty, penalty);
    }

    synchronized void pausedChanged(boolean paused)
    {
        boolean oldPaused = this.paused;
        this.paused = paused;
        firePropertyChange(PROPERTY_PAUSED, oldPaused, paused);
    }
}
