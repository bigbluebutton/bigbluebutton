module BigBlueButton    
    def self.directory_exist?(location)
      FileTest.directory?(location)
    end
end

    