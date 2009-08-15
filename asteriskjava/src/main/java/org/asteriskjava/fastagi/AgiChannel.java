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
package org.asteriskjava.fastagi;

import org.asteriskjava.fastagi.command.AgiCommand;
import org.asteriskjava.fastagi.reply.AgiReply;


/**
 * Provides the functionality to send AgiCommands to Asterisk while handling an
 * AgiRequest.
 * <p/>
 * This interface is supposed to be used by AgiScripts for interaction with the
 * Asterisk server.
 *
 * @author srt
 * @version $Id: AgiChannel.java 1274 2009-03-21 11:08:19Z srt $
 */
public interface AgiChannel
{
    /**
     * Returns the name of the channel.
     *
     * @return the name of the channel.
     */
    String getName();

    /**
     * Returns the unqiue id of the channel.
     *
     * @return the unqiue id of the channel.
     */
    String getUniqueId();

    /**
     * Returns the reply received in response to the last command sent to Asterisk.
     *
     * @return the reply received in response to the last command sent to Asterisk
     *         or <code>null</code> if none has yet been received.
     * @since 1.0.0
     */
    AgiReply getLastReply();

    /**
     * Sends a command to asterisk and returns the corresponding reply. The reply is also
     * available through {@link #getLastReply()}.
     *
     * @param command the command to send.
     * @return the reply of the asterisk server containing the return value.
     * @throws AgiException if the command can't be sent to Asterisk (for
     *                      example because the channel has been hung up)
     */
    AgiReply sendCommand(AgiCommand command) throws AgiException;

    /**
     * Answers the channel.
     *
     * @since 0.2
     */
    void answer() throws AgiException;

    /**
     * Hangs the channel up.
     *
     * @since 0.2
     */
    void hangup() throws AgiException;

    /**
     * Cause the channel to automatically hangup at the given number of seconds
     * in the future.
     *
     * @param time the number of seconds before this channel is automatically
     *             hung up.<p>
     *             0 disables the autohangup feature.
     * @since 0.2
     */
    void setAutoHangup(int time) throws AgiException;

    /**
     * Sets the caller id on the current channel.
     *
     * @param callerId the raw caller id to set, for example "John Doe<1234>".
     * @since 0.2
     */
    void setCallerId(String callerId) throws AgiException;

    /**
     * Plays music on hold from the default music on hold class.
     *
     * @since 0.2
     */
    void playMusicOnHold() throws AgiException;

    /**
     * Plays music on hold from the given music on hold class.
     *
     * @param musicOnHoldClass the music on hold class to play music from as
     *                         configures in Asterisk's <code><musiconhold.conf/code>.
     * @since 0.2
     */
    void playMusicOnHold(String musicOnHoldClass) throws AgiException;

    /**
     * Stops playing music on hold.
     *
     * @since 0.2
     */
    void stopMusicOnHold() throws AgiException;

    /**
     * Returns the status of the channel.<p>
     * Return values:
     * <ul>
     * <li>0 Channel is down and available
     * <li>1 Channel is down, but reserved
     * <li>2 Channel is off hook
     * <li>3 Digits (or equivalent) have been dialed
     * <li>4 Line is ringing
     * <li>5 Remote end is ringing
     * <li>6 Line is up
     * <li>7 Line is busy
     * </ul>
     *
     * @return the status of the channel.
     * @since 0.2
     */
    int getChannelStatus() throws AgiException;

    /**
     * Plays the given file and waits for the user to enter DTMF digits until he
     * presses '#'. The user may interrupt the streaming by starting to enter
     * digits.
     *
     * @param file the name of the file to play
     * @return a String containing the DTMF the user entered
     * @since 0.2
     */
    String getData(String file) throws AgiException;

