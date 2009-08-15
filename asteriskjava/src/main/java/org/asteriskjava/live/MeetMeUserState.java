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
package org.asteriskjava.live;

/**
 * The lifecycle status of a {@link org.asteriskjava.live.MeetMeUser}.
 * 
 * @author srt
 * @version $Id: MeetMeUserState.java 938 2007-12-31 03:23:38Z srt $
 */
public enum MeetMeUserState
{
    /**
     * The user joined the MeetMe room.
     */
    JOINED,

    /**
     * The user left the MeetMe room.
     */
    LEFT
}
