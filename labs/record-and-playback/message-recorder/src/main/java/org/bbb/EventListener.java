/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.ObjectMessage;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 *
 * @author Markos
 */
public class EventListener implements MessageListener {

    private static final String FIELD_CONFERENCEID="conferenceid";
    private static final String FIELD_UUID="uuid";
    private static final String FIELD_MESSAGE="message";

    private static final String TABLE_EVENT="events";

    private JdbcTemplate jdbcTemplate;

    public void onMessage(Message msg) {
        if(msg instanceof ObjectMessage){
            try{
                IEvent objmsg=(IEvent)((ObjectMessage)msg).getObject();
                if(objmsg instanceof IEvent){
                    if(!isDuplicated(objmsg)){
                        insertEvent(objmsg);
                    }
                }
            }catch(JMSException ex){
                ex.printStackTrace();
            }
        }
    }

    public void insertEvent(IEvent event) {
        String sql = "INSERT INTO "+TABLE_EVENT;
        sql=sql+" ("+FIELD_UUID+","+FIELD_CONFERENCEID+","+FIELD_MESSAGE+")";
        sql=sql+" VALUES (?, ?, ?)";
        jdbcTemplate.update(sql,
                    new Object[] {event.getUUID(),event.getConferenceID(),event.getMessage()});
    }

    /**
     * @param jdbcTemplate the jdbcTemplate to set
     */
    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private boolean isDuplicated(IEvent objmsg) {
        String sql="select count(0) from events where uuid = ?";
        int count=jdbcTemplate.queryForInt(sql, new Object[]{objmsg.getUUID()});
        if(count>0)
            return true;
        return false;
    }

}
