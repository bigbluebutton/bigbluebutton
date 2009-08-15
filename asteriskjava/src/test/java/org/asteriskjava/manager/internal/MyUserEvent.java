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

import org.asteriskjava.manager.event.UserEvent;
import java.util.Map;

public class MyUserEvent extends UserEvent
{
    private static final long serialVersionUID = 3689913989471418169L;

    private String stringMember;
    private Map<String,String> mapMember;
    
    public MyUserEvent(Object source)
    {
        super(source);
    }

    /**
     * @return the mapMember
     */
    public Map<String, String> getMapMember()
    {
        return mapMember;
    }

    /**
     * @param mapMember the mapMember to set
     */
    public void setMapMember(Map<String, String> mapMember)
    {
        this.mapMember = mapMember;
    }

    /**
     * @return the stringMember
     */
    public String getStringMember()
    {
        return stringMember;
    }

    /**
     * @param stringMember the stringMember to set
     */
    public void setStringMember(String stringMember)
    {
        this.stringMember = stringMember;
    }
}
