import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { X } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    message: string;
    mode?: 'alert' | 'confirm';
    confirmText?: string;
    cancelText?: string;
}

export function AlertModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    mode = 'alert',
    confirmText = '확인',
    cancelText = '취소'
}: AlertModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-auto"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-900">{title || '알림'}</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-8 whitespace-pre-wrap">{message}</p>

                        <div className="flex gap-3">
                            {mode === 'confirm' && (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={onClose}
                                >
                                    {cancelText}
                                </Button>
                            )}
                            <Button
                                className="flex-1"
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
