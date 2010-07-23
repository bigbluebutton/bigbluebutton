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

import org.freeswitch.esl.client.outbound.example.SimpleHangupPipelineFactory;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class SocketClientTest
{
    private final Logger log = LoggerFactory.getLogger( this.getClass() );

    @Test
    public void run_client() throws InterruptedException
    {
        log.info( "Test starting ..." );

        
        SocketClient client = new SocketClient( 8084, new SimpleHangupPipelineFactory() );
        
        client.start();
        
        Thread.sleep( 45000 );

        client.stop();

        
        log.info( "Test ended" );
    }
    
}
