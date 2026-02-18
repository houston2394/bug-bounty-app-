const { db } = require('./database');
const { v4: uuidv4 } = require('uuid');

class TargetService {
  async getAllTargets() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM targets ORDER BY created_at DESC',
        [],
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

  async createTarget(targetData) {
    const { domain, name, description, scope } = targetData;
    const id = uuidv4();
    
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO targets (id, domain, name, description, scope) VALUES (?, ?, ?, ?, ?)',
        [id, domain, name, description, JSON.stringify(scope || [])],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, domain, name, description, scope, status: 'active' });
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
          } else if (row) {
            resolve({
              ...row,
              scope: JSON.parse(row.scope || '[]')
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async updateTarget(targetId, updateData) {
    const { domain, name, description, scope, status } = updateData;
    
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE targets SET domain = ?, name = ?, description = ?, scope = ?, status = ?, updated_at = ? WHERE id = ?',
        [domain, name, description, JSON.stringify(scope || []), status, new Date().toISOString(), targetId],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Target not found'));
          } else {
            resolve({ id: targetId, ...updateData });
          }
        }
      );
    });
  }

  async deleteTarget(targetId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM targets WHERE id = ?',
        [targetId],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Target not found'));
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async getTargetStats(targetId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          t.id,
          t.domain,
          t.created_at as target_created,
          COUNT(DISTINCT rj.id) as total_recon_jobs,
          COUNT(DISTINCT CASE WHEN rj.status = 'completed' THEN rj.id END) as completed_jobs,
          COUNT(DISTINCT v.id) as total_vulnerabilities,
          COUNT(DISTINCT CASE WHEN v.severity = 'Critical' THEN v.id END) as critical_vulns,
          COUNT(DISTINCT CASE WHEN v.severity = 'High' THEN v.id END) as high_vulns
        FROM targets t
        LEFT JOIN recon_jobs rj ON t.id = rj.target_id
        LEFT JOIN vulnerabilities v ON t.id = v.target_id
        WHERE t.id = ?
        GROUP BY t.id, t.domain, t.created_at
      `;
      
      db.get(query, [targetId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

module.exports = new TargetService();