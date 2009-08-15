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
package org.asteriskjava.fastagi.reply;

import java.util.List;
import java.io.Serializable;

/**
 * Reply received in response to an AgiCommand.<p>
 * The AgiReply contains information about success or failure of the execution
 * of an AgiCommand and - depending on the command sent - additional information
 * returned, for example the value of a variable requested by a
 * GetVariableCommand.
 * 
 * @see org.asteriskjava.fastagi.command.AgiCommand
 * @author srt
 * @version $Id: AgiReply.java 1271 2009-03-21 03:41:24Z srt $
 */
public interface AgiReply extends Serializable
{
    /**
     * Status code (200) indicating Asterisk successfully processed the
     * AgiCommand.
     */
    int SC_SUCCESS = 200;

    /**
     * Status code (510) indicating Asterisk was unable to process the
     * AgiCommand because there is no command with the given name available.
     */
    int SC_INVALID_OR_UNKNOWN_COMMAND = 510;

    /**
     * Status code (511) indicating Asterisk was unable to execute the command
     * because the channel has been hung up. Up to Asterisk 1.4 the TCP connection
     * was closed on hangup, since Asterisk 1.6 the connection stays alive and
     * commands that require a channel return a reply with this status code.
     *
     * @since 1.0.0
     */
    int SC_DEAD_CHANNEL = 511;

    /**
     * Status code (520) indicating Asterisk was unable to process the
     * AgiCommand because the syntax used was not correct. This is most likely
     * due to missing required parameters or additional parameters sent that are
     * not understood.<p>
     * Ensure proper quoting of the parameters when you receive this status
     * code.
     */
    int SC_INVALID_COMMAND_SYNTAX = 520;

    /**
     * Returns the first line of the raw reply.
     * 
     * @return the first line of the raw reply.
     */
    String getFirstLine();

    /**
     * Returns a List containing the lines of the raw reply.
     * 
     * @return a List containing the lines of the raw reply.
     */
    List<String> getLines();

    /**
     * Returns the return code (the result as int).
     * 
     * @return the return code or -1 if the result is not an int.
     */
    int getResultCode();

    /**
     * Returns the return code as character.
     * 
     * @return the return code as character.
     */
    char getResultCodeAsChar();

    /**
     * Returns the result, that is the part directly following the "result="
     * string.
     * 
     * @return the result.
     */
    String getResult();

    /**
     * Returns the status code.<p>
     * Supported status codes are:
     * <ul>
     * <li>200 Success
     * <li>510 Invalid or unknown command
     * <li>511 Command Not Permitted on a dead channel (since Asterisk 1.6)
     * <li>520 Invalid command syntax
     * </ul>
     * 
     * @return the status code.
     * @see #SC_SUCCESS
     * @see #SC_INVALID_OR_UNKNOWN_COMMAND
     * @see #SC_DEAD_CHANNEL
     * @see #SC_INVALID_COMMAND_SYNTAX
     */
    int getStatus();

    /**
     * Returns an additional attribute contained in the reply.<p>
     * For example the reply to the StreamFileCommand contains an additional
     * endpos attribute indicating the frame where the playback was stopped.
     * This can be retrieved by calling getAttribute("endpos") on the
     * corresponding reply.
     * 
     * @param name the name of the attribute to retrieve. The name is case
     *            insensitive.
     * @return the value of the attribute or <code>null</code> if it is not
     *         set.
     */
    String getAttribute(String name);

    /**
     * Returns the text in parenthesis contained in this reply.<p>
     * The meaning of this property depends on the command sent. Sometimes it
     * contains a flag like "timeout" or "hangup" or - in case of the
     * GetVariableCommand - the value of the variable.
     * 
     * @return the text in the parenthesis or <code>null</code> if not set.
     */
    String getExtra();

    /**
     * Returns the synopsis of the command sent if Asterisk expected a different
     * syntax (getStatus() == SC_INVALID_COMMAND_SYNTAX).
     * 
     * @return the synopsis of the command sent, <code>null</code> if there
     *         were no syntax errors.
     */
    String getSynopsis();

    /**
     * Returns the usage of the command sent if Asterisk expected a different
     * syntax (getStatus() == SC_INVALID_COMMAND_SYNTAX).
     * 
     * @return the usage of the command sent, <code>null</code> if there were
     *         no syntax errors.
     */
    String getUsage();
}
