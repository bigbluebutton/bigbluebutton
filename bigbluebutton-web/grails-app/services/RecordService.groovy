import javax.jms.MapMessage

class RecordService {

    boolean transactional = true

    def handleRecordMessage = {message ->
    	
		println "--Got JMS message"
    }
}
