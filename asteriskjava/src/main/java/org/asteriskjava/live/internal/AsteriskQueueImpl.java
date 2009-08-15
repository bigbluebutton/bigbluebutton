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
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import org.asteriskjava.live.AsteriskQueue;
import org.asteriskjava.live.AsteriskQueueEntry;
import org.asteriskjava.live.AsteriskQueueListener;
import org.asteriskjava.live.AsteriskQueueMember;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

/**
 * Default implementation of the AsteriskQueue interface.
 *
 * @author srt
 * @version $Id: AsteriskQueueImpl.java 1242 2009-03-09 15:49:12Z srt $
 */
class AsteriskQueueImpl extends AbstractLiveObject implements AsteriskQueue
{
    /**
     * TimerTask that monitors exceeding service levels.
     *
     * @author <a href="mailto:patrick.breucking{@nospam}gonicus.de">Patrick Breucking</a>
     */
    private class ServiceLevelTimerTask extends TimerTask
    {
        private final AsteriskQueueEntry entry;

        ServiceLevelTimerTask(AsteriskQueueEntry entry)
        {
            this.entry = entry;
        }

        @Override
        public void run()
        {
            fireServiceLevelExceeded(entry);
        }
    }

    private final Log logger = LogFactory.getLog(this.getClass());
    private final String name;
    private Integer max;
    private String strategy;
    private Integer serviceLevel;
    private Integer weight;
    private final ArrayList<AsteriskQueueEntryImpl> entries;
    private final Timer timer;
    private final HashMap<String, AsteriskQueueMemberImpl> members;
    private final List<AsteriskQueueListener> listeners;
    private final HashMap<AsteriskQueueEntry, ServiceLevelTimerTask> serviceLevelTimerTasks;

    AsteriskQueueImpl(AsteriskServerImpl server, String name, Integer max,
                      String strategy, Integer serviceLevel, Integer weight)
    {
        super(server);
        this.name = name;
        this.max = max;
        this.strategy = strategy;
        this.serviceLevel = serviceLevel;
        this.weight = weight;
        entries = new ArrayList<AsteriskQueueEntryImpl>(25);
        listeners = new ArrayList<AsteriskQueueListener>();
        members = new HashMap<String, AsteriskQueueMemberImpl>();
        timer = new Timer("ServiceLevelTimer-" + name, true);
        serviceLevelTimerTasks = new HashMap<AsteriskQueueEntry, ServiceLevelTimerTask>();
    }

    void cancelServiceLevelTimer()
    {
        timer.cancel();
    }

    public String getName()
    {
        return name;
    }

    public Integer getMax()
    {
        return max;
    }

    public String getStrategy()
    {
        return strategy;
    }

    void setMax(Integer max)
    {
        this.max = max;
    }

    public Integer getServiceLevel()
    {
        return serviceLevel;
    }

    void setServiceLevel(Integer serviceLevel)
    {
        this.serviceLevel = serviceLevel;
    }

    public Integer getWeight()
    {
        return weight;
    }

    void setWeight(Integer weight)
    {
        this.weight = weight;
    }

    public List<AsteriskQueueEntry> getEntries()
    {
        synchronized (entries)
        {
            return new ArrayList<AsteriskQueueEntry>(entries);
        }
    }

    /**
     * Shifts the position of the queue entries if needed
     * (and fire PCE on queue entries if appropriate).
     */
    private void shift()
    {
        int currentPos = 1; // Asterisk starts at 1

        synchronized (entries)
        {
            for (AsteriskQueueEntryImpl qe : entries)
            {
                // Only set (and fire PCE on qe) if necessary
                if (qe.getPosition() != currentPos)
                {
                    qe.setPosition(currentPos);
                }
                currentPos++;
            }
        }
    }

