#!/usr/bin/env node

/**
 * Bundle Size Analysis Script for BED Map
 * Analyzes build output and provides bundle size insights
 * Run with: npm run build && node scripts/analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');
const MAX_JS_SIZE = 500 * 1024; // 500KB warning threshold
const MAX_CSS_SIZE = 100 * 1024; // 100KB warning threshold
const MAX_TOTAL_SIZE = 1000 * 1024; // 1MB warning threshold

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function analyzeDirectory(dir, prefix = '') {
  const results = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`❌ Build directory not found: ${dir}`);
    console.log('Run "npm run build" first');
    process.exit(1);
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results.push(...analyzeDirectory(fullPath, prefix + item + '/'));
    } else {
      results.push({
        name: prefix + item,
        size: stat.size,
        path: fullPath
      });
    }
  }
  
  return results;
}

function categorizeFiles(files) {
  const categories = {
    javascript: files.filter(f => f.name.endsWith('.js')),
    css: files.filter(f => f.name.endsWith('.css')),
    images: files.filter(f => /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(f.name)),
    fonts: files.filter(f => /\.(woff|woff2|ttf|eot)$/i.test(f.name)),
    other: files.filter(f => 
      !f.name.endsWith('.js') && 
      !f.name.endsWith('.css') && 
      !/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(f.name)
    )
  };
  
  return categories;
}

function generateReport(files) {
  const categories = categorizeFiles(files);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  
  console.log('\n🔍 BED Map Bundle Analysis Report');
  console.log('=' .repeat(50));
  
  // Overall stats
  console.log(`\n📊 Overall Statistics:`);
  console.log(`Total files: ${files.length}`);
  console.log(`Total size: ${formatBytes(totalSize)}`);
  
  if (totalSize > MAX_TOTAL_SIZE) {
    console.log(`⚠️  Warning: Total bundle size exceeds ${formatBytes(MAX_TOTAL_SIZE)}`);
  } else {
    console.log(`✅ Total bundle size is within limits`);
  }
  
  // Category breakdown
  console.log(`\n📂 By Category:`);
  
  Object.entries(categories).forEach(([category, categoryFiles]) => {
    if (categoryFiles.length === 0) return;
    
    const categorySize = categoryFiles.reduce((sum, file) => sum + file.size, 0);
    const percentage = ((categorySize / totalSize) * 100).toFixed(1);
    
    console.log(`${category.toUpperCase().padEnd(12)} ${formatBytes(categorySize).padStart(8)} (${percentage}%)`);
    
    // Check thresholds
    if (category === 'javascript' && categorySize > MAX_JS_SIZE) {
      console.log(`  ⚠️  JavaScript bundle exceeds ${formatBytes(MAX_JS_SIZE)}`);
    }
    if (category === 'css' && categorySize > MAX_CSS_SIZE) {
      console.log(`  ⚠️  CSS bundle exceeds ${formatBytes(MAX_CSS_SIZE)}`);
    }
  });
  
  // Largest files
  console.log(`\n📋 Largest Files:`);
  const largestFiles = files
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
    
  largestFiles.forEach(file => {
    const sizeStr = formatBytes(file.size).padStart(8);
    console.log(`${sizeStr}  ${file.name}`);
  });
  
  // Recommendations
  console.log(`\n💡 Optimization Recommendations:`);
  
  const jsSize = categories.javascript.reduce((sum, file) => sum + file.size, 0);
  const cssSize = categories.css.reduce((sum, file) => sum + file.size, 0);
  const imageSize = categories.images.reduce((sum, file) => sum + file.size, 0);
  
  if (jsSize > MAX_JS_SIZE) {
    console.log(`• Consider code splitting for JavaScript bundles`);
    console.log(`• Use dynamic imports for non-critical components`);
    console.log(`• Check for duplicate dependencies`);
  }
  
  if (cssSize > MAX_CSS_SIZE) {
    console.log(`• Consider purging unused CSS`);
    console.log(`• Use CSS-in-JS for component-specific styles`);
  }
  
  if (imageSize > 200 * 1024) {
    console.log(`• Optimize images (WebP format, compression)`);
    console.log(`• Consider lazy loading for images`);
  }
  
  if (totalSize > MAX_TOTAL_SIZE) {
    console.log(`• Enable gzip/brotli compression on server`);
    console.log(`• Implement service worker for caching`);
  }
  
  // Performance budget check
  console.log(`\n🎯 Performance Budget:`);
  const budgetStatus = {
    js: jsSize <= MAX_JS_SIZE,
    css: cssSize <= MAX_CSS_SIZE,
    total: totalSize <= MAX_TOTAL_SIZE
  };
  
  Object.entries(budgetStatus).forEach(([type, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${type.toUpperCase()} budget: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  // GitHub Pages specific advice
  console.log(`\n🚀 GitHub Pages Deployment:`);
  console.log(`• Current bundle size: ${formatBytes(totalSize)}`);
  console.log(`• GitHub Pages supports gzip compression automatically`);
  console.log(`• Consider using CDN for heavy assets`);
  
  // Export JSON report
  const reportData = {
    timestamp: new Date().toISOString(),
    totalSize,
    totalFiles: files.length,
    categories: Object.fromEntries(
      Object.entries(categories).map(([cat, files]) => [
        cat, 
        {
          count: files.length,
          size: files.reduce((sum, file) => sum + file.size, 0),
          files: files.map(f => ({ name: f.name, size: f.size }))
        }
      ])
    ),
    budgetStatus,
    largestFiles: largestFiles.map(f => ({ name: f.name, size: f.size }))
  };
  
  const reportPath = path.join(__dirname, '../bundle-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`\n📄 Detailed report saved to: bundle-analysis.json`);
  
  console.log('\n' + '='.repeat(50));
  
  return budgetStatus;
}

// Main execution
try {
  console.log('Analyzing BED Map bundle...');
  const files = analyzeDirectory(DIST_DIR);
  const budgetStatus = generateReport(files);
  
  // Exit with error code if budget failed
  const allPassed = Object.values(budgetStatus).every(Boolean);
  process.exit(allPassed ? 0 : 1);
  
} catch (error) {
  console.error('❌ Error analyzing bundle:', error.message);
  process.exit(1);
}