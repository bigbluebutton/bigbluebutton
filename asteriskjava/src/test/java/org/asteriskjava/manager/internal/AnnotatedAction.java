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
package org.asteriskjava.manager.internal;

import org.asteriskjava.manager.action.AbstractManagerAction;
import org.asteriskjava.manager.AsteriskMapping;

public class AnnotatedAction extends AbstractManagerAction
{
    private static final long serialVersionUID = 1L;
    private String property1;
    private String property2;

    @AsteriskMapping("property-3") // annotated field
    private String property3;

    public AnnotatedAction()
    {
    }

    public AnnotatedAction(String property1, String property2, String property3)
    {
        this.property1 = property1;
        this.property2 = property2;
        this.property3 = property3;
    }

    @Override
   public String getAction()
    {
        return "Custom";
    }

    @AsteriskMapping("property-1") // annotated getter
    public String getProperty1()
    {
        return property1;
    }

    public void setProperty1(String property1)
    {
        this.property1 = property1;
    }

    public String getProperty2()
    {
        return property2;
    }

    @AsteriskMapping("property-2") // annotated setter
    public void setProperty2(String property2)
    {
        this.property2 = property2;
    }

    public String getProperty3()
    {
        return property3;
    }

    public void setProperty3(String property3)
    {
        this.property3 = property3;
    }
}