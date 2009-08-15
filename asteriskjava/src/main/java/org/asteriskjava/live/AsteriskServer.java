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

import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.action.OriginateAction;
import org.asteriskjava.config.ConfigFile;

/**
 * The AsteriskServer is built on top of the
 * {@link org.asteriskjava.manager.ManagerConnection} and is an attempt to
 * simplify interaction with Asterisk by abstracting the interface. <p/> You
 * will certainly have less freedom using AsteriskServer but it will make life
 * easier for easy things (like originating a call or getting a list of open
 * channels). <p/> AsteriskServer is still in an early state of development. So,
 * when using AsteriskServer be aware that it might change in the future.
 * 
 * @author srt
 * @version $Id: AsteriskServer.java 1137 2008-08-18 14:05:05Z srt $
 */
public interface AsteriskServer
{
    /**
     * Returns the underlying ManagerConnection.
     * 
     * @return the underlying ManagerConnection.
     */
    ManagerConnection getManagerConnection();

    /**
     * Generates an outgoing channel.
     * @param originateAction the action that contains parameters for the originate
     * @return the generated channel
     * @throws NoSuchChannelException if the channel is not available on the
     *         Asterisk server, for example because you used "SIP/1310" and 1310
     *         is not a valid SIP user, the SIP channel module hasn't been
     *         loaded or the SIP or IAX peer is not registered currently.
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    public AsteriskChannel originate(OriginateAction originateAction) throws ManagerCommunicationException, NoSuchChannelException;
    
    /**
     * Asynchronously generates an outgoing channel.
     * @param originateAction the action that contains parameters for the originate
     * @param cb callback to inform about the result
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    public void originateAsync(OriginateAction originateAction, OriginateCallback cb) throws ManagerCommunicationException;
    
    /**
     * Generates an outgoing channel to a dialplan entry (extension, context,
     * priority).
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param context context to connect to
     * @param exten extension to connect to
     * @param priority priority to connect to
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @return the generated channel
     * @throws NoSuchChannelException if the channel is not available on the
     *         Asterisk server, for example because you used "SIP/1310" and 1310
     *         is not a valid SIP user, the SIP channel module hasn't been
     *         loaded or the SIP or IAX peer is not registered currently.
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    AsteriskChannel originateToExtension(String channel, String context,
	    String exten, int priority, long timeout)
	    throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Generates an outgoing channel to a dialplan entry (extension, context,
     * priority) and sets an optional map of channel variables.
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param context context to connect to
     * @param exten extension to connect to
     * @param priority priority to connect to
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @param callerId callerId to use for the outgoing channel, may be
     *        <code>null</code>.
     * @param variables channel variables to set, may be <code>null</code>.
     * @return the generated channel
     * @throws NoSuchChannelException if the channel is not available on the
     *         Asterisk server, for example because you used "SIP/1310" and 1310
     *         is not a valid SIP user, the SIP channel module hasn't been
     *         loaded or the SIP or IAX peer is not registered currently.
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    AsteriskChannel originateToExtension(String channel, String context,
	    String exten, int priority, long timeout, CallerId callerId,
	    Map<String, String> variables)
	    throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Generates an outgoing channel to an application.
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param application application to connect to, for example "MeetMe"
     * @param data data to pass to the application, for example "1000|d", may be
     *        <code>null</code>.
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @return the generated channel
     * @throws NoSuchChannelException if the channel is not available on the
     *         Asterisk server, for example because you used "SIP/1310" and 1310
     *         is not a valid SIP user, the SIP channel module hasn't been
     *         loaded or the SIP or IAX peer is not registered currently.
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    AsteriskChannel originateToApplication(String channel, String application,
	    String data, long timeout) throws ManagerCommunicationException,
	    NoSuchChannelException;

    /**
     * Generates an outgoing channel to an application and sets an optional map
     * of channel variables.
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param application application to connect to, for example "MeetMe"
     * @param data data to pass to the application, for example "1000|d", may be
     *        <code>null</code>.
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @param callerId callerId to use for the outgoing channel, may be
     *        <code>null</code>.
     * @param variables channel variables to set, may be <code>null</code>.
     * @return the generated channel
     * @throws NoSuchChannelException if the channel is not available on the
     *         Asterisk server, for example because you used "SIP/1310" and 1310
     *         is not a valid SIP user, the SIP channel module hasn't been
     *         loaded or the SIP or IAX peer is not registered currently.
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    AsteriskChannel originateToApplication(String channel, String application,
	    String data, long timeout, CallerId callerId,
	    Map<String, String> variables)
	    throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Asynchronously generates an outgoing channel to a dialplan entry
     * (extension, context, priority).
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param context context to connect to
     * @param exten extension to connect to
     * @param priority priority to connect to
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @param callback callback to inform about the result
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    void originateToExtensionAsync(String channel, String context,
	    String exten, int priority, long timeout, OriginateCallback callback)
	    throws ManagerCommunicationException;

    /**
     * Asynchronously generates an outgoing channel to a dialplan entry
     * (extension, context, priority) and sets an optional map of channel
     * variables.
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param context context to connect to
     * @param exten extension to connect to
     * @param priority priority to connect to
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @param callerId callerId to use for the outgoing channel, may be
     *        <code>null</code>.
     * @param variables channel variables to set, may be <code>null</code>.
     * @param callback callback to inform about the result
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    void originateToExtensionAsync(String channel, String context,
	    String exten, int priority, long timeout, CallerId callerId,
	    Map<String, String> variables, OriginateCallback callback)
	    throws ManagerCommunicationException;

    /**
     * Asynchronously generates an outgoing channel to an application.
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param application application to connect to, for example "MeetMe"
     * @param data data to pass to the application, for example "1000|d", may be
     *        <code>null</code>.
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @param callback callback to inform about the result
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    void originateToApplicationAsync(String channel, String application,
	    String data, long timeout, OriginateCallback callback)
	    throws ManagerCommunicationException;

    /**
     * Asynchronously generates an outgoing channel to an application and sets
     * an optional map of channel variables.
     * 
     * @param channel channel name to call, for example "SIP/1310".
     * @param application application to connect to, for example "MeetMe"
     * @param data data to pass to the application, for example "1000|d", may be
     *        <code>null</code>.
     * @param timeout how long to wait for the channel to be answered before its
     *        considered to have failed (in ms)
     * @param callerId callerId to use for the outgoing channel, may be
     *        <code>null</code>.
     * @param variables channel variables to set, may be <code>null</code>.
     * @param callback callback to inform about the result
     * @throws ManagerCommunicationException if the originate action cannot be
     *         sent to Asterisk
     */
    void originateToApplicationAsync(String channel, String application,
	    String data, long timeout, CallerId callerId,
	    Map<String, String> variables, OriginateCallback callback)
	    throws ManagerCommunicationException;

