// mockData.js

const getNextDayOfWeek = (date, dayOfWeek) => {
    const resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
};

const today = new Date('2025-08-24T13:18:00');
const thisSaturday = getNextDayOfWeek(today, 6);
thisSaturday.setHours(19, 0, 0, 0);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

// --- 聊天室模擬資料 ---
export const mockChats = {
    'event-1': [
        { id: 'msg1', senderId: 'creator-user-1', senderName: '電影迷', text: '大家好！很期待這次的電影！', timestamp: new Date(Date.now() - 3600000 * 2) },
        { id: 'msg2', senderId: 'mock-user-123456789', senderName: '模擬使用者', text: '我也是！聽說很讚！', timestamp: new Date(Date.now() - 3600000 * 1) },
    ],
};

export const mockProfile = { 
  nickname: '新來的揪咖', 
  bio: '我喜歡用這個 App！', 
  faceVerified: false, 
  interests: ['電影', '美食'],
  reputation: 75,
  phone: '',
  address: '',
};

export const mockWallet = {
  balance: 1250,
  vouchers: [
    { id: 'v1', name: '夏日港都飲品大挑戰 冠軍獎勵', description: '合作店家一個月份免費兌換券', expiry: '2025-09-30' },
    { id: 'v2', name: '新人歡迎禮', description: '首次活動報名費 50 元折價券', expiry: '2025-08-31' }
  ]
};

export const mockCurrentUser = { id: 'mock-user-123456789', nickname: '模擬使用者', avatar: 'https://i.pravatar.cc/80?u=f' };

export const mockFriends = [
    { id: 'friend-1', nickname: '王小明', avatar: 'https://i.pravatar.cc/80?u=a' },
    { id: 'friend-2', nickname: '陳小花', avatar: 'https://i.pravatar.cc/80?u=b' },
    { id: 'friend-3', nickname: '林大頭', avatar: 'https://i.pravatar.cc/80?u=c' },
];

export const mockSuggestions = [
    { id: 'sugg-1', nickname: '李美麗', avatar: 'https://i.pravatar.cc/80?u=d' },
    { id: 'sugg-2', nickname: '周大偉', avatar: 'https://i.pravatar.cc/80?u=e' },
];

export const mockGroups = [
    { id: 'group-1', name: '羽球好咖', members: ['friend-1', 'friend-3'] }
];

// --- 完整的挑戰列表 ---
export const mockChallenges = [
    {
        id: 'challenge-1',
        creatorId: 'creator-user-3',
        title: '夏日港都飲品大挑戰',
        description: '與您的隊友一起探索高雄，尋找五家指定的特色飲品店並完成打卡，集滿所有徽章，贏得最終大獎！',
        reward: '合作店家一個月份免費兌換券',
        eventTimestamp: new Date('2025-08-31T23:59:59').toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1551030173-1a29ab29e4a8?q=80&w=800&auto=format&fit=crop',
        treasurePoints: [
            { id: 'tp-1', name: '鹽埕區 - 神秘冬瓜茶', clue: '去尋找那間賣了超過一甲子的老店，它的甜味是高雄人的共同回憶。', status: 'locked', lat: 22.626, lng: 120.282, submission: null },
            { id: 'tp-2', name: '駁二 - 文創水果茶', clue: '望著海的巨大白色貓咪附近，有著最新鮮的清涼滋味。', status: 'locked', lat: 22.623, lng: 120.284, submission: null },
            { id: 'tp-3', name: '旗津 - 手工粉圓冰', clue: '搭上渡輪，在熱鬧的老街上尋找那碗最消暑的古早味。', status: 'locked', lat: 22.613, lng: 120.268, submission: null },
        ],
        team: [
            { id: 'mock-user-123456789', nickname: '模擬使用者', avatar: 'https://i.pravatar.cc/80?u=f' },
            { id: 'friend-1', nickname: '王小明', avatar: 'https://i.pravatar.cc/80?u=a' },
        ]
    },
    {
        id: 'challenge-2',
        creatorId: 'creator-user-4',
        title: '駁二藝術尋蹤',
        description: '穿梭在駁二的倉庫群中，尋找隱藏的壁畫與裝置藝術。這是一場結合解謎與攝影的文藝冒險！',
        reward: '駁二限定文創商品組',
        eventTimestamp: new Date('2025-09-01T23:59:59').toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1598972111535-643190a6e2e2?q=80&w=800&auto=format&fit=crop',
        treasurePoints: [
            { id: 'tp-b1', name: '大義倉庫 - 椅子樂譜', clue: '上千張國小課桌椅組成的公共藝術，是回憶也是風景。', status: 'locked', lat: 22.624, lng: 120.286, submission: null },
            { id: 'tp-b2', name: '本東倉庫 - 巨型壁畫', clue: '尋找牆上那對凝視著港口的巨大男女。', status: 'locked', lat: 22.621, lng: 120.283, submission: null },
        ],
        team: []
    },
    {
        id: 'challenge-3',
        creatorId: 'creator-user-5',
        title: '旗津日落美食馬拉松',
        description: '從旗津渡輪站出發，一路向著夕陽前進，完成指定的美食任務，最後在沙灘上欣賞絕美日落！',
        reward: '海產店 500 元折價券',
        eventTimestamp: new Date('2025-08-23T18:30:00').toISOString(), // An expired one for testing
        imageUrl: 'https://images.unsplash.com/photo-1617501333948-e878b2e1e03a?q=80&w=800&auto=format&fit=crop',
        treasurePoints: [
            { id: 'tp-c1', name: '旗津老街 - 烤小卷', clue: '海的鮮味，炭火的香氣，是這條街最誘人的味道。', status: 'locked', lat: 22.613, lng: 120.268, submission: null },
            { id: 'tp-c2', name: '彩虹教堂 - 打卡照', clue: '在通往天堂的彩虹步道上，留下一張美麗的剪影。', status: 'locked', lat: 22.607, lng: 120.266, submission: null },
        ],
        team: []
    }
];

const mockEvents = [
    { id: '1', title: '一起去看新上映的科幻電影', imageUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=800&auto=format&fit=crop', description: '聽說特效超讚，找個伴一起去！', category: '電影', eventType: 'in-person', location: '高雄大遠百威秀', city: '高雄市', lat: 22.611, lng: 120.300, eventTimestamp: new Date('2025-08-24T20:00:00').toISOString(), creator: '電影迷', creatorId: 'creator-user-1', creatorVerified: true, responses: { wantToGo: 5, interested: 8, cantGo: 1 }, responders: {'mock-user-123456789': { response: 'wantToGo', nickname: '模擬使用者'}, 'creator-user-1': { response: 'wantToGo', nickname: '電影迷' } } },
    { id: '2', title: '線上讀書會：原子習慣', imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop', description: '一起來討論書中的觀點，分享彼此的心得。', category: '藝文', eventType: 'online', city: '線上', onlineLink: 'https://meet.google.com/xyz', eventTimestamp: new Date('2025-08-25T14:00:00').toISOString(), creator: '小書僮', creatorId: 'creator-user-2', creatorVerified: false, responses: { wantToGo: 12, interested: 15, cantGo: 3 }, responders: {'mock-user-123456789': { response: 'interested', nickname: '模擬使用者'}} },
];

export default mockEvents;

