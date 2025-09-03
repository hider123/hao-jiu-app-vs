import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../firebaseService';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    if (loading) {
        return <div className="text-center">正在載入所有使用者...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">使用者列表 ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">暱稱</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">角色</th>
                            <th className="px-6 py-3">註冊時間</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{user.profile?.nickname || 'N/A'}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        user.role === 'admin' 
                                        ? 'bg-purple-100 text-purple-800' 
                                        : 'bg-slate-100 text-slate-800'
                                    }`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.createdAt?.toDate().toLocaleDateString('zh-TW') || 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

