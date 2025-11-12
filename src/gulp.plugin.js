// Export Plugin
module.exports = function (BasePlugin) {
    class GulpPlugin extends BasePlugin {
        // Plugin name
        get name() {
            return 'gulp';
        }

        // Plugin default config
        get config() {
            return {
                background: false,
                writeAfter: []
            };
        }

        /**
         * Constructor
         */
        constructor(opts) {
            super(opts);

            const { docpad } = opts;

            // Dependencies
            this.safeps = require('safeps');
            this.path = require('path');
            this.glob = require('glob');

            // Attach event handlers dynamically
            this.createEventHandlers(docpad);
        }

        /**
         * Dynamically attach event handlers for any DocPad event
         */
        createEventHandlers(docpad) {
            const events = docpad.getEvents();

            events.forEach(eventName => {
                this[eventName] = (opts, next) => {
                    const tasks = this.getConfig()[eventName] || false;

                    if (tasks) {
                        this.processGulp(tasks, opts, next);
                    } else {
                        return next();
                    }
                };
            });

            return this;
        }

        /**
         * Execute gulp tasks
         */
        processGulp(tasks, opts, next) {
            const rootPath = this.docpad.getConfig().rootPath;

            // Locate gulp CLI inside node_modules
            const files = this.glob.sync('**/gulp/bin/gulp.js', {
                cwd: rootPath,
                nosort: true
            });

            const gulpPath = files[0];

            if (!gulpPath) {
                return next(new Error('Could not find the gulp command line interface.'));
            }

            // Build command
            const command = [
                this.path.join(rootPath, gulpPath),
                ...(tasks || [])
            ];

            if (!this.getConfig().background) {
                // Synchronous with output
                this.safeps.spawn(command, { cwd: rootPath, output: true }, next);
            } else {
                // Fire-and-forget background task
                this.safeps.spawn(command, { cwd: rootPath, output: true });
                next();
            }
        }
    }

    return GulpPlugin;
};
