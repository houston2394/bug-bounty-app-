const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');

class VulnerabilityService {
  async getAllVulnerabilities(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM vulnerabilities WHERE 1=1';
      const params = [];

      if (filters.severity) {
        query += ' AND severity = ?';
        params.push(filters.severity);
      }

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.targetId) {
        query += ' AND target_id = ?';
        params.push(filters.targetId);
      }

      query += ' ORDER BY created_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getVulnerabilitiesByTarget(targetId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM vulnerabilities WHERE target_id = ? ORDER BY created_at DESC',
        [targetId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  async createVulnerability(vulnData) {
    const { targetId, title, severity, cweId, description, poc } = vulnData;
    const id = uuidv4();
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO vulnerabilities (id, target_id, title, severity, cwe_id, description, poc) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, targetId, title, severity, cweId, description, poc],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, targetId, title, severity, cweId, description, poc, status: 'open' });
          }
        }
      );
    });
  }

  async getVulnerabilityById(vulnId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM vulnerabilities WHERE id = ?',
        [vulnId],
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

  async updateVulnerability(vulnId, updateData) {
    const { title, severity, cweId, description, poc, status } = updateData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE vulnerabilities SET title = ?, severity = ?, cwe_id = ?, description = ?, poc = ?, status = ? WHERE id = ?',
        [title, severity, cweId, description, poc, status, vulnId],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Vulnerability not found'));
          } else {
            resolve({ id: vulnId, ...updateData });
          }
        }
      );
    });
  }

  async deleteVulnerability(vulnId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM vulnerabilities WHERE id = ?',
        [vulnId],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Vulnerability not found'));
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async getVulnerabilityStats(targetId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          severity,
          COUNT(*) as count,
          status
        FROM vulnerabilities 
        WHERE target_id = ?
        GROUP BY severity, status
      `;
      
      db.all(query, [targetId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = new VulnerabilityService();