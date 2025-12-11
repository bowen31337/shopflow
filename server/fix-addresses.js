import db from './src/database.js';

try {
  db.exec('ALTER TABLE addresses ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
  console.log('✓ Added created_at column to addresses table');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ created_at column already exists');
  } else {
    console.log('❌ Error adding column:', error.message);
  }
}

process.exit(0);