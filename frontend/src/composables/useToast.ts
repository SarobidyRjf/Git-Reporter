import { ref } from 'vue';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, message, type, duration };

        toasts.value.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id: string) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    };

    const success = (message: string, duration = 3000) => addToast(message, 'success', duration);
    const error = (message: string, duration = 5000) => addToast(message, 'error', duration);
    const info = (message: string, duration = 3000) => addToast(message, 'info', duration);

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info
    };
}
