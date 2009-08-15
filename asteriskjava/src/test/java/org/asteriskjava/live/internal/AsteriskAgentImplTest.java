/*
 *  This code is property of GONICUS GmbH
 *  
 *  (c) 2007
 *
 *  SVN-Information
 *       Author: $LastChangedBy: srt $
 *     Revision: $LastChangedRevision: 966 $
 *  Last change: $LastChangedDate: 2008-02-03 02:00:58 -0500 (Sun, 03 Feb 2008) $
 *
 *         File: AsteriskAgentImplTest.java
 *      Package: org.asteriskjava.live.internal
 *
 *   Change History:
 *
 *             0001 breucking Sep 12, 2007 File created
 */
package org.asteriskjava.live.internal;

import static org.junit.Assert.assertEquals;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import org.asteriskjava.live.AgentState;
import org.junit.Before;
import org.junit.Test;

/**
 * @author <a href="mailto:patrick.breucking{@nospam}gonicus.de">Patrick
 *         Breucking</a>
 * @since 0.1
 * @version $Id: AsteriskAgentImplTest.java 966 2008-02-03 07:00:58Z srt $
 * 
 */
public class AsteriskAgentImplTest
{

    private AsteriskAgentImpl agent;
    private int numberOfChanges;

    /**
     * @throws java.lang.Exception
     */
    @Before
    public void setUp() throws Exception
    {
	AsteriskServerImpl server = new AsteriskServerImpl();
	agent = new AsteriskAgentImpl(server, "Testagent", "Agent/999",
		AgentState.AGENT_IDLE);
	numberOfChanges = 0;
    }

    /**
     * Test method for
     * {@link org.asteriskjava.live.internal.AsteriskAgentImpl#updateState(org.asteriskjava.live.AgentState)}.
     */
    @Test
    public void testUpdateStatus()
    {
	assertEquals(AgentState.AGENT_IDLE, agent.getState());
	agent.addPropertyChangeListener(new PropertyChangeListener()
	{
	    public void propertyChange(PropertyChangeEvent evt)
	    {
		assertEquals("wrong propertyName", "state", evt
			.getPropertyName());
		assertEquals("wrong oldValue", AgentState.AGENT_IDLE, evt
			.getOldValue());
		assertEquals("wrong newValue", AgentState.AGENT_RINGING, evt
			.getNewValue());
		assertEquals("wrong queue", agent, evt.getSource());
		numberOfChanges++;
	    }

	});
	agent.updateState(AgentState.AGENT_RINGING);
	assertEquals("wrong number of propagated changes", 1, numberOfChanges);
    }

}
