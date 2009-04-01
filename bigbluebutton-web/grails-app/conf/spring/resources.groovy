
// Place your Spring DSL code here
beans = {

	jmsFactory(org.apache.activemq.pool.PooledConnectionFactory) { bean ->
		bean.destroyMethod = "stop"
		connectionFactory = {org.apache.activemq.ActiveMQConnectionFactory cf ->
			brokerURL = "tcp://localhost:61616"
		}
	}
	
	jmsTemplate(org.springframework.jms.core.JmsTemplate) {
		connectionFactory = jmsFactory
	}
	
	jmsMessageListener(org.springframework.jms.listener.adapter.MessageListenerAdapter, ref("recordService")) {
		//delegate = ref("recordService")
		defaultListenerMethod = "handleRecordMessage"
	}
	
	messageListener(org.bigbluebutton.web.jms.RecordMessageListener)
	
	recordQueue(org.apache.activemq.command.ActiveMQQueue, "RecordQueue")
	
	jmsContainer(org.springframework.jms.listener.DefaultMessageListenerContainer) {
		connectionFactory = jmsFactory		
		concurrentConsumers = 1
		destination = ref("recordQueue")
		messageListener = messageListener		
		transactionManager = ref("transactionManager")
		autoStartup = false
	}
	
		////destination = ref("recordDestination")
		//destinationName = "RecordQueue"	
//		   pbxLive(org.bigbluebutton.pbx.PbxLive) { bean ->
//			      bean.initMethod = "startup" 
//			      bean.destroyMethod = "shutdown"
//			      asteriskServer = ref("asteriskServer")
//		   }
			   
//		   asteriskServer(org.asteriskjava.live.DefaultAsteriskServer,
//					"192.168.0.101", "ralam", "secure") {}  		
}