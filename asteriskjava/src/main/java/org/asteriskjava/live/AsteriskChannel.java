/*
 * Copyright 2004-2006 Stefan Reuter
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

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Represents an Asterisk channel.
 * <p>
 * PropertyChangeEvents are fired for the following properties:
 * <ul>
 * <li>id
 * <li>name
 * <li>callerId
 * <li>state
 * <li>account
 * <li>currentExtension
 * <li>callDetailRecord
 * <li>dialedChannel
 * <li>dialingChannel
 * <li>linkedChannel
 * <li>meetMeUser
 * <li>queueEntry
 * <li>parkedAt
 * </ul>
 * 
 * @author srt
 */
public interface AsteriskChannel extends LiveObject
{
    String PROPERTY_ID = "id";
    String PROPERTY_NAME = "name";
    String PROPERTY_CALLER_ID = "callerId";
    String PROPERTY_STATE = "state";
    String PROPERTY_ACCOUNT = "account";
    String PROPERTY_CURRENT_EXTENSION = "currentExtension";
    String PROPERTY_CALL_DETAIL_RECORD = "callDetailRecord";
    String PROPERTY_DIALED_CHANNEL = "dialedChannel";
    String PROPERTY_DIALING_CHANNEL = "dialingChannel";
    String PROPERTY_LINKED_CHANNEL = "linkedChannel";
    String PROPERTY_MEET_ME_USER = "meetMeUser";
    String PROPERTY_QUEUE_ENTRY = "queueEntry";
    String PROPERTY_PARKED_AT = "parkedAt";

    String VARIABLE_MONITOR_EXEC = "MONITOR_EXEC";
    String VARIABLE_MONITOR_EXEC_ARGS = "MONITOR_EXEC_ARGS";

    /**
     * Returns the unique id of this channel, for example "1099015093.165".
     * 
     * @return the unique id of this channel.
     */
    String getId();

    /**
     * Returns the name of this channel, for example "SIP/1310-20da".
     * 
     * @return the name of this channel.
     */
    String getName();

    /**
     * Returns the caller id of this channel.
     * 
     * @return the caller id of this channel.
     */
    CallerId getCallerId();

    /**
     * Returns the state of this channel.
     * 
     * @return the state of this channel.
     */
    ChannelState getState();

    /**
     * Checks if this channel was at least once in the given state.
     * <p>
     * For example you can use this method the check if this channel had been
     * answered:
     * 
     * <pre>
     * boolean answered = channel.wasInState(ChannelState.UP);
     * </pre>
     * 
     * @param state the state to look for.
     * @return <code>true</code> if this channel was at least once in the
     *         given state; <code>false</code> otherwise.
     * @since 0.3
     */
    boolean wasInState(ChannelState state);

    /**
     * Checks if this channel was busy.
     * 
     * @return <code>true</code> if this channel was busy; <code>false</code>
     *         otherwise.
     * @since 0.3
     */
    boolean wasBusy();

    /**
     * Returns the account code used to bill this channel.
     * 
     * @return the account code used to bill this channel.
     */
    String getAccount();

    /**
     * Returns the last visited dialplan entry.
     * 
     * @return the last visited dialplan entry.
     * @since 0.2
     */
    Extension getCurrentExtension();

    /**
     * Returns the first visited dialplan entry.
     * 
     * @return the first visited dialplan entry.
     * @since 0.2
     */
    Extension getFirstExtension();

    /**
     * Returns a list of all visited dialplan entries.
     * 
     * @return a list of all visited dialplan entries.
     * @since 0.3
     */
    List<ExtensionHistoryEntry> getExtensionHistory();

    /**
     * Returns the date this channel has been created.
     * <p>
     * This property is immutable.
     * 
     * @return the date this channel has been created.
     */
    Date getDateOfCreation();

    /**
     * Returns the date this channel has left the Asterisk server for example by
     * a hangup.
     * 
     * @return the date this channel has left the Asterisk server or
     *         <code>null</code> if this channel is still active.
     * @since 0.3
     */
    Date getDateOfRemoval();

    /**
     * Returns the reason for hangup.
     * 
     * @return the reason for hangup or <code>null</code> if the channel has
     *         not yet been hung up or no hangup cause is available for this
     *         type of channel.
     * @since 0.3
     */
    HangupCause getHangupCause();

