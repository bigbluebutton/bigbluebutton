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
package org.asteriskjava.manager;

import java.io.IOException;
import java.net.InetAddress;

import org.asteriskjava.AsteriskVersion;
import org.asteriskjava.manager.action.EventGeneratingAction;
import org.asteriskjava.manager.action.ManagerAction;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.response.ManagerResponse;

/**
 * The main interface to talk to an Asterisk server via the Asterisk Manager
 * API.
 * <p>
 * The ManagerConnection repesents a connection to an Asterisk server and is
 * capable of sending {@link org.asteriskjava.manager.action.ManagerAction}s
 * and receiving {@link org.asteriskjava.manager.response.ManagerResponse}s and
 * {@link org.asteriskjava.manager.event.ManagerEvent}s. It does not add any
 * further functionality but rather provides a Java view to Asterisk's Manager
 * API (freeing you from TCP/IP connection and parsing stuff).
 * <p>
 * It is used as the foundation for higher leveled interfaces like the
 * Asterisk-Java Live.
 * <p>
 * A concrete implementation of this interface can be obtained from a
 * {@link org.asteriskjava.manager.ManagerConnectionFactory}.
 *
 * @see org.asteriskjava.manager.ManagerConnectionFactory
 * @author srt
 * @version $Id: ManagerConnection.java 1155 2008-08-25 20:22:46Z srt $
 */
public interface ManagerConnection
{
    /**
     * Returns the hostname of the connected Asterisk server.
     *
     * @return the hostname of the connected Asterisk server.
     * @since 0.3
     */
    String getHostname();

    /**
     * Returns the Manager API port of the connected Asterisk server.
     *
     * @return the Manager API port of the connected Asterisk server.
     * @since 0.3
     */
    int getPort();

    /**
     * Returns the username to use to connect to the Asterisk server. This is
     * the username specified in Asterisk's <code>manager.conf</code> file.
     *
     * @return the username to use for login
     * @since 0.3
     */
    String getUsername();

    /**
     * Returns the password to use to connect to the Asterisk server. This is
     * the username specified in Asterisk's <code>manager.conf</code> file.
     *
     * @return the password to use for login
     * @since 0.3
     */
    String getPassword();

    /**
     * Returns the version of Asterisk running in the server.
     *
     * @return the Asterisk version running in the server.
     * @since 1.0.0
     */
    AsteriskVersion getVersion();

    /**
     * Returns whether to use SSL.
     * <p>
     * Default is false.
     *
     * @return <code>true</code> if SSL is used for the connection,
     *         <code>false</code> for a plain text connection.
     * @since 0.3
     */
    boolean isSsl();

    /**
     * Returns the local address of the underlying socket connection.
     *
     * @return the local address of the underlying socket connection.
     * @since 1.0.0
     */
    InetAddress getLocalAddress();

    /**
     * Returns the local port of the underlying socket connection.
     *
     * @return the local port of the underlying socket connection.
     * @since 1.0.0
     */
    int getLocalPort();

    /**
     * Returns the remote address of the underlying socket connection.
     *
     * @return the remote address of the underlying socket connection.
     * @since 1.0.0
     */
    InetAddress getRemoteAddress();

    /**
     * Returns the remote port of the underlying socket connection.
     *
     * @return the remote port of the underlying socket connection.
     * @since 1.0.0
     */
    int getRemotePort();

    /**
     * Registers a new user event type.
     * <p>
     * Asterisk allows you to send custom events via the UserEvent application.
     * If you choose to send such events you can extend the abstract class
     * UserEvent provide a name for your new event and optionally add your own
     * attributes. After registering a user event type Asterisk-Java will handle
     * such events the same way it handles the internal events and inform your
     * registered event handlers.
     * <p>
     * Note: If you write your own Asterisk applications that use Asterisk's
     * <code>manager_event()</code> function directly and don't use the
     * channel and uniqueid attributes provided by UserEvent you can also
     * register events that directly subclass {@link ManagerEvent}.
     * <p>
     * The event class must be a concrete class with a default constructor (one
     * that takes no arguments).
     * 
     * @param userEventClass the class representing the user event to register.
     * @throws IllegalArgumentException if userEventClass is not a valid event
     *             class.
     * @see org.asteriskjava.manager.event.UserEvent
     * @see ManagerEvent
     */
    void registerUserEventClass(Class<? extends ManagerEvent> userEventClass);

    /**
     * The timeout to use when connecting the the Asterisk server.
     * <p>
     * Default is 0, that is using Java's built-in default.
     * 
     * @param socketTimeout the timeout value to be used in milliseconds.
     * @see java.net.Socket#connect(java.net.SocketAddress, int)
     * @since 0.2
     */
    public void setSocketTimeout(int socketTimeout);

