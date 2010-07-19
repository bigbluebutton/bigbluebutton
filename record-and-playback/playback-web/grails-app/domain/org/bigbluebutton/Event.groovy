package org.bigbluebutton

class Event implements Serializable{

    String conferenceid
    long tsevent
    String message

    static mapping = {
        version false
        id composite:['conferenceid', 'tsevent']
    }
}
