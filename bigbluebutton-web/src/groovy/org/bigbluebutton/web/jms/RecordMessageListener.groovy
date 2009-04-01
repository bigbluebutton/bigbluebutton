package org.bigbluebutton.web.jms

import javax.jms.MapMessage
import javax.jms.Message
import javax.jms.MessageListener

import org.springframework.jms.core.JmsTemplate

/**
 * Listener for Map messages containing messages to record.
 *
 * @author Richard Alam
 */
class RecordMessageListener implements MessageListener {

    def jmsTemplate

    public void onMessage(Message message) {

        MapMessage map = (MapMessage) message
        String msg = map.getString("message")

        println "Got ${msg}"


    }
}
