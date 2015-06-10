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
package org.freeswitch.esl.client.inbound;

/**
 * Checked exception to handle connection failures.
 * 
 * @author  david varnes
 */
public class InboundConnectionFailure extends Exception
{
    private static final long serialVersionUID = 1L;

    public InboundConnectionFailure( String message )
    {
        super( message );
    }
    
    public InboundConnectionFailure( String message, Throwable cause )
    {
        super( message, cause );
    }
}
