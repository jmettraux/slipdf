
#
# Spec'ing Slipdf
#
# Tue Nov 21 18:15:32 JST 2017
#

require 'spec_helpers'


describe 'Slipdf' do

  describe 'template' do

    describe '()' do

      Dir['spec/t_*.slim']
        .sort_by { |slim| slim.match(/\d+/)[0].to_i }
        .each { |slim|

          i = slim.match(/\d+/)[0].to_i

          sli =
            File.basename(slim)
          src =
            File.read(slim).inspect
          ctx =
            JSON.dump(
              File.exist?("spec/t_#{i}_ctx.yaml") ?
              YAML.load(File.read("spec/t_#{i}_ctx.yaml")) :
              eval(File.read("spec/t_#{i}_ctx.rb")))
          res =
            File.exist?("spec/t_#{i}.yaml") ?
            YAML.load(File.read("spec/t_#{i}.yaml")) :
            eval(File.read("spec/t_#{i}.rb"))

          it "generates a pdfmake document for #{sli}" do

            #print_tree(js "var src = #{src}; return Slipdf.debug(src, 3);")

            #puts '-' * 80
            #pp(js "return Slipdf.prepare(#{src});")
              #
            #puts '-' * 80
            #pp(js "return Slipdf.compile(#{src})(#{ctx});")
              #
            #puts '-' * 80
            #puts YAML.dump(js "return Slipdf.compile(#{src})(#{ctx});")

            expect(js("return Slipdf.compile(#{src})(#{ctx});")).to eq(res)
          end }
    end
  end
end

