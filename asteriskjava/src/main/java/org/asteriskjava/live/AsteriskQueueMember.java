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
package org.asteriskjava.live;

/**
 * A queue member. Queue Member can be an agent or a direkt sip account, eg. a
 * Phone.<p>
 * PropertyChangeEvents are fired for the following properties:
 * <ul>
 * <li>state</li>
 * <li>paused</li>
 * <li>penalty (since Asterisk 1.6)</li>
 * </ul>
 *
 * @author <a href="mailto:patrick.breucking{@nospam}gonicus.de">Patrick Breucking</a>
 * @version $Id: AsteriskQueueMember.java 1159 2008-08-27 17:52:12Z srt $
 * @since 0.3.1
 */
public interface AsteriskQueueMember extends LiveObject
{
    String PROPERTY_STATE = "state";
    String PROPERTY_PENALTY = "penalty";
    String PROPERTY_PAUSED = "paused";

    /**
     * Returns the location of this member.
     *
     * @return the location of this member.
     */
    String getLocation();

    /**
     * Returns the queue this member is registerd to.
     *
     * @return the queue this member is registerd to.
     */
    AsteriskQueue getQueue();

    /**
     * Returns the state of this member.
     *
     * @return the state of this member.
     */
    QueueMemberState getState();

    /**
     * Returns whether this member is currently paused..
     *
     * @return paused <code>true</code> is this queue member is paused, <code>false</code> otherwise.
     * @deprecated as of 1.0.0. Use {@link #isPaused()} instead.
     */
    boolean getPaused();

    /**
     * Returns whether this member is currently paused..
     *
     * @return paused <code>true</code> is this queue member is paused, <code>false</code> otherwise.
     * @since 1.0.0
     */
    boolean isPaused();

    /**
     * Pauses or unpauses this member on this queue.
     *
     * @param paused <code>true</code> to pause this member, <code>false</code> to unpause.
     * @throws ManagerCommunicationException if the QueuePauseAction could not be send to Asterisk.
     * @throws NoSuchInterfaceException      if the interface or the queue do not exist.
     * @since 1.0.0
     */
    void setPaused(boolean paused) throws ManagerCommunicationException, NoSuchInterfaceException;

    /**
     * Pauses or unpauses this member on all queues.
     *
     * @param paused <code>true</code> to pause this member, <code>false</code> to unpause.
     * @throws ManagerCommunicationException if the QueuePauseAction could not be send to Asterisk.
     * @throws NoSuchInterfaceException      if the interface or the queue do not exist.
     * @since 1.0.0
     */
    void setPausedAll(boolean paused) throws ManagerCommunicationException, NoSuchInterfaceException;

    /**
     * Returns if this member has been dynamically added by the QueueAdd command
     * (in the dialplan or via the Manager API) or if this member is has been
     * statically defined in <code>queues.conf</code>.
     *
     * @return "dynamic" if the added member is a dynamic queue member, "static"
     *         if the added member is a static queue member.
     * @since 1.0.0
     */
    public String getMembership();

    /**
     * Convenience method that checks whether this member has been statically
     * defined in <code>queues.conf</code>.
     *
     * @return <code>true</code> if this member has been statically defined in
     *         <code>queues.conf</code>, <code>false</code> otherwise.
     * @since 1.0.0
     */
    public boolean isStatic();

    /**
     * Convenience method that checks whether this member has been dynamically
     * added by the QueueAdd command.
     *
     * @return <code>true</code> if this member has been dynamically added by
     *         the QueueAdd command, <code>false</code> otherwise.
     * @since 1.0.0
     */
    public boolean isDynamic();

    /**
     * Returns the penalty of this member.
     *
     * @return the penalty of this member.
     * @since 1.0.0
     */
    Integer getPenalty();

    /**
     * Assignes a new penalty to this queue member.<p>
     * Available since Asterisk 1.6.
     *
     * @param penalty the new penalty value, must not be negative.
     * @throws IllegalArgumentException      if the penalty is negative.
     * @throws ManagerCommunicationException if the QueuePenaltyAction could not be send to Asterisk.
     * @throws InvalidPenaltyException       if Asterisk refused to set the new penalty.
     * @since 1.0.0
     */
    void setPenalty(int penalty) throws IllegalArgumentException, ManagerCommunicationException, InvalidPenaltyException;
}