    /**
     * Connection is dropped (and restarted) if it stales on read longer than
     * the timeout.
     * <p>
     * If you set this property to a non zero value be sure to also use a
     * {@link PingThread} or somthing similar to make sure there is some network
     * traffic, otherwise you will encounter lots of unexpected reconnects. The
     * read timeout should be at least twice the interval set for the
     * PingThread.
     * <p>
     * Default is 0, that is no read timeout.
     * 
     * @param socketReadTimeout the read timeout value to be used in
     *            milliseconds.
     * @see java.net.Socket#setSoTimeout(int)
     * @since 0.3
     */
    void setSocketReadTimeout(int socketReadTimeout);

    /**
     * Logs in to the Asterisk server with the username and password specified
     * when this connection was created.
     * 
     * @throws IllegalStateException if connection is not in state INITIAL or
     *             DISCONNECTED.
     * @throws IOException if the network connection is disrupted.
     * @throws AuthenticationFailedException if the username and/or password are
     *             incorrect or the ChallengeResponse could not be built.
     * @throws TimeoutException if a timeout occurs while waiting for the
     *             protocol identifier. The connection is closed in this case.
     * @see org.asteriskjava.manager.action.LoginAction
     * @see org.asteriskjava.manager.action.ChallengeAction
     */
    void login() throws IllegalStateException, IOException, AuthenticationFailedException, TimeoutException;

    /**
     * Logs in to the Asterisk server with the username and password specified
     * when this connection was created and a given event mask.
     * 
     * @param events the event mask. Set to "on" if all events should be send,
     *            "off" if not events should be sent or a combination of
     *            "system", "call" and "log" (separated by ',') to specify what
     *            kind of events should be sent.
     * @throws IllegalStateException if connection is not in state INITIAL or
     *             DISCONNECTED.
     * @throws IOException if the network connection is disrupted.
     * @throws AuthenticationFailedException if the username and/or password are
     *             incorrect or the ChallengeResponse could not be built.
     * @throws TimeoutException if a timeout occurs while waiting for the
     *             protocol identifier. The connection is closed in this case.
     * @since 0.3
     * @see org.asteriskjava.manager.action.LoginAction
     * @see org.asteriskjava.manager.action.ChallengeAction
     */
    void login(String events) throws IllegalStateException, IOException, AuthenticationFailedException, TimeoutException;

    /**
     * Sends a LogoffAction to the Asterisk server and disconnects.
     * 
     * @throws IllegalStateException if not in state CONNECTED or RECONNECTING.
     * @see org.asteriskjava.manager.action.LogoffAction
     */
    void logoff() throws IllegalStateException;

    /**
     * Returns the protocol identifier, that is a string like "Asterisk Call
     * Manager/1.0".
     * 
     * @return the protocol identifier of the Asterisk Manager Interface in use
     *         if it has already been received; <code>null</code> otherwise
     */
    String getProtocolIdentifier();

    /**
     * Returns the lifecycle status of this connection.
     * 
     * @return the lifecycle status of this connection.
     */
    ManagerConnectionState getState();

    /**
     * Sends a ManagerAction to the Asterisk server and waits for the
     * corresponding ManagerResponse.
     * 
     * @param action the action to send to the Asterisk server
     * @return the corresponding response received from the Asterisk server
     * @throws IOException if the network connection is disrupted.
     * @throws TimeoutException if no response is received within the default
     *             timeout period.
     * @throws IllegalArgumentException if the action is <code>null</code>.
     * @throws IllegalStateException if you are not connected to an Asterisk
     *             server.
     * @see #sendAction(ManagerAction, long)
     * @see #sendAction(ManagerAction, SendActionCallback)
     */
    ManagerResponse sendAction(ManagerAction action) throws IOException, TimeoutException, IllegalArgumentException,
            IllegalStateException;

    /**
     * Sends a ManagerAction to the Asterisk server and waits for the
     * corresponding {@link ManagerResponse}.
     * 
     * @param action the action to send to the Asterisk server
     * @param timeout milliseconds to wait for the response before throwing a
     *            TimeoutException
     * @return the corresponding response received from the Asterisk server
     * @throws IOException if the network connection is disrupted.
     * @throws TimeoutException if no response is received within the given
     *             timeout period.
     * @throws IllegalArgumentException if the action is <code>null</code>.
     * @throws IllegalStateException if you are not connected to an Asterisk
     *             server.
     * @see #sendAction(ManagerAction, SendActionCallback)
     */
    ManagerResponse sendAction(ManagerAction action, long timeout) throws IOException, TimeoutException,
            IllegalArgumentException, IllegalStateException;