    /**
     * Plays the given file and waits for the user to enter DTMF digits until he
     * presses '#' or the timeout occurs. The user may interrupt the streaming
     * by starting to enter digits.
     *
     * @param file    the name of the file to play
     * @param timeout the timeout in milliseconds to wait for user input.<p>
     *                0 means standard timeout value, -1 means "ludicrous time"
     *                (essentially never times out).
     * @return a String containing the DTMF the user entered
     * @since 0.2
     */
    String getData(String file, long timeout) throws AgiException;

    /**
     * Plays the given file and waits for the user to enter DTMF digits until he
     * presses '#' or the timeout occurs or the maximum number of digits has
     * been entered. The user may interrupt the streaming by starting to enter
     * digits.
     *
     * @param file      the name of the file to play
     * @param timeout   the timeout in milliseconds to wait for user input.<p>
     *                  0 means standard timeout value, -1 means "ludicrous time"
     *                  (essentially never times out).
     * @param maxDigits the maximum number of digits the user is allowed to
     *                  enter
     * @return a String containing the DTMF the user entered
     * @since 0.2
     */
    String getData(String file, long timeout, int maxDigits)
            throws AgiException;

    /**
     * Plays the given file, and waits for the user to press one of the given
     * digits. If none of the esacpe digits is pressed while streaming the file
     * it waits for the default timeout of 5 seconds still waiting for the user
     * to press a digit.
     *
     * @param file         the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that the user is expected to
     *                     press.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char getOption(String file, String escapeDigits) throws AgiException;

    /**
     * Plays the given file, and waits for the user to press one of the given
     * digits. If none of the esacpe digits is pressed while streaming the file
     * it waits for the specified timeout still waiting for the user to press a
     * digit.
     *
     * @param file         the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that the user is expected to
     *                     press.
     * @param timeout      the timeout in milliseconds to wait if none of the defined
     *                     esacpe digits was presses while streaming.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char getOption(String file, String escapeDigits, long timeout)
            throws AgiException;

    /**
     * Executes the given command.
     *
     * @param application the name of the application to execute, for example
     *                    "Dial".
     * @return the return code of the application of -2 if the application was
     *         not found.
     * @since 0.2
     */
    int exec(String application) throws AgiException;

    /**
     * Executes the given command.
     *
     * @param application the name of the application to execute, for example
     *                    "Dial".
     * @param options     the parameters to pass to the application, for example
     *                    "SIP/123".
     * @return the return code of the application of -2 if the application was
     *         not found.
     * @since 0.2
     */
    int exec(String application, String options) throws AgiException;

    /**
     * Sets the context for continuation upon exiting the application.
     *
     * @param context the context for continuation upon exiting the application.
     * @since 0.2
     */
    void setContext(String context) throws AgiException;

    /**
     * Sets the extension for continuation upon exiting the application.
     *
     * @param extension the extension for continuation upon exiting the
     *                  application.
     * @since 0.2
     */
    void setExtension(String extension) throws AgiException;

    /**
     * Sets the priority or label for continuation upon exiting the application.
     *
     * @param priority the priority or label for continuation upon exiting the
     *                 application.
     * @since 0.2
     */
    void setPriority(String priority) throws AgiException;

    /**
     * Plays the given file.
     *
     * @param file name of the file to play.
     * @since 0.2
     */
    void streamFile(String file) throws AgiException;

    /**
     * Plays the given file and allows the user to escape by pressing one of the
     * given digit.
     *
     * @param file         name of the file to play.
     * @param escapeDigits a String containing the DTMF digits that allow the
     *                     user to escape.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char streamFile(String file, String escapeDigits) throws AgiException;

    /**
     * Plays the given file starting at the specified offset and allows the
     * user to escape by pressing one of the given digit.
     *
     * @param file         name of the file to play.
     * @param escapeDigits a String containing the DTMF digits that allow the
     *                     user to escape.
     * @param offset       the offset samples to skip before streaming.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 1.0.0
     */
    char streamFile(String file, String escapeDigits, int offset) throws AgiException;

    /**
     * Says the given digit string.
     *
     * @param digits the digit string to say.
     * @since 0.2
     */
    void sayDigits(String digits) throws AgiException;

