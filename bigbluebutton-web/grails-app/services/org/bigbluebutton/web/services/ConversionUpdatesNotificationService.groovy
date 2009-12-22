/**
 * 
 */
package org.bigbluebutton.web.services



/**
 * @author Richard Alam
 *
 */
public class ConversionUpdatesNotificationService{
	boolean transactional = false
	def jmsTemplate	
	
	private sendJmsMessage(HashMap message) {
		def msg = message.toString()
		log.debug "Send Jms message $msg"
		jmsTemplate.convertAndSend(JMS_UPDATES_Q, message)
	}	
}
