const { spawn } = require('child_process');
const path = require('path');
// const { app } = require('electron'); // Unused and breaks node testing

class PythonBridge {
  constructor() {
    this.pythonProcess = null;
    this.isReady = false;
    this.pendingRequests = [];
    // Adjust path to where new_project/bridge.py is located relative to the electron app
    // In dev: project/electron -> ../../new_project/bridge.py
    this.scriptPath = path.join(__dirname, '../../new_project/bridge.py');
    
    // In production, you might need to adjust this path based on how you package the app
    // For this prototype, we assume the dev structure.
  }

  start() {
    if (this.pythonProcess) return;

    console.log('Starting Python bridge...', this.scriptPath);
    
    // Use 'python' or 'python3' depending on system. 
    // Ideally this should be configurable or detected.
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    this.pythonProcess = spawn(pythonCommand, [this.scriptPath]);

    this.pythonProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        if (line.includes('READY')) {
            console.log('Python bridge is ready');
            this.isReady = true;
            this.processQueue();
        } else {
            try {
                const response = JSON.parse(line);
                if (this.currentResolver) {
                    this.currentResolver(response);
                    this.currentResolver = null;
                    this.processQueue();
                }
            } catch (e) {
                console.error('Error parsing python output:', line, e);
            }
        }
      }
    });

    this.pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    this.pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      this.pythonProcess = null;
      this.isReady = false;
    });
  }

  processQueue() {
    if (!this.isReady || this.pendingRequests.length === 0 || this.currentResolver) return;

    const { text, resolve } = this.pendingRequests.shift();
    this.currentResolver = resolve;
    
    const message = JSON.stringify({ description: text }) + '\r\n';
    this.pythonProcess.stdin.write(message);
  }

  predict(text) {
    return new Promise((resolve) => {
      if (!this.pythonProcess) {
        this.start();
      }
      this.pendingRequests.push({ text, resolve });
      if (this.isReady) {
        this.processQueue();
      }
    });
  }
  
  stop() {
    if (this.pythonProcess) {
        this.pythonProcess.kill();
        this.pythonProcess = null;
    }
  }
}

module.exports = new PythonBridge();
