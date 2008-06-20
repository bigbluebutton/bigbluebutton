/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.red5.io.utils;

import org.apache.mina.common.ByteBuffer;

// TODO: Auto-generated Javadoc
/**
 * ByteBuffer utility.
 * <br />
 * <i>Note: Paul added this back in for use with Mina due to its removal from Mina 2.0</i>
 * 
 * @author The Apache Directory Project (mina-dev@directory.apache.org)
 */
@Deprecated
@SuppressWarnings("all")
public class ByteBufferUtil {

    /**
     * Acquire if possible.
     * 
     * @param message the message
     */
    public static void acquireIfPossible( Object message )
    {
        if( message instanceof ByteBuffer )
        {
        }
    }

    /**
     * Release if possible.
     * 
     * @param message the message
     */
    public static void releaseIfPossible( Object message )
    {
        if( message instanceof ByteBuffer )
        {
            //( ( ByteBuffer ) message ).release();
        }
    }

    /**
     * Instantiates a new byte buffer util.
     */
    private ByteBufferUtil()
    {
    }
}