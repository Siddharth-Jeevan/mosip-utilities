const pool = require('./db');

/**
 * Ensure the repos table exists. Creates it if it doesn't exist.
 */
async function ensureReposTable() {
  try {
    // Check if table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'repos'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('✓ repos table already exists');
      return;
    }

    console.log('Creating repos table...');
    
    // Create the table
    await pool.query(`
      CREATE TABLE repos (
        github_repo_id BIGINT PRIMARY KEY,
        owner VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        full_name VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_repos_owner ON repos(owner);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_repos_name ON repos(name);
    `);

    console.log('✓ repos table created successfully');
  } catch (error) {
    console.error('Error ensuring repos table exists:', error);
    throw error;
  }
}

module.exports = {
  ensureReposTable,
};
