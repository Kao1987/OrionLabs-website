import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface GlobalError {
  id: string;
  code: string;
  message: string;
  timestamp: Date;
  source?: string;
  severity: "low" | "medium" | "high" | "critical";
  details?: unknown;
  resolved: boolean;
}

export const useErrorStore = defineStore("error", () => {
  const errors = ref<GlobalError[]>([]);
  const maxErrors = ref(50);

  const activeErrors = computed(() => errors.value.filter((error) => !error.resolved));

  const criticalErrors = computed(() =>
    activeErrors.value.filter((error) => error.severity === "critical"),
  );

  const hasActiveErrors = computed(() => activeErrors.value.length > 0);
  const hasCriticalErrors = computed(() => criticalErrors.value.length > 0);

  const addError = (errorData: Omit<GlobalError, "id" | "timestamp" | "resolved">) => {
    const error: GlobalError = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      resolved: false,
      ...errorData,
    };

    errors.value.unshift(error);

    if (errors.value.length > maxErrors.value) {
      errors.value = errors.value.slice(0, maxErrors.value);
    }

    console.error(
      `[${error.severity.toUpperCase()}] ${error.source || "Unknown"}:`,
      error.message,
      error.details,
    );

    return error.id;
  };

  const resolveError = (id: string) => {
    const error = errors.value.find((err) => err.id === id);
    if (error) {
      error.resolved = true;
    }
  };

  const resolveAllErrors = () => {
    errors.value.forEach((error) => {
      error.resolved = true;
    });
  };

  const removeError = (id: string) => {
    const index = errors.value.findIndex((err) => err.id === id);
    if (index > -1) {
      errors.value.splice(index, 1);
    }
  };

  const clearResolvedErrors = () => {
    errors.value = errors.value.filter((error) => !error.resolved);
  };

  const clearAllErrors = () => {
    errors.value = [];
  };

  const logError = (code: string, message: string, source?: string, details?: unknown) => {
    return addError({
      code,
      message,
      source,
      severity: "medium",
      details,
    });
  };

  const logCriticalError = (code: string, message: string, source?: string, details?: unknown) => {
    return addError({
      code,
      message,
      source,
      severity: "critical",
      details,
    });
  };

  const logNetworkError = (url: string, status?: number, message?: string) => {
    return addError({
      code: `NETWORK_${status || "ERROR"}`,
      message: message || `Network request failed: ${url}`,
      source: "Network",
      severity: status && status >= 500 ? "high" : "medium",
      details: { url, status },
    });
  };

  const logValidationError = (field: string, message: string, value?: unknown) => {
    return addError({
      code: "VALIDATION_ERROR",
      message: `${field}: ${message}`,
      source: "Validation",
      severity: "low",
      details: { field, value },
    });
  };

  return {
    errors,
    maxErrors,
    activeErrors,
    criticalErrors,
    hasActiveErrors,
    hasCriticalErrors,
    addError,
    resolveError,
    resolveAllErrors,
    removeError,
    clearResolvedErrors,
    clearAllErrors,
    logError,
    logCriticalError,
    logNetworkError,
    logValidationError,
  };
});
