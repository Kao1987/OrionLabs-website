// Vitest 全局設置檔案
import { beforeEach, beforeAll, afterEach, afterAll, vi } from "vitest";
import { setupServer } from "msw/node";
import { createPinia, setActivePinia } from "pinia";

// 全局變數設置
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// localStorage mock with actual storage behavior
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const localStorageMock = new LocalStorageMock();
const sessionStorageMock = new LocalStorageMock();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// MSW server 設置（初始為空，各測試檔案自行加入 handlers）
export const server = setupServer();

// 全局 MSW 生命週期
beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  // 重置 MSW handlers
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// 清理函數，每次測試前執行
beforeEach(() => {
  // 清除所有 mocks
  vi.clearAllMocks();

  // 重置 localStorage
  localStorageMock.clear();
  sessionStorageMock.clear();

  // 重置 fake timers（如果有使用）
  vi.clearAllTimers();

  // 設置新的 Pinia 實例
  setActivePinia(createPinia());
});

// flushAll 工具函數實作（符合 Orion 規範 §A-4）
export async function flushAll() {
  // 1) Microtasks
  await Promise.resolve();
  await Promise.resolve();

  // 2) Vue nextTick（如果存在）
  const maybeNextTick = (globalThis as any).nextTick;
  if (typeof maybeNextTick === "function") {
    await maybeNextTick();
  }

  // 3) Macro tasks (一次迭代)
  await new Promise((resolve) => setTimeout(resolve, 0));
}
