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

import java.util.Collection;
import java.util.Map;
import java.util.List;

import org.asteriskjava.live.internal.AsteriskServerImpl;
import org.asteriskjava.manager.DefaultManagerConnection;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.action.OriginateAction;
import org.asteriskjava.config.ConfigFile;

/**
 * Default implementation of the AsteriskServer interface.
 *
 * @author srt
 * @version $Id: DefaultAsteriskServer.java 1137 2008-08-18 14:05:05Z srt $
 * @see org.asteriskjava.live.AsteriskServer
 */
public class DefaultAsteriskServer implements AsteriskServer
{
    private final AsteriskServerImpl impl;

    /**
     * Creates a new instance without a {@link ManagerConnection}. The
     * ManagerConnection must be set using
     * {@link #setManagerConnection(ManagerConnection)} before you can use this
     * AsteriskServer.
     */
    public DefaultAsteriskServer()
    {
        impl = new AsteriskServerImpl();
    }

    /**
     * Creates a new instance and a new {@link ManagerConnection} with the given
     * connection data.
     *
     * @param hostname the hostname of the Asterisk server to connect to.
     * @param username the username to use for login
     * @param password the password to use for login
     */
    public DefaultAsteriskServer(String hostname, String username, String password)
    {
        final ManagerConnection connection;
        connection = createManagerConnection(hostname, 0, username, password);
        impl = new AsteriskServerImpl(connection);
    }

    /**
     * Creates a new instance and a new {@link ManagerConnection} with the given
     * connection data.
     *
     * @param hostname the hostname of the Asterisk server to connect to.
     * @param port     the port where Asterisk listens for incoming Manager API
     *                 connections, usually 5038.
     * @param username the username to use for login
     * @param password the password to use for login
     */
    public DefaultAsteriskServer(String hostname, int port, String username, String password)
    {
        final ManagerConnection connection;
        connection = createManagerConnection(hostname, port, username, password);
        impl = new AsteriskServerImpl(connection);
    }

    protected DefaultManagerConnection createManagerConnection(String hostname, int port, String username, String password)
    {
        DefaultManagerConnection dmc;
        dmc = new DefaultManagerConnection(hostname, port, username, password);
        return dmc;
    }

    /**
     * Creates a new instance that uses the given {@link ManagerConnection}.
     *
     * @param eventConnection the ManagerConnection to use for receiving events
     *                        from Asterisk.
     */
    public DefaultAsteriskServer(ManagerConnection eventConnection)
    {
        impl = new AsteriskServerImpl(eventConnection);
    }

    /**
     * Determines if queue status is retrieved at startup. If you don't need
     * queue information and still run Asterisk 1.0.x you can set this to
     * <code>true</code> to circumvent the startup delay caused by the missing
     * QueueStatusComplete event.
     * <p/>
     * Default is <code>false</code>.
     *
     * @param skipQueues <code>true</code> to skip queue initialization,
     *                   <code>false</code> to not skip.
     * @since 0.2
     */
    public void setSkipQueues(boolean skipQueues)
    {
        impl.setSkipQueues(skipQueues);
    }

    public void setManagerConnection(ManagerConnection eventConnection)
    {
        impl.setManagerConnection(eventConnection);
    }

    public void initialize() throws ManagerCommunicationException
    {
        impl.initialize();
    }

    /* Implementation of the AsteriskServer interface */

    public ManagerConnection getManagerConnection()
    {
        return impl.getManagerConnection();
    }
    
    public AsteriskChannel originate(OriginateAction originateAction) throws ManagerCommunicationException, NoSuchChannelException
	{
    	return impl.originate(originateAction);
	}


    public AsteriskChannel originateToExtension(String channel, String context,
                                                String exten, int priority, long timeout)
            throws ManagerCommunicationException, NoSuchChannelException
    {
        return impl.originateToExtension(channel, context, exten, priority, timeout);
    }

    public AsteriskChannel originateToExtension(String channel, String context,
                                                String exten, int priority, long timeout, CallerId callerId,
                                                Map<String, String> variables)
            throws ManagerCommunicationException, NoSuchChannelException
    {
        return impl.originateToExtension(channel, context, exten, priority, timeout, callerId, variables);
    }

    public AsteriskChannel originateToApplication(String channel,
                                                  String application, String data, long timeout)
            throws ManagerCommunicationException, NoSuchChannelException
    {
        return impl.originateToApplication(channel, application, data, timeout);
    }

