
#
# Spec'ing Slipdf
#
# Tue Nov 21 18:15:32 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe '.prepare' do

    it 'creates a template' do

      expect(
        js %q{
          var s =
            'document\n' +
            '  footer\n' +
            '    image.logo\n';
          return Slipdf.prepare(s);
        }
      ).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'footer', 'cn' => [
              { 't' => 'image', 'cs' => %w[ logo ] }
            ] }
          ] }
      )
    end

    it 'creates a template (with strings)' do

      expect(js %q{
        var s =
          'document\n' +
          '  footer\n' +
          '    | fun stuff\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'document', 'cn' => [
            { 't' => 'footer', 'cn' => [
              { 's' => 'fun stuff' }
            ] }
          ] }
      )
    end

    it 'creates a template (with code)' do

      expect(js %q{
        var s =
          'document\n' +
          '  = user.name\n' +
          '  - user.items.forEach(function(i) \{\n' +
          '    = i.count\n';
        return Slipdf.prepare(s);
      }).to eq(
        { 't' => 'document', 'cn' => [
            { 'x' => '=', 'c' => 'user.name' },
            { 'x' => '-', 'c' => 'user.items.forEach(function(i) {', 'cn' => [
              { 'x' => '=', 'c' => 'i.count' }
            ] },
          ] }
      )
    end
  end

  describe '.compile' do

    it 'returns a template function'
  end

  describe 'template' do

    describe '()' do

      it 'generates a pdfmake document'
    end
  end
end

