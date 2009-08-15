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
import org.asteriskjava.manager.ResponseEvents;
import org.asteriskjava.manager.action.StatusAction;
import org.asteriskjava.manager.event.*;
import org.asteriskjava.util.DateUtil;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

import java.util.*;

/**
 * Manages channel events on behalf of an AsteriskServer.
 *
 * @author srt
 * @version $Id: ChannelManager.java 1315 2009-06-02 22:36:54Z srt $
 */
class ChannelManager
{
    private final Log logger = LogFactory.getLog(getClass());

    /**
     * How long we wait before we remove hung up channels from memory (in milliseconds).
     */
    private static final long REMOVAL_THRESHOLD = 15 * 60 * 1000L; // 15 minutes
    private static final long SLEEP_TIME_BEFORE_GET_VAR = 50L;

    private final AsteriskServerImpl server;

    /**
     * A map of all active channel by their unique id.
     */
    private final Set<AsteriskChannelImpl> channels;

    /**
     * Creates a new instance.
     *
     * @param server the server this channel manager belongs to.
     */
    ChannelManager(AsteriskServerImpl server)
    {
        this.server = server;
        this.channels = new HashSet<AsteriskChannelImpl>();
    }

    void initialize() throws ManagerCommunicationException
    {
        ResponseEvents re;

        disconnected();
        re = server.sendEventGeneratingAction(new StatusAction());
        for (ManagerEvent event : re.getEvents())
        {
            if (event instanceof StatusEvent)
            {
                handleStatusEvent((StatusEvent) event);
            }
        }
    }

    void disconnected()
    {
        synchronized (channels)
        {
            channels.clear();
        }
    }

    /**
     * Returns a collection of all active AsteriskChannels.
     *
     * @return a collection of all active AsteriskChannels.
     */
    Collection<AsteriskChannel> getChannels()
    {
        Collection<AsteriskChannel> copy;

        synchronized (channels)
        {
            copy = new ArrayList<AsteriskChannel>(channels.size() + 2);
            for (AsteriskChannel channel : channels)
            {
                if (channel.getState() != ChannelState.HUNGUP)
                {
                    copy.add(channel);
                }
            }
        }
        return copy;
    }

    private void addChannel(AsteriskChannelImpl channel)
    {
        synchronized (channels)
        {
            channels.add(channel);
        }
    }

    /**
     * Removes channels that have been hung more than {@link #REMOVAL_THRESHOLD} milliseconds.
     */
    private void removeOldChannels()
    {
        Iterator<AsteriskChannelImpl> i;

        synchronized (channels)
        {
            i = channels.iterator();
            while (i.hasNext())
            {
                final AsteriskChannel channel = i.next();
                final Date dateOfRemoval = channel.getDateOfRemoval();
                if (channel.getState() == ChannelState.HUNGUP && dateOfRemoval != null)
                {
                    final long diff = DateUtil.getDate().getTime() - dateOfRemoval.getTime();
                    if (diff >= REMOVAL_THRESHOLD)
                    {
                        i.remove();
                    }
                }
            }
        }
    }

    private AsteriskChannelImpl addNewChannel(String uniqueId, String name,
                                              Date dateOfCreation, String callerIdNumber, String callerIdName,
                                              ChannelState state, String account)
    {
        final AsteriskChannelImpl channel;
        final String traceId;

        channel = new AsteriskChannelImpl(server, name, uniqueId, dateOfCreation);
        channel.setCallerId(new CallerId(callerIdName, callerIdNumber));
        channel.setAccount(account);
        channel.stateChanged(dateOfCreation, state);
        logger.info("Adding channel " + channel.getName() + "(" + channel.getId() + ")");

        if (SLEEP_TIME_BEFORE_GET_VAR > 0)
        {
            try
            {
                Thread.sleep(SLEEP_TIME_BEFORE_GET_VAR);
            }
            catch (InterruptedException e)
            {
                // ignore
            }
        }

        traceId = getTraceId(channel);
        channel.setTraceId(traceId);

        addChannel(channel);

        if (traceId != null && (!name.toLowerCase(Locale.ENGLISH).startsWith("local/") || (name.endsWith(",1") || name.endsWith(";1"))))
        {
            final OriginateCallbackData callbackData;
            callbackData = server.getOriginateCallbackDataByTraceId(traceId);
            if (callbackData != null && callbackData.getChannel() == null)
            {
                callbackData.setChannel(channel);
                try
                {
                    callbackData.getCallback().onDialing(channel);
                }
                catch (Throwable t)
                {
                    logger.warn("Exception dispatching originate progress.", t);
                }
            }
        }
        server.fireNewAsteriskChannel(channel);
        return channel;
    }

