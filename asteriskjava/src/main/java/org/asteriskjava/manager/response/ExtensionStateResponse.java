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
package org.asteriskjava.manager.response;

/**
 * Response to an {@link org.asteriskjava.manager.action.ExtensionStateAction}.  
 *
 * @author srt
 * @version $Id: ExtensionStateResponse.java 1124 2008-08-18 03:25:01Z srt $
 * @see org.asteriskjava.manager.action.ExtensionStateAction
 */
public class ExtensionStateResponse extends ManagerResponse
{
    private static final long serialVersionUID = -2044248427247227390L;
    private String exten;
    private String context;
    private String hint;
    private Integer status;

    public String getExten()
    {
        return exten;
    }

    public void setExten(String exten)
    {
        this.exten = exten;
    }

    public String getContext()
    {
        return context;
    }

    public void setContext(String context)
    {
        this.context = context;
    }

    public String getHint()
    {
        return hint;
    }

    public void setHint(String hint)
    {
        this.hint = hint;
    }

    public Integer getStatus()
    {
        return status;
    }

    public void setStatus(Integer status)
    {
        this.status = status;
    }

    @Override
    public String toString()
    {
        StringBuffer sb;

        sb = new StringBuffer(getClass().getName() + ": ");
        sb.append("actionId='").append(getActionId()).append("'; ");
        sb.append("message='").append(getMessage()).append("'; ");
        sb.append("response='").append(getResponse()).append("'; ");
        sb.append("uniqueId='").append(getUniqueId()).append("'; ");
        sb.append("exten='").append(getExten()).append("'; ");
        sb.append("context='").append(getContext()).append("'; ");
        sb.append("hint='").append(getHint()).append("'; ");
        sb.append("status='").append(getStatus()).append("'; ");
        sb.append("systemHashcode=").append(System.identityHashCode(this));

        return sb.toString();
    }
}