    /**
     * Returns a textual representation of the reason for hangup.
     * 
     * @return the textual representation of the reason for hangup or
     *         <code>null</code> if the channel has not yet been hung up or no
     *         hangup cause is available for this type of channel. If no hangup
     *         cause is available an empty String may be returned, too.
     * @since 0.3
     */
    String getHangupCauseText();

    /**
     * Returns the call detail record for this channel.
     * 
     * @return the call detail record for this channel or <code>null</code> if
     *         none has (yet) been received.
     */
    CallDetailRecord getCallDetailRecord();

    /**
     * Returns the channel that has been dialed by this channel most recently,
     * this is the destination channel that was created because this channel
     * dialed it.
     * 
     * @return the channel that has been dialed by this channel or
     *         <code>null</code> if none has been dialed.
     */
    AsteriskChannel getDialedChannel();

    /**
     * Returns a list of all channels that have been dialed by this channel.
     * 
     * @return a list of all channels that have been dialed by this channel.
     */
    List<DialedChannelHistoryEntry> getDialedChannelHistory();

    /**
     * Returns the channel that was dialing this channel, this is the source
     * channel that created this channel by dialing it.
     * 
     * @return the channel that was dialing this channel or <code>null</code>
     *         if none was dialing.
     */
    AsteriskChannel getDialingChannel();

    /**
     * Returns the channel this channel is currently bridged with, if any.
     * 
     * @return the channel this channel is bridged with, or <code>null</code>
     *         if this channel is currently not bridged to another channel.
     */
    AsteriskChannel getLinkedChannel();

    /**
     * Returns a list of all channels this channel was briged with.
     * 
     * @return a list of all channels this channel was briged with.
     */
    List<LinkedChannelHistoryEntry> getLinkedChannelHistory();

    /**
     * Indicates if this channel was linked to another channel at least once.
     * 
     * @return <code>true</code> if this channel was linked to another channel
     *         at least once, <code>false</code> otherwise.
     * @since 0.2
     */
    boolean wasLinked();

    /**
     * Returns the MeetMeUser associated with this channel if this channel is
     * currently taking part in a MeetMe conference.
     * 
     * @return the MeetMeUser associated with this channel or <code>null</code>
     *         if this channel is currently not taking part in a MeetMe
     *         conference.
     */
    MeetMeUser getMeetMeUser();

    /**
     * Returns the queue entry associated with this channel.
     *
     * @return the queue entry associated with this channel if any, <code>null</code> otherwise.
     */
    AsteriskQueueEntry getQueueEntry();
    
    /**
     * Return the extension to dial to pickup he channel of the parking if the channel is
     * currently parked.
     *
     * @return the Extension to dial, <code>null</code> if not currently parked.
     */
    Extension getParkedAt();

    /**
     * Returns the channel variables as received by
     * {@link org.asteriskjava.manager.event.VarSetEvent VarSetEvents}.<p>
     * Available since Asterisk 1.6.
     *
     * @return the channel variables.
     * @since 1.0.0
     */
    Map<String, String> getVariables();

    /* Actions */
    