    void handleStatusEvent(StatusEvent event)
    {
        AsteriskChannelImpl channel;
        final Extension extension;
        boolean isNew = false;

        channel = getChannelImplById(event.getUniqueId());
        if (channel == null)
        {
            Date dateOfCreation;

            if (event.getSeconds() != null)
            {
                dateOfCreation = new Date(DateUtil.getDate().getTime() - (event.getSeconds() * 1000L));
            }
            else
            {
                dateOfCreation = DateUtil.getDate();
            }
            channel = new AsteriskChannelImpl(server, event.getChannel(), event.getUniqueId(), dateOfCreation);
            isNew = true;
        }

        if (event.getContext() == null && event.getExtension() == null
                && event.getPriority() == null)
        {
            extension = null;
        }
        else
        {
            extension = new Extension(event.getContext(), event.getExtension(), event.getPriority());
        }

        synchronized (channel)
        {
            channel.setCallerId(new CallerId(event.getCallerIdName(), event.getCallerIdNum()));
            channel.setAccount(event.getAccountCode());
            if (event.getChannelState() != null)
            {
                channel.stateChanged(event.getDateReceived(), ChannelState.valueOf(event.getChannelState()));
            }
            channel.extensionVisited(event.getDateReceived(), extension);

            if (event.getBridgedChannel() != null)
            {
                final AsteriskChannelImpl linkedChannel = getChannelImplByName(event.getBridgedChannel());
                if (linkedChannel != null)
                {
                    // the date used here is not correct!
                    channel.channelLinked(event.getDateReceived(), linkedChannel);
                    synchronized (linkedChannel)
                    {
                        linkedChannel.channelLinked(event.getDateReceived(), channel);
                    }
                }
            }
        }

        if (isNew)
        {
            logger.info("Adding new channel " + channel.getName());
            addChannel(channel);
            server.fireNewAsteriskChannel(channel);
        }
    }

    /**
     * Returns a channel from the ChannelManager's cache with the given name
     * If multiple channels are found, returns the most recently CREATED one.
     * If two channels with the very same date exist, avoid HUNGUP ones.
     *
     * @param name the name of the requested channel.
     * @return the (most recent) channel if found, in any state, or null if none found.
     */
    AsteriskChannelImpl getChannelImplByName(String name)
    {
        Date dateOfCreation = null;
        AsteriskChannelImpl channel = null;

        if (name == null)
        {
            return null;
        }

        synchronized (channels)
        {
            for (AsteriskChannelImpl tmp : channels)
            {
                if (tmp.getName() != null && tmp.getName().equals(name))
                {
                    // return the most recent channel or when dates are similar, the active one
                    if (dateOfCreation == null ||
                            tmp.getDateOfCreation().after(dateOfCreation) ||
                            (tmp.getDateOfCreation().equals(dateOfCreation) && tmp.getState() != ChannelState.HUNGUP))
                    {
                        channel = tmp;
                        dateOfCreation = channel.getDateOfCreation();
                    }
                }
            }
        }
        return channel;
    }

    /**
     * Returns a NON-HUNGUP channel from the ChannelManager's cache with the given name.
     *
     * @param name the name of the requested channel.
     * @return the NON-HUNGUP channel if found, or null if none is found.
     */
    AsteriskChannelImpl getChannelImplByNameAndActive(String name)
    {

        // In non bristuffed AST 1.2, we don't have uniqueid header to match the channel
        // So we must use the channel name
        // Channel name is unique at any give moment in the  * server
        // But asterisk-java keeps Hungup channels for a while.
        // We don't want to retrieve hungup channels.

        AsteriskChannelImpl channel = null;

        if (name == null)
        {
            return null;
        }

        synchronized (channels)
        {
            for (AsteriskChannelImpl tmp : channels)
            {
                if (tmp.getName() != null && tmp.getName().equals(name) && tmp.getState() != ChannelState.HUNGUP)
                {
                    channel = tmp;
                }
            }
        }
        return channel;
    }

    AsteriskChannelImpl getChannelImplById(String id)
    {
        if (id == null)
        {
            return null;
        }

        synchronized (channels)
        {
            for (AsteriskChannelImpl channel : channels)
            {
                if (id.equals(channel.getId()))
                {
                    return channel;
                }
            }
        }
        return null;
    }

