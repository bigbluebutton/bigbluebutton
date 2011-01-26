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
package org.freeswitch.esl.client;

import org.freeswitch.esl.client.transport.event.EslEvent;
import org.jboss.netty.channel.ExceptionEvent;

/**
 * Interface for observers wanting to be notified of incoming FreeSWITCH Event Socket events.
 * <p>
 * Incoming events arrive asynchronously and are processed into two queues, one for server 
 * initiated events, and one for the results of client requested background jobs.
 * <p>  
 * Each queue is serviced by a different thread pool (to ensure lowest latency for event-driven events) 
 * and each queue is guaranteed to be processed (and listeners notified) in the order in which the
 * events are received off the wire.
 * <p>
 * This design ensures that incoming event processing is not blocked by any long-running listener process.
 * However multiple listeners will be notified sequentially, and so one slow listener can cause latency
 * to other listeners.
 *   
 * @author  david varnes
 */
public interface IEslEventListener
{
    /**
     * Signal of a server initiated event.
     * 
     * @param event as an {@link EslEvent} 
     */
    void eventReceived( EslEvent event );

    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param event as an {@link EslEvent}
     */
    void conferenceEventJoin(String uniqueId, String confName, int confSize, EslEvent event);

    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param event as an {@link EslEvent}
     */
    void conferenceEventLeave(String uniqueId, String confName, int confSize, EslEvent event);

    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param event as an {@link EslEvent}
     */
    void conferenceEventMute(String uniqueId, String confName, int confSize, EslEvent event);

    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param event as an {@link EslEvent}
     */
    void conferenceEventUnMute(String uniqueId, String confName, int confSize, EslEvent event);

    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param action
     * @param event as an {@link EslEvent}
     */
    void conferenceEventAction(String uniqueId, String confName, int confSize, String action, EslEvent event);

    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param event as an {@link EslEvent}
     */
    void conferenceEventTransfer(String uniqueId, String confName, int confSize, EslEvent event);

    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param event as an {@link EslEvent}
     */
    void conferenceEventThreadRun(String uniqueId, String confName, int confSize, EslEvent event);

    /**
    *
    * @param uniqueId
    * @param confName
    * @param confSize
    * @param event as an {@link EslEvent}
    */
   void conferenceEventRecord(String uniqueId, String confName, int confSize, EslEvent event);
   
    /**
     *
     * @param uniqueId
     * @param confName
     * @param confSize
     * @param event as an {@link EslEvent}
     */
    void conferenceEventPlayFile(String uniqueId, String confName, int confSize, EslEvent event);

    /**
     * Signal of an event containing the result of a client requested background job.  The Job-UUID will
     * be available as an event header of that name.
     * 
     * @param event as an {@link EslEvent}
     */
    void backgroundJobResultReceived( EslEvent event );

    /**
     * 
     * @param e as an {@link ExceptionEvent}
     */
    void exceptionCaught(ExceptionEvent e);

}
