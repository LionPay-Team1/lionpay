import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { X, Receipt } from 'lucide-react';
import type { Transaction } from '../../lib/store';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: TransactionDetailModalProps) {
    if (!transaction) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 min-h-[400px] max-w-md mx-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold">거래 상세</h3>
                            <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Receipt className="w-8 h-8 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">{transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}원</h2>
                            <p className="text-gray-500">{transaction.title}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">거래 일시</span>
                                <span className="font-medium">{transaction.date}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">거래 유형</span>
                                <span className="font-medium">{transaction.amount > 0 ? '충전' : '결제'}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">결제 수단</span>
                                <span className="font-medium">라이언 페이 머니</span>
                            </div>
                            {transaction.currency && transaction.currency !== 'KRW' && transaction.originalAmount && (
                                <div className="flex justify-between py-3 border-b border-gray-100">
                                    <span className="text-gray-500">현지 결제 금액</span>
                                    <span className="font-medium">{transaction.originalAmount.toLocaleString()} {transaction.currency}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">거래 후 잔액</span>
                                <span className="font-medium">{transaction.balanceAfter.toLocaleString()}원</span>
                            </div>
                        </div>

                        <Button className="w-full mt-8" variant="secondary" onClick={onClose}>
                            확인
                        </Button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
