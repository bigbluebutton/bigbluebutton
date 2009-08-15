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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.asteriskjava.fastagi.AgiException;
import org.asteriskjava.fastagi.AgiHangupException;
import org.asteriskjava.fastagi.AgiNetworkException;
import org.asteriskjava.fastagi.AgiRequest;
import org.asteriskjava.fastagi.reply.AgiReply;
import org.asteriskjava.util.SocketConnectionFacade;

/**
 * Default implementation of the AgiReader implementation.
 * 
 * @author srt
 * @version $Id: FastAgiReader.java 1268 2009-03-14 12:30:01Z srt $
 */
class FastAgiReader implements AgiReader
{
    private final SocketConnectionFacade socket;

    FastAgiReader(SocketConnectionFacade socket)
    {
        this.socket = socket;
    }

    public AgiRequest readRequest() throws AgiException
    {
        AgiRequestImpl request;
        String line;
        List<String> lines;

        lines = new ArrayList<String>();

        try
        {
            while ((line = socket.readLine()) != null)
            {
                if (line.length() == 0)
                {
                    break;
                }

                lines.add(line);
            }
        }
        catch (IOException e)
        {
            throw new AgiNetworkException("Unable to read request from Asterisk: " + e.getMessage(), e);
        }

        request = new AgiRequestImpl(lines);
        request.setLocalAddress(socket.getLocalAddress());
        request.setLocalPort(socket.getLocalPort());
        request.setRemoteAddress(socket.getRemoteAddress());
        request.setRemotePort(socket.getRemotePort());

        return request;
    }

    public AgiReply readReply() throws AgiException
    {
        AgiReply reply;
        List<String> lines;
        String line;

        lines = new ArrayList<String>();

        try
        {
            line = socket.readLine();
        }
        catch (IOException e)
        {
            // readline throws IOException if the connection has been closed
            throw new AgiHangupException();
        }

        if (line == null)
        {
            throw new AgiHangupException();
        }

        // TODO Asterisk 1.6 sends "HANGUP" when the channel is hung up.
        //System.out.println(line);
        if (line.startsWith("HANGUP"))
        {
            if (line.length() > 6)
            {
                line = line.substring(6);
            }
            else
            {
                return readReply();
            }
        }

        lines.add(line);

        // read synopsis and usage if statuscode is 520
        if (line.startsWith(Integer.toString(AgiReply.SC_INVALID_COMMAND_SYNTAX)))
        {
            try
            {
                while ((line = socket.readLine()) != null)
                {
                    lines.add(line);
                    if (line.startsWith(Integer.toString(AgiReply.SC_INVALID_COMMAND_SYNTAX)))
                    {
                        break;
                    }
                }
            }
            catch (IOException e)
            {
                throw new AgiNetworkException("Unable to read reply from Asterisk: " + e.getMessage(), e);
            }
        }

        reply = new AgiReplyImpl(lines);

        return reply;
    }
}
