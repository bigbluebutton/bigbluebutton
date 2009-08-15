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
package org.asteriskjava.live;

/**
 * Callback interface for asynchronous originates.
 * <p>
 * Contract:<br>
 * {@link #onDialing(AsteriskChannel)} is called exactly once iif originate did not fail.
 * It is called immediately after the channel has been created and before it is ringing.<br>
 * In case of a failure {@link #onFailure(LiveException)} is the only method that is called
 * and it is called exactly once.<br>
 * Otherwise one of {@link #onSuccess(AsteriskChannel)} {@link #onBusy(AsteriskChannel)} or
 * {@link #onNoAnswer(AsteriskChannel)} is called exactly once.
 * 
 * @see AsteriskServer#originateToApplicationAsync(String, String, String, long, OriginateCallback)
 * @see AsteriskServer#originateToApplicationAsync(String, String, String, long, CallerId, java.util.Map, OriginateCallback)
 * @see AsteriskServer#originateToExtensionAsync(String, String, String, int, long, OriginateCallback)
 * @see AsteriskServer#originateToExtensionAsync(String, String, String, int, long, CallerId, java.util.Map, OriginateCallback)
 * @author srt
 * @version $Id: OriginateCallback.java 938 2007-12-31 03:23:38Z srt $
 * @since 0.3
 */
public interface OriginateCallback
{
    /**
     * Called when the channel has been created and before it starts ringing.
     * 
     * @param channel the channel created.
     */
    void onDialing(AsteriskChannel channel);

    /**
     * Called if the originate was successful and the called party answered the
     * call.
     * 
     * @param channel the channel created.
     */
    void onSuccess(AsteriskChannel channel);

    /**
     * Called if the originate was unsuccessful because the called party did not
     * answer the call.
     * 
     * @param channel the channel created.
     */
    void onNoAnswer(AsteriskChannel channel);

    /**
     * Called if the originate was unsuccessful because the called party was
     * busy.
     * 
     * @param channel the channel created.
     */
    void onBusy(AsteriskChannel channel);

    /**
     * Called if the originate failed for example due to an invalid channel name
     * or an originate to an unregistered SIP or IAX peer.
     * 
     * @param cause the exception that caused the failure.
     */
    void onFailure(LiveException cause);
}
