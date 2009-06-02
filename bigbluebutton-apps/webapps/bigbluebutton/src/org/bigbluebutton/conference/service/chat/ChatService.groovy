package org.bigbluebutton.conference.service.chat
import org.slf4j.Loggerimport org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import org.red5.server.api.Red5
public class ChatService {
	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private ChatApplication application

	public String getChatMessages() {
		String roomName = Red5.connectionLocal.scope.name
		return application.getChatMessages(roomName)
	}
	
	public void sendMessage(String message) {
		String roomName = Red5.connectionLocal.scope.name
		application.sendMessage(roomName, message)
	}
	public void setChatApplication(ChatApplication a) {
		log.debug("Setting Chat Applications")
		application = a
	}
}
