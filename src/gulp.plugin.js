// @ts-nocheck
'use strict'

const BasePlugin = require('docpad-baseplugin')
const { spawn } = require('child_process')
const path = require('path')
const os = require('os')

class GulpPlugin extends BasePlugin {
  get name() {
    return 'gulp'
  }

  get initialConfig() {
    return {
      background: false,
      generateAfter: ['build-js'], // default Gulp tasks to run after generate
    }
  }

  // Hook into DocPad's generateAfter event
  generateAfter(opts, next) {
    const config = this.getConfig()
    const tasks = config.generateAfter

    if (!tasks || tasks.length === 0) {
      return next()
    }

    const startTime = Date.now()
    const cwd = process.cwd()

    // Use npx or npx.cmd for Windows
    const gulpCommand = os.platform() === 'win32' ? 'npx.cmd' : 'npx'
    const gulpArgs = ['gulp', ...tasks]

    this.docpad.log('info', `[GulpPlugin] Running Gulp tasks: ${tasks.join(', ')}`)

    const gulpProc = spawn(gulpCommand, gulpArgs, {
      stdio: 'inherit',
      shell: true,
      cwd,
    })

    gulpProc.on('error', (err) => {
      this.docpad.log('error', `[GulpPlugin] Failed to start Gulp: ${err}`)
      next(err)
    })

    gulpProc.on('close', (code) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
      if (code === 0) {
        this.docpad.log('info', `[GulpPlugin] Gulp tasks completed successfully in ${elapsed}s`)
      } else {
        this.docpad.log('error', `[GulpPlugin] Gulp tasks exited with code ${code}`)
      }
      next()
    })
  }
}

module.exports = GulpPlugin
