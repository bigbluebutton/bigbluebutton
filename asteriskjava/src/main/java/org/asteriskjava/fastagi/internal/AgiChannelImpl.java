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
package org.asteriskjava.fastagi.internal;

import org.asteriskjava.fastagi.*;
import org.asteriskjava.fastagi.command.*;
import org.asteriskjava.fastagi.reply.AgiReply;
import org.asteriskjava.util.SocketConnectionFacade;

/**
 * Default implementation of the AgiChannel interface.
 * 
 * @author srt
 * @version $Id: AgiChannelImpl.java 1271 2009-03-21 03:41:24Z srt $
 */
public class AgiChannelImpl implements AgiChannel
{
    private final AgiRequest request;
    private final AgiWriter agiWriter;
    private final AgiReader agiReader;

    private AgiReply lastReply;

    AgiChannelImpl(AgiRequest request, SocketConnectionFacade socket)
    {
        this.request = request;
        this.agiWriter = new FastAgiWriter(socket);
        this.agiReader = new FastAgiReader(socket);
        this.lastReply = null;
    }

    AgiChannelImpl(AgiRequest request, AgiWriter agiWriter, AgiReader agiReader)
    {
        this.request = request;
        this.agiWriter = agiWriter;
        this.agiReader = agiReader;
        this.lastReply = null;
    }

    public String getName()
    {
        return request.getChannel();
    }

    public String getUniqueId()
    {
        return request.getUniqueId();
    }

    public AgiReply getLastReply()
    {
        return lastReply;
    }

    public synchronized AgiReply sendCommand(AgiCommand command) throws AgiException
    {
        agiWriter.sendCommand(command);
        lastReply = agiReader.readReply();

        if (lastReply.getStatus() == AgiReply.SC_INVALID_OR_UNKNOWN_COMMAND)
        {
            throw new InvalidOrUnknownCommandException(command.buildCommand());
        }
        if (lastReply.getStatus() == AgiReply.SC_DEAD_CHANNEL)
        {
            throw new AgiHangupException();
        }
        if (lastReply.getStatus() == AgiReply.SC_INVALID_COMMAND_SYNTAX)
        {
            throw new InvalidCommandSyntaxException(lastReply.getSynopsis(), lastReply.getUsage());
        }

        return lastReply;
    }
    
    public void answer() throws AgiException
    {
        sendCommand(new AnswerCommand());
    }

    public void hangup() throws AgiException
    {
        sendCommand(new HangupCommand());
    }

    public void setAutoHangup(int time) throws AgiException
    {
        sendCommand(new SetAutoHangupCommand(time));
    }

    public void setCallerId(String callerId) throws AgiException
    {
        sendCommand(new SetCallerIdCommand(callerId));
    }

    public void playMusicOnHold() throws AgiException
    {
        sendCommand(new SetMusicOnCommand());
    }

    public void playMusicOnHold(String musicOnHoldClass) throws AgiException
    {
        sendCommand(new SetMusicOnCommand(musicOnHoldClass));
    }

    public void stopMusicOnHold() throws AgiException
    {
        sendCommand(new SetMusicOffCommand());
    }

    public int getChannelStatus() throws AgiException
    {
        sendCommand(new ChannelStatusCommand());
        return lastReply.getResultCode();
    }

    public String getData(String file) throws AgiException
    {
        sendCommand(new GetDataCommand(file));
        return lastReply.getResult();
    }

    public String getData(String file, long timeout) throws AgiException
    {
        sendCommand(new GetDataCommand(file, timeout));
        return lastReply.getResult();
    }

    public String getData(String file, long timeout, int maxDigits) throws AgiException
    {
        sendCommand(new GetDataCommand(file, timeout, maxDigits));
        return lastReply.getResult();
    }

