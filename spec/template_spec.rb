
#
# Spec'ing Slipdf
#
# Tue Nov 21 18:15:32 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe 'template' do

    describe '()' do

      Dir['spec/t_*.slim'].each do |slim|

        i = slim.match(/\d+/)[0].to_i

        sli =
          File.basename(slim)
        src =
          File.read(slim).inspect
        ctx = JSON.dump(
          eval(File.read("spec/t_#{i}_ctx.rb")))
        res =
          eval(File.read("spec/t_#{i}.rb"))

        it "generates a pdfmake document for #{sli}" do

          #print_tree(js "var src = #{src}; return Slipdf.debug(src, 3);")
          pp(js "var src = #{src}; return Slipdf.prepare(src);")

          expect(js("return Slipdf.compile(#{src})(#{ctx});")).to eq(res)
        end
      end
    end
  end
end

