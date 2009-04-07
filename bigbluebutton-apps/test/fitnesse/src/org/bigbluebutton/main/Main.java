package org.bigbluebutton.main;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Main {
	public static void main(String[] args) {
	ApplicationContext context =
	new ClassPathXmlApplicationContext("beans.xml");
//	SequenceGenerator generator =
//	(SequenceGenerator) context.getBean("sequenceGenerator");
//	System.out.println(generator.getSequence());
//	System.out.println(generator.getSequence());
	}
}
