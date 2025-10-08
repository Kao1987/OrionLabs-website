#!/usr/bin/env node

/**
 * 環境變數安全驗證工具
 * 檢查是否有敏感資訊洩露到環境變數中
 */

import fs from 'fs';
import path from 'path';

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /private.*key/i,
  /api.*key/i,
  /token/i,
  /credential/i,
  /auth.*key/i,
  /database.*url/i,
  /mysql:\/\//i,
  /postgresql:\/\//i,
  /mongodb:\/\//i,
  /redis:\/\//i,
  /ssh.*key/i,
  /certificate/i,
  /private/i
];

const DANGEROUS_VALUES = [
  /^admin$/i,
  /^password$/i,
  /^123456/,
  /^secret$/i,
  /^test$/i,
  /localhost:3306/i,
  /root:.*@/i,
  /admin:.*@/i
];

function checkEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { safe: true, warnings: [], errors: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const warnings = [];
  const errors = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // 跳過註釋和空行
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }

    const [key, value] = line.split('=').map(s => s.trim());
    
    if (!key || !value) return;

    // 檢查敏感的鍵名
    SENSITIVE_PATTERNS.forEach(pattern => {
      if (pattern.test(key)) {
        warnings.push({
          line: lineNum,
          key,
          issue: `敏感的環境變數名稱: ${key}`,
          suggestion: '考慮使用 GitHub Secrets 或其他安全方式管理'
        });
      }
    });

    // 檢查危險的值
    DANGEROUS_VALUES.forEach(pattern => {
      if (pattern.test(value)) {
        errors.push({
          line: lineNum,
          key,
          issue: `危險的環境變數值: ${value.substring(0, 20)}...`,
          suggestion: '請更改為安全的值'
        });
      }
    });

    // 檢查明文密碼模式
    if (value.length < 8 && (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret'))) {
      warnings.push({
        line: lineNum,
        key,
        issue: '密碼或密鑰長度過短',
        suggestion: '使用至少8個字符的複雜密碼'
      });
    }
  });

  return {
    safe: errors.length === 0,
    warnings,
    errors
  };
}

function main() {
  console.log('🔒 開始環境變數安全檢查...\n');

  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '.env.remote',
    '.env.docker',
    'temp-env'  // 檢查是否誤提交
  ];

  let totalWarnings = 0;
  let totalErrors = 0;
  let hasInsecureFiles = false;

  envFiles.forEach(file => {
    const result = checkEnvFile(file);
    
    if (result.warnings.length > 0 || result.errors.length > 0) {
      console.log(`📁 檢查文件: ${file}`);
      
      if (result.errors.length > 0) {
        hasInsecureFiles = true;
        console.log('❌ 發現安全問題:');
        result.errors.forEach(error => {
          console.log(`   行 ${error.line}: ${error.issue}`);
          console.log(`   建議: ${error.suggestion}\n`);
        });
      }

      if (result.warnings.length > 0) {
        console.log('⚠️  安全警告:');
        result.warnings.forEach(warning => {
          console.log(`   行 ${warning.line}: ${warning.issue}`);
          console.log(`   建議: ${warning.suggestion}\n`);
        });
      }
    } else if (fs.existsSync(file)) {
      console.log(`✅ ${file} - 通過安全檢查`);
    }

    totalWarnings += result.warnings.length;
    totalErrors += result.errors.length;
  });

  // 檢查是否存在不應該存在的文件
  const forbiddenFiles = ['temp-env', '.env.backup', '.env.old'];
  forbiddenFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`❌ 發現不安全的文件: ${file}`);
      console.log('   建議: 立即刪除此文件並從版本控制中移除\n');
      hasInsecureFiles = true;
    }
  });

  console.log('\n📊 檢查結果:');
  console.log(`   錯誤: ${totalErrors}`);
  console.log(`   警告: ${totalWarnings}`);

  if (hasInsecureFiles) {
    console.log('\n❌ 安全檢查失敗！請修復上述問題後再繼續。');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('\n⚠️  發現安全警告，建議修復後再部署到生產環境。');
    process.exit(0);
  } else {
    console.log('\n✅ 所有環境變數安全檢查通過！');
    process.exit(0);
  }
}

main();