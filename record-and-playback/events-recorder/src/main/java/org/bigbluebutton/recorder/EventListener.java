/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bigbluebutton.recorder;

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
    private static final String FIELD_TSEVENT="tsevent";
    private static final String FIELD_MESSAGE="message";

    private static final String TABLE_EVENT="event";

    private JdbcTemplate jdbcTemplate;

    public void onMessage(Message msg) {
        if(msg instanceof ObjectMessage){
            try{
                IEventMessage objmsg=(IEventMessage)((ObjectMessage)msg).getObject();
                if(objmsg instanceof IEventMessage){
                    if(!isDuplicated(objmsg)){
                        insertEvent(objmsg);
                    }
                }
            }catch(JMSException ex){
                ex.printStackTrace();
            }
        }
    }

    public void insertEvent(IEventMessage event) {
        String sql = "INSERT INTO "+TABLE_EVENT;
        sql=sql+" ("+FIELD_CONFERENCEID+","+FIELD_TSEVENT+","+FIELD_MESSAGE+")";
        sql=sql+" VALUES (?, ?, ?)";
        jdbcTemplate.update(sql,
                    new Object[] {event.getConferenceID(),event.getTimeStamp(),event.getMessage()});
    }

    /**
     * @param jdbcTemplate the jdbcTemplate to set
     */
    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private boolean isDuplicated(IEventMessage objmsg) {
        String sql="SELECT COUNT(0) FROM "+TABLE_EVENT+" WHERE "+FIELD_CONFERENCEID+" = ? AND "+FIELD_TSEVENT+" = ?";
        int count=jdbcTemplate.queryForInt(sql, new Object[]{objmsg.getConferenceID(),objmsg.getTimeStamp()});
        if(count>0)
            return true;
        return false;
    }

}
