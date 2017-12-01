
#
# Spec'ing Slipdf
#
# Fri Dec  1 09:53:01 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe 'footer function' do

    it 'works' do

      c = JSON.dump({ template: 'f_0' })

      s = File.read('spec/f_0.slim')
      #puts '-' * 80; puts s; puts '-' * 80
      s = s.inspect

      #print_tree(js "return Slipdf.debug(#{s}, 3);")
      #puts '-' * 80; pp(js "return Slipdf.prepare(#{s});")
      #puts '-' * 80; pp(js "return Slipdf.compile(#{s})(#{c});")
      #puts '-' * 80; puts YAML.dump(js "return Slipdf.compile(#{s})(#{c});")

      #pp(js "return Slipdf.compile(#{s})(#{c}).footer(1, 2);")

      expect(
        js "return Slipdf.compile(#{s})(#{c}).footer(1, 2);"
      ).to eq(
        [ { 'text' => '1 / 2', 'style' => [ 'footer', 'pagination' ] } ]
      )
    end
  end
end