    /**
     * Says the given number, returning early if any of the given DTMF number
     * are received on the channel.
     *
     * @param digits       the digit string to say.
     * @param escapeDigits a String containing the DTMF digits that allow the
     *                     user to escape.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayDigits(String digits, String escapeDigits) throws AgiException;

    /**
     * Says the given number.
     *
     * @param number the number to say.
     * @since 0.2
     */
    void sayNumber(String number) throws AgiException;

    /**
     * Says the given number, returning early if any of the given DTMF number
     * are received on the channel.
     *
     * @param number       the number to say.
     * @param escapeDigits a String containing the DTMF digits that allow the
     *                     user to escape.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayNumber(String number, String escapeDigits) throws AgiException;

    /**
     * Says the given character string with phonetics.
     *
     * @param text the text to say.
     * @since 0.2
     */
    void sayPhonetic(String text) throws AgiException;

    /**
     * Says the given character string with phonetics, returning early if any of
     * the given DTMF number are received on the channel.
     *
     * @param text         the text to say.
     * @param escapeDigits a String containing the DTMF digits that allow the
     *                     user to escape.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayPhonetic(String text, String escapeDigits) throws AgiException;

    /**
     * Says the given character string.
     *
     * @param text the text to say.
     * @since 0.2
     */
    void sayAlpha(String text) throws AgiException;

    /**
     * Says the given character string, returning early if any of the given DTMF
     * number are received on the channel.
     *
     * @param text         the text to say.
     * @param escapeDigits a String containing the DTMF digits that allow the
     *                     user to escape.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayAlpha(String text, String escapeDigits) throws AgiException;

    /**
     * Says the given time.
     *
     * @param time the time to say in seconds since 00:00:00 on January 1, 1970.
     * @since 0.2
     */
    void sayTime(long time) throws AgiException;

    /**
     * Says the given time, returning early if any of the given DTMF number are
     * received on the channel.
     *
     * @param time         the time to say in seconds since 00:00:00 on January 1, 1970.
     * @param escapeDigits a String containing the DTMF digits that allow the
     *                     user to escape.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayTime(long time, String escapeDigits) throws AgiException;

    /**
     * Returns the value of the current channel or global variable.<p>
     * Supports functions and builtin variables. To retrieve
     * the caller id you can use <code>getVariable("CALLERID(name)");<code><p>
     * Does not support expression parsing, use {@link #getFullVariable(String)} in those cases.
     *
     * @param name the name of the variable (or function call) to retrieve.
     * @return the value of the given variable or <code>null</code> if not
     *         set.
     * @since 0.2
     */
    String getVariable(String name) throws AgiException;

    /**
     * Sets the value of the current channel or global variable to a new value.<p>
     * Supports functions and builtin variables. To set the caller id
     * you can use <code>setVariable("CALLERID(name)", "John Doe");</code>
     *
     * @param name  the name of the variable (or function call) to set.
     * @param value the new value to set.
     * @since 0.2
     */
    void setVariable(String name, String value) throws AgiException;

    /**
     * Waits up to 'timeout' milliseconds to receive a DTMF digit.
     *
     * @param timeout timeout the milliseconds to wait for the channel to
     *                receive a DTMF digit, -1 will wait forever.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char waitForDigit(int timeout) throws AgiException;

    /**
     * Evaluates a channel expression for the current channel. To extract
     * the caller id use <code>getFullVariable("${CALLERID(name)}");</code>.<p>
     * Available since Asterisk 1.2.
     *
     * @param expr the expression to evaluate.
     * @return the value of the given expression or <code>null</code> if not
     *         set.
     * @see #getVariable(String)
     * @since 0.2
     */
    String getFullVariable(String expr) throws AgiException;

