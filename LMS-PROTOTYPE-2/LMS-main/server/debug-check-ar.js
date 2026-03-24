const db = require('./config/sqlite-db');

const tablesToCheck = [
  'courses',
  'live_classes',
  'announcements',
  'classrooms',
  'universities',
  'inventory',
  'feeStructures'
];

function checkTable(table) {
  return new Promise((resolve) => {
    db.all(`PRAGMA table_info(${table})`, (err, columns) => {
      if (err) return resolve({ table, error: err.message });

      const colNames = columns.map(c => c.name);
      const arCols = colNames.filter(n => n.endsWith('_ar'));
      if (arCols.length === 0) return resolve({ table, arCols: [], arPopulated: false });

      // For each _ar column, check up to 10 rows for non-empty values
      const checks = arCols.map(col => {
        return new Promise(res => {
          db.get(`SELECT COUNT(1) as cnt FROM ${table} WHERE ${col} IS NOT NULL AND TRIM(${col}) <> ''`, (e, row) => {
            if (e) return res({ column: col, error: e.message });
            res({ column: col, nonEmptyCount: row.cnt });
          });
        });
      });

      Promise.all(checks).then(results => {
        resolve({ table, arCols: arCols, results });
      });
    });
  });
}

(async () => {
  console.log('Checking Arabic (_ar) columns for sample tables...');
  for (const t of tablesToCheck) {
    // eslint-disable-next-line no-await-in-loop
    const report = await checkTable(t);
    if (report.error) {
      console.log(`- ${t}: ERROR - ${report.error}`);
      continue;
    }
    if (!report.arCols || report.arCols.length === 0) {
      console.log(`- ${t}: no *_ar columns found`);
      continue;
    }

    const populated = report.results.some(r => r.nonEmptyCount && r.nonEmptyCount > 0);
    console.log(`- ${t}: found ${report.arCols.length} _ar column(s). Any populated? ${populated ? 'YES' : 'NO'}`);
    report.results.forEach(r => {
      if (r.error) console.log(`    • ${r.column}: ERROR ${r.error}`);
      else console.log(`    • ${r.column}: non-empty rows = ${r.nonEmptyCount}`);
    });
  }
  process.exit(0);
})();
