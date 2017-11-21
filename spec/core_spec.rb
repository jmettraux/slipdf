
#
# Spec'ing Slipdf
#
# Tue Nov 21 18:15:32 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe '.template' do

    it 'creates a template' do

      expect(
        js %q{
          var s =
            'document\n' +
            '  footer\n' +
            '    image.logo\n';
          return Slipdf.template(s);
        }
      ).to eq(:x)
    end
  end

  describe 'template' do

    describe '.generate' do

      it 'generates a pdfmake document'
    end
  end
end