    /**
     * Returns the active channels of the Asterisk server.
     * 
     * @return a Collection of active channels.
     * @throws ManagerCommunicationException if there is a problem communication
     *         with Asterisk
     */
    Collection<AsteriskChannel> getChannels()
	    throws ManagerCommunicationException;

    /**
     * Returns a channel by its name.
     * 
     * @param name name of the channel to return
     * @return the channel with the given name or <code>null</code> if there
     *         is no such channel.
     * @throws ManagerCommunicationException if there is a problem communication
     *         with Asterisk
     */
    AsteriskChannel getChannelByName(String name)
	    throws ManagerCommunicationException;

    /**
     * Returns a channel by its unique id.
     * 
     * @param id the unique id of the channel to return
     * @return the channel with the given unique id or <code>null</code> if
     *         there is no such channel.
     * @throws ManagerCommunicationException if there is a problem communication
     *         with Asterisk
     */
    AsteriskChannel getChannelById(String id)
	    throws ManagerCommunicationException;

    /**
     * Returns the acitve MeetMe rooms on the Asterisk server.
     * 
     * @return a Collection of MeetMeRooms
     * @throws ManagerCommunicationException if there is a problem communication
     *         with Asterisk
     */
    Collection<MeetMeRoom> getMeetMeRooms()
	    throws ManagerCommunicationException;

    /**
     * Returns the MeetMe room with the given number, if the room does not yet
     * exist a new {@link MeetMeRoom} object is created.
     * 
     * @param roomNumber the number of the room to return
     * @return the MeetMe room with the given number.
     * @throws ManagerCommunicationException if there is a problem communication
     *         with Asterisk
     */
    MeetMeRoom getMeetMeRoom(String roomNumber)
	    throws ManagerCommunicationException;

    /**
     * Returns the queues served by the Asterisk server.
     * 
     * @return a Collection of queues.
     * @throws ManagerCommunicationException if there is a problem communication
     *         with Asterisk
     */
    Collection<AsteriskQueue> getQueues() throws ManagerCommunicationException;

    /**
     * Return the agents, registered at Asterisk server. (Consider remarks for
     * {@link AsteriskAgent})
     * 
     * @return a Collection of agents
     * @throws ManagerCommunicationException if there is a problem communication
     *         with Asterisk
     */
    Collection<AsteriskAgent> getAgents() throws ManagerCommunicationException;

    /**
     * Returns the exact version string of this Asterisk server. <p/> This
     * typically looks like "Asterisk 1.2.9.1-BRIstuffed-0.3.0-PRE-1q built by
     * root @ pbx0 on a i686 running Linux on 2006-06-20 20:21:30 UTC".
     * 
     * @return the version of this Asterisk server
     * @throws ManagerCommunicationException if the version cannot be retrieved
     *         from Asterisk
     * @since 0.2
     */
    String getVersion() throws ManagerCommunicationException;