    /**
     * Returns the other side of a local channel.
     * <p/>
     * Local channels consist of two sides, like
     * "Local/1234@from-local-60b5,1" and "Local/1234@from-local-60b5,2" (for Asterisk 1.4) or
     * "Local/1234@from-local-60b5;1" and "Local/1234@from-local-60b5;2" (for Asterisk 1.6)
     * this method returns the other side.
     *
     * @param localChannel one side
     * @return the other side, or <code>null</code> if not available or if the given channel
     *         is not a local channel.
     */
    AsteriskChannelImpl getOtherSideOfLocalChannel(AsteriskChannel localChannel)
    {
        final String name;
        final char num;

        if (localChannel == null)
        {
            return null;
        }

        name = localChannel.getName();
        if (name == null || !name.startsWith("Local/") || (name.charAt(name.length() - 2) != ',' && name.charAt(name.length() - 2) != ';'))
        {
            return null;
        }

        num = name.charAt(name.length() - 1);

        if (num == '1')
        {
            return getChannelImplByName(name.substring(0, name.length() - 1) + "2");
        }
        else if (num == '2')
        {
            return getChannelImplByName(name.substring(0, name.length() - 1) + "1");
        }
        else
        {
            return null;
        }
    }

    void handleNewChannelEvent(NewChannelEvent event)
    {
        final AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());

