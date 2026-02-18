const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ScriptService {
  constructor() {
    this.scriptDir = path.join(__dirname, '../../../bug-bounty-system/scripts');
    this.outputDir = path.join(__dirname, '../../data/outputs');
    this.activeJobs = new Map();
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async executeScript(scriptName, target, jobId, io = null) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.scriptDir, scriptName);
      const outputPath = path.join(this.outputDir, `${jobId}.log`);
      
      if (!fs.existsSync(scriptPath)) {
        reject(new Error(`Script not found: ${scriptName}`));
        return;
      }

      const args = [target];
      const child = spawn('bash', [scriptPath, ...args]);
      
      let output = '';
      let errorOutput = '';

      // Update job status to running
      this.updateJobStatus(jobId, 'running', io);
      
      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Log to file
        fs.appendFileSync(outputPath, text);
        
        // Emit real-time updates
        if (io) {
          io.to(`target-${target}`).emit('script-output', {
            jobId,
            output: text,
            timestamp: new Date().toISOString()
          });
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        
        fs.appendFileSync(outputPath, `ERROR: ${text}`);
        
        if (io) {
          io.to(`target-${target}`).emit('script-error', {
            jobId,
            error: text,
            timestamp: new Date().toISOString()
          });
        }
      });

      child.on('close', (code) => {
        const status = code === 0 ? 'completed' : 'failed';
        const result = {
          exitCode: code,
          output: output,
          error: errorOutput,
          timestamp: new Date().toISOString(),
          outputFiles: this.getOutputFiles(target, jobId)
        };

        this.updateJobStatus(jobId, status, io, result);
        this.activeJobs.delete(jobId);
        
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Script exited with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        this.updateJobStatus(jobId, 'failed', io, { error: error.message });
        this.activeJobs.delete(jobId);
        reject(error);
      });

      this.activeJobs.set(jobId, {
        process: child,
        startTime: Date.now(),
        target,
        scriptName
      });
    });
  }

  updateJobStatus(jobId, status, io = null, result = null) {
    const jobData = {
      jobId,
      status,
      timestamp: new Date().toISOString(),
      result
    };

    if (io) {
      io.emit('job-status-update', jobData);
    }

    console.log(`Job ${jobId} status: ${status}`);
  }

  getOutputFiles(target, jobId) {
    const targetDir = path.join(this.outputDir, '../targets', target);
    const files = [];
    
    if (fs.existsSync(targetDir)) {
      const items = fs.readdirSync(targetDir);
      items.forEach(item => {
        const itemPath = path.join(targetDir, item);
        const stats = fs.statSync(itemPath);
        if (stats.isFile()) {
          files.push({
            name: item,
            path: itemPath,
            size: stats.size,
            modified: stats.mtime
          });
        }
      });
    }
    
    return files;
  }

  async killJob(jobId) {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.process.kill('SIGTERM');
      this.activeJobs.delete(jobId);
      return true;
    }
    return false;
  }

  getJobStatus(jobId) {
    const job = this.activeJobs.get(jobId);
    return {
      jobId,
      status: job ? 'running' : 'completed',
      startTime: job?.startTime,
      runtime: job ? Date.now() - job.startTime : 0
    };
  }

  parseReconResults(target) {
    const targetDir = path.join(this.outputDir, '../targets', target);
    const results = {
      subdomains: [],
      liveHosts: [],
      technologies: [],
      ports: [],
      vulnerabilities: [],
      summary: {}
    };

    try {
      // Parse subdomains
      const subdomainsFile = path.join(targetDir, 'subdomains.txt');
      if (fs.existsSync(subdomainsFile)) {
        const content = fs.readFileSync(subdomainsFile, 'utf8');
        results.subdomains = content.split('\n').filter(line => line.trim());
      }

      // Parse live hosts
      const liveFile = path.join(targetDir, 'live-subdomains.txt');
      if (fs.existsSync(liveFile)) {
        const content = fs.readFileSync(liveFile, 'utf8');
        results.liveHosts = content.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const [url, status, title] = line.split('\t');
            return { url, status, title };
          });
      }

      // Update summary
      results.summary = {
        totalSubdomains: results.subdomains.length,
        liveHosts: results.liveHosts.length,
        scanDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error parsing recon results:', error);
    }

    return results;
  }
}

module.exports = new ScriptService();