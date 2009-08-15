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
package org.asteriskjava.manager.internal;

/**
 * Utilitiy class with some static helper methods that are used in multiple
 * contexts within the manager package.<p>
 * The methods for handling the internal action id are used to make sure we
 * send unique ids to Asterisk even when the user of Asterisk-Java does not
 * provide a unique action id or no action id at all.<p>
 * All the methods contained in this class are supposed to be internally
 * only. 
 * 
 * @author srt
 * @version $Id: ManagerUtil.java 1124 2008-08-18 03:25:01Z srt $
 */
public class ManagerUtil
{
    public static final char INTERNAL_ACTION_ID_DELIMITER = '#';

    /**
     * The hex digits used to build a hex string representation of a byte array.
     */
    private static final char[] hexChar = {'0', '1', '2', '3', '4', '5', '6',
            '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};

    /**
     * Converts a byte array to a hex string representing it. The hex digits are
     * lower case.
     * 
     * @param b the byte array to convert
     * @return the hex representation of b
     */
    public static String toHexString(byte[] b)
    {
        final StringBuilder sb;
        
        sb = new StringBuilder(b.length * 2);
        for (byte aB : b)
        {
            sb.append(hexChar[(aB & 0xf0) >>> 4]);
            sb.append(hexChar[aB & 0x0f]);
        }
        return sb.toString();
    }

    /**
     * Returns the internal action id contained in the given action id.
     * 
     * @param actionId the action id prefixed by the internal action
     *            id as received from Asterisk.
     * @return the internal action id that has been added before.
     * @see #addInternalActionId(String, String)
     */
    public static String getInternalActionId(String actionId)
    {
        final int delimiterIndex;

        if (actionId == null)
        {
            return null;
        }
        
        delimiterIndex = actionId.indexOf(INTERNAL_ACTION_ID_DELIMITER);
        if (delimiterIndex > 0)
        {
            return actionId.substring(0, delimiterIndex);
        }
        else
        {
            return null;
        }
    }

    /**
     * Strips the internal action id from the given action id.
     * 
     * @param actionId the action id prefixed by the internal action
     *            id as received from Asterisk.
     * @return the original action id, that is the action id as it was before
     *         the internal action id was added.
     * @see #addInternalActionId(String, String)
     */
    public static String stripInternalActionId(String actionId)
    {
        int delimiterIndex;

        delimiterIndex = actionId.indexOf(INTERNAL_ACTION_ID_DELIMITER);
        if (delimiterIndex > 0)
        {
            if (actionId.length() > delimiterIndex + 1)
            {
                return actionId.substring(delimiterIndex + 1);
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    }

    /**
     * Adds the internal action id to the given action id.
     * 
     * @param actionId the action id as set by the user.
     * @param internalActionId the internal action id to add.
     * @return the action id prefixed by the internal action id suitable to be
     *         sent to Asterisk.
     */
    public static String addInternalActionId(String actionId,
            String internalActionId)
    {
        if (actionId == null)
        {
            return internalActionId + INTERNAL_ACTION_ID_DELIMITER;
        }
        else
        {
            return internalActionId + INTERNAL_ACTION_ID_DELIMITER + actionId;
        }
    }
}
