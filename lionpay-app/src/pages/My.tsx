import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { User, Shield, Bell, HelpCircle, LogOut } from 'lucide-react';

export default function My() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-xl font-bold">마이페이지</h1>

            <Card className="p-6 flex items-center gap-4 bg-gray-900 text-white border-none">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-300">
                    U
                </div>
                <div>
                    <p className="text-gray-400 text-sm">안녕하세요</p>
                    <p className="text-xl font-bold">김라이언 님</p>
                </div>
            </Card>

            <div className="space-y-2">
                {[
                    { icon: User, label: '내 정보 수정' },
                    { icon: Shield, label: '보안 설정' },
                    { icon: Bell, label: '알림 설정' },
                    { icon: HelpCircle, label: '고객센터' },
                ].map((item, idx) => (
                    <button key={idx} className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 text-gray-700">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-gray-400 text-lg">›</span>
                    </button>
                ))}
            </div>

            <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" /> SignOut
            </Button>
        </div>
    );
}
