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
import org.asteriskjava.fastagi.internal.AgiConnectionHandler;
import org.asteriskjava.fastagi.reply.AgiReply;

/**
 * AgiOperations provides some convinience methods that wrap the various
 * {@link AgiCommand AgiCommands}.
 * 
 * @since 0.3
 * @author srt
 * @version $Id: AgiOperations.java 1271 2009-03-21 03:41:24Z srt $
 */
public class AgiOperations implements AgiChannel
{
    private final AgiChannel channel;

    /**
     * Creates a new instance that operates on the channel attached to the
     * current thread.
     */
    public AgiOperations()
    {
        this.channel = null;
    }

    /**
     * Creates a new instance that operates on the given channel.
     * 
     * @param channel the channel to operate on.
     */
    public AgiOperations(AgiChannel channel)
    {
        this.channel = channel;
    }

    /**
     * Returns the channel to operate on.
     * 
     * @return the channel to operate on.
     * @throws IllegalStateException if no {@link AgiChannel} is bound to the
     *             current channel and no channel has been passed to the
     *             constructor.
     */
    protected AgiChannel getChannel()
    {
        AgiChannel threadBoundChannel;

        if (channel != null)
        {
            return channel;
        }

        threadBoundChannel = AgiConnectionHandler.getChannel();
        if (threadBoundChannel == null)
        {
            throw new IllegalStateException("Trying to send command from an invalid thread");
        }

        return threadBoundChannel;
    }

    /* The following methods simply delegate to #getChannel() */

    public String getName()
    {
        return getChannel().getName();
    }

    public String getUniqueId()
    {
        return getChannel().getUniqueId();
    }

    public AgiReply getLastReply()
    {
        return getChannel().getLastReply();
    }

    public AgiReply sendCommand(AgiCommand command)
            throws AgiException
    {
        return getChannel().sendCommand(command);
    }

    public void answer()
            throws AgiException
    {
        getChannel().answer();
    }

    public void hangup()
            throws AgiException
    {
        getChannel().hangup();
    }

    public void setAutoHangup(int time)
            throws AgiException
    {
        getChannel().setAutoHangup(time);
    }

    public void setCallerId(String callerId)
            throws AgiException
    {
        getChannel().setCallerId(callerId);
    }

    public void playMusicOnHold()
            throws AgiException
    {
        getChannel().playMusicOnHold();
    }

    public void playMusicOnHold(String musicOnHoldClass)
            throws AgiException
    {
        getChannel().playMusicOnHold(musicOnHoldClass);
    }

    public void stopMusicOnHold()
            throws AgiException
    {
        getChannel().stopMusicOnHold();
    }

    public int getChannelStatus()
            throws AgiException
    {
        return getChannel().getChannelStatus();
    }

    public String getData(String file)
            throws AgiException
    {
        return getChannel().getData(file);
    }

    public String getData(String file, long timeout)
            throws AgiException
    {
        return getChannel().getData(file, timeout);
    }

    public String getData(String file, long timeout, int maxDigits)
            throws AgiException
    {
        return getChannel().getData(file, timeout, maxDigits);
    }

    public char getOption(String file, String escapeDigits)
            throws AgiException
    {
        return getChannel().getOption(file, escapeDigits);
    }

    public char getOption(String file, String escapeDigits, long timeout)
            throws AgiException
    {
        return getChannel().getOption(file, escapeDigits, timeout);
    }

    public int exec(String application)
            throws AgiException
    {
        return getChannel().exec(application);
    }

    public int exec(String application, String options)
            throws AgiException
    {
        return getChannel().exec(application, options);
    }

    public void setContext(String context)
            throws AgiException
    {
        getChannel().setContext(context);
    }

    public void setExtension(String extension)
            throws AgiException
    {
        getChannel().setExtension(extension);
    }

    public void setPriority(String priority)
            throws AgiException
    {
        getChannel().setPriority(priority);
    }

    public void streamFile(String file)
            throws AgiException
    {
        getChannel().streamFile(file);
    }

    public char streamFile(String file, String escapeDigits)
            throws AgiException
    {
        return getChannel().streamFile(file, escapeDigits);
    }

    public char streamFile(String file, String escapeDigits, int offset)
            throws AgiException
    {
        return getChannel().streamFile(file, escapeDigits, offset);
    }

    public void sayDigits(String digits)
            throws AgiException
    {
        getChannel().sayDigits(digits);
    }

    public char sayDigits(String digits, String escapeDigits)
            throws AgiException
    {
        return getChannel().sayDigits(digits, escapeDigits);
    }

    public void sayNumber(String number)
            throws AgiException
    {
        getChannel().sayNumber(number);
    }

    public char sayNumber(String number, String escapeDigits)
            throws AgiException
    {
        return getChannel().sayNumber(number, escapeDigits);
    }

    public void sayPhonetic(String text)
            throws AgiException
    {
        getChannel().sayPhonetic(text);
    }

    public char sayPhonetic(String text, String escapeDigits)
            throws AgiException
    {
        return getChannel().sayPhonetic(text, escapeDigits);
    }

