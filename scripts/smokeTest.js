#!/usr/bin/env node
// Simple smoke test that GETs a URL and prints status and whether expected content is present.
// Usage: node scripts/smokeTest.js http://localhost:3000/loans

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/smokeTest.js <url>');
  process.exit(2);
}

(async () => {
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    console.log('Status:', res.status);
    const found = text.includes('No loan requests yet.') || text.includes('Loading loans') || text.includes('Fund Loan');
    console.log('Contains expected loan UI text:', found);
    process.exit(res.status === 200 ? 0 : 1);
  } catch (err) {
    console.error('Error fetching URL:', err.message || err);
    process.exit(1);
  }
})();
