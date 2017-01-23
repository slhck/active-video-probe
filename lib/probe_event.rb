class ProbeEvent
  attr_accessor :type, :timestamp, :data
  def initialize(type, timestamp, data)
    @type      = type
    @timestamp = timestamp
    @data      = data
  end
end