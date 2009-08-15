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
 * Breaks the Async AGI loop.
 *
 * @author srt
 * @version $Id: AsyncAgiBreakCommand.java 1015 2008-04-04 21:56:36Z srt $
 */
public class AsyncAgiBreakCommand extends AbstractAgiCommand
{
    /**
     * Serial version identifier.
     */
    private static final long serialVersionUID = 1L;

    /**
     * Creates a new AsyncAgiBreakCommand.
     */
    public AsyncAgiBreakCommand()
    {
        super();
    }

    @Override
    public String buildCommand()
    {
        return "ASYNCAGI BREAK";
    }
}