/*
 * GT-Mconf: Multiconference system for interoperable web and mobile
 * http://www.inf.ufrgs.br/prav/gtmconf
 * PRAV Labs - UFRGS
 * 
 * This file is part of Mconf-Mobile.
 *
 * Mconf-Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Mconf-Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Mconf-Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.app.videoproxy;

import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ChannelPipeline;
import org.jboss.netty.channel.ChannelPipelineFactory;
import org.jboss.netty.channel.ChannelStateEvent;
import org.jboss.netty.channel.Channels;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.flazr.rtmp.RtmpDecoder;
import com.flazr.rtmp.RtmpEncoder;
import com.flazr.rtmp.RtmpMessage;
import com.flazr.rtmp.client.ClientHandshakeHandler;
import com.flazr.rtmp.client.ClientOptions;
import com.flazr.rtmp.message.Command;
import com.flazr.rtmp.message.MessageType;
import com.flazr.rtmp.message.Video;

public abstract class VideoProxyReceiverConnection extends RtmpConnection {

    @SuppressWarnings("unused")
	private static final Logger log = LoggerFactory.getLogger(VideoProxyReceiverConnection.class);
    
	public VideoProxyReceiverConnection(ClientOptions options) {
		super(options);
	}
	
	@Override
	protected ChannelPipelineFactory pipelineFactory() {
		return new ChannelPipelineFactory() {
			@Override
			public ChannelPipeline getPipeline() throws Exception {
		        final ChannelPipeline pipeline = Channels.pipeline();
		        pipeline.addLast("handshaker", new ClientHandshakeHandler(options));
		        pipeline.addLast("decoder", new RtmpDecoder());
		        pipeline.addLast("encoder", new RtmpEncoder());
		        pipeline.addLast("handler", VideoProxyReceiverConnection.this);
		        return pipeline;
			}
		};
	}
	
	@Override
	public void channelConnected(ChannelHandlerContext ctx, ChannelStateEvent e) {
        options.setArgs((Object[]) null);
        writeCommandExpectingResult(e.getChannel(), Command.connect(options));
	}
	
	@Override
	protected void onMultimedia(Channel channel, RtmpMessage message) {
		super.onMultimedia(channel, message);
		if (message.getHeader().getMessageType() == MessageType.VIDEO) {
			onVideo((Video) message);
		}
	}
	
	abstract protected void onVideo(Video video);
	
}
