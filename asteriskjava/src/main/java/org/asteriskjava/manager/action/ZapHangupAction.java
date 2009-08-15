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
package org.asteriskjava.manager.action;

/**
 * The ZapHangupAction hangs up a zap channel.
 * 
 * @author srt
 * @version $Id: ZapHangupAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class ZapHangupAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -4064616334146097495L;
    private Integer zapChannel;

    /**
     * Creates a new empty ZapHangupAction.
     */
    public ZapHangupAction()
    {

    }

    /**
     * Creates a new ZapHangupAction that hangs up the given zap channel.
     * 
     * @param zapChannel the number of the zap channel to hang up
     * @since 0.2
     */
    public ZapHangupAction(Integer zapChannel)
    {
        this.zapChannel = zapChannel;
    }

    /**
     * Returns the name of this action, i.e. "ZapHangup".
     */
    @Override
   public String getAction()
    {
        return "ZapHangup";
    }

    /**
     * Returns the number of the zap channel to hangup.
     */
    public Integer getZapChannel()
    {
        return zapChannel;
    }

    /**
     * Sets the number of the zap channel to hangup.<p>
     * This property is mandatory.
     */
    public void setZapChannel(Integer channel)
    {
        this.zapChannel = channel;
    }
}