        if (channel == null)
        {
            addNewChannel(
                    event.getUniqueId(), event.getChannel(), event.getDateReceived(),
                    event.getCallerIdNum(), event.getCallerIdName(),
                    ChannelState.valueOf(event.getChannelState()), event.getAccountCode());
        }
        else
        {
            // channel had already been created probably by a NewCallerIdEvent
            synchronized (channel)
            {
                channel.nameChanged(event.getDateReceived(), event.getChannel());
                channel.setCallerId(new CallerId(event.getCallerIdName(), event.getCallerIdNum()));
                channel.stateChanged(event.getDateReceived(), ChannelState.valueOf(event.getChannelState()));
            }
        }
    }

    void handleNewExtenEvent(NewExtenEvent event)
    {
        AsteriskChannelImpl channel;
        final Extension extension;

        channel = getChannelImplById(event.getUniqueId());
        if (channel == null)
        {
            logger.error("Ignored NewExtenEvent for unknown channel " + event.getChannel());
            return;
        }

        extension = new Extension(
                event.getContext(), event.getExtension(), event.getPriority(),
                event.getApplication(), event.getAppData());

        synchronized (channel)
        {
            channel.extensionVisited(event.getDateReceived(), extension);
        }
    }

    void handleNewStateEvent(NewStateEvent event)
    {
        AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());

        if (channel == null)
        {
            // NewStateEvent can occur for an existing channel that now has a different unique id (originate with Local/)
            channel = getChannelImplByNameAndActive(event.getChannel());
            if (channel != null)
            {
                logger.info("Changing unique id for '" + channel.getName() + "' from " + channel.getId() + " to " + event.getUniqueId());
                channel.idChanged(event.getDateReceived(), event.getUniqueId());
            }

            if (channel == null)
            {
                logger.info("Creating new channel due to NewStateEvent '" + event.getChannel() + "' unique id " + event.getUniqueId());
                // NewStateEvent can occur instead of a NewChannelEvent
                channel = addNewChannel(
                        event.getUniqueId(), event.getChannel(), event.getDateReceived(),
                        event.getCallerIdNum(), event.getCallerIdName(),
                        ChannelState.valueOf(event.getChannelState()), null /* account code not available */);
            }
        }

        // NewStateEvent can provide a new CallerIdNum or CallerIdName not previously received through a
        // NewCallerIdEvent. This happens at least on outgoing legs from the queue application to agents.
        if (event.getCallerIdNum() != null || event.getCallerIdName() != null)
        {
            String cidnum = "";
            String cidname = "";
            CallerId currentCallerId = channel.getCallerId();

            if (currentCallerId != null)
            {
                cidnum = currentCallerId.getNumber();
                cidname = currentCallerId.getName();
            }

            if (event.getCallerIdNum() != null)
            {
                cidnum = event.getCallerIdNum();
            }

            if (event.getCallerIdName() != null)
            {
                cidname = event.getCallerIdName();
            }

            CallerId newCallerId = new CallerId(cidname, cidnum);
            logger.debug("Updating CallerId (following NewStateEvent) to: " + newCallerId.toString());
            channel.setCallerId(newCallerId);

            // Also, NewStateEvent can return a new channel name for the same channel uniqueid, indicating the channel has been
            // renamed but no related RenameEvent has been received.
            // This happens with mISDN channels (see AJ-153)
            if (event.getChannel() != null && !event.getChannel().equals(channel.getName()))
            {
                logger.info("Renaming channel (following NewStateEvent) '" + channel.getName() + "' to '" + event.getChannel() + "'");
                synchronized (channel)
                {
                    channel.nameChanged(event.getDateReceived(), event.getChannel());
                }
            }
        }

        if (event.getChannelState() != null)
        {
            synchronized (channel)
            {
                channel.stateChanged(event.getDateReceived(), ChannelState.valueOf(event.getChannelState()));
            }
        }
    }

    void handleNewCallerIdEvent(NewCallerIdEvent event)
    {
        AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());

        if (channel == null)
        {
            // NewCallerIdEvent can occur for an existing channel that now has a different unique id (originate with Local/)
            channel = getChannelImplByNameAndActive(event.getChannel());
            if (channel != null)
            {
                logger.info("Changing unique id for '" + channel.getName() + "' from " + channel.getId() + " to " + event.getUniqueId());
                channel.idChanged(event.getDateReceived(), event.getUniqueId());
            }

            if (channel == null)
            {
                // NewCallerIdEvent can occur before NewChannelEvent
                channel = addNewChannel(
                        event.getUniqueId(), event.getChannel(), event.getDateReceived(),
                        event.getCallerIdNum(), event.getCallerIdName(),
                        ChannelState.DOWN, null /* account code not available */);
            }
        }

        synchronized (channel)
        {
            channel.setCallerId(new CallerId(event.getCallerIdName(), event.getCallerIdNum()));
        }
    }

    void handleHangupEvent(HangupEvent event)
    {
        HangupCause cause = null;
        AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());

        if (channel == null)
        {
            logger.error("Ignored HangupEvent for unknown channel " + event.getChannel());
            return;
        }

        if (event.getCause() != null)
        {
            cause = HangupCause.getByCode(event.getCause());
        }

        synchronized (channel)
        {
            channel.hungup(event.getDateReceived(), cause, event.getCauseTxt());
        }

        logger.info("Removing channel " + channel.getName() + " due to hangup (" + cause + ")");
        removeOldChannels();
    }

    void handleDialEvent(DialEvent event)
    {
        final AsteriskChannelImpl sourceChannel = getChannelImplById(event.getUniqueId());
        final AsteriskChannelImpl destinationChannel = getChannelImplById(event.getDestUniqueId());

        if (sourceChannel == null)
        {
            logger.error("Ignored DialEvent for unknown source channel " + event.getChannel() + " with unique id " + event.getUniqueId());
            return;
        }
        if (destinationChannel == null)
        {
            logger.error("Ignored DialEvent for unknown destination channel " + event.getDestination() + " with unique id " + event.getDestUniqueId());
            return;
        }

        logger.info(sourceChannel.getName() + " dialed " + destinationChannel.getName());
        getTraceId(sourceChannel);
        getTraceId(destinationChannel);
        synchronized (sourceChannel)
        {
            sourceChannel.channelDialed(event.getDateReceived(), destinationChannel);
        }
        synchronized (destinationChannel)
        {
            destinationChannel.channelDialing(event.getDateReceived(), sourceChannel);
        }
    }

    void handleBridgeEvent(BridgeEvent event)
    {
        final AsteriskChannelImpl channel1 = getChannelImplById(event.getUniqueId1());
        final AsteriskChannelImpl channel2 = getChannelImplById(event.getUniqueId2());

        if (channel1 == null)
        {
            logger.error("Ignored BridgeEvent for unknown channel " + event.getChannel1());
            return;
        }
        if (channel2 == null)
        {
            logger.error("Ignored BridgeEvent for unknown channel " + event.getChannel2());
            return;
        }

        if (event.isLink())
        {
            logger.info("Linking channels " + channel1.getName() + " and " + channel2.getName());
            synchronized (channel1)
            {
                channel1.channelLinked(event.getDateReceived(), channel2);
            }

            synchronized (channel2)
            {
                channel2.channelLinked(event.getDateReceived(), channel1);
            }
        }

        if (event.isUnlink())
        {
            logger.info("Unlinking channels " + channel1.getName() + " and " + channel2.getName());
            synchronized (channel1)
            {
                channel1.channelUnlinked(event.getDateReceived());
            }

            synchronized (channel2)
            {
                channel2.channelUnlinked(event.getDateReceived());
            }
        }
    }

    void handleRenameEvent(RenameEvent event)
    {
        AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());

        if (channel == null)
        {
            logger.error("Ignored RenameEvent for unknown channel with uniqueId " + event.getUniqueId());
            return;
        }

        logger.info("Renaming channel '" + channel.getName() + "' to '" + event.getNewname() + "', uniqueId is " + event.getUniqueId());
        synchronized (channel)
        {
            channel.nameChanged(event.getDateReceived(), event.getNewname());
        }
    }

    void handleCdrEvent(CdrEvent event)
    {
        final AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());
        final AsteriskChannelImpl destinationChannel = getChannelImplByName(event.getDestinationChannel());
        final CallDetailRecordImpl cdr;

        if (channel == null)
        {
            logger.info("Ignored CdrEvent for unknown channel with uniqueId " + event.getUniqueId());
            return;
        }

        cdr = new CallDetailRecordImpl(channel, destinationChannel, event);

        synchronized (channel)
        {
            channel.callDetailRecordReceived(event.getDateReceived(), cdr);
        }
    }

    private String getTraceId(AsteriskChannel channel)
    {
        String traceId;

        try
        {
            traceId = channel.getVariable(Constants.VARIABLE_TRACE_ID);
        }
        catch (Exception e)
        {
            traceId = null;
        }
        //logger.info("TraceId for channel " + channel.getName() + " is " + traceId);
        return traceId;
    }

    void handleParkedCallEvent(ParkedCallEvent event)
    {
        // Only bristuffed versions: AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());
        AsteriskChannelImpl channel = getChannelImplByNameAndActive(event.getChannel());

        if (channel == null)
        {
            logger.info("Ignored ParkedCallEvent for unknown channel "
                    + event.getChannel());
            return;
        }

        synchronized (channel)
        {
            // todo The context should be "parkedcalls" or whatever has been configured in features.conf
            // unfortunately we don't get the context in the ParkedCallEvent so for now we'll set it to null.
            Extension ext = new Extension(null, event.getExten(), 1);
            channel.setParkedAt(ext);
            logger.info("Channel " + channel.getName() + " is parked at " + channel.getParkedAt().getExtension());
        }
    }

    void handleParkedCallGiveUpEvent(ParkedCallGiveUpEvent event)
    {
        // Only bristuffed versions: AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());
        AsteriskChannelImpl channel = getChannelImplByNameAndActive(event.getChannel());

        if (channel == null)
        {
            logger.info("Ignored ParkedCallGiveUpEvent for unknown channel "
                    + event.getChannel());
            return;
        }

        Extension wasParkedAt = channel.getParkedAt();

        if (wasParkedAt == null)
        {
            logger.info("Ignored ParkedCallGiveUpEvent as the channel was not parked");
            return;
        }

        synchronized (channel)
        {
            channel.setParkedAt(null);
        }
        logger.info("Channel " + channel.getName() + " is unparked (GiveUp) from " + wasParkedAt.getExtension());
    }

    void handleParkedCallTimeOutEvent(ParkedCallTimeOutEvent event)
    {
        // Only bristuffed versions: AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());
        final AsteriskChannelImpl channel = getChannelImplByNameAndActive(event.getChannel());

        if (channel == null)
        {
            logger.info("Ignored ParkedCallTimeOutEvent for unknown channel " + event.getChannel());
            return;
        }

        Extension wasParkedAt = channel.getParkedAt();

        if (wasParkedAt == null)
        {
            logger.info("Ignored ParkedCallTimeOutEvent as the channel was not parked");
            return;
        }

        synchronized (channel)
        {
            channel.setParkedAt(null);
        }
        logger.info("Channel " + channel.getName() + " is unparked (Timeout) from " + wasParkedAt.getExtension());
    }

    void handleUnparkedCallEvent(UnparkedCallEvent event)
    {
        // Only bristuffed versions: AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());
        final AsteriskChannelImpl channel = getChannelImplByNameAndActive(event.getChannel());

        if (channel == null)
        {
            logger.info("Ignored UnparkedCallEvent for unknown channel " + event.getChannel());
            return;
        }

        Extension wasParkedAt = channel.getParkedAt();

        if (wasParkedAt == null)
        {
            logger.info("Ignored UnparkedCallEvent as the channel was not parked");
            return;
        }

        synchronized (channel)
        {
            channel.setParkedAt(null);
        }
        logger.info("Channel " + channel.getName() + " is unparked (moved away) from " + wasParkedAt.getExtension());
    }

    void handleVarSetEvent(VarSetEvent event)
    {
        if (event.getUniqueId() == null)
        {
            return;
        }

        final AsteriskChannelImpl channel = getChannelImplById(event.getUniqueId());
        if (channel == null)
        {
            logger.info("Ignored VarSetEvent for unknown channel with uniqueId " + event.getUniqueId());
            return;
        }

        synchronized (channel)
        {
            channel.updateVariable(event.getVariable(), event.getValue());
        }
    }
}
