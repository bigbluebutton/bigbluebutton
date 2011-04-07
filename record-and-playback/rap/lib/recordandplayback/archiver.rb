
module BigBlueButton
  class Archiver
    def meeting_recorded?(meeting_id)
      true
      helper = BigBlueButton::Helper.new
      helper.am_i_visible?
    end
    
    def store_recorded_events(meeting_id)
      
    end
  end
end
