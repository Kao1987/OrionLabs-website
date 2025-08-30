#!/usr/bin/env node

/**
 * OrionLabs BEM Validator
 * 驗證 Vue 組件中的 CSS class 命名是否符合 BEM 規範
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// BEM 命名規範
const BEM_PATTERNS = {
  // Block: lowercase, hyphen-separated
  block: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  
  // Element: block__element
  element: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*__[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  
  // Modifier: block--modifier or block__element--modifier
  modifier: /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?--[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
  
  // Utility classes (prefixed with u-)
  utility: /^u-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
};

// Bootstrap classes to ignore
const BOOTSTRAP_CLASSES = new Set([
  'container', 'container-fluid', 'row', 'col', 'col-12', 'col-md-6', 'col-lg-4',
  'd-flex', 'd-none', 'd-block', 'flex-column', 'flex-row', 'justify-content-center',
  'align-items-center', 'text-center', 'text-left', 'text-right', 'mb-4', 'mt-3',
  'btn', 'btn-primary', 'btn-secondary', 'btn-outline-primary', 'form-control',
  'form-label', 'form-check', 'form-check-input', 'form-check-label', 'is-invalid',
  'is-valid', 'invalid-feedback', 'valid-feedback', 'spinner-border', 'visually-hidden'
]);

// Standard HTML/CSS classes to ignore
const STANDARD_CLASSES = new Set([
  'active', 'disabled', 'hidden', 'visible', 'focus', 'hover'
]);

/**
 * 提取 Vue 文件中的 class 名稱
 */
function extractClassNames(content) {
  const classNames = new Set();
  
  // 匹配 class="..." 和 :class="..."
  const classRegex = /(?:class|:class)=["']([^"']+)["']/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const classString = match[1];
    
    // 處理動態 class 對象語法 { 'class-name': condition }
    const objectClassRegex = /'([^']+)':/g;
    let objectMatch;
    while ((objectMatch = objectClassRegex.exec(classString)) !== null) {
      classNames.add(objectMatch[1]);
    }
    
    // 處理普通 class 字符串
    if (!classString.includes('{') && !classString.includes('(')) {
      classString.split(/\s+/).forEach(className => {
        if (className.trim()) {
          classNames.add(className.trim());
        }
      });
    }
  }
  
  // 匹配 CSS 選擇器
  const cssRegex = /\.([a-zA-Z][\w-]*)/g;
  while ((match = cssRegex.exec(content)) !== null) {
    classNames.add(match[1]);
  }
  
  return Array.from(classNames);
}

/**
 * 驗證單個 class 名稱
 */
function validateClassName(className) {
  // 跳過 Bootstrap 類
  if (BOOTSTRAP_CLASSES.has(className)) {
    return { valid: true, type: 'bootstrap' };
  }
  
  // 跳過標準類
  if (STANDARD_CLASSES.has(className)) {
    return { valid: true, type: 'standard' };
  }
  
  // 跳過以數字或特殊字符開頭的類
  if (!/^[a-zA-Z]/.test(className)) {
    return { valid: true, type: 'other' };
  }
  
  // 驗證 BEM 模式
  if (BEM_PATTERNS.utility.test(className)) {
    return { valid: true, type: 'utility' };
  }
  
  if (BEM_PATTERNS.modifier.test(className)) {
    return { valid: true, type: 'modifier' };
  }
  
  if (BEM_PATTERNS.element.test(className)) {
    return { valid: true, type: 'element' };
  }
  
  if (BEM_PATTERNS.block.test(className)) {
    return { valid: true, type: 'block' };
  }
  
  return { 
    valid: false, 
    type: 'invalid',
    suggestions: generateSuggestions(className)
  };
}

/**
 * 生成 BEM 命名建議
 */
function generateSuggestions(className) {
  const suggestions = [];
  
  // 轉換為 kebab-case
  const kebabCase = className
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  
  suggestions.push(`Block: ${kebabCase}`);
  
  if (className.includes('_')) {
    const parts = className.split('_');
    suggestions.push(`Element: ${parts[0]}__${parts.slice(1).join('-')}`);
  }
  
  return suggestions;
}

/**
 * 掃描目錄中的 Vue 文件
 */
async function scanDirectory(dirPath) {
  const results = [];
  
  try {
    const items = await readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = join(dirPath, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.')) {
        results.push(...await scanDirectory(fullPath));
      } else if (item.isFile() && extname(item.name) === '.vue') {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Cannot read directory ${dirPath}: ${error.message}`);
  }
  
  return results;
}

/**
 * 驗證單個文件
 */
async function validateFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    const classNames = extractClassNames(content);
    const issues = [];
    
    classNames.forEach(className => {
      const validation = validateClassName(className);
      if (!validation.valid) {
        issues.push({
          className,
          suggestions: validation.suggestions
        });
      }
    });
    
    return {
      file: filePath,
      classCount: classNames.length,
      issues
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 主要驗證函數
 */
async function main() {
  console.log('🔍 OrionLabs BEM Validator');
  console.log('='.repeat(40));
  
  const projectRoot = join(__dirname, '..');
  const componentsDir = join(projectRoot, 'src', 'components');
  const viewsDir = join(projectRoot, 'src', 'views');
  
  // 掃描所有 Vue 文件
  const vueFiles = [
    ...await scanDirectory(componentsDir),
    ...await scanDirectory(viewsDir)
  ];
  
  console.log(`Found ${vueFiles.length} Vue files to validate\n`);
  
  let totalIssues = 0;
  let totalClasses = 0;
  
  for (const file of vueFiles) {
    const result = await validateFile(file);
    if (!result) continue;
    
    totalClasses += result.classCount;
    totalIssues += result.issues.length;
    
    if (result.issues.length > 0) {
      const relativePath = file.replace(projectRoot, '');
      console.log(`❌ ${relativePath}`);
      
      result.issues.forEach(issue => {
        console.log(`   • ${issue.className}`);
        issue.suggestions.forEach(suggestion => {
          console.log(`     → ${suggestion}`);
        });
      });
      console.log();
    } else {
      const relativePath = file.replace(projectRoot, '');
      console.log(`✅ ${relativePath} (${result.classCount} classes)`);
    }
  }
  
  console.log('\n' + '='.repeat(40));
  console.log(`📊 Summary:`);
  console.log(`   Total files: ${vueFiles.length}`);
  console.log(`   Total classes: ${totalClasses}`);
  console.log(`   BEM violations: ${totalIssues}`);
  
  if (totalIssues > 0) {
    console.log(`\n💡 BEM Naming Guide:`);
    console.log(`   Block: component-name`);
    console.log(`   Element: component-name__element`);
    console.log(`   Modifier: component-name--modifier`);
    console.log(`   Utility: u-utility-name`);
  }
  
  process.exit(totalIssues > 0 ? 1 : 0);
}

// 執行驗證
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { validateClassName, extractClassNames };