import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPhoneNumber(value: string) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

export function toE164(value: string) {
    const numbers = value.replace(/\D/g, '');
    // Assume KR +82 for this app
    if (numbers.startsWith('0')) {
        return `+82${numbers.slice(1)}`;
    }
    return `+82${numbers}`;
}
