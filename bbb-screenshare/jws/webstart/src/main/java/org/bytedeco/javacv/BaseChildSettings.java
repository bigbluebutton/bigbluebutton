/*
 * Copyright (C) 2009-2011 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacv;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.beans.PropertyVetoException;
import java.beans.beancontext.BeanContextChildSupport;
import java.util.ListResourceBundle;
import java.util.concurrent.Callable;
import java.util.logging.Level;
import java.util.logging.LogRecord;

/**
 *
 * @author Samuel Audet
 */
public class BaseChildSettings extends BeanContextChildSupport implements Comparable<BaseChildSettings> {

    public void addPropertyChangeListener(PropertyChangeListener listener) {
        pcSupport.addPropertyChangeListener(listener);
    }
    public void removePropertyChangeListener(PropertyChangeListener listener) {
        pcSupport.removePropertyChangeListener(listener);
    }

    public int compareTo(BaseChildSettings o) {
        return getName().compareTo(o.getName());
    }

    protected String getName() {
        return "";
    }

    public static class PropertyVetoExceptionThatNetBeansLikes extends PropertyVetoException implements Callable {
        public PropertyVetoExceptionThatNetBeansLikes(String mess, PropertyChangeEvent evt)  {
            super(mess, evt);
        }
        public Object call() throws Exception {
            LogRecord lg = new LogRecord(Level.ALL, getMessage());
            lg.setResourceBundle(new ListResourceBundle() {
                protected Object[][] getContents() {
                    return new Object[][] { {getMessage(), getMessage()} };
                }
            });
            return new LogRecord[] { lg };
        }
    }
}
