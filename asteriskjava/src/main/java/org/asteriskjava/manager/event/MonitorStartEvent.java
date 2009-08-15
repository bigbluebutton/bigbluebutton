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
package org.asteriskjava.manager.event;

/**
 * A MonitorStartEvent indicates that monitoring was started on a channel.<p>
 * Available since Asterisk 1.6.<p>
 * It is implemented in <code>res/res_monitor.c</code>
 *
 * @author srt
 * @version $Id: MonitorStartEvent.java 1095 2008-08-09 01:49:43Z sprior $
 * @since 1.0.0
 * @see org.asteriskjava.manager.event.MonitorStopEvent
 */
public class MonitorStartEvent extends AbstractMonitorEvent
{
    private static final long serialVersionUID = 253533286571341499L;
    public MonitorStartEvent(Object source)
    {
        super(source);
    }
}