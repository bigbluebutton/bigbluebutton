require 'spec_helper'
require 'redis'

module BigBlueButton
  describe RedisEventsArchiver do       
    context "#success" do
      it "should return the meeting metadata" do               
        @redis = BigBlueButton::RedisWrapper.new("localhost", 6379)
        @redis.stub(:metadata_for).and_return({"matterhorn" => true, "professor" => "Tony B.", "title" => "Ecosystem"})
        @events_archiver = BigBlueButton::RedisEventsArchiver.new @redis
        result = @redis.metadata_for("test-meeting-id")
        result["matterhorn"].should be_true
        result["professor"].should == "Tony B."
      end
    end
  end
end