/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.common2.redis.commands;

import java.util.Map;

import io.lettuce.core.dynamic.Commands;
import io.lettuce.core.dynamic.annotation.Command;

public interface RecordingCommands extends Commands {
    // Temporary deactivated due to a bug
    // @Command("INCR ?0")
    // Long incrementRecords(String key);

    @Command("HMSET ?0 ?1")
    String recordEventName(String meetingKey, Map<String, String> values);

    @Command("RPUSH ?0 ?1")
    Long recordEventValues(String meetingKey, String values);
    // Buggy command !!
    // @Command("EXPIRE ?0 ?1")
    // Boolean expireKey(String key, long seconds);
}
