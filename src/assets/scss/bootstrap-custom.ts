// OrionLabs 自定義 Bootstrap JavaScript 載入
// 只載入專案實際使用的組件

import { Toast } from 'bootstrap';
import { Modal } from 'bootstrap';
import { Tab } from 'bootstrap';
import { Button } from 'bootstrap';
import { Tooltip } from 'bootstrap';

// 自動初始化組件
document.addEventListener('DOMContentLoaded', function() {
  // 初始化 Toasts
  const toastElList: Element[] = [].slice.call(document.querySelectorAll('.toast'));
  const toastList = toastElList.map(function (toastEl: Element) {
    return new Toast(toastEl);
  });
  
  // 初始化 Tooltips
  const tooltipTriggerList: Element[] = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl: Element) {
    return new Tooltip(tooltipTriggerEl);
  });
});

console.log('Bootstrap 自定義組件已載入:', ['toast', 'modal', 'tab', 'button', 'tooltip']);

export default {
  Toast,
  Modal,
  Tab,
  Button,
  Tooltip
};