class Logger
	def self.info(msg)
	  print "[INFO]".green
	  print "\t#{msg}\n"
	end

	def self.warn(msg)
	  print "[WARN]".white_on_yellow
	  print "\t#{msg}\n"
	end

	def self.debug(msg)
	  print "[DEBUG]".white_on_blue
	  print "\t#{msg}\n"
	end

	def self.error(msg)
	  print "[ERR]".white_on_red
	  print "\t#{msg}\n"
	end
end