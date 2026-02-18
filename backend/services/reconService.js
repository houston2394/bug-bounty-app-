const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');
const scriptService = require('./scriptService');
const axios = require('axios');
const dns = require('dns').promises;

class ReconService {
  async getSetting(key) {
    return new Promise((resolve, reject) => {
      db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
        if (err) reject(err);
        resolve(row ? row.value : null);
      });
    });
  }

  async runShodanScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');

    await this.createReconJob(jobId, targetId, 'shodan');
    
    // Run async to not block
    this._executeShodan(jobId, target.domain, io).catch(console.error);

    return jobId;
  }

  async _executeShodan(jobId, domain, io) {
    try {
      const apiKey = await this.getSetting('shodan_api_key');
      if (!apiKey) throw new Error('Shodan API Key not configured');

      io.to(`target-${jobId}`).emit('scan-update', `Resolving IP for ${domain}...`);
      
      let ip;
      try {
        const resolution = await dns.lookup(domain);
        ip = resolution.address;
      } catch (e) {
        throw new Error(`Could not resolve domain: ${e.message}`);
      }

      io.to(`target-${jobId}`).emit('scan-update', `IP Found: ${ip}. Querying Shodan...`);

      const response = await axios.get(`https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`);
      const data = response.data;

      const result = {
        ip: data.ip_str,
        ports: data.ports,
        os: data.os,
        hostnames: data.hostnames,
        vulns: data.vulns || []
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `Shodan scan complete. Found ${data.ports.length} open ports.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);

    } catch (error) {
      const msg = error.response ? `Shodan API Error: ${error.response.statusText}` : error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async runDnsScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');

    await this.createReconJob(jobId, targetId, 'dns_deep');
    
    this._executeDns(jobId, target.domain, io).catch(console.error);

    return jobId;
  }

  async _executeDns(jobId, domain, io) {
    try {
      let subdomains = new Set();
      
      // 1. CRT.sh (Free)
      io.to(`target-${jobId}`).emit('scan-update', `Querying CRT.sh for ${domain}...`);
      try {
        const crtRes = await axios.get(`https://crt.sh/?q=%.${domain}&output=json`);
        crtRes.data.forEach(entry => {
          const name = entry.name_value;
          if (name.includes(domain)) subdomains.add(name);
        });
        io.to(`target-${jobId}`).emit('scan-update', `CRT.sh found ${subdomains.size} unique subdomains.`);
      } catch (e) {
        io.to(`target-${jobId}`).emit('scan-update', `CRT.sh failed: ${e.message}`);
      }

      // 2. SecurityTrails (API Key)
      const stKey = await this.getSetting('securitytrails_api_key');
      if (stKey) {
        io.to(`target-${jobId}`).emit('scan-update', `Querying SecurityTrails...`);
        try {
          const stRes = await axios.get(`https://api.securitytrails.com/v1/domain/${domain}/subdomains`, {
            headers: { 'APIKEY': stKey }
          });
          const stSubs = stRes.data.subdomains;
          stSubs.forEach(sub => subdomains.add(`${sub}.${domain}`));
          io.to(`target-${jobId}`).emit('scan-update', `SecurityTrails added more subdomains. Total: ${subdomains.size}`);
        } catch (e) {
           io.to(`target-${jobId}`).emit('scan-update', `SecurityTrails failed: ${e.message}`);
        }
      } else {
        io.to(`target-${jobId}`).emit('scan-update', `Skipping SecurityTrails (No API Key configured)`);
      }

      const result = {
        domain,
        subdomains: Array.from(subdomains).sort(),
        count: subdomains.size
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-complete', result);

    } catch (error) {
       await this.updateReconJob(jobId, 'failed', { error: error.message });
       io.to(`target-${jobId}`).emit('scan-error', error.message);
    }
  }

  async runPassiveRecon(targetId, io) {
    const jobId = uuidv4();
    
    // Get target information
    const target = await this.getTargetById(targetId);
    if (!target) {
      throw new Error('Target not found');
    }

    // Create job record
    await this.createReconJob(jobId, targetId, 'passive');

    // Execute script asynchronously
    scriptService.executeScript('passive-recon.sh', target.domain, jobId, io)
      .then(async (result) => {
        await this.updateReconJob(jobId, 'completed', result);
      })
      .catch(async (error) => {
        await this.updateReconJob(jobId, 'failed', { error: error.message });
      });

    return jobId;
  }

  async runActiveRecon(targetId, io) {
    const jobId = uuidv4();
    
    const target = await this.getTargetById(targetId);
    if (!target) {
      throw new Error('Target not found');
    }

    await this.createReconJob(jobId, targetId, 'active');

    scriptService.executeScript('active-recon.sh', target.domain, jobId, io)
      .then(async (result) => {
        await this.updateReconJob(jobId, 'completed', result);
      })
      .catch(async (error) => {
        await this.updateReconJob(jobId, 'failed', { error: error.message });
      });

    return jobId;
  }

  async runQuickVulnScan(targetId, io) {
    const jobId = uuidv4();
    
    const target = await this.getTargetById(targetId);
    if (!target) {
      throw new Error('Target not found');
    }

    await this.createReconJob(jobId, targetId, 'quick-scan');

    scriptService.executeScript('quick-vuln-scan.sh', target.domain, jobId, io)
      .then(async (result) => {
        await this.updateReconJob(jobId, 'completed', result);
      })
      .catch(async (error) => {
        await this.updateReconJob(jobId, 'failed', { error: error.message });
      });

    return jobId;
  }

  async runVirusTotalScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');
    await this.createReconJob(jobId, targetId, 'virustotal');
    this._executeVirusTotal(jobId, target.domain, io).catch(console.error);
    return jobId;
  }

  async _executeVirusTotal(jobId, domain, io) {
    try {
      const apiKey = await this.getSetting('virustotal_api_key');
      if (!apiKey) throw new Error('VirusTotal API Key not configured');

      io.to(`target-${jobId}`).emit('scan-update', `Querying VirusTotal for subdomains of ${domain}...`);

      const response = await axios.get(`https://www.virustotal.com/api/v3/domains/${domain}/subdomains`, {
        headers: { 'x-apikey': apiKey }
      });

      const subdomains = (response.data.data || []).map(item => item.id);
      const result = {
        domain,
        subdomains,
        count: subdomains.length
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `VirusTotal scan complete. Found ${subdomains.length} subdomains.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);
    } catch (error) {
      const msg = error.response ? `VirusTotal API Error: ${error.response.status} ${error.response.statusText}` : error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async runAlienVaultScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');
    await this.createReconJob(jobId, targetId, 'alienvault');
    this._executeAlienVault(jobId, target.domain, io).catch(console.error);
    return jobId;
  }

  async _executeAlienVault(jobId, domain, io) {
    try {
      const apiKey = await this.getSetting('alienvault_api_key');
      const headers = {};
      if (apiKey) headers['X-OTX-API-KEY'] = apiKey;

      io.to(`target-${jobId}`).emit('scan-update', `Querying AlienVault OTX for passive DNS of ${domain}...`);

      const response = await axios.get(
        `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/passive_dns`,
        { headers }
      );

      const records = (response.data.passive_dns || []).map(entry => ({
        hostname: entry.hostname,
        address: entry.address,
        type: entry.record_type,
        firstSeen: entry.first,
        lastSeen: entry.last
      }));

      const result = {
        domain,
        passiveDns: records,
        count: records.length
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `AlienVault OTX complete. Found ${records.length} passive DNS records.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);
    } catch (error) {
      const msg = error.response ? `AlienVault API Error: ${error.response.status} ${error.response.statusText}` : error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async runCensysScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');
    await this.createReconJob(jobId, targetId, 'censys');
    this._executeCensys(jobId, target.domain, io).catch(console.error);
    return jobId;
  }

  async _executeCensys(jobId, domain, io) {
    try {
      const apiId = await this.getSetting('censys_api_id');
      const apiSecret = await this.getSetting('censys_api_secret');
      if (!apiId || !apiSecret) throw new Error('Censys API credentials not configured');

      io.to(`target-${jobId}`).emit('scan-update', `Querying Censys for hosts matching ${domain}...`);

      const response = await axios.get(`https://search.censys.io/api/v2/hosts/search?q=${domain}`, {
        auth: { username: apiId, password: apiSecret }
      });

      const hosts = (response.data.result?.hits || []).map(hit => ({
        ip: hit.ip,
        services: (hit.services || []).map(s => ({
          port: s.port,
          protocol: s.transport_protocol,
          serviceName: s.service_name
        })),
        location: hit.location || {},
        lastUpdated: hit.last_updated_at
      }));

      const result = {
        domain,
        hosts,
        count: hosts.length
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `Censys scan complete. Found ${hosts.length} hosts.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);
    } catch (error) {
      const msg = error.response ? `Censys API Error: ${error.response.status} ${error.response.statusText}` : error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async runVulnIntelScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');
    await this.createReconJob(jobId, targetId, 'vulnintel');
    this._executeVulnIntel(jobId, target.domain, io).catch(console.error);
    return jobId;
  }

  async _executeVulnIntel(jobId, domain, io) {
    try {
      const nvdResults = [];
      const kevResults = [];

      io.to(`target-${jobId}`).emit('scan-update', `Querying NIST NVD for vulnerabilities related to ${domain}...`);
      try {
        const nvdApiKey = await this.getSetting('nvd_api_key');
        const nvdHeaders = {};
        if (nvdApiKey) nvdHeaders['apiKey'] = nvdApiKey;

        const nvdRes = await axios.get(
          `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(domain)}&resultsPerPage=20`,
          { headers: nvdHeaders }
        );

        (nvdRes.data.vulnerabilities || []).forEach(item => {
          const cve = item.cve;
          nvdResults.push({
            id: cve.id,
            description: (cve.descriptions || []).find(d => d.lang === 'en')?.value || '',
            severity: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
            score: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || null,
            published: cve.published
          });
        });
        io.to(`target-${jobId}`).emit('scan-update', `NVD returned ${nvdResults.length} CVEs.`);
      } catch (e) {
        io.to(`target-${jobId}`).emit('scan-update', `NVD query failed: ${e.message}`);
      }

      io.to(`target-${jobId}`).emit('scan-update', `Fetching CISA Known Exploited Vulnerabilities catalog...`);
      try {
        const kevRes = await axios.get('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
        const allKev = kevRes.data.vulnerabilities || [];
        const domainKeyword = domain.replace(/\.\w+$/, '').toLowerCase();
        allKev.forEach(kev => {
          const text = `${kev.vendorProject} ${kev.product} ${kev.shortDescription}`.toLowerCase();
          if (text.includes(domainKeyword)) {
            kevResults.push({
              cveId: kev.cveID,
              vendor: kev.vendorProject,
              product: kev.product,
              description: kev.shortDescription,
              dateAdded: kev.dateAdded,
              dueDate: kev.dueDate
            });
          }
        });
        io.to(`target-${jobId}`).emit('scan-update', `CISA KEV: ${kevResults.length} relevant entries found.`);
      } catch (e) {
        io.to(`target-${jobId}`).emit('scan-update', `CISA KEV fetch failed: ${e.message}`);
      }

      const result = {
        domain,
        nvdCves: nvdResults,
        cisaKev: kevResults,
        totalCves: nvdResults.length,
        totalKev: kevResults.length
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `Vulnerability intelligence complete. ${nvdResults.length} CVEs, ${kevResults.length} KEV entries.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);
    } catch (error) {
      const msg = error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async runHackerTargetScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');
    await this.createReconJob(jobId, targetId, 'hackertarget');
    this._executeHackerTarget(jobId, target.domain, io).catch(console.error);
    return jobId;
  }

  async _executeHackerTarget(jobId, domain, io) {
    try {
      const apiKey = await this.getSetting('hackertarget_api_key');
      let url = `https://api.hackertarget.com/hostsearch/?q=${domain}`;
      if (apiKey) url += `&apikey=${apiKey}`;

      io.to(`target-${jobId}`).emit('scan-update', `Querying HackerTarget for DNS records of ${domain}...`);

      const response = await axios.get(url);
      const lines = response.data.split('\n').filter(line => line.trim() && !line.startsWith('error'));
      const hosts = lines.map(line => {
        const [hostname, ip] = line.split(',');
        return { hostname: hostname?.trim(), ip: ip?.trim() };
      }).filter(h => h.hostname);

      const result = {
        domain,
        hosts,
        count: hosts.length
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `HackerTarget complete. Found ${hosts.length} hosts.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);
    } catch (error) {
      const msg = error.response ? `HackerTarget API Error: ${error.response.status} ${error.response.statusText}` : error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async runHunterScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');
    await this.createReconJob(jobId, targetId, 'hunter');
    this._executeHunter(jobId, target.domain, io).catch(console.error);
    return jobId;
  }

  async _executeHunter(jobId, domain, io) {
    try {
      const apiKey = await this.getSetting('hunter_api_key');
      if (!apiKey) throw new Error('Hunter.io API Key not configured');

      io.to(`target-${jobId}`).emit('scan-update', `Querying Hunter.io for emails at ${domain}...`);

      const response = await axios.get(
        `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${apiKey}`
      );

      const data = response.data.data || {};
      const emails = (data.emails || []).map(e => ({
        email: e.value,
        type: e.type,
        confidence: e.confidence,
        firstName: e.first_name,
        lastName: e.last_name,
        position: e.position
      }));

      const result = {
        domain,
        organization: data.organization,
        emails,
        totalEmails: data.total || emails.length,
        pattern: data.pattern
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `Hunter.io complete. Found ${emails.length} emails.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);
    } catch (error) {
      const msg = error.response ? `Hunter.io API Error: ${error.response.status} ${error.response.statusText}` : error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async runWhoisScan(targetId, io) {
    const jobId = uuidv4();
    const target = await this.getTargetById(targetId);
    if (!target) throw new Error('Target not found');
    await this.createReconJob(jobId, targetId, 'whois');
    this._executeWhois(jobId, target.domain, io).catch(console.error);
    return jobId;
  }

  async _executeWhois(jobId, domain, io) {
    try {
      const apiKey = await this.getSetting('whois_api_key');
      if (!apiKey) throw new Error('WHOIS API Key not configured');

      io.to(`target-${jobId}`).emit('scan-update', `Querying WHOIS for ${domain}...`);

      const response = await axios.get(`https://whoisjson.com/api/v1/whois?domain=${domain}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });

      const data = response.data;
      const result = {
        domain,
        registrar: data.registrar,
        creationDate: data.creation_date,
        expirationDate: data.expiration_date,
        updatedDate: data.updated_date,
        nameServers: data.name_servers || [],
        status: data.status || [],
        registrant: data.registrant || {},
        dnssec: data.dnssec
      };

      await this.updateReconJob(jobId, 'completed', result);
      io.to(`target-${jobId}`).emit('scan-update', `WHOIS lookup complete for ${domain}.`);
      io.to(`target-${jobId}`).emit('scan-complete', result);
    } catch (error) {
      const msg = error.response ? `WHOIS API Error: ${error.response.status} ${error.response.statusText}` : error.message;
      await this.updateReconJob(jobId, 'failed', { error: msg });
      io.to(`target-${jobId}`).emit('scan-error', msg);
    }
  }

  async getJobStatus(jobId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM recon_jobs WHERE id = ?',
        [jobId],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            reject(new Error('Job not found'));
          } else {
            resolve({
              jobId: row.id,
              targetId: row.target_id,
              type: row.type,
              status: row.status,
              startedAt: row.started_at,
              completedAt: row.completed_at,
              results: row.results ? JSON.parse(row.results) : null
            });
          }
        }
      );
    });
  }

  async getReconResults(targetId) {
    const target = await this.getTargetById(targetId);
    if (!target) {
      throw new Error('Target not found');
    }

    return scriptService.parseReconResults(target.domain);
  }

  async createReconJob(jobId, targetId, type) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO recon_jobs (id, target_id, type, status, started_at) VALUES (?, ?, ?, ?, ?)',
        [jobId, targetId, type, 'running', new Date().toISOString()],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async updateReconJob(jobId, status, result) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE recon_jobs SET status = ?, completed_at = ?, results = ? WHERE id = ?',
        [status, new Date().toISOString(), JSON.stringify(result), jobId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  async getTargetById(targetId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM targets WHERE id = ?',
        [targetId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async getAllJobs() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM recon_jobs ORDER BY started_at DESC',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => ({
              ...row,
              results: row.results ? JSON.parse(row.results) : null
            })));
          }
        }
      );
    });
  }
}

module.exports = new ReconService();