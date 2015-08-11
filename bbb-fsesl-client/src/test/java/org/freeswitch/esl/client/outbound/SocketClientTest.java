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

/**
 * This 'test' is not really a unit test, more an integration test. In order to see
 * any result, configure a FreeSWITCH installation with an extension something like
 * the following:
 * <pre>
    &lt;extension&gt;
      &lt;condition field="destination_number" expresssion="444"&gt;  
        &lt;action application="socket" data="192.168.100.88:8084 async full"/&gt;
      &lt;/condition&gt;
    &lt;/extension&gt;
 * <pre>
 * Replace the ip address with the host that FreeSWITCH sees that you are running the test on, perhaps
 * localhost.
 * <p/>
 * Run the test, you have 45 seconds to make a call to extension 444 and observe the logs.
 *  
 * @author  david varnes
 */
public class SocketClientTest
{
    private final Logger log = LoggerFactory.getLogger( this.getClass() );

    /*
     *  Example usage of an 'outbound' socket client.  Of course an application developer would need to
     *  create their own implementation of a handler and pipeline factory, and invoke the SocketClient.
     *  
     */
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
