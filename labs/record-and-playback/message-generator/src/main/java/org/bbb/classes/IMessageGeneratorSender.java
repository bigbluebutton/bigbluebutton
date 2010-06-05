/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb.classes;

import java.util.Map;

/**
 *
 * @author Markos
 */
public interface IMessageGeneratorSender {
    public void sendEvents(Map<String,String> map);
}
