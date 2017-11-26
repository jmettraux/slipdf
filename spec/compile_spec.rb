
#
# Spec'ing Slipdf
#
# Tue Nov 21 18:15:32 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe '.compile' do

    it 'returns a template function' do

      expect(js %q{
        var s =
          'doc\n' +
          '  - user.children.forEach(function(c) \{\n' +
          '    name= c.name\n';
        return (typeof Slipdf.compile(s));
      }).to eq(
        'function'
      )
    end
  end
end