    public char getOption(String file, String escapeDigits) throws AgiException
    {
        sendCommand(new GetOptionCommand(file, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public char getOption(String file, String escapeDigits, long timeout) throws AgiException
    {
        sendCommand(new GetOptionCommand(file, escapeDigits, timeout));
        return lastReply.getResultCodeAsChar();
    }

    public int exec(String application) throws AgiException
    {
        sendCommand(new ExecCommand(application));
        return lastReply.getResultCode();
    }

    public int exec(String application, String options) throws AgiException
    {
        sendCommand(new ExecCommand(application, options));
        return lastReply.getResultCode();
    }

    public void setContext(String context) throws AgiException
    {
        sendCommand(new SetContextCommand(context));
    }

    public void setExtension(String extension) throws AgiException
    {
        sendCommand(new SetExtensionCommand(extension));
    }

    public void setPriority(String priority) throws AgiException
    {
        sendCommand(new SetPriorityCommand(priority));
    }

    public void streamFile(String file) throws AgiException
    {
        sendCommand(new StreamFileCommand(file));
    }

    public char streamFile(String file, String escapeDigits) throws AgiException
    {
        sendCommand(new StreamFileCommand(file, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public char streamFile(String file, String escapeDigits, int offset) throws AgiException
    {
        sendCommand(new StreamFileCommand(file, escapeDigits, offset));
        return lastReply.getResultCodeAsChar();
    }

    public void sayDigits(String digits) throws AgiException
    {
        sendCommand(new SayDigitsCommand(digits));
    }

    public char sayDigits(String digits, String escapeDigits) throws AgiException
    {
        sendCommand(new SayDigitsCommand(digits, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public void sayNumber(String number) throws AgiException
    {
        sendCommand(new SayNumberCommand(number));
    }

    public char sayNumber(String number, String escapeDigits) throws AgiException
    {
        sendCommand(new SayNumberCommand(number, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public void sayPhonetic(String text) throws AgiException
    {
        sendCommand(new SayPhoneticCommand(text));
    }

    public char sayPhonetic(String text, String escapeDigits) throws AgiException
    {
        sendCommand(new SayPhoneticCommand(text, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public void sayAlpha(String text) throws AgiException
    {
        sendCommand(new SayAlphaCommand(text));
    }

    public char sayAlpha(String text, String escapeDigits) throws AgiException
    {
        sendCommand(new SayAlphaCommand(text, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public void sayTime(long time) throws AgiException
    {
        sendCommand(new SayTimeCommand(time));
    }

    public char sayTime(long time, String escapeDigits) throws AgiException
    {
        sendCommand(new SayTimeCommand(time, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public String getVariable(String name) throws AgiException
    {
        sendCommand(new GetVariableCommand(name));
        if (lastReply.getResultCode() != 1)
        {
            return null;
        }
        return lastReply.getExtra();
    }

    public void setVariable(String name, String value) throws AgiException
    {
        sendCommand(new SetVariableCommand(name, value));
    }

    public char waitForDigit(int timeout) throws AgiException
    {
        sendCommand(new WaitForDigitCommand(timeout));
        return lastReply.getResultCodeAsChar();
    }

    public String getFullVariable(String name) throws AgiException
    {
        sendCommand(new GetFullVariableCommand(name));
        if (lastReply.getResultCode() != 1)
        {
            return null;
        }
        return lastReply.getExtra();
    }

    public String getFullVariable(String name, String channel) throws AgiException
    {
        sendCommand(new GetFullVariableCommand(name, channel));
        if (lastReply.getResultCode() != 1)
        {
            return null;
        }
        return lastReply.getExtra();
    }

    public char sayDateTime(long time, String escapeDigits, String format, String timezone) throws AgiException
    {
        sendCommand(new SayDateTimeCommand(time, escapeDigits, format, timezone));
        return lastReply.getResultCodeAsChar();
    }

    public char sayDateTime(long time, String escapeDigits, String format) throws AgiException
    {
        sendCommand(new SayDateTimeCommand(time, escapeDigits, format));
        return lastReply.getResultCodeAsChar();
    }

    public char sayDateTime(long time, String escapeDigits) throws AgiException
    {
        sendCommand(new SayDateTimeCommand(time, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public void sayDateTime(long time) throws AgiException
    {
        sendCommand(new SayDateTimeCommand(time));
    }
    
    public String databaseGet(String family, String key) throws AgiException
    {
        sendCommand(new DatabaseGetCommand(family, key));
        if (lastReply.getResultCode() != 1)
        {
            return null;
        }
        return lastReply.getExtra();
    }

    public void databasePut(String family, String key, String value) throws AgiException
    {
        sendCommand(new DatabasePutCommand(family, key, value));
    }

    public void databaseDel(String family, String key) throws AgiException
    {
        sendCommand(new DatabaseDelCommand(family, key));
    }

    public void databaseDelTree(String family) throws AgiException
    {
        sendCommand(new DatabaseDelTreeCommand(family));
    }

    public void databaseDelTree(String family, String keytree) throws AgiException
    {
        sendCommand(new DatabaseDelTreeCommand(family, keytree));
    }

    public void verbose(String message, int level) throws AgiException
    {
        sendCommand(new VerboseCommand(message, level));
    }

    public char recordFile(String file, String format, String escapeDigits, int timeout) throws AgiException
    {
        sendCommand(new RecordFileCommand(file, format, escapeDigits, timeout));
        return lastReply.getResultCodeAsChar();
    }

    public char recordFile(String file, String format, String escapeDigits, int timeout, int offset, boolean beep, int maxSilence) throws AgiException
    {
        sendCommand(new RecordFileCommand(file, format, escapeDigits, timeout, offset, beep, maxSilence));
        return lastReply.getResultCodeAsChar();
    }

    public void controlStreamFile(String file) throws AgiException
    {
        sendCommand(new ControlStreamFileCommand(file));
    }

    public char controlStreamFile(String file, String escapeDigits) throws AgiException
    {
        sendCommand(new ControlStreamFileCommand(file, escapeDigits));
        return lastReply.getResultCodeAsChar();
    }

    public char controlStreamFile(String file, String escapeDigits, int offset) throws AgiException
    {
        sendCommand(new ControlStreamFileCommand(file, escapeDigits, offset));
        return lastReply.getResultCodeAsChar();
    }

    public char controlStreamFile(String file, String escapeDigits, int offset, String forwardDigit, String rewindDigit, String pauseDigit) throws AgiException
    {
        sendCommand(new ControlStreamFileCommand(file, escapeDigits, offset, forwardDigit, rewindDigit, pauseDigit));
        return lastReply.getResultCodeAsChar();
    }

    public void speechCreate() throws AgiException
    {
        speechCreate("");
    }

    public void speechCreate(String engine) throws AgiException
    {
        sendCommand(new SpeechCreateCommand(engine));
        if (lastReply.getResultCode() != 1)
        {
            if (engine == null || "".equals(engine))
            {
                throw new AgiSpeechException("Speech object for default engine cannot be created");
            }
            else
            {
                throw new AgiSpeechException("Speech object for engine '" + engine + "' cannot be created");
            }
        }
    }

    public void speechSet(String name, String value) throws AgiException
    {
        sendCommand(new SpeechSetCommand(name, value));
        if (lastReply.getResultCode() != 1)
        {
            throw new AgiSpeechException("Setting '" + name + "' cannot be set to '" + value + "'");
        }
    }

    public void speechDestroy() throws AgiException
    {
        sendCommand(new SpeechDestroyCommand());
        if (lastReply.getResultCode() != 1)
        {
            throw new AgiSpeechException("Speech object cannot be destroyed");
        }
    }

    public void speechLoadGrammar(String name, String path) throws AgiException
    {
        sendCommand(new SpeechLoadGrammarCommand(name, path));
        if (lastReply.getResultCode() != 1)
        {
            throw new AgiSpeechException("Grammar '" + name + "' cannot be loaded from '" + path + "'");
        }
    }

    public void speechUnloadGrammar(String name) throws AgiException
    {
        sendCommand(new SpeechUnloadGrammarCommand(name));
        if (lastReply.getResultCode() != 1)
        {
            throw new AgiSpeechException("Grammar '" + name + "' cannot be unloaded");
        }
    }

    public void speechActivateGrammar(String name) throws AgiException
    {
        sendCommand(new SpeechActivateGrammarCommand(name));
        if (lastReply.getResultCode() != 1)
        {
            throw new AgiSpeechException("Grammar '" + name + "' cannot be activated");
        }
    }

    public void speechDeactivateGrammar(String name) throws AgiException
    {
        sendCommand(new SpeechDeactivateGrammarCommand(name));
        if (lastReply.getResultCode() != 1)
        {
            throw new AgiSpeechException("Grammar '" + name + "' cannot be deactivated");
        }
    }

    public SpeechRecognitionResult speechRecognize(String prompt, int timeout) throws AgiException
    {
        return speechRecognize(new SpeechRecognizeCommand(prompt, timeout));
    }

    public SpeechRecognitionResult speechRecognize(String prompt, int timeout, int offset) throws AgiException
    {
        return speechRecognize(new SpeechRecognizeCommand(prompt, timeout, offset));
    }

    private SpeechRecognitionResult speechRecognize(SpeechRecognizeCommand command) throws AgiException
    {
        sendCommand(command);
        if (lastReply.getResultCode() != 1)
        {
            throw new AgiSpeechException("Cannot recognize speech");
        }

        if ("hangup".equals(lastReply.getExtra()))
        {
            throw new AgiHangupException();
        }
        final AgiReply speechRecognizeReply = lastReply;
        return new SpeechRecognitionResult(speechRecognizeReply);
    }

    public void continueAt(String context, String extension, String priority) throws AgiException
    {
        setContext(context);
        setExtension(extension);
        setPriority(priority);
    }
}