    /**
     * Evaluates a channel expression for the given channel.To extract
     * the caller id of channel use <code>getFullVariable("${CALLERID(name)}", "SIP/john-0085d860");</code>.<p>
     * Available since Asterisk 1.2.
     *
     * @param expr    the the expression to evaluate.
     * @param channel the name of the channel.
     * @return the value of the given expression or <code>null</code> if not
     *         set.
     * @since 0.2
     */
    String getFullVariable(String expr, String channel) throws AgiException;

    /**
     * Says the given time.<p>
     * Available since Asterisk 1.2.
     *
     * @param time the time to say in seconds elapsed since 00:00:00 on January
     *             1, 1970, Coordinated Universal Time (UTC)
     * @since 0.2
     */
    void sayDateTime(long time) throws AgiException;

    /**
     * Says the given time and allows interruption by one of the given escape
     * digits.<p>
     * Available since Asterisk 1.2.
     *
     * @param time         the time to say in seconds elapsed since 00:00:00 on January
     *                     1, 1970, Coordinated Universal Time (UTC)
     * @param escapeDigits the digits that allow the user to interrupt this
     *                     command or <code>null</code> for none.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayDateTime(long time, String escapeDigits) throws AgiException;

    /**
     * Says the given time in the given format and allows interruption by one of
     * the given escape digits.<p>
     * Available since Asterisk 1.2.
     *
     * @param time         the time to say in seconds elapsed since 00:00:00 on January
     *                     1, 1970, Coordinated Universal Time (UTC)
     * @param escapeDigits the digits that allow the user to interrupt this
     *                     command or <code>null</code> for none.
     * @param format       the format the time should be said in
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayDateTime(long time, String escapeDigits, String format) throws AgiException;

    /**
     * Says the given time in the given format and timezone and allows
     * interruption by one of the given escape digits.<p>
     * Available since Asterisk 1.2.
     *
     * @param time         the time to say in seconds elapsed since 00:00:00 on January
     *                     1, 1970, Coordinated Universal Time (UTC)
     * @param escapeDigits the digits that allow the user to interrupt this
     *                     command or <code>null</code> for none.
     * @param format       the format the time should be said in
     * @param timezone     the timezone to use when saying the time, for example
     *                     "UTC" or "Europe/Berlin".
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.2
     */
    char sayDateTime(long time, String escapeDigits, String format,
                     String timezone) throws AgiException;

    /**
     * Retrieves an entry in the Asterisk database for a given family and key.
     *
     * @param family the family of the entry to retrieve.
     * @param key    the key of the entry to retrieve.
     * @return the value of the given family and key or <code>null</code> if there
     *         is no such value.
     * @since 0.3
     */
    String databaseGet(String family, String key) throws AgiException;

    /**
     * Adds or updates an entry in the Asterisk database for a given family, key,
     * and value.
     *
     * @param family the family of the entry to add or update.
     * @param key    the key of the entry to add or update.
     * @param value  the new value of the entry.
     * @since 0.3
     */
    void databasePut(String family, String key, String value) throws AgiException;

    /**
     * Deletes an entry in the Asterisk database for a given family and key.
     *
     * @param family the family of the entry to delete.
     * @param key    the key of the entry to delete.
     * @since 0.3
     */
    void databaseDel(String family, String key) throws AgiException;

    /**
     * Deletes a whole family of entries in the Asterisk database.
     *
     * @param family the family to delete.
     * @since 0.3
     */
    void databaseDelTree(String family) throws AgiException;

    /**
     * Deletes all entries of a given family in the Asterisk database that have a key
     * that starts with a given prefix.
     *
     * @param family  the family of the entries to delete.
     * @param keytree the prefix of the keys of the entries to delete.
     * @since 0.3
     */
    void databaseDelTree(String family, String keytree) throws AgiException;

    /**
     * Sends a message to the Asterisk console via the verbose message system.
     *
     * @param message the message to send.
     * @param level   the verbosity level to use. Must be in [1..4].
     * @since 0.3
     */
    void verbose(String message, int level) throws AgiException;

