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
package org.asteriskjava.fastagi.internal;

import org.asteriskjava.fastagi.*;
import org.asteriskjava.fastagi.command.VerboseCommand;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

/**
 * An AgiConnectionHandler is created and run by the AgiServer whenever a new
 * AGI connection from an Asterisk Server is received.
 * <p>
 * It reads the request using an AgiReader and runs the AgiScript configured to
 * handle this type of request. Finally it closes the AGI connection.
 * 
 * @author srt
 * @version $Id: AgiConnectionHandler.java 1302 2009-05-12 16:39:11Z srt $
 */
public abstract class AgiConnectionHandler implements Runnable
{
    private static final String AJ_AGISTATUS_VARIABLE = "AJ_AGISTATUS";
    private static final String AJ_AGISTATUS_NOT_FOUND = "NOT_FOUND";
    private static final String AJ_AGISTATUS_SUCCESS = "SUCCESS";
    private static final String AJ_AGISTATUS_FAILED = "FAILED";
    private static final ThreadLocal<AgiChannel> channel = new ThreadLocal<AgiChannel>();
    private final Log logger = LogFactory.getLog(getClass());
    private boolean ignoreMissingScripts = false;
    private AgiScript script = null;

    /**
     * The strategy to use to determine which script to run.
     */
    private final MappingStrategy mappingStrategy;

    /**
     * Creates a new AGIConnectionHandler to handle the given socket connection.
     * 
     * @param mappingStrategy the strategy to use to determine which script to run.
     */
    protected AgiConnectionHandler(MappingStrategy mappingStrategy)
    {
        this.mappingStrategy = mappingStrategy;
    }

    protected boolean isIgnoreMissingScripts()
    {
        return ignoreMissingScripts;
    }

    protected void setIgnoreMissingScripts(boolean ignoreMissingScripts)
    {
        this.ignoreMissingScripts = ignoreMissingScripts;
    }

    protected AgiScript getScript()
    {
        return script;
    }

    protected abstract AgiReader createReader();

    protected abstract AgiWriter createWriter();

    protected abstract void release();

    public void run()
    {
        AgiChannel channel = null;

        try
        {
            AgiReader reader;
            AgiWriter writer;
            AgiRequest request;

            reader = createReader();
            writer = createWriter();

            request = reader.readRequest();
            channel = new AgiChannelImpl(request, writer, reader);

            AgiConnectionHandler.channel.set(channel);

            if (mappingStrategy != null)
            {
                script = mappingStrategy.determineScript(request);
            }
            
            if (script == null && ! ignoreMissingScripts)
            {
                final String errorMessage;

                errorMessage = "No script configured for URL '" + request.getRequestURL() + "' (script '" + request.getScript() + "')";
                logger.error(errorMessage);

                setStatusVariable(channel, AJ_AGISTATUS_NOT_FOUND);
                logToAsterisk(channel, errorMessage);
            }
            else if (script != null)
            {
                runScript(script, request, channel);
            }
        }
        catch (AgiException e)
        {
            setStatusVariable(channel, AJ_AGISTATUS_FAILED);
            logger.error("AgiException while handling request", e);
        }
        catch (Exception e)
        {
            setStatusVariable(channel, AJ_AGISTATUS_FAILED);
            logger.error("Unexpected Exception while handling request", e);
        }
        finally
        {
            AgiConnectionHandler.channel.set(null);
            release();
        }
    }

    private void runScript(AgiScript script, AgiRequest request, AgiChannel channel)
    {
        String threadName;
        threadName = Thread.currentThread().getName();

        logger.info("Begin AgiScript " + getScriptName(script) + " on " + threadName);
        try
        {
            script.service(request, channel);
            setStatusVariable(channel, AJ_AGISTATUS_SUCCESS);
        }
        catch (AgiException e)
        {
            logger.error("AgiException running AgiScript " + getScriptName(script) + " on " + threadName, e);
            setStatusVariable(channel, AJ_AGISTATUS_FAILED);
        }
        catch (Exception e)
        {
            logger.error("Exception running AgiScript " + getScriptName(script) + " on " + threadName, e);
            setStatusVariable(channel, AJ_AGISTATUS_FAILED);
        }
        logger.info("End AgiScript " + getScriptName(script) + " on " + threadName);
    }

    protected String getScriptName(AgiScript script)
    {
        if (script == null)
        {
            return null;
        }

        if (script instanceof NamedAgiScript)
        {
            return ((NamedAgiScript) script).getName();
        }
        return script.getClass().getName();
    }

    private void setStatusVariable(AgiChannel channel, String value)
    {
        if (channel == null)
        {
            return;
        }

        try
        {
            channel.setVariable(AJ_AGISTATUS_VARIABLE, value);
        }
        catch (Exception e) // NOPMD
        {
            // swallow
        }
    }

    private void logToAsterisk(AgiChannel channel, String message)
    {
        if (channel == null)
        {
            return;
        }

        try
        {
            channel.sendCommand(new VerboseCommand(message, 1));
        }
        catch (Exception e) // NOPMD
        {
            // swallow
        }
    }

    /**
     * Returns the AgiChannel associated with the current thread.
     * 
     * @return the AgiChannel associated with the current thread or
     *         <code>null</code> if none is associated.
     */
    public static AgiChannel getChannel()
    {
        return AgiConnectionHandler.channel.get();
    }
}
