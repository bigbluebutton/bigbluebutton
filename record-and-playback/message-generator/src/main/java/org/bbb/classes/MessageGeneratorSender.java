/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb.classes;

import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import javax.jms.JMSException;
import javax.jms.MapMessage;
import javax.jms.Message;
import javax.jms.Session;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;

/**
 *
 * @author Markos
 */
public class MessageGeneratorSender implements IMessageGeneratorSender {
    private JmsTemplate jmsTemplate;

    public void sendEvents(Map<String,String> map) {
        jmsTemplate.send(new MessageCreatorEvent(map));
    }

    /**
     * @return the jmsTemplate
     */
    public JmsTemplate getJmsTemplate() {
        return jmsTemplate;
    }

    /**
     * @param jmsTemplate the jmsTemplate to set
     */
    public void setJmsTemplate(JmsTemplate jmsTemplate) {
        this.jmsTemplate = jmsTemplate;
    }

}
