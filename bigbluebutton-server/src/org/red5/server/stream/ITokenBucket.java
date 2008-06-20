package org.red5.server.stream;

// TODO: Auto-generated Javadoc
/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

/**
 * Basically token bucket is used to control the bandwidth used by a stream or a connection or a client.
 * There's a background thread that distributes tokens to the buckets in the system according
 * to the configuration of the bucket. The configuration includes how fast the tokens are distributed.
 * When a stream, for example, needs to send out a packet, the packet's byte count is calculated and
 * each byte corresponds to a token in the bucket. The stream is assigned a bucket and the tokens in
 * the bucket are acquired before the packet can be sent out. So if the speed(or bandwidth) in
 * configuration is low, the stream can't send out packets fast.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface ITokenBucket {
	
	/**
	 * Acquire tokens amount of <tt>tokenCount</tt>
	 * waiting <tt>wait</tt> milliseconds if token not available.
	 * 
	 * @param tokenCount The count of tokens to acquire.
	 * @param wait Milliseconds to wait. <tt>0</tt> means no wait
	 * and any value below zero means wait forever.
	 * 
	 * @return <tt>true</tt> if successfully acquired or <tt>false</tt>
	 * if not acquired.
	 */
	boolean acquireToken(long tokenCount, long wait);

	/**
	 * Nonblockingly acquire token. If the token is not available and
	 * <tt>task</tt> is not null, the callback will be executed when the token
	 * is available. The tokens are not consumed automatically before callback,
	 * so it's recommended to acquire token again in callback function.
	 * 
	 * @param tokenCount        Number of tokens
	 * @param callback          Callback
	 * 
	 * @return <tt>true</tt> if successfully acquired or <tt>false</tt>
	 * if not acquired.
	 */
	boolean acquireTokenNonblocking(long tokenCount,
			ITokenBucketCallback callback);

	/**
	 * Nonblockingly acquire token. The upper limit is specified. If
	 * not enough tokens are left in bucket, all remaining will be
	 * returned.
	 * 
	 * @param upperLimitCount      Upper limit of aquisition
	 * 
	 * @return                     Remaining tokens from bucket
	 */
	long acquireTokenBestEffort(long upperLimitCount);

	/**
	 * Get the capacity of this bucket in Byte.
	 * 
	 * @return                     Capacity of this bucket in bytes
	 */
	long getCapacity();

	/**
	 * The amount of tokens increased per millisecond.
	 * 
	 * @return                     Amount of tokens increased per millisecond.
	 */
	double getSpeed();

	/**
	 * Reset this token bucket. All pending threads are woken up with <tt>false</tt>
	 * returned for acquiring token and callback is removed without calling back.
	 */
	void reset();

    /**
     * Callback for tocket bucket.
     */
    public interface ITokenBucketCallback {
        
        /**
         * Being called when the tokens requested are available.
         * 
         * @param bucket          Bucket
         * @param tokenCount      Number of tokens
         */
        void available(ITokenBucket bucket, long tokenCount);

        /**
         * Resets tokens in bucket.
         * 
         * @param bucket          Bucket
         * @param tokenCount      Number of tokens
         */
        void reset(ITokenBucket bucket, long tokenCount);
	}
}