    /**
     * Creates a new AsteriskQueueEntry, adds it to this queue.<p>
     * Fires:
     * <ul>
     * <li>PCE on channel</li>
     * <li>NewEntry on this queue</li>
     * <li>PCE on other queue entries if shifted (never happens)</li>
     * <li>NewQueueEntry on server</li>
     * </ul>
     *
     * @param channel          the channel that joined the queue
     * @param reportedPosition the position as given by Asterisk (currently not used)
     * @param dateReceived     the date the hannel joined the queue
     */
    void createNewEntry(AsteriskChannelImpl channel, int reportedPosition, Date dateReceived)
    {
        AsteriskQueueEntryImpl qe = new AsteriskQueueEntryImpl(server, this, channel, reportedPosition, dateReceived);

        long delay = serviceLevel * 1000L;
        if (delay > 0)
        {
            ServiceLevelTimerTask timerTask = new ServiceLevelTimerTask(qe);
            timer.schedule(timerTask, delay);
            synchronized (serviceLevelTimerTasks)
            {
                serviceLevelTimerTasks.put(qe, timerTask);
            }
        }

        synchronized (entries)
        {
            entries.add(qe); // at the end of the list

            // Keep the lock !
            // This will fire PCE on the newly created queue entry
            // but hopefully this one has no listeners yet
            shift();
        }

        // Set the channel property ony here as queue entries and channels
        // maintain a reciprocal reference.
        // That way property change on channel and new entry event on queue will be
        // lanched when BOTH channel and queue are correctly set.
        channel.setQueueEntry(qe);
        fireNewEntry(qe);
        server.fireNewQueueEntry(qe);
    }

    /**
     * Removes the given queue entry from the queue.<p>
     * Fires if needed:
     * <ul>
     * <li>PCE on channel</li>
     * <li>EntryLeave on this queue</li>
     * <li>PCE on other queue entries if shifted</li>
     * </ul>
     *
     * @param entry        an existing entry object.
     * @param dateReceived the remove event was received.
     */
    void removeEntry(AsteriskQueueEntryImpl entry, Date dateReceived)
    {
        synchronized (serviceLevelTimerTasks)
        {
            if (serviceLevelTimerTasks.containsKey(entry))
            {
                ServiceLevelTimerTask timerTask = serviceLevelTimerTasks.get(entry);
                timerTask.cancel();
                serviceLevelTimerTasks.remove(entry);
            }
        }

        boolean changed;
        synchronized (entries)
        {
            changed = entries.remove(entry);

            if (changed)
            {
                // Keep the lock !
                shift();
            }
        }

        // Fire outside lock
        if (changed)
        {
            entry.getChannel().setQueueEntry(null);
            entry.left(dateReceived);
            fireEntryLeave(entry);
        }
    }

    @Override
    public String toString()
    {
        final StringBuffer sb;

        sb = new StringBuffer("AsteriskQueue[");
        sb.append("name='").append(getName()).append("',");
        sb.append("max='").append(getMax()).append("',");
        sb.append("strategy='").append(getStrategy()).append("',");
        sb.append("serviceLevel='").append(getServiceLevel()).append("',");
        sb.append("weight='").append(getWeight()).append("',");
        synchronized (entries)
        {
            sb.append("entries='").append(entries.toString()).append("',");
        }
        synchronized (members)
        {
            sb.append("members='").append(members.toString()).append("',");
        }
        sb.append("systemHashcode=").append(System.identityHashCode(this));
        sb.append("]");

        return sb.toString();
    }

    public void addAsteriskQueueListener(AsteriskQueueListener listener)
    {
        synchronized (listeners)
        {
            listeners.add(listener);
        }
    }

    public void removeAsteriskQueueListener(AsteriskQueueListener listener)
    {
        synchronized (listeners)
        {
            listeners.remove(listener);
        }
    }

    /**
     * Notifies all registered listener that an entry joins the queue.
     *
     * @param entry that joins the queue
     */
    void fireNewEntry(AsteriskQueueEntryImpl entry)
    {
        synchronized (listeners)
        {
            for (AsteriskQueueListener listener : listeners)
            {
                try
                {
                    listener.onNewEntry(entry);
                }
                catch (Exception e)
                {
                    logger.warn("Exception in onNewEntry()", e);
                }
            }
        }
    }

    /**
     * Notifies all registered listener that an entry leaves the queue.
     *
     * @param entry that leaves the queue.
     */
    void fireEntryLeave(AsteriskQueueEntryImpl entry)
    {
        synchronized (listeners)
        {
            for (AsteriskQueueListener listener : listeners)
            {
                try
                {
                    listener.onEntryLeave(entry);
                }
                catch (Exception e)
                {
                    logger.warn("Exception in onEntryLeave()", e);
                }
            }
        }
    }

    /**
     * Notifies all registered listener that a member has been added to the queue.
     *
     * @param member added to the queue
     */
    void fireMemberAdded(AsteriskQueueMemberImpl member)
    {
        synchronized (listeners)
        {
            for (AsteriskQueueListener listener : listeners)
            {
                try
                {
                    listener.onMemberAdded(member);
                }
                catch (Exception e)
                {
                    logger.warn("Exception in onMemberAdded()", e);
                }
            }
        }
    }

