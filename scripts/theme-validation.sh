#!/bin/bash
# OrionLabs 主題一致性驗證腳本

echo "🎨 OrionLabs 主題驗證開始..."
echo "================================"

# 檢查硬編碼色彩
echo "🔍 檢查硬編碼色彩..."
hardcoded_colors=$(grep -r "#[0-9a-fA-F]\{3,6\}\|white\|black" src/views/ --include="*.vue" | grep -v "var(" | wc -l)
if [ $hardcoded_colors -gt 0 ]; then
    echo "⚠️  發現 $hardcoded_colors 個硬編碼色彩"
    echo "建議使用 CSS 變數替代"
else
    echo "✅ 未發現硬編碼色彩"
fi

# 檢查深色模式支援
echo ""
echo "🌙 檢查深色模式支援..."
dark_mode_rules=$(grep -r "\[data-theme=\"dark\"\]" src/assets/css/ | wc -l)
echo "✅ 發現 $dark_mode_rules 個深色模式規則"

# 檢查 BEM-Lite 命名規範
echo ""
echo "📝 檢查 BEM-Lite 命名規範..."
bem_violations=$(grep -r "class.*__.*--" src/ --include="*.vue" | wc -l)
if [ $bem_violations -gt 0 ]; then
    echo "⚠️  發現 $bem_violations 個 BEM 命名違規"
else
    echo "✅ BEM-Lite 命名規範符合要求"
fi

# 檢查 CSS 變數使用
echo ""
echo "🎯 檢查 CSS 變數使用..."
css_vars=$(grep -r "var(--" src/ --include="*.vue" --include="*.css" | wc -l)
echo "✅ 發現 $css_vars 個 CSS 變數使用"

echo ""
echo "================================"
echo "✨ 主題驗證完成！"
echo ""
echo "📋 建議事項："
echo "   • 確保所有顏色都使用 CSS 變數"
echo "   • 測試淺色/深色模式切換"
echo "   • 驗證對比度符合 WCAG 標準"
echo "   • 檢查響應式設計"
