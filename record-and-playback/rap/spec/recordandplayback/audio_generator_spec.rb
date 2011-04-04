require 'spec_helper'

module Generator
  describe Audio do
    context "#success" do
      it "should create a silence file" do 
        ag = Generator::Audio.new
        ag.generate_silence(2000,"/tmp/audio.dat", 8000)
      end
    end
  end
end