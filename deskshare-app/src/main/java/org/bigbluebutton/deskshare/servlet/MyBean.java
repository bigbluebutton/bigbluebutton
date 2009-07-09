package org.bigbluebutton.deskshare.servlet;

import java.io.Serializable;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class MyBean implements Serializable {
	final private Logger log = Red5LoggerFactory.getLogger(MyBean.class, "deskshare");
	
	private static final long serialVersionUID = 42L;

	private String parameter;

	public String getParameter() {
		return parameter;
	}

	public void setParameter(String parameter) {
		this.parameter = parameter;
	}
	
	public void sendMessage(String message) {
		log.debug("Got send message {}", message);
	}
}
