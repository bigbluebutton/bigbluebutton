/*
 *  Copyright 2004-2006 Stefan Reuter
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this time except in compliance with the License.
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
package org.asteriskjava.fastagi.command;

/**
 * Changes the callerid of the current channel.
 * 
 * @author srt
 * @version $Id: SetCallerIdCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public class SetCallerIdCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3256721797012404276L;

    /**
     * The new callerId.
     */
    private String callerId;

    /**
     * Creates a new SetCallerIdCommand.
     * 
     * @param callerId the new callerId.
     */
    public SetCallerIdCommand(String callerId)
    {
        super();
        this.callerId = callerId;
    }

    /**
     * Returns the new callerId.
     * 
     * @return the new callerId.
     */
    public String getCallerId()
    {
        return callerId;
    }

    /**
     * Sets the new callerId.
     * 
     * @param callerId the new callerId.
     */
    public void setCallerId(String callerId)
    {
        this.callerId = callerId;
    }

    @Override
   public String buildCommand()
    {
        return "SET CALLERID " + escapeAndQuote(callerId);
    }
}
