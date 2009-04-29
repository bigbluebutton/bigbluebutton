
// Place your Spring DSL code here
beans = {

	jmsFactory(org.apache.activemq.pool.PooledConnectionFactory) { bean ->
		connectionFactory = {org.apache.activemq.ActiveMQConnectionFactory cf ->
			brokerURL = "tcp://localhost:61616"
		}
	}
	
	jmsTemplate(org.springframework.jms.core.JmsTemplate) {
		connectionFactory = jmsFactory
	} 		
}