    /**
     * Sends a ManagerAction to the Asterisk server and registers a callback
     * handler to be called when the corresponding {@link ManagerResponse} is
     * received. Be very careful that your callbackHandler terminates very
     * quickly and does not do any fancy processing because it is called from
     * the reader thread which is blocked for the time it takes to execute your
     * callbackHandler.
     * 
     * @param action the action to send to the Asterisk server
     * @param callback the callback handler to call when the response is
     *            received or <code>null</code> if you are not interested in
     *            the response
     * @throws IOException if the network connection is disrupted.
     * @throws IllegalArgumentException if the action is <code>null</code>.
     * @throws IllegalStateException if you are not connected to the Asterisk
     *             server.
     */
    void sendAction(ManagerAction action, SendActionCallback callback) throws IOException, IllegalArgumentException,
            IllegalStateException;

    /**
     * Sends an {@link EventGeneratingAction} to the Asterisk server and waits
     * for the corresponding {@link ManagerResponse} and the
     * {@link org.asteriskjava.manager.event.ResponseEvent}s
     * <p>
     * EventGeneratingActions are {@link ManagerAction}s that don't return
     * their response in the corresponding {@link ManagerResponse} but send a
     * series of events that contain the payload.
     * <p>
     * This method will block until the correpsonding action complete event has
     * been received. The action complete event is determined by
     * {@link EventGeneratingAction#getActionCompleteEventClass()}.
     * <p>
     * Examples for EventGeneratingActions are
     * {@link org.asteriskjava.manager.action.StatusAction},
     * {@link org.asteriskjava.manager.action.QueueStatusAction} or
     * {@link org.asteriskjava.manager.action.AgentsAction}.
     * 
     * @param action the action to send to the Asterisk server
     * @return a ResponseEvents that contains the corresponding response and
     *         response events received from the Asterisk server
     * @throws IOException if the network connection is disrupted.
     * @throws EventTimeoutException if no response or not all response events
     *             are received within the given timeout period.
     * @throws IllegalArgumentException if the action is <code>null</code>,
     *             the actionCompleteEventClass property of the action is
     *             <code>null</code> or if actionCompleteEventClass is not a
     *             ResponseEvent.
     * @throws IllegalStateException if you are not connected to an Asterisk
     *             server.
     * @see EventGeneratingAction
     * @see org.asteriskjava.manager.event.ResponseEvent
     * @since 0.2
     */
    ResponseEvents sendEventGeneratingAction(EventGeneratingAction action) throws IOException, EventTimeoutException,
            IllegalArgumentException, IllegalStateException;

    /**
     * Sends an {@link EventGeneratingAction} to the Asterisk server and waits
     * for the corresponding {@link ManagerResponse} and the
     * {@link org.asteriskjava.manager.event.ResponseEvent}s
     * <p>
     * EventGeneratingActions are {@link ManagerAction}s that don't return
     * their response in the corresponding {@link ManagerResponse} but send a
     * series of events that contain the payload.
     * <p>
     * This method will block until the correpsonding action complete event has
     * been received but no longer that timeout seconds. The action complete
     * event is determined by
     * {@link EventGeneratingAction#getActionCompleteEventClass()}.
     * <p>
     * Examples for EventGeneratingActions are the
     * {@link org.asteriskjava.manager.action.StatusAction}, the
     * {@link org.asteriskjava.manager.action.QueueStatusAction} or the
     * {@link org.asteriskjava.manager.action.AgentsAction}.
     * 
     * @param action the action to send to the Asterisk server
     * @param timeout milliseconds to wait for the response and the action
     *            complete event before throwing a TimeoutException
     * @return a ResponseEvents that contains the corresponding response and
     *         response events received from the Asterisk server
     * @throws IOException if the network connection is disrupted.
     * @throws EventTimeoutException if no response or not all response events
     *             are received within the given timeout period.
     * @throws IllegalArgumentException if the action is <code>null</code>,
     *             the actionCompleteEventClass property of the action is
     *             <code>null</code> or if actionCompleteEventClass is not a
     *             ResponseEvent.
     * @throws IllegalStateException if you are not connected to an Asterisk
     *             server.
     * @see EventGeneratingAction
     * @see org.asteriskjava.manager.event.ResponseEvent
     * @since 0.2
     */
    ResponseEvents sendEventGeneratingAction(EventGeneratingAction action, long timeout) throws IOException,
            EventTimeoutException, IllegalArgumentException, IllegalStateException;

    /**
     * Registers an event listener that is called whenever an
     * {@link org.asteriskjava.manager.event.ManagerEvent} is receiced from the
     * Asterisk server.
     * <p>
     * Event listeners are notified about new events in the same order as they
     * were registered.
     * 
     * @param eventListener the listener to call whenever a manager event is
     *            received
     * @see #removeEventListener(ManagerEventListener)
     */
    void addEventListener(ManagerEventListener eventListener);

    /**
     * Unregisters a previously registered event listener.
     * <p>
     * Does nothing if the given event listener hasn't be been regiered before.
     * 
     * @param eventListener the listener to remove
     * @see #addEventListener(ManagerEventListener)
     */
    void removeEventListener(ManagerEventListener eventListener);
}