    public void sayAlpha(String text)
            throws AgiException
    {
        getChannel().sayAlpha(text);
    }

    public char sayAlpha(String text, String escapeDigits)
            throws AgiException
    {
        return getChannel().sayAlpha(text, escapeDigits);
    }

    public void sayTime(long time)
            throws AgiException
    {
        getChannel().sayTime(time);
    }

    public char sayTime(long time, String escapeDigits)
            throws AgiException
    {
        return getChannel().sayTime(time, escapeDigits);
    }

    public String getVariable(String name)
            throws AgiException
    {
        return getChannel().getVariable(name);
    }

    public void setVariable(String name, String value)
            throws AgiException
    {
        getChannel().setVariable(name, value);
    }

    public char waitForDigit(int timeout)
            throws AgiException
    {
        return getChannel().waitForDigit(timeout);
    }

    public String getFullVariable(String name)
            throws AgiException
    {
        return getChannel().getFullVariable(name);
    }

    public String getFullVariable(String name, String channel)
            throws AgiException
    {
        return getChannel().getFullVariable(name, channel);
    }

    public void sayDateTime(long time)
            throws AgiException
    {
        getChannel().sayDateTime(time);
    }

    public char sayDateTime(long time, String escapeDigits)
            throws AgiException
    {
        return getChannel().sayDateTime(time, escapeDigits);
    }

    public char sayDateTime(long time, String escapeDigits, String format)
            throws AgiException
    {
        return getChannel().sayDateTime(time, escapeDigits, format);
    }

    public char sayDateTime(long time, String escapeDigits, String format, String timezone)
            throws AgiException
    {
        return getChannel().sayDateTime(time, escapeDigits, format, timezone);
    }

    public String databaseGet(String family, String key)
            throws AgiException
    {
        return getChannel().databaseGet(family, key);
    }

    public void databasePut(String family, String key, String value)
            throws AgiException
    {
        getChannel().databasePut(family, key, value);
    }

    public void databaseDel(String family, String key)
            throws AgiException
    {
        getChannel().databaseDel(family, key);
    }

    public void databaseDelTree(String family)
            throws AgiException
    {
        getChannel().databaseDelTree(family);
    }

    public void databaseDelTree(String family, String keytree)
            throws AgiException
    {
        getChannel().databaseDelTree(family, keytree);
    }

    public void verbose(String message, int level)
            throws AgiException
    {
        getChannel().verbose(message, level);
    }

    public char recordFile(String file, String format, String escapeDigits, int timeout)
            throws AgiException
    {
        return getChannel().recordFile(file, format, escapeDigits, timeout);
    }

    public char recordFile(String file, String format, String escapeDigits, int timeout, int offset, boolean beep, int maxSilence)
            throws AgiException
    {
        return getChannel().recordFile(file, format, escapeDigits, timeout, offset, beep, maxSilence);
    }

    public void controlStreamFile(String file)
            throws AgiException
    {
        getChannel().controlStreamFile(file);
    }

    public char controlStreamFile(String file, String escapeDigits)
            throws AgiException
    {
        return getChannel().controlStreamFile(file, escapeDigits);
    }

    public char controlStreamFile(String file, String escapeDigits, int offset)
            throws AgiException
    {
        return getChannel().controlStreamFile(file, escapeDigits, offset);
    }

    public char controlStreamFile(String file, String escapeDigits, int offset, String forwardDigit, String rewindDigit, String pauseDigit)
            throws AgiException
    {
        return getChannel().controlStreamFile(file, escapeDigits, offset, forwardDigit, rewindDigit, pauseDigit);
    }

    public void speechCreate() throws AgiException
    {
        getChannel().speechCreate();
    }

    public void speechCreate(String engine)
            throws AgiException
    {
        getChannel().speechCreate(engine);
    }

    public void speechSet(String name, String value)
            throws AgiException
    {
        getChannel().speechSet(name, value);
    }

    public void speechDestroy()
            throws AgiException
    {
        getChannel().speechDestroy();
    }

    public void speechLoadGrammar(String name, String path)
            throws AgiException
    {
        getChannel().speechLoadGrammar(name, path);
    }

    public void speechUnloadGrammar(String name)
            throws AgiException
    {
        getChannel().speechUnloadGrammar(name);
    }

    public void speechActivateGrammar(String name)
            throws AgiException
    {
        getChannel().speechActivateGrammar(name);
    }

    public void speechDeactivateGrammar(String name)
            throws AgiException
    {
        getChannel().speechDeactivateGrammar(name);
    }

    public SpeechRecognitionResult speechRecognize(String prompt, int timeout)
            throws AgiException
    {
        return getChannel().speechRecognize(prompt, timeout);
    }

    public SpeechRecognitionResult speechRecognize(String prompt, int timeout, int offset)
            throws AgiException
    {
        return getChannel().speechRecognize(prompt, timeout, offset);
    }

    public void continueAt(String context, String extension, String priority) throws AgiException
    {
        getChannel().continueAt(context, extension, priority);
    }
}
