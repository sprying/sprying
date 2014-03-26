
module.exports = function(grunt) {

    var path = require("path")


    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        concat: {
            seajs: {
                src: [
                    "src/es5-safe.js",
                    "src/sprying.js"
                ],
                dest: "dist/sprying-debug.js"
            }
        },

        gcc: {
            spryingjs: {
                src: "dist/sprying-debug.js",
                dest: "dist/sprying.js",
                options: {
                    banner: "/*! sprying.js <%= pkg.version %>\n" +
                        "//# sourceMappingURL=sprying.js.map\n*/",

                    source_map_format: "V3",
                    create_source_map: "dist/sprying.js.map",

                    compilation_level: "SIMPLE_OPTIMIZATIONS",
                    externs: "tools/extern.js",

                    warning_level: "QUIET",
                    jscomp_off: "checkTypes",
                    jscomp_error: "checkDebuggerStatement"
                }
            }
        }

    })


    grunt.registerTask("embed", "Embed version etc.", function() {
        var filepath = "dist/sprying-debug.js"
        var version = grunt.config("pkg.version")

        var code = grunt.file.read(filepath)
        code = code.replace(/@VERSION/g, version)
        grunt.file.write(filepath, code)

        grunt.log.writeln("@VERSION is replaced to \"" + version + "\".")
    })

    grunt.registerTask("fix", "Fix sourceMap etc.", function() {
        var mapfile = "dist/sprying.js.map"

        var code = grunt.file.read(mapfile)
        code = code.replace('"file":""', '"file":"sprying.js"')
        code = code.replace("dist/sprying-debug.js", "sprying-debug.js")
        grunt.file.write(mapfile, code)
        grunt.log.writeln('"' + mapfile + '" is fixed.')

        /*
         // No `$` variable in compressed code to avoiding conflicting
         // when inline in velocity template.
         var minfile = "dist/sea.js"

         code = grunt.file.read(minfile)
         code = code.replace('function $', 'function _')
         code = code.replace('$=', '_=')
         code = code.replace(/\$\./g, '_.')
         code = code.replace(/\$&&/g, '_&&')
         code = code.replace(/=\$/g, '=_')
         code = code.replace(/\$\(/g, '_(')
         grunt.file.write(minfile, code)
         grunt.log.writeln('$ in "' + minfile + '" is fixed.')
         */
    })


    grunt.loadTasks("tools/grunt-tasks")
    grunt.loadNpmTasks("grunt-contrib-concat")

    grunt.registerTask("default", ["concat", "embed", "gcc:spryingjs", "fix"])

}

