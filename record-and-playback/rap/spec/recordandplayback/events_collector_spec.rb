require 'spec_helper'
require 'redis'

module BigBlueButton
  describe RedisEventsArchiver do   
    before(:all) do
      @events_archiver = BigBlueButton::RedisEventsArchiver.new
      @events_archiver.connect("192.168.0.166", 6379)
      @events_archiver.is_connected?.should be_true
      @events_archiver.setup_test_data
      
    end
            
    after(:all) do
      @events_archiver.disconnect
      @events_archiver.is_connected?.should be_false
    end    
    
    context "#success" do
      it "should connect to redis" do       
        expect { @events_archiver.is_connected? }.to_not raise_error
        @events_archiver.is_connected?.should be_true
        @events_archiver.store_events('test-meeting-id')
      end
    end

  end
end