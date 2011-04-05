require 'spec_helper'
require 'digest/md5'

module Generator
  describe Audio do
    context "#success" do
      it "should create a silence file" do 
        ag = Generator::Audio.new
        ag.generate_silence(2000,"/tmp/silence-audio.wav", 16000)
        puts Digest::MD5.hexdigest(File.read("/tmp/silence-audio.wav")) + " " + "18a011a2706e27ff3f574c30a002505d"
      end
    end
  end
end