    /**
     * Record to a file until a given dtmf digit in the sequence is received.
     *
     * @param file         the name of the file to stream, must not include extension.
     * @param format       the format of the file to be recorded, for example "wav".
     * @param escapeDigits contains the digits that allow the user to end
     *                     recording.
     * @param timeout      the maximum record time in milliseconds, or -1 for no
     *                     timeout.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.3
     */
    char recordFile(String file, String format, String escapeDigits,
                    int timeout) throws AgiException;

    /**
     * Record to a file until a given dtmf digit in the sequence is received.
     *
     * @param file         the name of the file to stream, must not include extension.
     * @param format       the format of the file to be recorded, for example "wav".
     * @param escapeDigits contains the digits that allow the user to end
     *                     recording.
     * @param timeout      the maximum record time in milliseconds, or -1 for no
     *                     timeout.
     * @param offset       the offset samples to skip.
     * @param beep         <code>true</code> if a beep should be played before
     *                     recording.
     * @param maxSilence   The amount of silence (in seconds) to allow before
     *                     returning despite the lack of dtmf digits or reaching timeout.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.3
     */
    char recordFile(String file, String format, String escapeDigits,
                    int timeout, int offset, boolean beep, int maxSilence) throws AgiException;

    /**
     * Plays the given file allowing the user to control the streaming by
     * using "#" for forward and "*" for rewind.
     *
     * @param file the name of the file to stream, must not include extension.
     * @since 0.3
     */
    void controlStreamFile(String file) throws AgiException;

    /**
     * Plays the given file allowing the user to control the streaming by
     * using "#" for forward and "*" for rewind. Pressing one of the escape
     * digits stops streaming.
     *
     * @param file         the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *                     this command.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.3
     */
    char controlStreamFile(String file, String escapeDigits) throws AgiException;

    /**
     * Plays the given file allowing the user to control the streaming by
     * using "#" for forward and "*" for rewind. Pressing one of the escape
     * digits stops streaming. The file is played starting at the indicated
     * offset.
     *
     * @param file         the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *                     this command. May be <code>null</code> if you don't want the
     *                     user to interrupt.
     * @param offset       the offset samples to skip before streaming.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.3
     */
    char controlStreamFile(String file, String escapeDigits, int offset) throws AgiException;

    /**
     * Plays the given file allowing the user to control the streaming by
     * using forwardDigit for forward, rewindDigit for rewind and pauseDigit for pause.
     * Pressing one of the escape digits stops streaming.
     * The file is played starting at the indicated
     * offset, use 0 to start at the beginning.
     *
     * @param file         the name of the file to stream, must not include extension.
     * @param escapeDigits contains the digits that allow the user to interrupt
     *                     this command. May be <code>null</code> if you don't want the
     *                     user to interrupt.
     * @param offset       the offset samples to skip before streaming, use 0 to start at the beginning.
     * @param forwardDigit the digit for fast forward.
     * @param rewindDigit  the digit for rewind.
     * @param pauseDigit   the digit for pause and unpause.
     * @return the DTMF digit pressed or 0x0 if none was pressed.
     * @since 0.3
     */
    char controlStreamFile(String file, String escapeDigits,
                           int offset, String forwardDigit, String rewindDigit,
                           String pauseDigit) throws AgiException;

    /**
     * Creates a speech object that uses the default speech engine. The speech object is
     * used by the other speech methods and must be created before they are called.
     *
     * @throws AgiSpeechException if the speech object cannot be created.
     * @see #speechDestroy()
     * @since 1.0.0
     */
    void speechCreate() throws AgiException;

    /**
     * Creates a speech object that uses the given speech engine. The speech object is
     * used by the other speech methods and must be created before they are called.
     *
     * @param engine the name of the speech engine. For example "lumenvox".
     * @throws AgiSpeechException if the speech object cannot be created.
     * @see #speechDestroy()
     * @since 1.0.0
     */
    void speechCreate(String engine) throws AgiException;