    /**
     * Hangs up this channel.
     * 
     * @throws ManagerCommunicationException if the hangup action cannot be sent
     *             to Asterisk.
     * @throws NoSuchChannelException if this channel had already been hung up
     *             before the hangup was sent.
     * @since 0.3
     */
    void hangup() throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Hangs up this channel using a given cause code. The cause code is mainly
     * used for Zap PRI channels where it makes Asterisk send a PRI DISCONNECT
     * message with the set CAUSE element to the switch.
     * 
     * @param cause the cause code to send.
     * @throws ManagerCommunicationException if the hangup action cannot be sent
     *             to Asterisk.
     * @throws NoSuchChannelException if this channel had already been hung up
     *             before the hangup was sent.
     * @since 0.3
     */
    void hangup(HangupCause cause) throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Sets the absolute maximum amount of time permitted for a call on a given
     * channel, it hangs up the channel after this time.
     * <p>
     * Time is counted from when you call setAbsoluteTimeout, not from the
     * beginning of the call.
     * 
     * @param seconds maximum duration of the call in seconds, 0 for unlimited
     *            call length.
     * @throws ManagerCommunicationException if the absolute timeout action
     *             cannot be sent to Asterisk.
     * @throws NoSuchChannelException if this channel had already been hung up
     *             before the absolute timeout was set.
     * @since 0.3
     */
    //TODO exception when setting it to 0: NoSuchChannelException: Channel 
    // 'SIP/248-0a02fcd0' is not available: No timeout specified
    void setAbsoluteTimeout(int seconds) throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Redirects this channel to a new extension.
     * <p>
     * If this channel is linked to another channel, the linked channel is hung
     * up.
     * 
     * @param context the destination context.
     * @param exten the destination extension.
     * @param priority the destination priority.
     * @throws ManagerCommunicationException if the redirect action cannot be
     *             sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             the redirect was sent.
     * @since 0.3
     */
    void redirect(String context, String exten, int priority) throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Redirects this channel and the channel this channel is linked to to a new
     * extension.
     * <p>
     * If this channel is not linked to another channel only this channel is
     * redirected.
     * 
     * @param context the destination context.
     * @param exten the destination extension.
     * @param priority the destination priority.
     * @throws ManagerCommunicationException if the redirect action cannot be
     *             sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             the redirect was sent.
     * @since 0.3
     */
    void redirectBothLegs(String context, String exten, int priority) throws ManagerCommunicationException,
            NoSuchChannelException;

    /**
     * Returns the value of the given channel variable.
     * <p>
     * Currently Asterisk does not support the retrieval of built-in variables
     * like EXTEN or CALLERIDNUM but only custom variables set via Asterisk's
     * Set command or via {@link #setVariable(String, String)}.
     * 
     * @param variable the name of the channel variable to return.
     * @return the value of the channel variable or <code>null</code> if it is
     *         not set.
     * @throws ManagerCommunicationException if the get variable action cannot
     *             be sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             the variable was requested.
     * @since 0.3
     */
    String getVariable(String variable) throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Sets the value of the given channel variable.
     * 
     * @param variable the name of the channel variable to set.
     * @param value the value of the channel variable to set.
     * @throws ManagerCommunicationException if the set variable action cannot
     *             be sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             the variable was set.
     * @since 0.3
     */
    void setVariable(String variable, String value) throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Plays the given DTMF digit on this channel.
     * <p>
     * Available since Asterisk 1.2.8
     * 
     * @param digit the DTMF digit to play.
     * @throws ManagerCommunicationException if the play DTMF action cannot be
     *             sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             the DTMF digit was set.
     * @throws IllegalArgumentException if the digit is <code>null</code>.
     * @since 0.3
     */
    void playDtmf(String digit) throws ManagerCommunicationException, NoSuchChannelException, IllegalArgumentException;

