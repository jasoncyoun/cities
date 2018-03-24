# Based on http://www.jonathanleighton.com/articles/2011/awesome-active-record-bug-reports/

# Run this script with `$ ruby import_script.rb`
# to-do maybe we'll need a Gemfile
# TODO: Fix louisville, nashville, etc

require 'mysql2'
require 'active_record'
require 'carmen'

# Use `binding.pry` anywhere in this script for easy debugging
# require 'pry'

ActiveRecord::Base.establish_connection(
  adapter: 'mysql2',
  database: 'cities',
  username: 'root',
  password: '',
  host: '127.0.0.1'
)

# Define a minimal database schema
ActiveRecord::Schema.define do
  unless ActiveRecord::Base.connection.table_exists? :states
    create_table :states do |t|
      t.string :name
      t.string :abbr
      t.integer :population
    end
    add_index :states, :name, unique: true
  end

  unless ActiveRecord::Base.connection.table_exists? :cities
    create_table :cities do |t|
      t.string :name, required: true
      t.string :lowercase_name, required: true # @TODO: put this in ElasticSearch
      t.integer :state_id, required: true
      t.integer :population, default: 0
    end
    add_index :cities, [:state_id, :name], unique: true
    add_index :cities, [:state_id, :lowercase_name], unique: true
  end
end

# Define the models
class City < ActiveRecord::Base
  belongs_to :state, inverse_of: :cities, required: true
  before_save :set_lowercase_name

  def set_lowercase_name
    self.lowercase_name = name.strip.downcase
  end
end

class State < ActiveRecord::Base
  has_many :cities, inverse_of: :state, class_name: City
end

ActiveRecord::Base.transaction do
  Carmen::Country.named('United States').subregions.select{|s| ['district', 'state'].include?(s.type) }.each do |state|
    State.find_or_create_by(name: state.name, abbr: state.code)
  end
end

File.open("./city_data.txt", "r") do |f|
  state_populations = {}
  f.each_line do |line|
    city_state, population = line.split("\t")
    city_name, state_name = city_state.split(", ")

    puts "Seeding #{city_name}, #{state_name}, population: #{population}"

    state = State.find_by(name: state_name)
    city = City.where(name: city_name, state: state).first_or_create!(population: population)
  end
end

State.all.each do |state|
  population = ActiveRecord::Base.connection.execute("SELECT SUM(population) FROM cities WHERE state_id = %d" % state.id).first.first
  state.update(population: population)
end