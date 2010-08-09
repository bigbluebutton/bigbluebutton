package org.freeswitch.esl.client.internal.debug;
/*
 * Copyright 2009 Red Hat, Inc.
 *
 * Red Hat licenses this file to you under the Apache License, version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License.  You may obtain a copy of the License at:
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */


import java.util.concurrent.Executor;

import org.jboss.netty.channel.ChannelEvent;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.util.EstimatableObjectWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * a {@link Runnable} which sends the specified {@link ChannelEvent} upstream.
 * Most users will not see this type at all because it is used by
 * {@link Executor} implementors only
 *
 * @author The Netty Project (netty-dev@lists.jboss.org)
 * @author Trustin Lee (tlee@redhat.com)
 *
 * @version $Rev: 1685 $, $Date: 2009-08-28 16:15:49 +0900 (금, 28 8 2009) $
 *
 */
public class ChannelEventRunnable implements Runnable, EstimatableObjectWrapper {
    
    private final Logger log = LoggerFactory.getLogger( this.getClass() );
    private final ChannelHandlerContext ctx;
    private final ChannelEvent e;
    volatile int estimatedSize;

    /**
     * Creates a {@link Runnable} which sends the specified {@link ChannelEvent}
     * upstream via the specified {@link ChannelHandlerContext}.
     */
    public ChannelEventRunnable(ChannelHandlerContext ctx, ChannelEvent e) {
        this.ctx = ctx;
        this.e = e;
    }

    /**
     * Returns the {@link ChannelHandlerContext} which will be used to
     * send the {@link ChannelEvent} upstream.
     */
    public ChannelHandlerContext getContext() {
        return ctx;
    }

    /**
     * Returns the {@link ChannelEvent} which will be sent upstream.
     */
    public ChannelEvent getEvent() {
        return e;
    }

    /**
     * Sends the event upstream.
     */
    public void run() {
//        log.info( "Sending [{}] upstream in [{}]", e, ctx );
        try
        {
            ctx.sendUpstream(e);
        }
        catch ( Throwable t )
        {
            log.error( "Caught -->", t );
        }
    }

    public Object unwrap() {
        return e;
    }
}