    /**
     * Starts monitoring (recording) this channel.
     * <p>
     * The format of the files is "wav", they are not mixed.
     * <p>
     * The files are called <i>filename</i>-in.wav and <i>filename</i>-out.wav.
     * 
     * @param filename the basename of the files created in the monitor spool
     *            directory. If <code>null</code> the channel name (with
     *            slashed replaced by dashes) is used.
     * @throws ManagerCommunicationException if the monitor action cannot be
     *             sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             starting monitoring.
     * @see #stopMonitoring()
     * @see #pauseMonitoring()
     * @since 0.3
     */
    void startMonitoring(String filename) throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Starts monitoring (recording) this channel using the given audio format.
     * <p>
     * The files are not mixed.
     * <p>
     * The files are called <i>filename</i>-in.<i>format</i> and <i>filename</i>-out.<i>format</i>.
     * 
     * @param filename the basename of the files created in the monitor spool
     *            directory. If <code>null</code> the channel name (with
     *            slashed replaced by dashes) is used.
     * @param format the audio recording format. If <code>null</code> wav is
     *            used.
     * @throws ManagerCommunicationException if the monitor action cannot be
     *             sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             starting monitoring.
     * @see #stopMonitoring()
     * @see #pauseMonitoring()
     * @since 0.3
     */
    void startMonitoring(String filename, String format) throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Starts monitoring (recording) this channel using the given audio format
     * and optionally mixing input and output data after recording is finished.
     * <p>
     * Mixing is done by soxmix by default (which has to be installed on your
     * Asterisk server). You can use your own script by setting the variable
     * <code>MONITOR_EXEC</code> to your custom script before starting
     * monitoring the channel. Your script is then called with 3 arguments, the
     * two leg files and a target mixed file name which is the same as the leg
     * file names without the in/out designator, i.e. <i>filename</i>.<i>format</i>.<br>
     * The two leg files are only removed by Asterisk if
     * <code>MONITOR_EXEC</code> is not set. If you use a custom script and
     * want to remove them, just let your script do this.<br>
     * To pass additional arguments to your script you can set the variable
     * <code>MONITOR_EXEC_ARGS</code> to a list of arguments (separated by
     * spaces).
     * <p>
     * Example:
     * 
     * <pre>
     *      AsteriskChannel c;
     *      
     *      [...]
     *      c.setVariable(AsteriskChannel.VARIABLE_MONITOR_EXEC, &quot;/usr/local/bin/2wav2mp3&quot;);
     *      c.startMonitoring(&quot;my-recording&quot;, &quot;wav&quot;, true);
     * </pre>
     * 
     * Side note: <tt>2wav2mp3</tt> is a nice script by Dietmar Zlabinger to mix the two
     * legs to a stero mp3 file, for details see
     * <a href="http://www.voip-info.org/wiki/view/Monitor+stereo-example">voip-info.org</a>.
     * 
     * @param filename the basename of the file(s) created in the monitor spool
     *            directory. If <code>null</code> the channel name (with
     *            slashed replaced by dashes) is used.
     * @param format the audio recording format. If <code>null</code> wav is
     *            used.
     * @param mix <code>true</code> to mix input and output data together
     *            after recording is finished, <code>false</code> to not mix
     *            them.
     * @throws ManagerCommunicationException if the monitor action cannot be
     *             sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             starting monitoring.
     * @see #VARIABLE_MONITOR_EXEC
     * @see #VARIABLE_MONITOR_EXEC_ARGS
     * @see #stopMonitoring()
     * @see #pauseMonitoring()
     * @since 0.3
     */
    void startMonitoring(String filename, String format, boolean mix) throws ManagerCommunicationException,
            NoSuchChannelException;

    /**
     * Changes the filename of a previously started monitoring.
     * <p>
     * If the channel exists but is not currently monitored your request is
     * ignored and a warning message is written to Asterisk's CLI.
     * <p>
     * Use with care, this doesn't always seem to work.
     * 
     * @param filename the basename of the file(s) created in the monitor spool
     *            directory.
     * @throws ManagerCommunicationException if the change monitor action cannot
     *             be sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             changing monitoring.
     * @throws IllegalArgumentException if filename is <code>null</code>.
     * @see #stopMonitoring()
     * @see #pauseMonitoring()
     * @since 0.3
     */
    void changeMonitoring(String filename) throws ManagerCommunicationException, NoSuchChannelException,
            IllegalArgumentException;

    /**
     * Stops monitoring this channel.
     * <p>
     * If the channel exists but is not currently monitored your request is
     * ignored.
     * 
     * @throws ManagerCommunicationException if the stop monitor action cannot
     *             be sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             stopping monitoring.
     * @see #startMonitoring(String)
     * @see #startMonitoring(String, String)
     * @see #startMonitoring(String, String, boolean)
     * @since 0.3
     */
    void stopMonitoring() throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Temporarily stops monitoring this channel.
     * <p>
     * If the channel exists but is not currently monitored your request is
     * ignored.
     * <p>
     * This method is available since Asterisk 1.4.
     * 
     * @throws ManagerCommunicationException if the pause monitor action cannot
     *             be sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             temporarily stopping monitoring.
     * @see #unpauseMonitoring()
     * @since 0.3
     */
    void pauseMonitoring() throws ManagerCommunicationException, NoSuchChannelException;

    /**
     * Re-enables monitoring this channel after calling
     * {@link #pauseMonitoring()}.
     * <p>
     * If the channel exists but monitoring has not been paused your request is
     * ignored.
     * <p>
     * This method is available since Asterisk 1.4.
     * 
     * @throws ManagerCommunicationException if the unpasue monitor action
     *             cannot be sent to Asterisk.
     * @throws NoSuchChannelException if this channel had been hung up before
     *             re-enabling monitoring.
     * @see #pauseMonitoring()
     * @since 0.3
     */
    void unpauseMonitoring() throws ManagerCommunicationException, NoSuchChannelException;
}