    /**
     * Returns the CVS revision of a given source file of this Asterisk server.
     * <p/> For example getVersion("app_meetme.c") may return {1, 102} for CVS
     * revision "1.102". <p/> Note that this feature is not available with
     * Asterisk 1.0.x. <p/> You can use this feature if you need to write
     * applications that behave different depending on specific modules being
     * available in a specific version or not.
     * 
     * @param file the file for which to get the version like "app_meetme.c"
     * @return the CVS revision of the file, or <code>null</code> if that file
     *         is not part of the Asterisk instance you are connected to (maybe
     *         due to a module that provides it has not been loaded) or if you
     *         are connected to an Astersion 1.0.x
     * @throws ManagerCommunicationException if the version cannot be retrieved
     *         from Asterisk
     * @since 0.2
     */
    int[] getVersion(String file) throws ManagerCommunicationException;

    /**
     * Returns the value of the given global variable.
     * 
     * @param variable the name of the global variable to return.
     * @return the value of the global variable or <code>null</code> if it is
     *         not set.
     * @throws ManagerCommunicationException if the get variable action cannot
     *         be sent to Asterisk.
     * @since 0.3
     */
    String getGlobalVariable(String variable)
	    throws ManagerCommunicationException;

    /**
     * Sets the value of the given global variable.
     * 
     * @param variable the name of the global variable to set.
     * @param value the value of the global variable to set.
     * @throws ManagerCommunicationException if the set variable action cannot
     *         be sent to Asterisk.
     * @since 0.3
     */
    void setGlobalVariable(String variable, String value)
	    throws ManagerCommunicationException;

    /**
     * Returns a collection of all voicemailboxes configured for this Asterisk
     * server with the number of new and old messages they contain.
     * 
     * @return a collection of all voicemailboxes configured for this Asterisk
     *         server
     * @throws ManagerCommunicationException if the voicemailboxes can't be
     *         retrieved.
     * @since 0.3
     */
    Collection<Voicemailbox> getVoicemailboxes() throws ManagerCommunicationException;

    /**
     * Executes a command line interface (CLI) command.
     * 
     * @param command the command to execute, for example "sip show peers".
     * @return a List containing strings representing the lines returned by the
     *         CLI command.
     * @throws ManagerCommunicationException if the command can't be executed.
     * @see org.asteriskjava.manager.action.CommandAction
     * @since 0.3
     */
    List<String> executeCliCommand(String command) throws ManagerCommunicationException;

    /**
     * Checks whether a module is currently loaded.<p>
     * Available since Asterisk 1.6
     *
     * @param module name of the module to load (with out without the ".so" extension).
     * @return <code>true</code> if the module is currently loaded, <code>false</code> otherwise.
     * @throws ManagerCommunicationException if the module can't be checked.
     */
    boolean isModuleLoaded(String module) throws ManagerCommunicationException;

    /**
     * Loads a module or subsystem<p>
     * Available since Asterisk 1.6
     *
     * @param module name of the module to load (including ".so" extension) or subsystem name.
     * @throws ManagerCommunicationException if the module cannot be loaded.
     * @since 1.0.0
     */
    void loadModule(String module) throws ManagerCommunicationException;

    /**
     * Unloads a module or subsystem.<p>
     * Available since Asterisk 1.6
     *
     * @param module name of the module to unload (including ".so" extension) or subsystem name.
     * @throws ManagerCommunicationException if the module cannot be unloaded.
     * @since 1.0.0
     */
    void unloadModule(String module) throws ManagerCommunicationException;

    /**
     * Reloads a module or subsystem.<p>
     * Available since Asterisk 1.6
     *
     * @param module name of the module to reload (including ".so" extension) or subsystem name.
     * @throws ManagerCommunicationException if the module cannot be reloaded.
     * @since 1.0.0
     */
    void reloadModule(String module) throws ManagerCommunicationException;

    /**
     * Reloads all currently loaded modules.<p>
     * Available since Asterisk 1.6
     *
     * @throws ManagerCommunicationException if the modules cannot be reloaded.
     * @since 1.0.0
     */
    void reloadAllModules() throws ManagerCommunicationException;

    /**
     * Reads the given Asterisk configuration file.
     *
     * @param filename the filename, for example "voicemail.conf".
     * @return the configuration file.
     * @throws ManagerCommunicationException if the command can't be executed.
     */
    ConfigFile getConfig(String filename) throws ManagerCommunicationException;

    /**
     * Adds a listener to this AsteriskServer.<p/>
     * If this server is not yet connected it will be implicitly connected.
     * 
     * @param listener the listener to add.
     * @throws ManagerCommunicationException if the server is not yet connected
     *         and the connection or initialization fails.
     */
    void addAsteriskServerListener(AsteriskServerListener listener) throws ManagerCommunicationException;

    /**
     * Removes a listener from this Asterisk server.
     * 
     * @param listener the listener to remove.
     */
    void removeAsteriskServerListener(AsteriskServerListener listener);

    /**
     * Closes the connection to this server.
     */
    void shutdown();

	/**
	 * Opens the connection to this server.
     * 
	 * @throws ManagerCommunicationException if login fails
	 */
	void initialize() throws ManagerCommunicationException;
}
