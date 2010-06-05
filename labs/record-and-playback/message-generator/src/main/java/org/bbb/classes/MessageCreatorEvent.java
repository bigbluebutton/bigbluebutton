/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb.classes;

import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import javax.jms.JMSException;
import javax.jms.MapMessage;
import javax.jms.Message;
import javax.jms.Session;
import org.springframework.jms.core.MessageCreator;

/**
 *
 * @author Markos
 */
public class MessageCreatorEvent implements MessageCreator {

    private Map<String,String> mapevents;
    public MessageCreatorEvent(Map<String,String> mapevents){
        this.mapevents=mapevents;
    }
    public Message createMessage(Session sn) throws JMSException {
        MapMessage mapmessage=sn.createMapMessage();

        //mapmessage
        Set<String> keyvalues=mapevents.keySet();
        ArrayList arrkeys= new ArrayList(keyvalues);
        for(int j=0;j<arrkeys.size();j++){
            //arrkeys.contains("join")
            String key=(String) arrkeys.get(j);
            String value=mapevents.get(key);
            //message+=(key+"="+value);
            //message+=" ";
            mapmessage.setString(key, value);
        }

        return mapmessage;
    }

}
