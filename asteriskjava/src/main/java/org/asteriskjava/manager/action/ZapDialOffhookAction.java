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
 * The ZapDialOffhookAction dials a number on a zap channel while offhook.
 * 
 * @author srt
 * @version $Id: ZapDialOffhookAction.java 938 2007-12-31 03:23:38Z srt $
 */
public class ZapDialOffhookAction extends AbstractManagerAction
{
    /**
     * Serializable version identifier
     */
    private static final long serialVersionUID = -4708738122184810899L;
    private Integer zapChannel;
    private String number;

    /**
     * Creates a new empty ZapDialOffhookAction.
     */
    public ZapDialOffhookAction()
    {

    }

    /**
     * Creates a new ZapDialOffhookAction that dials the given number on the
     * given zap channel.
     * 
     * @param zapChannel the number of the zap channel
     * @param number the number to dial
     * @since 0.2
     */
    public ZapDialOffhookAction(Integer zapChannel, String number)
    {
        this.zapChannel = zapChannel;
        this.number = number;
    }

    /**
     * Returns the name of this action, i.e. "ZapDialOffhook".
     */
    @Override
   public String getAction()
    {
        return "ZapDialOffhook";
    }

    /**
     * Returns the number of the zap channel.
     */
    public Integer getZapChannel()
    {
        return zapChannel;
    }

    /**
     * Sets the number of the zap channel.<p>
     * This property is mandatory.
     */
    public void setZapChannel(Integer channel)
    {
        this.zapChannel = channel;
    }

    /**
     * Returns the number to dial.
     */
    public String getNumber()
    {
        return number;
    }

    /**
     * Sets the number to dial.<p>
     * This property is mandatory.
     */
    public void setNumber(String number)
    {
        this.number = number;
    }
}
