#!/usr/bin/env node

/**
 * OrionLabs CSS 清理腳本
 * 移除已廢棄的 CSS 檔案，並建立備份
 */

import { readdir, rename, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 已廢棄的檔案清單（根據 file-consolidation-map.css）
const DEPRECATED_FILES = [
  'src/assets/components.css', // 已整合到 BEM 系統
  'src/assets/color-optimizations.css', // 已整合到主題系統
  'src/assets/css/page-theme-consistency.css', // 重複載入
  'src/assets/css/page-color-consistency.css', // 重複載入
  'src/assets/css/dark-mode-comprehensive-fix.css', // 功能重複
  'src/assets/css/dark-mode-fixes.css', // 功能重複
  'src/assets/css/dark-mode-enhancements.css', // 功能重複
  'src/assets/css/bem-unified.css', // 已整合到 orion-bem-core.css
  'src/assets/css/bem-components.css', // 已整合到 orion-bem-core.css
  'src/assets/css/orion-bem-system.css' // 已整合到 orion-bem-core.css
];

// 安全清理的檔案（確認已不再使用）
const SAFE_TO_DELETE = [
  'src/assets/css/page-theme-consistency.css',
  'src/assets/css/page-color-consistency.css',
  'src/assets/css/dark-mode-comprehensive-fix.css',
  'src/assets/css/dark-mode-fixes.css',
  'src/assets/css/dark-mode-enhancements.css'
];

async function createBackupDirectory() {
  const backupDir = join(projectRoot, 'deprecated_css_backup');
  
  try {
    await mkdir(backupDir, { recursive: true });
    console.log(`✅ 建立備份目錄: ${backupDir}`);
    return backupDir;
  } catch (error) {
    console.error('❌ 無法建立備份目錄:', error.message);
    throw error;
  }
}

async function backupFile(filePath, backupDir) {
  const fullPath = join(projectRoot, filePath);
  
  if (!existsSync(fullPath)) {
    console.log(`⚠️  檔案不存在: ${filePath}`);
    return false;
  }
  
  try {
    const fileName = filePath.replace(/[/\\]/g, '_');
    const backupPath = join(backupDir, fileName);
    
    await rename(fullPath, backupPath);
    console.log(`📦 已備份: ${filePath} → ${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ 備份失敗 ${filePath}:`, error.message);
    return false;
  }
}

async function analyzeFileUsage() {
  console.log('\n🔍 分析檔案使用情況...\n');
  
  const analysis = {
    total: DEPRECATED_FILES.length,
    exists: 0,
    safeToDelete: 0,
    requiresReview: 0
  };
  
  for (const filePath of DEPRECATED_FILES) {
    const fullPath = join(projectRoot, filePath);
    const exists = existsSync(fullPath);
    
    if (exists) {
      analysis.exists++;
      
      if (SAFE_TO_DELETE.includes(filePath)) {
        analysis.safeToDelete++;
        console.log(`🟢 安全刪除: ${filePath}`);
      } else {
        analysis.requiresReview++;
        console.log(`🟡 需要審查: ${filePath}`);
      }
    } else {
      console.log(`⚪ 不存在: ${filePath}`);
    }
  }
  
  console.log('\n📊 分析結果:');
  console.log(`總檔案數: ${analysis.total}`);
  console.log(`存在檔案: ${analysis.exists}`);
  console.log(`可安全刪除: ${analysis.safeToDelete}`);
  console.log(`需要審查: ${analysis.requiresReview}`);
  
  return analysis;
}

async function cleanupFiles(isDryRun = true) {
  console.log(`\n🧹 開始清理 CSS 檔案 ${isDryRun ? '(模擬模式)' : '(實際執行)'}...\n`);
  
  let backupDir;
  if (!isDryRun) {
    backupDir = await createBackupDirectory();
  }
  
  const results = {
    backed: 0,
    failed: 0,
    skipped: 0
  };
  
  for (const filePath of SAFE_TO_DELETE) {
    const fullPath = join(projectRoot, filePath);
    
    if (!existsSync(fullPath)) {
      console.log(`⏭️  跳過 (不存在): ${filePath}`);
      results.skipped++;
      continue;
    }
    
    if (isDryRun) {
      console.log(`📝 將刪除: ${filePath}`);
      results.backed++;
    } else {
      const success = await backupFile(filePath, backupDir);
      if (success) {
        results.backed++;
      } else {
        results.failed++;
      }
    }
  }
  
  console.log('\n📈 清理結果:');
  console.log(`${isDryRun ? '將備份' : '已備份'}: ${results.backed}`);
  console.log(`失敗: ${results.failed}`);
  console.log(`跳過: ${results.skipped}`);
  
  return results;
}

async function updateDeprecatedFilesList() {
  const deprecatedYml = join(projectRoot, 'deprecated_files.yml');
  
  try {
    const deprecatedContent = `# OrionLabs 已廢棄檔案清單
# 自動生成於: ${new Date().toISOString()}

css_files_removed:
${SAFE_TO_DELETE.map(file => `  - "${file}"`).join('\n')}

css_files_consolidated:
  - "bem-components.css → orion-bem-core.css"  
  - "bem-unified.css → orion-bem-core.css"
  - "orion-bem-system.css → orion-bem-core.css"

backup_location: "deprecated_css_backup/"

notes:
  - 所有已廢棄檔案已備份至 deprecated_css_backup/ 目錄
  - 功能已整合至 orion-bem-core.css 和相關主題檔案
  - 如需回滾，請參考備份檔案
`;

    await writeFile(deprecatedYml, deprecatedContent);
    console.log(`✅ 更新廢棄檔案清單: ${deprecatedYml}`);
  } catch (error) {
    console.warn('⚠️  無法更新廢棄檔案清單:', error.message);
  }
}

// 主執行函數
async function main() {
  console.log('🚀 OrionLabs CSS 清理工具');
  console.log('=' .repeat(40));
  
  try {
    // 1. 分析檔案使用情況
    const analysis = await analyzeFileUsage();
    
    if (analysis.exists === 0) {
      console.log('\n✨ 沒有需要清理的檔案！');
      return;
    }
    
    // 2. 檢查命令行參數
    const args = process.argv.slice(2);
    const isDryRun = !args.includes('--execute');
    
    if (isDryRun) {
      console.log('\n💡 這是模擬模式。使用 --execute 參數執行實際清理。');
    }
    
    // 3. 執行清理
    const results = await cleanupFiles(isDryRun);
    
    // 4. 更新文件（僅在實際執行時）
    if (!isDryRun && results.backed > 0) {
      await updateDeprecatedFilesList();
    }
    
    console.log('\n🎉 CSS 清理完成！');
    
    if (isDryRun) {
      console.log('\n下一步：');
      console.log('1. 檢查分析結果');
      console.log('2. 執行: node scripts/cleanup-css.js --execute');
      console.log('3. 測試網站功能');
      console.log('4. 提交變更');
    }
    
  } catch (error) {
    console.error('❌ 清理過程發生錯誤:', error.message);
    process.exit(1);
  }
}

// 執行腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}