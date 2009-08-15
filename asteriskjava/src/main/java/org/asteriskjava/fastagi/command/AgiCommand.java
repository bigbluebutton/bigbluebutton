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

/**
 * AgiCommand that can be sent to Asterisk via the Asterisk Gateway Interface.<p>
 * This interface contains only one method that transforms the command to a
 * String representation understood by Asterisk.
 * 
 * @author srt
 * @version $Id: AgiCommand.java 938 2007-12-31 03:23:38Z srt $
 */
public interface AgiCommand
{

    /**
     * Returns a string suitable to be sent to asterisk.<p>
     * 
     * @return a string suitable to be sent to asterisk.
     */
    String buildCommand();
}
