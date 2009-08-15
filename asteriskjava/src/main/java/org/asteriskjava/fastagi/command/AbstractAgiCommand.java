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
package org.asteriskjava.fastagi.command;

import java.io.Serializable;

/**
 * Abstract base class that provides some convenience methods for 
 * implementing AgiCommand classes.
 * 
 * @author srt
 * @version $Id: AbstractAgiCommand.java 1013 2008-03-31 06:51:03Z srt $
 */
public abstract class AbstractAgiCommand implements Serializable, AgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 3257849874518456633L;

    public abstract String buildCommand();

    /**
     * Escapes and quotes a given String according to the rules set by
     * Asterisk's AGI.
     * 
     * @param s the String to escape and quote
     * @return the transformed String
     */
    protected String escapeAndQuote(String s)
    {
        String tmp;

        if (s == null)
        {
            return "\"\"";
        }

        tmp = s;
        tmp = tmp.replaceAll("\\\"", "\\\\\""); // escape quotes
        tmp = tmp.replaceAll("\\\n", ""); // filter newline
        return "\"" + tmp + "\""; // add quotes
    }

    @Override
   public String toString()
    {
        StringBuffer sb;

        sb = new StringBuffer(getClass().getName()).append("[");
        sb.append("command='").append(buildCommand()).append("', ");
        sb.append("systemHashcode=").append(System.identityHashCode(this)).append("]");

        return sb.toString();
    }
}