    /**
     * Sets the speech engine setting indicated by name to the given value.
     *
     * @param name  the name of the setting to set.
     * @param value the value to set.
     * @throws AgiSpeechException if the setting cannot be set.
     * @since 1.0.0
     */
    void speechSet(String name, String value) throws AgiException;

    /**
     * Destroys the current speech object.
     *
     * @throws AgiSpeechException if the speech engine cannot be destroyed.
     * @see #speechCreate(String)
     * @since 1.0.0
     */
    void speechDestroy() throws AgiException;

    /**
     * Loads the specified grammar. The grammer is then available for calls to {@link #speechActivateGrammar(String)}
     * under the given name. Eplicitly loading a grammer is only required if the grammer has not been defined in the
     * speech engine configuration, e.g. the <code>[grammars]</code> section of <code>lumenvox.conf</code>.
     *
     * @param label the name of the grammar, used for subsequent calls to {@link #speechActivateGrammar(String)},
     *              {@link #speechDeactivateGrammar(String)} and {@link #speechUnloadGrammar(String)}.
     * @param path  the path to the grammar to load.
     * @throws AgiSpeechException if the grammar cannot be loaded.
     * @see #speechUnloadGrammar(String)
     * @see #speechActivateGrammar(String)
     * @since 1.0.0
     */
    void speechLoadGrammar(String label, String path) throws AgiException;

    /**
     * Unloads the specified grammar.
     *
     * @param label the name of the grammar to unload.
     * @throws AgiSpeechException if the grammar cannot be unloaded.
     * @see #speechLoadGrammar(String, String)
     * @since 1.0.0
     */
    void speechUnloadGrammar(String label) throws AgiException;

    /**
     * Activates the specified grammar.
     *
     * @param label the name of the grammar to activate.
     * @throws AgiSpeechException if the grammar cannot be activated.
     * @see #speechDeactivateGrammar(String)
     * @see #speechLoadGrammar(String, String)
     * @since 1.0.0
     */
    void speechActivateGrammar(String label) throws AgiException;

    /**
     * Deactivates the specified grammar.
     *
     * @param label the name to the grammar to deactivate.
     * @throws AgiSpeechException if the grammar cannot be deactivated.
     * @see #speechActivateGrammar(String)
     * @since 1.0.0
     */
    void speechDeactivateGrammar(String label) throws AgiException;

    /**
     * Plays the given prompt while listening for speech and DTMF.
     *
     * @param prompt  the name of the file to stream, must not include extension.
     * @param timeout the timeout in milliseconds to wait for user input.<p>
     *                0 means standard timeout value, -1 means "ludicrous time"
     *                (essentially never times out).
     * @return the recognition result
     * @since 1.0.0
     */
    SpeechRecognitionResult speechRecognize(String prompt, int timeout) throws AgiException;

    /**
     * Plays the given prompt while listening for speech and DTMF.
     *
     * @param prompt  the name of the file to stream, must not include extension.
     * @param timeout the timeout in milliseconds to wait for user input.<p>
     *                0 means standard timeout value, -1 means "ludicrous time"
     *                (essentially never times out).
     * @param offset  the offset samples to skip before streaming, use 0 to start at the beginning.
     * @return the recognition result
     * @since 1.0.0
     */
    SpeechRecognitionResult speechRecognize(String prompt, int timeout, int offset) throws AgiException, AgiSpeechException;

    /**
     * Defines the point in the dialplan where the call will continue when the AGI script
     * returns.<p>
     * This is a shortcut for calling {@link #setContext(String)}, {@link #setExtension(String)}
     * and {@link #setPriority(String)} in series.
     *
     * @param context   the context for continuation upon exiting the application.
     * @param extension the extension for continuation upon exiting the
     *                  application.
     * @param priority  the priority or label for continuation upon exiting the
     *                  application.
     * @see #setContext(String)
     * @see #setExtension(String)
     * @see #setPriority(String)
     * @since 1.0.0
     */
    void continueAt(String context, String extension, String priority) throws AgiException;
}
