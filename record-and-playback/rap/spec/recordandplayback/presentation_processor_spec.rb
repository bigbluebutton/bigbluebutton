require 'spec_helper'
require 'digest/md5'
require 'fileutils'

module BigBlueButton
  describe Presentation do
    context "#success" do
      it "should generate a complete audio file for the recording" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8"
        events_xml = "#{dir}/events.xml"
        presentations_dir = "#{dir}/presentations"
        BigBlueButton::Presentation.get_presentations(events_xml).size.should equal(2)
      end
      
      it "should determine the number of pages in a presentation" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8"
        events_xml = "#{dir}/events.xml"
        presentations_dir = "#{dir}/presentations/aSimple-Layout"
        BigBlueButton::Presentation.get_number_of_pages_for(presentations_dir).should equal(6)
      end
      
      it "should extract each page from the presentation" do
        dir = "resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8"
        presentation = "#{dir}/presentations/aSimple-Layout/aSimple-Layout.pdf"
        temp_dir = "/tmp/simple"
        if FileTest.directory?(temp_dir)
          FileUtils.remove_dir temp_dir
        end
        FileUtils.mkdir_p temp_dir

        1.upto(6) do |x|
          BigBlueButton::Presentation.extract_page_from_pdf(x, presentation, "#{temp_dir}/slide-#{x}.pdf")
        end
        Dir.glob("#{temp_dir}/*.pdf").size.should equal(6)
        
        1.upto(6) do |x|
          BigBlueButton::Presentation.convert_pdf_to_png("#{temp_dir}/slide-#{x}.pdf", "#{temp_dir}/slide-#{x}.png")        
        end
                
        Dir.glob("#{temp_dir}/*.png").size.should equal(6)
        
        FileUtils.remove_dir temp_dir
      end
      
    end
  end
end