    /**
     * Notifies all registered listener that a member has been removed from the queue.
     *
     * @param member that has been removed.
     */
    void fireMemberRemoved(AsteriskQueueMemberImpl member)
    {
        synchronized (listeners)
        {
            for (AsteriskQueueListener listener : listeners)
            {
                try
                {
                    listener.onMemberRemoved(member);
                }
                catch (Exception e)
                {
                    logger.warn("Exception in onMemberRemoved()", e);
                }
            }
        }
    }

    /**
     * Returns a collection of members of this queue.
     *
     * @see org.asteriskjava.live.AsteriskQueue#getMembers()
     */
    public Collection<AsteriskQueueMember> getMembers()
    {
        ArrayList<AsteriskQueueMember> listOfMembers = new ArrayList<AsteriskQueueMember>(members.size());
        synchronized (members)
        {
            for (AsteriskQueueMemberImpl asteriskQueueMember : members.values())
            {
                listOfMembers.add(asteriskQueueMember);
            }
        }
        return listOfMembers;
    }

    /**
     * Returns a member by its location.
     *
     * @param location ot the member
     * @return the member by its location.
     */
    AsteriskQueueMemberImpl getMember(String location)
    {
        synchronized (members)
        {
            if (members.containsKey(location))
            {
                return members.get(location);
            }
        }
        return null;
    }

    /**
     * Add a new member to this queue.
     *
     * @param member to add
     */
    void addMember(AsteriskQueueMemberImpl member)
    {
        synchronized (members)
        {
            // Check if member already exists
            if (members.containsValue(member))
            {
                return;
            }
            // If not, add the new member.
            logger.info("Adding new member to the queue " + getName() + ": " + member.toString());
            members.put(member.getLocation(), member);
        }
        
        fireMemberAdded(member);
    }

    /**
     * Retrieves a member by its location.
     *
     * @param location of the member
     * @return the requested member.
     */
    AsteriskQueueMemberImpl getMemberByLocation(String location)
    {
        AsteriskQueueMemberImpl member;
        synchronized (members)
        {
            member = members.get(location);
        }
        if (member == null)
        {
            logger.error("Requested member at location " + location + " not found!");
        }
        return member;
    }

    /**
     * Notifies all registered listener that a queue member changes its state.
     *
     * @param member the changed member.
     */
    void fireMemberStateChanged(AsteriskQueueMemberImpl member)
    {
        synchronized (listeners)
        {
            for (AsteriskQueueListener listener : listeners)
            {
                try
                {
                    listener.onMemberStateChange(member);
                }
                catch (Exception e)
                {
                    logger.warn("Exception in onMemberStateChange()", e);
                }
            }
        }
    }

    /**
     * Gets an entry of the queue by its channel name.
     *
     * @param channelName The entry's channel name.
     * @return the queue entry if found, null otherwise.
     */
    AsteriskQueueEntryImpl getEntry(String channelName)
    {
        synchronized (entries)
        {
            for (AsteriskQueueEntryImpl entry : entries)
            {
                if (entry.getChannel().getName().equals(channelName))
                {
                    return entry;
                }
            }
        }
        return null;
    }


    /**
     * Removes a member from this queue.
     *
     * @param member the member to remove.
     */
    public void removeMember(AsteriskQueueMemberImpl member)
    {
        synchronized (members)
        {
            // Check if member exists
            if (!members.containsValue(member))
            {
                return;
            }
            // If so, remove the member.
            logger.info("Remove member from the queue " + getName() + ": "
                    + member.toString());
            members.remove(member.getLocation());
        }
        
        fireMemberRemoved(member);
    }

    void fireServiceLevelExceeded(AsteriskQueueEntry entry)
    {
        synchronized (listeners)
        {
            for (AsteriskQueueListener listener : listeners)
            {
                try
                {
                    listener.onEntryServiceLevelExceeded(entry);
                }
                catch (Exception e)
                {
                    logger.warn("Exception in fireServiceLevelExceeded()", e);
                }
            }
        }
    }

    /**
     * Gets an entry by its (estimated) position in the queue.
     *
     * @param position the position, starting at 1.
     * @return the queue entry if exiting at this position, null otherwise.
     */
    AsteriskQueueEntryImpl getEntry(int position)
    {
        // positions in asterisk start at 1, but list starts at 0
        position--;
        AsteriskQueueEntryImpl foundEntry = null;
        synchronized (entries)
        {
            try
            {
                foundEntry = entries.get(position);
            }
            catch (IndexOutOfBoundsException e)
            {
                // For consistency with the above method,
                // swallow. We might indeed request the 1st one from time to time
            } // NOPMD
        }
        return foundEntry;
    }
}
