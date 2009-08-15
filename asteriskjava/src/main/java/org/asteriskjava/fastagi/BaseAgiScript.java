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
package org.asteriskjava.fastagi;

/**
 * The BaseAgiScript provides some convinience methods to make it easier to
 * write custom {@link org.asteriskjava.fastagi.AgiScript}s.
 * <p>
 * Just extend it by your own script classes.
 * 
 * @since 0.2
 * @author srt
 * @version $Id: BaseAgiScript.java 938 2007-12-31 03:23:38Z srt $
 */
public abstract class BaseAgiScript extends AgiOperations implements AgiScript
{
    public BaseAgiScript()
    {
        super();
    }
}