    public AsteriskChannel originateToApplication(String channel,
                                                  String application, String data, long timeout, CallerId callerId,
                                                  Map<String, String> variables)
            throws ManagerCommunicationException, NoSuchChannelException
    {
        return impl.originateToApplication(channel, application, data, timeout, callerId, variables);
    }
    
    public void originateAsync(OriginateAction originateAction,
            OriginateCallback cb) throws ManagerCommunicationException
	{
    	impl.originateAsync(originateAction, cb);
	}

    public void originateToApplicationAsync(String channel, String application,
                                            String data, long timeout, CallerId callerId,
                                            Map<String, String> variables, OriginateCallback cb)
            throws ManagerCommunicationException
    {
        impl.originateToApplicationAsync(channel, application, data, timeout, callerId, variables, cb);
    }

    public void originateToApplicationAsync(String channel, String application,
                                            String data, long timeout, OriginateCallback cb)
            throws ManagerCommunicationException
    {
        impl.originateToApplicationAsync(channel, application, data, timeout, cb);
    }

    public void originateToExtensionAsync(String channel, String context,
                                          String exten, int priority, long timeout, CallerId callerId,
                                          Map<String, String> variables, OriginateCallback cb)
            throws ManagerCommunicationException
    {
        impl.originateToExtensionAsync(channel, context, exten, priority, timeout, callerId, variables, cb);
    }

    public void originateToExtensionAsync(String channel, String context,
                                          String exten, int priority, long timeout, OriginateCallback cb)
            throws ManagerCommunicationException
    {
        impl.originateToExtensionAsync(channel, context, exten, priority, timeout, cb);
    }

    public Collection<AsteriskChannel> getChannels() throws ManagerCommunicationException
    {
        return impl.getChannels();
    }

    public AsteriskChannel getChannelByName(String name) throws ManagerCommunicationException
    {
        return impl.getChannelByName(name);
    }

    public AsteriskChannel getChannelById(String id) throws ManagerCommunicationException
    {
        return impl.getChannelById(id);
    }

    public Collection<MeetMeRoom> getMeetMeRooms() throws ManagerCommunicationException
    {
        return impl.getMeetMeRooms();
    }

    public MeetMeRoom getMeetMeRoom(String name) throws ManagerCommunicationException
    {
        return impl.getMeetMeRoom(name);
    }

    public Collection<AsteriskQueue> getQueues() throws ManagerCommunicationException
    {
        return impl.getQueues();
    }

    public String getVersion() throws ManagerCommunicationException
    {
        return impl.getVersion();
    }

    public int[] getVersion(String file) throws ManagerCommunicationException
    {
        return impl.getVersion(file);
    }

    public String getGlobalVariable(String variable) throws ManagerCommunicationException
    {
        return impl.getGlobalVariable(variable);
    }

    public void setGlobalVariable(String variable, String value) throws ManagerCommunicationException
    {
        impl.setGlobalVariable(variable, value);
    }

    public Collection<Voicemailbox> getVoicemailboxes() throws ManagerCommunicationException
    {
        return impl.getVoicemailboxes();
    }

    public List<String> executeCliCommand(String command) throws ManagerCommunicationException
    {
        return impl.executeCliCommand(command);
    }

    public boolean isModuleLoaded(String module) throws ManagerCommunicationException
    {
        return impl.isModuleLoaded(module);
    }

    public ConfigFile getConfig(String filename) throws ManagerCommunicationException
    {
        return impl.getConfig(filename);
    }

    public void reloadAllModules() throws ManagerCommunicationException
    {
        impl.reloadAllModules();
    }

    public void reloadModule(String module) throws ManagerCommunicationException
    {
        impl.reloadModule(module);
    }

    public void unloadModule(String module) throws ManagerCommunicationException
    {
        impl.unloadModule(module);
    }

    public void loadModule(String module) throws ManagerCommunicationException
    {
        impl.loadModule(module);
    }

    public void addAsteriskServerListener(AsteriskServerListener listener) throws ManagerCommunicationException
    {
        impl.addAsteriskServerListener(listener);
    }

    public void removeAsteriskServerListener(AsteriskServerListener listener)
    {
        impl.removeAsteriskServerListener(listener);
    }

    public void shutdown()
    {
        impl.shutdown();
    }

    public Collection<AsteriskAgent> getAgents() throws ManagerCommunicationException
    {
        return impl.getAgents();
    }
}
