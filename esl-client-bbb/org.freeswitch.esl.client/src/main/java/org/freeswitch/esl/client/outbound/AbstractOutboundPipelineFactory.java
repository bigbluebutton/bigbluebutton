/*
 * Copyright 2010 david varnes.
 *
 * Licensed under the Apache License, version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at:
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.freeswitch.esl.client.outbound;

import org.freeswitch.esl.client.internal.debug.ExecutionHandler;
import org.freeswitch.esl.client.transport.message.EslFrameDecoder;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.Channels;
import org.jboss.netty.handler.codec.string.StringEncoder;
import org.jboss.netty.handler.execution.OrderedMemoryAwareThreadPoolExecutor;

/**
 * An abstract factory to assemble a Netty processing pipeline for outbound clients.
 * 
 * @author  david varnes
 */
public abstract class AbstractOutboundPipelineFactory implements ChannelPipelineFactory
{
    public ChannelPipeline getPipeline() throws Exception
    {
        ChannelPipeline pipeline = Channels.pipeline(); 
        // Add the text line codec combination first
        pipeline.addLast( "encoder", new StringEncoder() );
        // Note that outbound mode requires the decoder to treat many 'headers' as body lines
        pipeline.addLast( "decoder", new EslFrameDecoder( 8092, true ) );
        // Add an executor to ensure separate thread for each upstream message from here
        pipeline.addLast( "executor", new ExecutionHandler( 
            new OrderedMemoryAwareThreadPoolExecutor( 16, 1048576, 1048576 ) ) );

        // now the outbound client logic
        pipeline.addLast( "clientHandler", makeHandler() );
        
        return pipeline;
    }

    protected abstract AbstractOutboundClientHandler makeHandler();
}
