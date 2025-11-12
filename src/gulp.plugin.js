// Modern ES6 version of docpad-plugin-gulp (DocPad 8 compatible)
module.exports = function (BasePlugin) {
    class GulpPlugin extends BasePlugin {

        get name() {
            return "gulp";
        }

        // ✅ MUST NOT define "config:" — use this instead
        getDefaultConfig() {
            return {
                background: false,
                writeAfter: []
            };
        }

        constructor(opts) {
            super(opts);

            const { docpad } = opts;

            this.safeps = require("safeps");
            this.path = require("path");
            this.glob = require("glob");

            this.createEventHandlers(docpad);
        }

        createEventHandlers(docpad) {
            docpad.getEvents().forEach(eventName => {
                this[eventName] = (opts, next) => {
                    const tasks = this.getConfig()[eventName];

                    if (tasks) {
                        this.processGulp(tasks, opts, next);
                    } else {
                        next();
                    }
                };
            });
        }

        processGulp(tasks, opts, next) {
            const rootPath = this.docpad.getConfig().rootPath;

            const files = this.glob.sync("**/gulp/bin/gulp.js", {
                cwd: rootPath,
                nosort: true
            });

            const gulpPath = files[0];

            if (!gulpPath) {
                return next(new Error("Could not find the gulp command line interface."));
            }

            const command = [
                this.path.join(rootPath, gulpPath),
                ...tasks
            ];

            if (!this.getConfig().background) {
                this.safeps.spawn(command, { cwd: rootPath, output: true }, next);
            } else {
                this.safeps.spawn(command, { cwd: rootPath, output: true });
                next();
            }
        }
    }

    return GulpPlugin;
};
