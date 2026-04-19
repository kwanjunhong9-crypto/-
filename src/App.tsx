import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  BookOpen, 
  Plus, 
  MoreHorizontal, 
  Award, 
  MessageCircle, 
  Camera, 
  Heart, 
  Star, 
  Clock, 
  Zap, 
  Lightbulb,
  LogOut,
  Coins,
  Lock,
  Trophy,
  Crown,
  X,
  LogIn,
  Settings,
  Globe,
  Pencil,
  Trash2,
  Languages,
  Volume2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Medal,
  Package,
  Gift,
  LayoutGrid,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StoryPost, Skill, Homework, SpecialPet } from './types';
import { SKILLS, INITIAL_STUDENTS, NEEDS_WORK_SKILLS } from './constants';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  where,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';

const CHESTS = [
  {
    level: 1,
    cost: 3,
    rewards: [
      { amount: 30, weight: 75, type: 'coins' },
      { amount: 100, weight: 15, type: 'coins' },
      { amount: 120, weight: 5, type: 'coins' },
      { amount: 200, weight: 4, type: 'coins' },
      { amount: 250, weight: 1, type: 'coins' },
    ]
  },
  {
    level: 2,
    cost: 6,
    rewards: [
      { amount: 50, weight: 75, type: 'coins' },
      { amount: 120, weight: 15, type: 'coins' },
      { amount: 150, weight: 5, type: 'coins' },
      { amount: 220, weight: 4, type: 'coins' },
      { amount: 300, weight: 1, type: 'coins' },
    ]
  },
  {
    level: 3,
    cost: 9,
    rewards: [
      { amount: 75, weight: 75, type: 'coins' },
      { amount: 150, weight: 15, type: 'coins' },
      { amount: 175, weight: 5, type: 'coins' },
      { amount: 250, weight: 4, type: 'coins' },
      { petId: 23, weight: 1, type: 'pet' },
    ]
  }
];

const SkillIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'Heart': return <Heart className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Lightbulb': return <Lightbulb className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'MessageCircle': return <MessageCircle className={className} />;
    default: return <Award className={className} />;
  }
};

const PETS = [
  // Tier 1: The original 4 pets
  { id: 1, tier: 1, emoji: '🐶', name: '小狗', power: 7, price: 5 },
  { id: 2, tier: 1, emoji: '🐱', name: '貓咪', power: 5, price: 2 },
  { id: 3, tier: 1, emoji: '🐰', name: '小兔子', power: 3, price: 1 },
  { id: 4, tier: 1, emoji: '🦊', name: '狐狸', power: 10, price: 7 },
  
  // Tier 2
  { id: 5, tier: 2, emoji: '🐼', name: '熊貓', power: 15, price: 12 },
  { id: 6, tier: 2, emoji: '🐨', name: '無尾熊', power: 20, price: 15 },
  
  // Tier 3
  { id: 7, tier: 3, emoji: '🦁', name: '獅子', power: 50, price: 20 },
  { id: 8, tier: 3, emoji: '🐯', name: '老虎', power: 60, price: 25 },
  
  // Tier 4
  { id: 9, tier: 4, emoji: '🐸', name: '青蛙', power: 75, price: 30 },
  { id: 10, tier: 4, emoji: '🐵', name: '猴子', power: 80, price: 33 },
  
  // Tier 5
  { id: 11, tier: 5, emoji: '🐔', name: '公雞', power: 90, price: 40 },
  { id: 12, tier: 5, emoji: '🐧', name: '企鵝', power: 100, price: 44 },
  
  // Tier 6
  { id: 13, tier: 6, emoji: '🐷', name: '小豬', power: 120, price: 50 },
  { id: 14, tier: 6, emoji: '🐮', name: '小牛', power: 125, price: 70 },
  
  // Tier 7
  { id: 15, tier: 7, emoji: '🐘', name: '大象', power: 140, price: 90 },
  { id: 16, tier: 7, emoji: '🦒', name: '長頸鹿', power: 150, price: 120 },
  
  // Tier 8
  { id: 17, tier: 8, emoji: '🐙', name: '章魚', power: 175, price: 135 },
  { id: 18, tier: 8, emoji: '🦑', name: '烏賊', power: 190, price: 150 },
  
  // Tier 9
  { id: 19, tier: 9, emoji: '🐲', name: '神龍', power: 230, price: 190 },
  { id: 20, tier: 9, emoji: '🦕', name: '恐龍', power: 295, price: 230 },
  
  // Tier 10
  { id: 21, tier: 10, emoji: '👑', name: '王者', power: 750, price: 350 },
  { id: 22, tier: 10, emoji: '💎', name: '鑽石', power: 999, price: 500 },
  { id: 23, tier: 10, emoji: '🦄', name: '彩虹獨角獸', power: 1250, price: 0, isSpecial: true },
];

type Language = 'zh-Hans' | 'zh-Hant' | 'ms' | 'en';

const TRANSLATIONS = {
  'zh-Hans': {
    myClasses: '我的班级',
    newClass: '新班级',
    equipped: '使用中',
    owned: '已拥有',
    inLevel3Chest: '在level3宝箱',
    removePet: '移除宠物头像',
    petsAndAvatar: '宠物与头像',
    customizeCharacter: '自定义你的角色',
    pet: '宠物',
    avatar: '头像',
    power: '战力',
    experience: '经验',
    yourPet: '你的宠物',
    changeAvatar: '更换头像',
    choosePetFor: '为 {name} 选择一个宠物',
    chooseAvatarFor: '为 {name} 选择一个新头像',
    baseAvatar: '基础头像',
    petAvatar: '宠物头像',
    levelLocked: '等级 {level} 已锁定',
    needToReach: '你需要达到',
    toUnlockPets: '才能解锁此等级的宠物',
    currentStageLabel: '目前阶段',
    students: '学生',
    exit: '退出',
    logout: '登出',
    login: '登录',
    classroom: '班级',
    story: '故事',
    reports: '报告',
    leaderboard: '排行榜',
    addStudent: '添加新学生',
    editStudent: '修改学生资料',
    studentName: '学生姓名',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    positive: '加分',
    needsWork: '扣分',
    feedbackFor: '的反馈',
    start: '开始使用',
    guestMode: '游客模式',
    guestWarning: '注意：没有登录的人不能暂存班级',
    tagline: '最简单、最有趣的课堂管理工具',
    language: '语言',
    saveChanges: '保存修改',
    addStudentBtn: '添加学生',
    pointsUnit: '分',
    level: '等级',
    energy: '能量',
    energyUnit: '能量',
    postPlaceholder: '班级里发生了什么新鲜事？',
    photo: '照片',
    file: '文件',
    posting: '发布中...',
    post: '发布',
    likes: '赞',
    comments: '评论',
    homework: '作业',
    homeworkTitle: '班级作业',
    addHomework: '添加作业',
    question: '题目',
    answer: '答案',
    coins: '金币',
    exp: '经验值',
    submit: '提交',
    correct: '回答正确！',
    wrong: '回答错误，再试一次！',
    reward: '奖励',
    noHomework: '目前没有作业',
    editHomework: '修改作业',
    deleteHomework: '删除作业',
    image: '图片',
    imageUrl: '图片网址',
    uploadImage: '上传图片',
    enterAnswer: '请输入答案',
    teacherAnswer: '老师设定的答案',
    studentPassword: '学生密码',
    enterPassword: '请输入6位数密码',
    loginAsStudent: '学生登录',
    passwordError: '密码错误',
    setStudentPassword: '设定学生密码',
    passwordPlaceholder: '6位数字',
    onlyOwnProfile: '你只能查看自己的个人资料',
    teacherOnly: '只有老师可以执行此操作',
    expiryTime: '截止时间',
    oneDay: '1 天',
    twoDays: '2 天',
    threeDays: '3 天',
    oneWeek: '1 周',
    expiresIn: '剩余时间',
    expired: '已截止',
    chest: '宝箱',
    openChest: '开启宝箱',
    medals: '奖章',
    chestRewards: '宝箱奖励',
    probability: '概率',
    notEnoughMedals: '奖章不足',
    chestLevel: '等级',
    bossBattle: '打怪兽',
    simple: '简单',
    medium: '中等',
    hard: '困难',
    demon: '恶魔',
    bossHp: '怪兽血量',
    damageLeaderboard: '伤害排行榜',
    victory: '战斗胜利！',
    rewards: '奖励已发放',
    toolbox: '工具箱',
    specialPet: '特别宠物',
    addSpecialPet: '增加特别宠物',
    petName: '宠物名字',
    petPrice: '价格 (金币)',
    petPhoto: '照片网址',
    petPower: '力量数量',
    buy: '购买',
    notEnoughCoins: '金币不足',
    alreadyOwned: '已拥有',
    countdown: '倒计时',
    stage: '阶段',
    expLeaderboard: '排行榜',
    powerLeaderboard: 'Power 排行榜',
    congratulations: '恭喜获得！',
    newPet: '新宠物：',
    awesome: '太棒了！',
    passwordErrorDetail: '密码错误或找不到该学生。',
    confirmDeleteStudent: '确定要删除这位学生吗？此操作无法撤销。',
    studentStatus: '学生身份',
    totalStudents: '学生总数',
    studentCount: '学生人数',
    studentPerformance: '学生表现',
    homeworkAnswerPlaceholder: '学生输入此答案即可获得奖励',
    createYourClass: '创建您的班级',
    classNameLabel: '班级名称',
    startManagingClass: '开始管理班级',
    totalClassCoins: '班级总金币',
    totalClassExp: '班级总经验',
    expStarTagline: '谁是班级的学习之星？',
    powerStarTagline: '谁的宠物最强大？',
    rename: '重命名',
    enter: '进入',
    classNamePlaceholder: '例如：三年二班',
    renameFailed: '重命名失败',
    loginErrorDetail: '登录时出错，请稍后再试。',
    passwordTaken: '此密码已经有人使用过了！请更换一个。',
    setPasswordError: '设定密码时出错，请稍后再试。',
    fullNamePlaceholder: '输入全名',
    questionPlaceholder: '请输入题目内容...',
    popupBlocked: '登录窗口被拦截了！请点击右上角的「在新分页开启」按钮，或允许此网站弹出窗口。',
    popupClosed: '您关闭了登录窗口，请再试一次。',
    loginFailed: '登录失败，请稍后再试。',
    teacherName: '史密斯老师',
    verifiedTeacher: '认证教师',
    guestTeacher: '游客教师',
    exitTooltip: '退出并返回首页',
    rankPrefix: '第',
    rankSuffix: '名',
    backStep: '返回上一步',
    skill_p1: '+1 分', skill_p2: '+2 分', skill_p3: '+3 分', skill_p4: '+4 分', skill_p5: '+5 分',
    skill_1: '帮助他人', skill_2: '专注学习', skill_5: '团队合作',
    skill_m1: '-1 分', skill_m2: '-2 分', skill_m3: '-3 分', skill_m4: '-4 分', skill_m5: '-5 分',
    skill_n1: '分心', skill_n2: '不尊重他人',
    pet_1: '小狗', pet_2: '猫咪', pet_3: '小兔子', pet_4: '狐狸', pet_5: '熊猫',
    pet_6: '无尾熊', pet_7: '狮子', pet_8: '老虎', pet_9: '青蛙', pet_10: '猴子',
    pet_11: '公鸡', pet_12: '企鹅', pet_13: '小猪', pet_14: '小牛', pet_15: '大象',
    pet_16: '长颈鹿', pet_17: '章鱼', pet_18: '乌贼', pet_19: '神龙', pet_20: '恐龙',
    pet_21: '王者', pet_22: '钻石', pet_23: '彩虹独角兽'
  },
  'zh-Hant': {
    myClasses: '我的班級',
    newClass: '新班級',
    equipped: '使用中',
    owned: '已擁有',
    inLevel3Chest: '在level3寶箱',
    removePet: '移除寵物頭像',
    petsAndAvatar: '寵物與頭像',
    customizeCharacter: '自定義你的角色',
    pet: '寵物',
    avatar: '頭像',
    power: '戰力',
    experience: '經驗',
    yourPet: '你的寵物',
    changeAvatar: '更換頭像',
    choosePetFor: '為 {name} 選擇一個寵物',
    chooseAvatarFor: '為 {name} 選擇一個新頭像',
    baseAvatar: '基礎頭像',
    petAvatar: '寵物頭像',
    levelLocked: '等級 {level} 已鎖定',
    needToReach: '你需要達到',
    toUnlockPets: '才能解鎖此等級的寵物',
    currentStageLabel: '目前階段',
    students: '學生',
    exit: '退出',
    logout: '登出',
    login: '登入',
    classroom: '班級',
    story: '故事',
    reports: '報告',
    leaderboard: '排行榜',
    addStudent: '添加新學生',
    editStudent: '修改學生資料',
    studentName: '學生姓名',
    cancel: '取消',
    save: '儲存',
    delete: '刪除',
    positive: '加分',
    needsWork: '扣分',
    feedbackFor: '的反饋',
    start: '開始使用',
    guestMode: '遊客模式',
    guestWarning: '注意：沒有登錄的人不能暫存班級',
    tagline: '最簡單、最有趣的課堂管理工具',
    language: '語言',
    saveChanges: '儲存修改',
    addStudentBtn: '添加學生',
    pointsUnit: '分',
    level: '等級',
    energy: '能量',
    energyUnit: '能量',
    postPlaceholder: '班級裡發生了什麼新鮮事？',
    photo: '照片',
    file: '文件',
    posting: '發佈中...',
    post: '發佈',
    likes: '讚',
    comments: '評論',
    homework: '功課',
    homeworkTitle: '班級功課',
    addHomework: '添加功課',
    question: '題目',
    answer: '答案',
    coins: '金幣',
    exp: '經驗值',
    submit: '提交',
    correct: '回答正確！',
    wrong: '回答錯誤，再試一次！',
    reward: '獎勵',
    noHomework: '目前沒有功課',
    editHomework: '修改功課',
    deleteHomework: '刪除功課',
    image: '圖片',
    imageUrl: '圖片網址',
    uploadImage: '上傳圖片',
    enterAnswer: '請輸入答案',
    teacherAnswer: '老師設定的答案',
    studentPassword: '學生密碼',
    enterPassword: '請輸入6位數密碼',
    loginAsStudent: '學生登入',
    passwordError: '密碼錯誤',
    setStudentPassword: '設定學生密碼',
    passwordPlaceholder: '6位數字',
    onlyOwnProfile: '你只能查看自己的個人資料',
    teacherOnly: '只有老師可以執行此操作',
    expiryTime: '截止時間',
    oneDay: '1 天',
    twoDays: '2 天',
    threeDays: '3 天',
    oneWeek: '1 週',
    expiresIn: '剩餘時間',
    expired: '已截止',
    chest: '寶箱',
    openChest: '開啟寶箱',
    medals: '獎章',
    chestRewards: '寶箱獎勵',
    probability: '機率',
    notEnoughMedals: '獎章不足',
    chestLevel: '等級',
    bossBattle: '打怪獸',
    simple: '簡單',
    medium: '中等',
    hard: '困難',
    demon: '惡魔',
    bossHp: '怪獸血量',
    damageLeaderboard: '傷害排行榜',
    victory: '戰鬥勝利！',
    rewards: '獎勵已發放',
    toolbox: '工具箱',
    specialPet: '特別寵物',
    addSpecialPet: '增加特別寵物',
    petName: '寵物名字',
    petPrice: '價格 (金幣)',
    petPhoto: '寵物照片網址',
    petPower: '力量數量',
    buy: '購買',
    notEnoughCoins: '金幣不足',
    alreadyOwned: '已擁有',
    countdown: '倒計時',
    stage: '階段',
    expLeaderboard: '排行榜',
    powerLeaderboard: 'Power 排行榜',
    congratulations: '恭喜獲得！',
    newPet: '新寵物：',
    awesome: '太棒了！',
    passwordErrorDetail: '密碼錯誤或找不到該學生。',
    confirmDeleteStudent: '確定要刪除這位學生嗎？此操作無法撤銷。',
    studentStatus: '學生身份',
    totalStudents: '學生總數',
    studentCount: '學生人數',
    studentPerformance: '學生表現',
    homeworkAnswerPlaceholder: '學生輸入此答案即可獲得獎勵',
    createYourClass: '創建您的班級',
    classNameLabel: '班級名稱',
    startManagingClass: '開始管理班級',
    totalClassCoins: '班級總金幣',
    totalClassExp: '班級總經驗',
    expStarTagline: '誰是班級的學習之星？',
    powerStarTagline: '誰的寵物最強大？',
    rename: '重新命名',
    enter: '進入',
    classNamePlaceholder: '例如：三年二班',
    renameFailed: '重新命名失敗',
    loginErrorDetail: '登入時出錯，請稍後再試。',
    passwordTaken: '此密碼已經有人使用過了！請更換一個。',
    setPasswordError: '設定密碼時出錯，請稍後再試。',
    fullNamePlaceholder: '輸入全名',
    questionPlaceholder: '請輸入題目內容...',
    popupBlocked: '登入視窗被攔截了！請點擊右上角的「在新分頁開啟」按鈕，或允許此網站彈出視窗。',
    popupClosed: '您關閉了登入視窗，請再試一次。',
    loginFailed: '登入失敗，請稍後再試。',
    teacherName: '史密斯老師',
    verifiedTeacher: '認證教師',
    guestTeacher: '遊客教師',
    exitTooltip: '退出並返回首頁',
    rankPrefix: '第',
    rankSuffix: '名',
    backStep: '返回上一步',
    skill_p1: '+1 分', skill_p2: '+2 分', skill_p3: '+3 分', skill_p4: '+4 分', skill_p5: '+5 分',
    skill_1: '幫助他人', skill_2: '專注學習', skill_5: '團隊合作',
    skill_m1: '-1 分', skill_m2: '-2 分', skill_m3: '-3 分', skill_m4: '-4 分', skill_m5: '-5 分',
    skill_n1: '分心', skill_n2: '不尊重他人',
    pet_1: '小狗', pet_2: '貓咪', pet_3: '小兔子', pet_4: '狐狸', pet_5: '熊貓',
    pet_6: '無尾熊', pet_7: '獅子', pet_8: '老虎', pet_9: '青蛙', pet_10: '猴子',
    pet_11: '公雞', pet_12: '企鵝', pet_13: '小豬', pet_14: '小牛', pet_15: '大象',
    pet_16: '長頸鹿', pet_17: '章魚', pet_18: '烏賊', pet_19: '神龍', pet_20: '恐龍',
    pet_21: '王者', pet_22: '鑽石', pet_23: '彩虹獨角獸'
  },
  ms: {
    myClasses: 'Kelas Saya',
    newClass: 'Kelas Baru',
    equipped: 'Digunakan',
    owned: 'Dimiliki',
    inLevel3Chest: 'Dalam Peti Level 3',
    removePet: 'Alih Keluar Haiwan Peliharaan',
    petsAndAvatar: 'Haiwan Peliharaan & Avatar',
    customizeCharacter: 'Peribadikan watak anda',
    pet: 'Haiwan Peliharaan',
    avatar: 'Avatar',
    power: 'Kuasa',
    experience: 'Pengalaman',
    yourPet: 'Haiwan Peliharaan Anda',
    changeAvatar: 'Tukar Avatar',
    choosePetFor: 'Pilih haiwan peliharaan untuk {name}',
    chooseAvatarFor: 'Pilih avatar baru untuk {name}',
    baseAvatar: 'Avatar Asas',
    petAvatar: 'Avatar Haiwan',
    levelLocked: 'Tahap {level} Terkunci',
    needToReach: 'Anda perlu mencapai',
    toUnlockPets: 'untuk membuka haiwan peliharaan tahap ini',
    currentStageLabel: 'Peringkat semasa',
    students: 'Pelajar',
    exit: 'Keluar',
    logout: 'Log Keluar',
    login: 'Log Masuk',
    classroom: 'Bilik Darjah',
    story: 'Cerita',
    reports: 'Laporan',
    leaderboard: 'Papan Pendahulu',
    addStudent: 'Tambah Pelajar Baru',
    editStudent: 'Edit Maklumat Pelajar',
    studentName: 'Nama Pelajar',
    cancel: 'Batal',
    save: 'Simpan',
    delete: 'Padam',
    positive: 'Tambah Mata',
    needsWork: 'Tolak Mata',
    feedbackFor: 'Maklum Balas Untuk',
    start: 'Mula Sekarang',
    guestMode: 'Mod Tetamu',
    guestWarning: 'Nota: Data akan hilang selepas menutup pelayar dalam mod tetamu',
    tagline: 'Alat pengurusan bilik darjah yang paling mudah dan menyeronokkan',
    language: 'Bahasa',
    saveChanges: 'Simpan Perubahan',
    addStudentBtn: 'Tambah Pelajar',
    pointsUnit: 'Mata',
    level: 'Tahap',
    energy: 'Tenaga',
    energyUnit: 'Tenaga',
    postPlaceholder: 'Apa yang berlaku dalam kelas?',
    photo: 'Foto',
    file: 'Fail',
    posting: 'Menghantar...',
    post: 'Hantar',
    likes: 'Suka',
    comments: 'Komen',
    homework: 'Kerja Rumah',
    homeworkTitle: 'Kerja Rumah Kelas',
    addHomework: 'Tambah Kerja Rumah',
    question: 'Soalan',
    answer: 'Jawapan',
    coins: 'Syiling',
    exp: 'EXP',
    submit: 'Hantar',
    correct: 'Jawapan Betul!',
    wrong: 'Jawapan Salah, cuba lagi!',
    reward: 'Ganjaran',
    noHomework: 'Tiada kerja rumah buat masa ini',
    editHomework: 'Edit Kerja Rumah',
    deleteHomework: 'Padam Kerja Rumah',
    image: 'Imej',
    imageUrl: 'URL Imej',
    uploadImage: 'Muat Naik Imej',
    enterAnswer: 'Sila masukkan jawapan',
    teacherAnswer: 'Jawapan Guru',
    studentPassword: 'Kata Laluan Pelajar',
    enterPassword: 'Sila masukkan 6 digit kata laluan',
    loginAsStudent: 'Log Masuk Pelajar',
    passwordError: 'Kata laluan salah',
    setStudentPassword: 'Tetapkan Kata Laluan Pelajar',
    passwordPlaceholder: '6 digit',
    onlyOwnProfile: 'Anda hanya boleh melihat profil sendiri',
    teacherOnly: 'Hanya guru boleh melakukan tindakan ini',
    expiryTime: 'Masa Tamat',
    oneDay: '1 Hari',
    twoDays: '2 Hari',
    threeDays: '3 Hari',
    oneWeek: '1 Minggu',
    expiresIn: 'Tamat dalam',
    expired: 'Tamat',
    chest: 'Peti',
    openChest: 'Buka Peti',
    medals: 'Pingat',
    chestRewards: 'Ganjaran Peti',
    probability: 'Kebarangkalian',
    notEnoughMedals: 'Pingat tidak mencukupi',
    chestLevel: 'Tahap',
    bossBattle: 'Lawan Raksasa',
    simple: 'Mudah',
    medium: 'Sederhana',
    hard: 'Sukar',
    demon: 'Iblis',
    bossHp: 'Darah Raksasa',
    damageLeaderboard: 'Papan Pendahulu Kerosakan',
    victory: 'Kemenangan!',
    rewards: 'Ganjaran telah diberikan',
    toolbox: 'Kotak Alat',
    specialPet: 'Haiwan Istimewa',
    addSpecialPet: 'Tambah Haiwan Istimewa',
    petName: 'Nama Haiwan',
    petPrice: 'Harga (Syiling)',
    petPhoto: 'URL Foto Haiwan',
    petPower: 'Jumlah Kuasa',
    buy: 'Beli',
    notEnoughCoins: 'Syiling tidak mencukupi',
    alreadyOwned: 'Sedia ada',
    countdown: 'Kira Detik',
    stage: 'Peringkat',
    expLeaderboard: 'Papan Pendahulu EXP',
    powerLeaderboard: 'Papan Pendahulu Power',
    congratulations: 'Tahniah!',
    newPet: 'Haiwan Peliharaan Baru: ',
    awesome: 'Hebat!',
    passwordErrorDetail: 'Kata laluan salah atau pelajar tidak dijumpai.',
    confirmDeleteStudent: 'Adakah anda pasti mahu memadam pelajar ini? Tindakan ini tidak boleh diubah.',
    studentStatus: 'Status Pelajar',
    totalStudents: 'Jumlah Pelajar',
    studentCount: 'Bilangan Pelajar',
    studentPerformance: 'Prestasi Pelajar',
    homeworkAnswerPlaceholder: 'Pelajar masukkan jawapan ini untuk ganjaran',
    createYourClass: 'Cipta Kelas Anda',
    classNameLabel: 'Nama Kelas',
    startManagingClass: 'Mula Mengurus Kelas',
    totalClassCoins: 'Jumlah Syiling Kelas',
    totalClassExp: 'Jumlah EXP Kelas',
    expStarTagline: 'Siapa bintang pembelajaran kelas?',
    powerStarTagline: 'Siapa mempunyai haiwan peliharaan terkuat?',
    rename: 'Tukar Nama',
    enter: 'Masuk',
    classNamePlaceholder: 'Contoh: Tahun 3A',
    renameFailed: 'Gagal menukar nama',
    loginErrorDetail: 'Ralat semasa log masuk, sila cuba lagi.',
    passwordTaken: 'Kata laluan ini sudah digunakan! Sila pilih yang lain.',
    setPasswordError: 'Ralat semasa menetapkan kata laluan, sila cuba lagi.',
    fullNamePlaceholder: 'Masukkan nama penuh',
    questionPlaceholder: 'Sila masukkan soalan...',
    popupBlocked: 'Tetingkap timbul disekat! Sila benarkan tetingkap timbul untuk laman web ini.',
    popupClosed: 'Anda telah menutup tetingkap log masuk, sila cuba lagi.',
    loginFailed: 'Log masuk gagal, sila cuba lagi kemudian.',
    teacherName: 'Cikgu Smith',
    verifiedTeacher: 'Guru Disahkan',
    guestTeacher: 'Guru Tetamu',
    exitTooltip: 'Keluar dan kembali ke halaman utama',
    rankPrefix: 'No. ',
    rankSuffix: '',
    backStep: 'Kembali',
    skill_p1: '+1 Mata', skill_p2: '+2 Mata', skill_p3: '+3 Mata', skill_p4: '+4 Mata', skill_p5: '+5 Mata',
    skill_1: 'Membantu orang lain', skill_2: 'Fokus belajar', skill_5: 'Kerjasama pasukan',
    skill_m1: '-1 Mata', skill_m2: '-2 Mata', skill_m3: '-3 Mata', skill_m4: '-4 Mata', skill_m5: '-5 Mata',
    skill_n1: 'Gangguan', skill_n2: 'Tidak menghormati',
    pet_1: 'Anjing', pet_2: 'Kucing', pet_3: 'Arnab', pet_4: 'Musang', pet_5: 'Panda',
    pet_6: 'Koala', pet_7: 'Singa', pet_8: 'Harimau', pet_9: 'Katak', pet_10: 'Monyet',
    pet_11: 'Ayam', pet_12: 'Penguin', pet_13: 'Babi', pet_14: 'Lembu', pet_15: 'Gajah',
    pet_16: 'Zirafah', pet_17: 'Sotong', pet_18: 'Sotong Kurita', pet_19: 'Naga', pet_20: 'Dinosaur',
    pet_21: 'Raja', pet_22: 'Berlian', pet_23: 'Unicorn Pelangi'
  },
  en: {
    myClasses: 'My Classes',
    newClass: 'New Class',
    equipped: 'Equipped',
    owned: 'Owned',
    inLevel3Chest: 'In Level 3 Chest',
    removePet: 'Remove Pet Avatar',
    petsAndAvatar: 'Pets & Avatar',
    customizeCharacter: 'Customize your character',
    pet: 'Pet',
    avatar: 'Avatar',
    power: 'Power',
    experience: 'Experience',
    yourPet: 'Your Pet',
    changeAvatar: 'Change Avatar',
    choosePetFor: 'Choose a pet for {name}',
    chooseAvatarFor: 'Choose a new avatar for {name}',
    baseAvatar: 'Base Avatar',
    petAvatar: 'Pet Avatar',
    levelLocked: 'Level {level} Locked',
    needToReach: 'You need to reach',
    toUnlockPets: 'to unlock pets of this level',
    currentStageLabel: 'Current stage',
    students: 'Students',
    exit: 'Exit',
    logout: 'Logout',
    login: 'Login',
    classroom: 'Classroom',
    story: 'Story',
    reports: 'Reports',
    leaderboard: 'Leaderboard',
    addStudent: 'Add New Student',
    editStudent: 'Edit Student Info',
    studentName: 'Student Name',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    positive: 'Positive',
    needsWork: 'Needs Work',
    feedbackFor: 'Feedback for',
    start: 'Get Started',
    guestMode: 'Guest Mode',
    guestWarning: 'Note: Data will be lost after closing the browser in guest mode',
    tagline: 'The simplest and most fun classroom management tool',
    language: 'Language',
    saveChanges: 'Save Changes',
    addStudentBtn: 'Add Student',
    pointsUnit: 'Pts',
    level: 'Level',
    energy: 'Energy',
    energyUnit: 'Energy',
    postPlaceholder: "What's happening in your class?",
    photo: 'Photo',
    file: 'File',
    posting: 'Posting...',
    post: 'Post',
    likes: 'Likes',
    comments: 'Comments',
    homework: 'Homework',
    homeworkTitle: 'Class Homework',
    addHomework: 'Add Homework',
    question: 'Question',
    answer: 'Answer',
    coins: 'Coins',
    exp: 'EXP',
    submit: 'Submit',
    correct: 'Correct Answer!',
    wrong: 'Wrong Answer, try again!',
    reward: 'Reward',
    noHomework: 'No homework at the moment',
    editHomework: 'Edit Homework',
    deleteHomework: 'Delete Homework',
    image: 'Image',
    imageUrl: 'Image URL',
    uploadImage: 'Upload Image',
    enterAnswer: 'Please enter answer',
    teacherAnswer: 'Teacher\'s Answer',
    studentPassword: 'Student Password',
    enterPassword: 'Please enter 6-digit password',
    loginAsStudent: 'Student Login',
    passwordError: 'Incorrect password',
    setStudentPassword: 'Set Student Password',
    passwordPlaceholder: '6 digits',
    onlyOwnProfile: 'You can only view your own profile',
    teacherOnly: 'Only teachers can perform this action',
    expiryTime: 'Expiry Time',
    oneDay: '1 Day',
    twoDays: '2 Days',
    threeDays: '3 Days',
    oneWeek: '1 Week',
    expiresIn: 'Expires in',
    expired: 'Expired',
    chest: 'Chest',
    openChest: 'Open Chest',
    medals: 'Medals',
    chestRewards: 'Chest Rewards',
    probability: 'Probability',
    notEnoughMedals: 'Not enough medals',
    chestLevel: 'Level',
    bossBattle: 'Boss Battle',
    simple: 'Simple',
    medium: 'Medium',
    hard: 'Hard',
    demon: 'Demon',
    bossHp: 'Boss HP',
    damageLeaderboard: 'Damage Leaderboard',
    victory: 'Victory!',
    rewards: 'Rewards distributed',
    toolbox: 'Toolbox',
    specialPet: 'Special Pet',
    addSpecialPet: 'Add Special Pet',
    petName: 'Pet Name',
    petPrice: 'Price (Coins)',
    petPhoto: 'Pet Photo URL',
    petPower: 'Power Amount',
    buy: 'Buy',
    notEnoughCoins: 'Not enough coins',
    alreadyOwned: 'Already Owned',
    countdown: 'Countdown',
    stage: 'Stage',
    expLeaderboard: 'EXP Leaderboard',
    powerLeaderboard: 'Power Leaderboard',
    congratulations: 'Congratulations!',
    newPet: 'New Pet: ',
    awesome: 'Awesome!',
    passwordErrorDetail: 'Incorrect password or student not found.',
    confirmDeleteStudent: 'Are you sure you want to delete this student? This action cannot be undone.',
    studentStatus: 'Student Status',
    totalStudents: 'Total Students',
    studentCount: 'Student Count',
    studentPerformance: 'Student Performance',
    homeworkAnswerPlaceholder: 'Students enter this answer for rewards',
    createYourClass: 'Create Your Class',
    classNameLabel: 'Class Name',
    startManagingClass: 'Start Managing Class',
    totalClassCoins: 'Total Class Coins',
    totalClassExp: 'Total Class EXP',
    expStarTagline: 'Who is the class learning star?',
    powerStarTagline: 'Who has the strongest pet?',
    rename: 'Rename',
    enter: 'Enter',
    classNamePlaceholder: 'e.g. Grade 3B',
    renameFailed: 'Rename failed',
    loginErrorDetail: 'Error during login, please try again later.',
    passwordTaken: 'This password is already taken! Please choose another.',
    setPasswordError: 'Error setting password, please try again later.',
    fullNamePlaceholder: 'Enter full name',
    questionPlaceholder: 'Please enter question content...',
    popupBlocked: 'Login popup was blocked! Please allow popups for this site.',
    popupClosed: 'You closed the login window, please try again.',
    loginFailed: 'Login failed, please try again later.',
    teacherName: 'Teacher Smith',
    verifiedTeacher: 'Verified Teacher',
    guestTeacher: 'Guest Teacher',
    exitTooltip: 'Exit and return to home page',
    rankPrefix: 'Rank ',
    rankSuffix: '',
    backStep: 'Back',
    skill_p1: '+1 Point', skill_p2: '+2 Point', skill_p3: '+3 Point', skill_p4: '+4 Point', skill_p5: '+5 Point',
    skill_1: 'Helping others', skill_2: 'Focus on learning', skill_5: 'Teamwork',
    skill_m1: '-1 Point', skill_m2: '-2 Point', skill_m3: '-3 Point', skill_m4: '-4 Point', skill_m5: '-5 Point',
    skill_n1: 'Distracted', skill_n2: 'Disrespectful',
    pet_1: 'Puppy', pet_2: 'Kitty', pet_3: 'Bunny', pet_4: 'Fox', pet_5: 'Panda',
    pet_6: 'Koala', pet_7: 'Lion', pet_8: 'Tiger', pet_9: 'Frog', pet_10: 'Monkey',
    pet_11: 'Chicken', pet_12: 'Penguin', pet_13: 'Piggy', pet_14: 'Cow', pet_15: 'Elephant',
    pet_16: 'Giraffe', pet_17: 'Octopus', pet_18: 'Squid', pet_19: 'Dragon', pet_20: 'Dino',
    pet_21: 'King', pet_22: 'Diamond', pet_23: 'Rainbow Unicorn'
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'createClass' | 'app'>('landing');
  const [isGuest, setIsGuest] = useState(false);
  const [className, setClassName] = useState('');
  const [activeTab, setActiveTab] = useState<'classroom' | 'story' | 'reports' | 'leaderboard' | 'boss'>('classroom');
  const [modalTab, setModalTab] = useState<'positive' | 'needsWork'>('positive');
  const [powerModalStudent, setPowerModalStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [hasExited, setHasExited] = useState(false);
  const [language, setLanguage] = useState<Language>('zh-Hant');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [coinsModalStudent, setCoinsModalStudent] = useState<Student | null>(null);
  const [powerModalMode, setPowerModalMode] = useState<'pet' | 'avatar'>('pet');
  const [selectedPetTier, setSelectedPetTier] = useState<number>(1);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [myClasses, setMyClasses] = useState<{id: string, name: string}[]>([]);
  
  // Homework State
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isAddingHomework, setIsAddingHomework] = useState(false);
  const [newHomework, setNewHomework] = useState<Partial<Homework>>({
    question: '',
    answer: '',
    coinsReward: 10,
    expReward: 10,
    medalsReward: 0,
    imageUrl: '',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  });
  const [studentAnswers, setStudentAnswers] = useState<{[key: string]: string}>({});
  const [homeworkFeedback, setHomeworkFeedback] = useState<{[key: string]: {type: 'success' | 'error', message: string} | null}>({});

  // Student Login State
  const [loggedInStudentId, setLoggedInStudentId] = useState<string | null>(null);
  const [studentLoginPassword, setStudentLoginPassword] = useState('');
  const [isStudentPasswordModalOpen, setIsStudentPasswordModalOpen] = useState(false);
  const [passwordModalStudent, setPasswordModalStudent] = useState<Student | null>(null);
  const [tempStudentPassword, setTempStudentPassword] = useState('');

  // Special Pets State
  const [specialPets, setSpecialPets] = useState<SpecialPet[]>([]);
  const [isSpecialPetModalOpen, setIsSpecialPetModalOpen] = useState(false);
  const [isAddingSpecialPet, setIsAddingSpecialPet] = useState(false);
  const [newSpecialPet, setNewSpecialPet] = useState<Partial<SpecialPet>>({
    name: '',
    price: 0,
    imageUrl: '',
    power: 0
  });

  const [isChestModalOpen, setIsChestModalOpen] = useState(false);
  const [chestReward, setChestReward] = useState<{amount?: number, petId?: number, level: number} | null>(null);

  // Boss Battle State
  const [bossDifficulty, setBossDifficulty] = useState<'simple' | 'medium' | 'hard' | 'demon' | null>(null);
  const [bossHp, setBossHp] = useState(0);
  const [maxBossHp, setMaxBossHp] = useState(0);
  const [damageDealt, setDamageDealt] = useState<{[studentId: string]: number}>({});
  const [isBossDefeated, setIsBossDefeated] = useState(false);

  // Timer & Toolbox State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [timerEditMode, setTimerEditMode] = useState<'h' | 'm' | 's' | null>(null);
  const [showTimeUp, setShowTimeUp] = useState(false);

  const [leaderboardTab, setLeaderboardTab] = useState<'exp' | 'power'>('exp');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState('');

  const homeworkFileInputRef = useRef<HTMLInputElement>(null);
  const specialPetFileInputRef = useRef<HTMLInputElement>(null);

  // Timer Logic
  const playBellSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1011/1011-preview.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
    
    // Play again after 1.5s and 3s for a total of 3 rings
    setTimeout(() => {
      const audio2 = new Audio('https://assets.mixkit.co/active_storage/sfx/1011/1011-preview.mp3');
      audio2.play().catch(e => {});
    }, 1500);
    
    setTimeout(() => {
      const audio3 = new Audio('https://assets.mixkit.co/active_storage/sfx/1011/1011-preview.mp3');
      audio3.play().catch(e => {});
    }, 3000);
  };

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowTimeUp(true);
      playBellSound();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const t = TRANSLATIONS[language];

  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Image Viewer State
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState(1);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      if (currentUser) {
        setIsGuest(false);
        setActiveClassId(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial View Logic
  useEffect(() => {
    if (isAuthLoading || hasExited) return;

    if (user) {
      // Fetch all classes owned by this teacher
      const q = query(collection(db, 'classes'), where('teacherId', '==', user.uid));
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const classes: {id: string, name: string}[] = [];
        for (const classDoc of querySnapshot.docs) {
          const data = classDoc.data();
          classes.push({ id: classDoc.id, name: data.name });
        }
        setMyClasses(classes);
      });
      
      setView('landing');
      return () => unsubscribe();
    } else {
      const savedClass = localStorage.getItem('dojo_class_name');
      if (savedClass) {
        setClassName(savedClass);
        setIsGuest(true);
        setView('app');
      } else {
        setView('landing');
      }
    }
  }, [user, isAuthLoading]);

  // Firestore Sync
  useEffect(() => {
    if (activeClassId) {
      const classRef = doc(db, 'classes', activeClassId);
      const unsubscribeClass = onSnapshot(classRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClassName(data.name);
          setStudents(data.students || []);
          // Only set as teacher if not logged in as a student
          setIsTeacher(user?.uid === data.teacherId && !loggedInStudentId);
        }
      });

      const postsQuery = query(collection(db, 'posts'), where('classId', '==', activeClassId));
      const unsubscribePosts = onSnapshot(postsQuery, (querySnapshot) => {
        const fetchedPosts: StoryPost[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as StoryPost);
        });
        // Sort by timestamp if needed
        setPosts(fetchedPosts.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }));
      });

      return () => {
        unsubscribeClass();
        unsubscribePosts();
      };
    }
  }, [activeClassId, user, loggedInStudentId]);

  // Homework Sync
  useEffect(() => {
    if (activeClassId) {
      const hwQuery = query(collection(db, 'homeworks'), where('classId', '==', activeClassId));
      const unsubscribeHw = onSnapshot(hwQuery, (querySnapshot) => {
        const fetchedHw: Homework[] = [];
        querySnapshot.forEach((doc) => {
          fetchedHw.push({ id: doc.id, ...doc.data() } as Homework);
        });
        setHomeworks(fetchedHw);
      });
      return () => unsubscribeHw();
    }
  }, [activeClassId]);

  // Sync passwords to global collection for universal login
  useEffect(() => {
    if (isTeacher && activeClassId && students.length > 0 && !loggedInStudentId) {
      const syncPasswords = async () => {
        try {
          for (const student of students) {
            if (student.password) {
              const passwordDocRef = doc(db, 'studentPasswords', student.password);
              const passwordDocSnap = await getDoc(passwordDocRef);
              if (!passwordDocSnap.exists()) {
                await setDoc(passwordDocRef, {
                  classId: activeClassId,
                  studentId: student.id
                });
              }
            }
          }
        } catch (e) {
          console.error("Failed to sync passwords to global collection", e);
        }
      };
      syncPasswords();
    }
  }, [isTeacher, activeClassId, students, loggedInStudentId]);

  // Special Pet Sync
  useEffect(() => {
    if (activeClassId) {
      const petsQuery = query(collection(db, 'specialPets'), where('classId', '==', activeClassId));
      const unsubscribePets = onSnapshot(petsQuery, (querySnapshot) => {
        const fetchedPets: SpecialPet[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPets.push({ id: doc.id, ...doc.data() } as SpecialPet);
        });
        setSpecialPets(fetchedPets.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      });
      return () => unsubscribePets();
    }
  }, [activeClassId]);

  // LocalStorage Sync for Guests
  useEffect(() => {
    if (isGuest && view === 'app') {
      const savedStudents = localStorage.getItem('dojo_students');
      if (savedStudents) {
        try {
          setStudents(JSON.parse(savedStudents));
        } catch (e) {
          console.error('Failed to parse students', e);
        }
      }
      
      const savedPosts = localStorage.getItem('dojo_posts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      }
    }
  }, [isGuest, view]);

  // Persistence for Guests
  useEffect(() => {
    if (isGuest && view === 'app') {
      localStorage.setItem('dojo_students', JSON.stringify(students));
    }
  }, [students, isGuest, view]);

  useEffect(() => {
    if (isGuest && view === 'app') {
      localStorage.setItem('dojo_posts', JSON.stringify(posts));
    }
  }, [posts, isGuest, view]);

  useEffect(() => {
    if (isGuest && className) {
      localStorage.setItem('dojo_class_name', className);
    }
  }, [className, isGuest]);

  const playSound = (type: 'success' | 'error' | 'power') => {
    // Use more distinct sounds
    const successUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // High pitch ding
    const errorUrl = 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'; // Low pitch buzz/thud
    const powerUrl = 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3'; // Level up sound
    
    let url = successUrl;
    if (type === 'error') url = errorUrl;
    if (type === 'power') url = powerUrl;

    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handleStudentLogin = async (password: string) => {
    if (password.length !== 6) return;
    
    try {
      // Direct lookup using the new collection
      const passwordDocRef = doc(db, 'studentPasswords', password);
      const passwordDocSnap = await getDoc(passwordDocRef);

      if (passwordDocSnap.exists()) {
        const { classId, studentId } = passwordDocSnap.data();
        
        // Fetch the class to get student details
        const classRef = doc(db, 'classes', classId);
        const classSnap = await getDoc(classRef);
        
        if (classSnap.exists()) {
          const classData = classSnap.data();
          const student = (classData.students || []).find((s: any) => s.id === studentId);
          
          if (student) {
            setActiveClassId(classId);
            setLoggedInStudentId(studentId);
            setIsTeacher(false);
            setSelectedStudent(student);
            setStudentLoginPassword('');
            setIsToolboxOpen(false);
            playSound('success');
            setView('app');
            return;
          }
        }
      }
      
      playSound('error');
      alert(t.passwordErrorDetail);
    } catch (error) {
      console.error("Error during student login:", error);
      alert(t.loginErrorDetail);
    }
  };

  const handleStudentLogout = () => {
    setLoggedInStudentId(null);
    playSound('error');
  };

  const handleHomeworkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimension 800px
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress to jpeg with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setNewHomework({ ...newHomework, imageUrl: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setLoginError(null);
    setHasExited(false);
    setIsLoggingIn(true);
    
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to ensure users can switch accounts if they want
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError(t.popupBlocked);
      } else if (error.code === 'auth/cancelled-popup-request') {
        // This happens if multiple popups are requested, we can ignore it or show a subtle message
        console.warn('Multiple login requests detected, previous one cancelled.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoginError(t.popupClosed);
      } else {
        setLoginError(t.loginFailed);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleExit = async () => {
    if (view === 'app') {
      // If inside the app, just "Exit" to landing page without logging out
      setHasExited(true);
      setView('landing');
    } else {
      // If already on landing page, then perform a full logout
      console.log('Attempting to logout...');
      try {
        await signOut(auth);
        setIsGuest(false);
        setClassName('');
        setEditingClassId(null);
        setEditingClassName('');
        setStudents(INITIAL_STUDENTS);
        localStorage.removeItem('dojo_class_name');
        localStorage.removeItem('dojo_students');
        localStorage.removeItem('dojo_posts');
        setHasExited(false);
        setView('landing');
        console.log('Logout successful');
      } catch (error) {
        console.error('Logout failed', error);
      }
    }
  };

  const LanguageSwitcher = () => (
    <div className="relative">
      <button 
        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
        className="px-4 py-2 hover:bg-[#F1F3F5] rounded-xl transition-colors flex items-center gap-2 border border-[#E1E4E8] bg-white shadow-sm"
      >
        <Globe className="w-5 h-5 text-[#00B894]" />
        <span className="text-sm font-bold text-[#2D3436]">{t.language}</span>
      </button>
      
      <AnimatePresence>
        {isLangMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLangMenuOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#F1F3F5] overflow-hidden z-50"
            >
              <div className="p-2">
                <div className="px-4 py-2 text-[10px] font-black text-[#B2BEC3] uppercase tracking-widest flex items-center gap-2">
                  <Languages className="w-3 h-3" />
                  {t.language}
                </div>
                <button 
                  onClick={() => { setLanguage('zh-Hans'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${language === 'zh-Hans' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F1F3F5]'}`}
                >
                  华文（简体）
                </button>
                <button 
                  onClick={() => { setLanguage('zh-Hant'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${language === 'zh-Hant' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F1F3F5]'}`}
                >
                  華文（繁體）
                </button>
                <button 
                  onClick={() => { setLanguage('ms'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${language === 'ms' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F1F3F5]'}`}
                >
                  Bahasa Melayu
                </button>
                <button 
                  onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${language === 'en' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F1F3F5]'}`}
                >
                  English
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  const handleCreateClass = async () => {
    if (!className.trim()) return;

    if (user) {
      try {
        const newClassRef = doc(collection(db, 'classes'));
        await setDoc(newClassRef, {
          id: newClassRef.id,
          name: className,
          teacherId: user.uid,
          students: [],
          createdAt: new Date().toISOString()
        });
        setActiveClassId(newClassRef.id);
        setIsTeacher(true);
        setView('app');
      } catch (error) {
        console.error('Failed to create class in Firestore', error);
      }
    } else {
      setIsGuest(true);
      setView('app');
    }
  };

  const syncStudentsToFirestore = async (newStudents: Student[]) => {
    if (activeClassId && (isTeacher || loggedInStudentId)) {
      try {
        await updateDoc(doc(db, 'classes', activeClassId), {
          students: newStudents
        });
      } catch (error) {
        console.error('Failed to sync students', error);
      }
    }
  };

  const handleRenameClass = async (e: React.MouseEvent | React.FormEvent, classId: string) => {
    e.stopPropagation();
    if (!editingClassName.trim()) {
      setEditingClassId(null);
      return;
    }

    try {
      const classRef = doc(db, 'classes', classId);
      await updateDoc(classRef, { name: editingClassName.trim() });
      setEditingClassId(null);
      setEditingClassName('');
      playSound('success');
    } catch (error) {
      console.error('Failed to rename class', error);
      alert(t.renameFailed);
    }
  };

  const handleCreateSpecialPet = async () => {
    if (!newSpecialPet.name || !newSpecialPet.imageUrl) {
      alert('請填寫寵物名字和上傳照片');
      return;
    }
    
    if (newSpecialPet.price === undefined || newSpecialPet.power === undefined) {
      alert('請填寫價格和力量數量');
      return;
    }
    
    if (activeClassId) {
      try {
        const petRef = doc(collection(db, 'specialPets'));
        await setDoc(petRef, {
          name: newSpecialPet.name,
          price: Number(newSpecialPet.price),
          imageUrl: newSpecialPet.imageUrl,
          power: Number(newSpecialPet.power),
          id: petRef.id,
          classId: activeClassId,
          createdAt: serverTimestamp()
        });
        setIsAddingSpecialPet(false);
        setNewSpecialPet({ name: '', price: 0, imageUrl: '', power: 0 });
        playSound('success');
      } catch (e) {
        console.error("Error creating special pet:", e);
        alert('保存失敗，請檢查網絡連接');
      }
    } else {
      alert('無法找到班級 ID，請重新登入');
    }
  };

  const handleBuySpecialPet = async (pet: SpecialPet) => {
    if (!loggedInStudentId || !activeClassId) return;
    
    const student = students.find(s => s.id === loggedInStudentId);
    if (!student) return;
    
    if (student.coins < pet.price) {
      alert(t.notEnoughCoins);
      return;
    }
    
    if (student.ownedSpecialPets?.includes(pet.id)) {
      alert(t.alreadyOwned);
      return;
    }
    
    try {
      const classRef = doc(db, 'classes', activeClassId);
      const updatedStudents = students.map(s => {
        if (s.id === loggedInStudentId) {
          const ownedSpecialPets = [...(s.ownedSpecialPets || []), pet.id];
          return {
            ...s,
            coins: s.coins - pet.price,
            ownedSpecialPets,
            equippedSpecialPet: pet.id,
            equippedPet: null
          };
        }
        return s;
      });
      
      await updateDoc(classRef, { students: updatedStudents });
      playSound('power');
    } catch (e) {
      console.error("Error buying special pet:", e);
    }
  };

  const handleEquipSpecialPet = async (petId: string | null) => {
    if (!loggedInStudentId || !activeClassId) return;
    
    try {
      const classRef = doc(db, 'classes', activeClassId);
      const updatedStudents = students.map(s => {
        if (s.id === loggedInStudentId) {
          return {
            ...s,
            equippedSpecialPet: petId,
            equippedPet: petId ? null : s.equippedPet
          };
        }
        return s;
      });
      
      await updateDoc(classRef, { students: updatedStudents });
      playSound('success');
    } catch (e) {
      console.error("Error equipping special pet:", e);
    }
  };

  const handleSpecialPetImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setNewSpecialPet({ ...newSpecialPet, imageUrl: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);

    const newPost: Omit<StoryPost, 'id'> = {
      author: user?.displayName || '史密斯老師',
      content: newPostContent.trim(),
      imageUrl: `https://picsum.photos/seed/${Date.now()}/800/400`,
      timestamp: new Date().toISOString(),
      likes: 0,
      classId: user?.uid || 'guest'
    } as any;

    if (user) {
      try {
        const postRef = doc(collection(db, 'posts'));
        await setDoc(postRef, { ...newPost, id: postRef.id });
        setNewPostContent('');
      } catch (error) {
        console.error('Failed to create post in Firestore', error);
      }
    } else {
      const postWithId = { ...newPost, id: Date.now().toString() } as StoryPost;
      setPosts(prev => [postWithId, ...prev]);
      setNewPostContent('');
    }
    setIsPosting(false);
  };

  const handleLikePost = async (postId: string) => {
    if (user) {
      try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          await updateDoc(postRef, {
            likes: (postSnap.data().likes || 0) + 1
          });
        }
      } catch (error) {
        console.error('Failed to like post', error);
      }
    } else {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00B894]"></div>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col p-4 relative overflow-hidden">
        {/* Top Right Buttons */}
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button 
            onClick={user ? handleExit : handleGoogleLogin}
            disabled={isLoggingIn}
            className={`flex items-center gap-2 bg-white px-6 py-3 rounded-2xl font-bold text-[#2D3436] shadow-sm hover:shadow-md transition-all border border-[#E1E4E8] active:scale-95 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoggingIn ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#00B894]"></div>
            ) : user ? (
              <>
                <LogOut className="w-4 h-4 text-[#D63031]" />
                <span>{t.logout}</span>
              </>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                <span>{t.login}</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {loginError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 right-8 z-20 bg-[#D63031] text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-bold flex items-center gap-2 max-w-xs"
          >
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">!</div>
            {loginError}
            <button onClick={() => setLoginError(null)} className="ml-auto hover:opacity-70">✕</button>
          </motion.div>
        )}

        {/* Student Login Section - Prominent at the top */}
        <div className="max-w-md w-full mx-auto z-20 mt-12 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white rounded-[40px] border-4 border-[#00B894] shadow-2xl shadow-[#00B894]/10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#00B894]/10 rounded-2xl flex items-center justify-center">
                <Lock className="text-[#00B894] w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2D3436]">{t.loginAsStudent}</h2>
                <p className="text-xs text-[#636E72] font-bold uppercase tracking-widest">{t.enterPassword}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="password"
                  maxLength={6}
                  value={studentLoginPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setStudentLoginPassword(val);
                  }}
                  placeholder={t.passwordPlaceholder}
                  className="w-full bg-[#F8F9FA] border-2 border-[#E1E4E8] rounded-2xl px-6 py-5 font-black text-center tracking-[0.8em] outline-none focus:border-[#00B894] transition-all text-2xl"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#B2BEC3] pointer-events-none">
                  <LogIn className="w-full h-full" />
                </div>
              </div>
              <button
                onClick={() => handleStudentLogin(studentLoginPassword)}
                disabled={studentLoginPassword.length !== 6}
                className="bg-[#0984E3] text-white px-8 rounded-2xl font-black text-xl hover:bg-[#0773C5] transition-all shadow-lg shadow-[#0984E3]/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {t.enter}
              </button>
            </div>
          </motion.div>
        </div>

        {user ? (
          <div className="max-w-5xl w-full mx-auto z-10">
            <h2 className="text-2xl font-black text-[#2D3436] mb-8">{t.myClasses}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* My Own Classes */}
              {myClasses.map((cls) => (
                <motion.div 
                  key={cls.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    setActiveClassId(cls.id);
                    setIsTeacher(true);
                    setHasExited(false);
                    setView('app');
                  }}
                  className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative border-2 border-[#00B894]/20"
                >
                  <div className="absolute top-6 right-6 flex gap-2">
                    {isTeacher && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingClassId(cls.id);
                          setEditingClassName(cls.name);
                        }}
                        className="p-2 bg-[#F1F3F5] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E1E4E8] text-[#636E72]"
                        title={t.rename}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <Crown className="w-5 h-5 text-[#F1C40F]" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#00B894]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Globe className="w-10 h-10 text-[#00B894]" />
                    </div>
                    {editingClassId === cls.id ? (
                      <div className="flex flex-col gap-2 w-full" onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          type="text"
                          value={editingClassName}
                          onChange={(e) => setEditingClassName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameClass(e, cls.id);
                            if (e.key === 'Escape') setEditingClassId(null);
                          }}
                          className="w-full bg-[#F1F3F5] border-2 border-[#00B894] rounded-xl px-3 py-2 text-sm font-bold text-center outline-none"
                        />
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={(e) => handleRenameClass(e, cls.id)}
                              className="bg-[#00B894] text-white px-3 py-1 rounded-lg text-xs font-black"
                            >
                              {t.save}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingClassId(null); }}
                              className="bg-[#DFE6E9] text-[#636E72] px-3 py-1 rounded-lg text-xs font-black"
                            >
                              {t.cancel}
                            </button>
                          </div>
                      </div>
                    ) : (
                      <h3 className="text-lg font-black text-[#2D3436] mb-2">{cls.name}</h3>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Add New Class Button - Always visible for teachers */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setHasExited(false);
                  setView('createClass');
                }}
                className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer group border-2 border-dashed border-[#DFE6E9] hover:border-[#00B894] flex flex-col items-center justify-center min-h-[240px]"
              >
                <div className="w-16 h-16 bg-[#6C5CE7] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-[#6C5CE7]/20">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <span className="font-black text-[#6C5CE7] text-lg">{t.newClass}</span>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center z-10 mx-auto my-auto"
          >
            <div className="w-24 h-24 bg-[#00B894] rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#00B894]/20 rotate-3">
              <Users className="text-white w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-[#2D3436] mb-4 tracking-tight">{t.myClasses}</h1>
            <p className="text-[#636E72] mb-12 font-medium text-lg">{t.tagline}</p>
            
            <div className="space-y-6">
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#D63031]/10 text-[#D63031] p-4 rounded-2xl text-sm font-bold border border-[#D63031]/20"
                >
                  {loginError}
                </motion.div>
              )}
              <button 
                onClick={() => {
                  setHasExited(false);
                  setIsGuest(true);
                  setView('createClass');
                }}
                className="w-full bg-[#00B894] text-white py-6 rounded-[32px] font-black text-xl hover:bg-[#00A383] hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#00B894]/40"
              >
                {t.start}
              </button>
              
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-[#B2BEC3] font-bold uppercase tracking-widest">{t.guestMode}</p>
                <p className="text-[10px] text-[#B2BEC3] font-medium max-w-[200px]">{t.guestWarning}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#00B894]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#F1C40F]/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    );
  }

  if (view === 'createClass') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl shadow-[#00B894]/10"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#00B894]/10 rounded-2xl flex items-center justify-center">
              <Plus className="text-[#00B894] w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-[#2D3436]">{t.createYourClass}</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-[#636E72] uppercase tracking-widest mb-2 block px-1">{t.classNameLabel}</label>
              <input 
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder={t.classNamePlaceholder}
                className="w-full bg-[#F1F3F5] border-2 border-transparent rounded-2xl px-6 py-4 text-xl font-bold outline-none focus:border-[#00B894] transition-all"
              />
            </div>
            
            <button 
              disabled={!className.trim()}
              onClick={handleCreateClass}
              className="w-full bg-[#00B894] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#00A383] disabled:bg-[#DFE6E9] disabled:text-[#B2BEC3] disabled:cursor-not-allowed transition-all shadow-lg shadow-[#00B894]/30"
            >
              {t.startManagingClass}
            </button>
            
            <button 
              onClick={() => setView('landing')}
              className="w-full text-[#636E72] font-bold text-sm hover:text-[#2D3436] transition-colors"
            >
              {t.backStep}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleUpdateAvatar = (studentId: string, avatarUrl: string) => {
    const newStudents = students.map(s => {
      if (s.id === studentId) {
        return { ...s, avatar: avatarUrl };
      }
      return s;
    });
    setStudents(newStudents);
    syncStudentsToFirestore(newStudents);
    playSound('success');
    setPowerModalStudent(null);
  };

  const handleSelectPet = (studentId: string, petId: number) => {
    const pet = PETS.find(p => p.id === petId);
    
    const newStudents = students.map(s => {
      if (s.id === studentId) {
        // If petId is 0, explicitly unequip
        if (petId === 0) {
          return { ...s, equippedPet: null };
        }

        // If selecting the same pet that's already equipped, unequip it (toggle)
        if (s.equippedPet === petId) {
          return { ...s, equippedPet: null };
        }
        
        const isOwned = (s.ownedPets || []).includes(petId);
        
        if (isOwned) {
          return { ...s, equippedPet: petId, equippedSpecialPet: null };
        } else if (pet && (s.coins || 0) >= pet.price) {
          // Purchase new pet
          return { 
            ...s, 
            coins: s.coins - pet.price,
            ownedPets: [...(s.ownedPets || []), petId],
            equippedPet: petId, // Auto-equip on purchase
            equippedSpecialPet: null
          };
        }
        return s;
      }
      return s;
    });

    setStudents(newStudents);
    syncStudentsToFirestore(newStudents);
    
    // Play sound and close modal logic
    const student = students.find(s => s.id === studentId);
    if (student) {
      const isOwned = (student.ownedPets || []).includes(petId);
      const canAfford = pet && (student.coins || 0) >= pet.price;
      
      if (petId === 0 || isOwned || canAfford) {
        playSound('power');
        setPowerModalStudent(null);
      } else {
        playSound('error');
      }
    }
  };

  const handleOpenChest = (chestLevel: number) => {
    const chest = CHESTS.find(c => c.level === chestLevel);
    if (!chest || !loggedInStudentId) return;

    const student = students.find(s => s.id === loggedInStudentId);
    if (!student || (student.medals || 0) < chest.cost) {
      alert(TRANSLATIONS[language].notEnoughMedals);
      return;
    }

    // Determine reward based on weights
    const totalWeight = chest.rewards.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedReward = chest.rewards[0];

    for (const reward of chest.rewards) {
      if (random < reward.weight) {
        selectedReward = reward;
        break;
      }
      random -= reward.weight;
    }

    // Update student
    const newStudents = students.map(s => {
      if (s.id === loggedInStudentId) {
        const updatedOwnedPets = selectedReward.type === 'pet' && selectedReward.petId 
          ? Array.from(new Set([...(s.ownedPets || []), selectedReward.petId]))
          : s.ownedPets;

        return {
          ...s,
          medals: s.medals - chest.cost,
          coins: (s.coins || 0) + (selectedReward.type === 'coins' ? (selectedReward.amount || 0) : 0),
          ownedPets: updatedOwnedPets
        };
      }
      return s;
    });

    setStudents(newStudents);
    syncStudentsToFirestore(newStudents);
    
    if (selectedReward.type === 'pet') {
      setChestReward({ petId: selectedReward.petId, level: chestLevel });
    } else {
      setChestReward({ amount: selectedReward.amount, level: chestLevel });
    }
    playSound('power');
  };

  const startBossBattle = (difficulty: 'simple' | 'medium' | 'hard' | 'demon') => {
    const hpMap = {
      simple: 3500,
      medium: 5000,
      hard: 8800,
      demon: 12500
    };
    setBossDifficulty(difficulty);
    setBossHp(hpMap[difficulty]);
    setMaxBossHp(hpMap[difficulty]);
    setDamageDealt({});
    setIsBossDefeated(false);
    playSound('power');
  };

  const handleAttackBoss = (student: Student) => {
    if (isBossDefeated || bossHp <= 0) return;

    const power = getPetPower(student);
    if (power <= 0) {
      playSound('error');
      return;
    }

    const newHp = Math.max(0, bossHp - power);
    setBossHp(newHp);
    
    const currentDamage = (damageDealt[student.id] || 0) + power;
    const updatedDamageDealt = {
      ...damageDealt,
      [student.id]: currentDamage
    };
    
    setDamageDealt(updatedDamageDealt);

    playSound('success');

    if (newHp === 0) {
      setIsBossDefeated(true);
      distributeBossRewards(updatedDamageDealt);
    }
  };

  const distributeBossRewards = async (finalDamage: Record<string, number>) => {
    // Sort students by damage
    const sortedDamage = Object.entries(finalDamage)
      .sort((a, b) => (b[1] as number) - (a[1] as number));

    const newStudents = students.map(s => {
      const rankIndex = sortedDamage.findIndex(([id]) => id === s.id);
      
      let medalReward = 0;
      let coinReward = 0;

      if (rankIndex === 0) medalReward = 3;
      else if (rankIndex === 1) medalReward = 2;
      else if (rankIndex === 2) medalReward = 1;
      else if (finalDamage[s.id] > 0) coinReward = 50;

      if (medalReward > 0 || coinReward > 0) {
        return {
          ...s,
          medals: (s.medals || 0) + medalReward,
          coins: (s.coins || 0) + coinReward
        };
      }
      return s;
    });

    setStudents(newStudents);
    await syncStudentsToFirestore(newStudents);
    playSound('power');
  };

  const getPetEmoji = (petId: number | null | undefined) => {
    if (petId === null || petId === undefined) return null;
    return PETS.find(p => p.id === petId)?.emoji || null;
  };

  const getPetPower = (student: Student) => {
    let power = 0;
    if (student.ownedPets) {
      power += student.ownedPets.reduce((total, petId) => {
        const pet = PETS.find(p => p.id === petId);
        return total + (pet?.power || 0);
      }, 0);
    }
    if (student.ownedSpecialPets) {
      power += student.ownedSpecialPets.reduce((total, petId) => {
        const pet = specialPets.find(p => p.id === petId);
        return total + (pet?.power || 0);
      }, 0);
    }
    return power;
  };

  const handleAwardPoints = (skill: Skill) => {
    if (selectedStudent) {
      const newStudents = students.map(s => {
        if (s.id === selectedStudent.id) {
          const newPoints = Math.max(0, s.points + skill.points);
          const newStage = Math.floor(newPoints / 30);
          const currentMaxStage = s.maxLevelReached || 0;
          
          // If stage increased beyond the highest stage ever reached, add bonus coins
          let bonusCoins = 0;
          let newMaxStage = currentMaxStage;
          
          if (newStage > currentMaxStage) {
            bonusCoins = (newStage - currentMaxStage) * 30; // Increased bonus for harder stages
            newMaxStage = newStage;
          }

          return { 
            ...s, 
            points: newPoints,
            coins: (s.coins || 0) + bonusCoins,
            maxLevelReached: newMaxStage
          };
        }
        return s;
      });

      setStudents(newStudents);
      syncStudentsToFirestore(newStudents);
      
      // Play sound based on points
      playSound(skill.points > 0 ? 'success' : 'error');
      
      setSelectedStudent(null);
      setModalTab('positive');
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: newStudentName.trim(),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${newStudentName.trim()}`,
        points: 0,
        ownedPets: [],
        equippedPet: null,
        coins: 0,
        medals: 0,
        maxLevelReached: 0
      };
      const newStudents = [...students, newStudent];
      setStudents(newStudents);
      syncStudentsToFirestore(newStudents);
      setNewStudentName('');
      setIsAddingStudent(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditStudentName(student.name);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentName.trim()) return;

    const updatedStudents = students.map(s => 
      s.id === editingStudent.id ? { ...s, name: editStudentName.trim() } : s
    );
    
    setStudents(updatedStudents);
    await syncStudentsToFirestore(updatedStudents);
    setEditingStudent(null);
  };

  const handleSetStudentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalStudent || tempStudentPassword.length !== 6) return;

    try {
      // Check for uniqueness using the new collection
      const passwordDocRef = doc(db, 'studentPasswords', tempStudentPassword);
      const passwordDocSnap = await getDoc(passwordDocRef);
      
      if (passwordDocSnap.exists()) {
        const data = passwordDocSnap.data();
        // If it's not the same student, it's taken
        if (data.studentId !== passwordModalStudent.id || data.classId !== activeClassId) {
          alert('此密碼已經有人使用過了！請更換一個。');
          playSound('error');
          return;
        }
      }

      // If student had an old password, delete it
      if (passwordModalStudent.password && passwordModalStudent.password !== tempStudentPassword) {
        try {
          await deleteDoc(doc(db, 'studentPasswords', passwordModalStudent.password));
        } catch (e) {
          console.error("Failed to delete old password mapping", e);
        }
      }

      // Save new mapping
      await setDoc(passwordDocRef, {
        classId: activeClassId,
        studentId: passwordModalStudent.id
      });

      const updatedStudents = students.map(s => 
        s.id === passwordModalStudent.id ? { ...s, password: tempStudentPassword } : s
      );
      
      setStudents(updatedStudents);
      await syncStudentsToFirestore(updatedStudents);
      setIsStudentPasswordModalOpen(false);
      setPasswordModalStudent(null);
      setTempStudentPassword('');
      playSound('success');
    } catch (error) {
      console.error("Error setting student password:", error);
      alert("設定密碼時出錯，請稍後再試。");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm(t.confirmDeleteStudent)) return;

    const student = students.find(s => s.id === studentId);
    if (student?.password) {
      try {
        await deleteDoc(doc(db, 'studentPasswords', student.password));
      } catch (e) {
        console.error("Failed to delete student password mapping", e);
      }
    }

    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    await syncStudentsToFirestore(updatedStudents);
    setEditingStudent(null);
  };

  const handleUpdateCoins = (studentId: string, amount: number) => {
    const newStudents = students.map(s => {
      if (s.id === studentId) {
        return { ...s, coins: Math.max(0, (s.coins || 0) + amount) };
      }
      return s;
    });
    setStudents(newStudents);
    syncStudentsToFirestore(newStudents);
    playSound('success');
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setModalTab('positive');
  };

  const totalPoints = students.reduce((acc, s) => acc + s.points, 0);
  const averagePoints = students.length ? (totalPoints / students.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#2D3436] pb-20 sm:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-[#E1E4E8] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#00B894] rounded-xl flex items-center justify-center shadow-lg shadow-[#00B894]/20">
                <Users className="text-white w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight">{className || t.myClasses}</h1>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsToolboxOpen(!isToolboxOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                isToolboxOpen 
                  ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' 
                  : 'bg-white text-[#2D3436] border border-[#E1E4E8] hover:bg-[#F8F9FA]'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="hidden sm:inline">{t.toolbox}</span>
            </button>

            <AnimatePresence>
              {isToolboxOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsToolboxOpen(false)} 
                  />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto w-64 bg-white rounded-2xl shadow-xl border border-[#E1E4E8] py-2 z-50 overflow-hidden"
                    >
                      {/* Login/Profile Section */}
                      <div className="px-2 mb-2">
                        {!isTeacher && !loggedInStudentId && (
                          <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E1E4E8]">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <input 
                                  type="password"
                                  maxLength={6}
                                  value={studentLoginPassword}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setStudentLoginPassword(val);
                                  }}
                                  placeholder={t.passwordPlaceholder}
                                  className="w-full bg-white border border-[#E1E4E8] rounded-lg px-2 py-1.5 text-sm font-bold text-center tracking-widest outline-none focus:border-[#6C5CE7]"
                                />
                              </div>
                              <button
                                onClick={() => handleStudentLogin(studentLoginPassword)}
                                disabled={studentLoginPassword.length !== 6}
                                className="bg-[#0984E3] text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-[#0773C5] disabled:opacity-50"
                              >
                                {t.login}
                              </button>
                            </div>
                          </div>
                        )}

                        {loggedInStudentId && (
                          <div className="p-3 bg-[#00B894]/5 rounded-xl border border-[#00B894]/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img 
                                src={students.find(s => s.id === loggedInStudentId)?.avatar} 
                                className="w-8 h-8 rounded-lg bg-white shadow-sm" 
                                alt="" 
                              />
                              <span className="text-sm font-bold text-[#2D3436]">
                                {students.find(s => s.id === loggedInStudentId)?.name}
                              </span>
                            </div>
                            <button 
                              onClick={handleStudentLogout}
                              className="p-1.5 hover:bg-[#D63031]/10 rounded-lg text-[#D63031]"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-[#E1E4E8] mx-2 mb-2" />

                      <button 
                        onClick={() => { setActiveTab('classroom'); setIsToolboxOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                          activeTab === 'classroom' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F8F9FA]'
                        }`}
                      >
                        <Users className="w-4 h-4" />
                        {t.classroom}
                      </button>
                      
                      {(!loggedInStudentId || isTeacher) && (
                        <>
                          <button 
                            onClick={() => { setActiveTab('story'); setIsToolboxOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                              activeTab === 'story' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F8F9FA]'
                            }`}
                          >
                            <BookOpen className="w-4 h-4" />
                            {t.story}
                          </button>
                          <button 
                            onClick={() => { setActiveTab('reports'); setIsToolboxOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                              activeTab === 'reports' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F8F9FA]'
                            }`}
                          >
                            <Award className="w-4 h-4" />
                            {t.reports}
                          </button>
                          <button 
                            onClick={() => { setActiveTab('leaderboard'); setIsToolboxOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                              activeTab === 'leaderboard' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F8F9FA]'
                            }`}
                          >
                            <Trophy className="w-4 h-4" />
                            {t.leaderboard}
                          </button>
                        </>
                      )}

                      <button 
                        onClick={() => { setIsSpecialPetModalOpen(true); setIsToolboxOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#636E72] hover:bg-[#F8F9FA] transition-colors"
                      >
                        <Heart className="w-4 h-4 text-[#F368E0]" />
                        {t.specialPet}
                      </button>

                      {isTeacher && !loggedInStudentId && (
                        <button 
                          onClick={() => { setActiveTab('boss'); setIsToolboxOpen(false); }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${
                            activeTab === 'boss' ? 'bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'text-[#636E72] hover:bg-[#F8F9FA]'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          {t.bossBattle}
                        </button>
                      )}

                      <div className="h-px bg-[#E1E4E8] mx-2 my-2" />

                      {(!loggedInStudentId || isTeacher) && (
                        <button 
                          onClick={() => {
                            setIsTimerModalOpen(true);
                            setIsToolboxOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#636E72] hover:bg-[#F8F9FA]"
                        >
                          <Clock className="w-4 h-4 text-[#00B894]" />
                          {t.countdown}
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setIsHomeworkModalOpen(true);
                          setIsToolboxOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#636E72] hover:bg-[#F8F9FA]"
                      >
                        <BookOpen className="w-4 h-4 text-[#6C5CE7]" />
                        {t.homework}
                      </button>
                    </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            {loggedInStudentId && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#E1E4E8] shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#F39C12] fill-current" />
                  <span className="font-black text-[#F39C12] text-sm">
                    {students.find(s => s.id === loggedInStudentId)?.coins || 0}
                  </span>
                </div>
                <div className="w-px h-4 bg-[#E1E4E8]" />
                <button 
                  onClick={() => setIsChestModalOpen(true)}
                  className="flex items-center gap-1.5 hover:scale-105 transition-transform"
                  title={t.medals}
                >
                  <Medal className="w-4 h-4 text-[#6C5CE7] fill-current" />
                  <span className="font-black text-[#6C5CE7] text-sm">
                    {students.find(s => s.id === loggedInStudentId)?.medals || 0}
                  </span>
                </button>
              </div>
            )}
            <LanguageSwitcher />
            <div className="hidden md:block text-right">
              {loggedInStudentId ? (
                <>
                  <p className="text-sm font-bold">{students.find(s => s.id === loggedInStudentId)?.name || t.students}</p>
                  <p className="text-xs text-[#636E72]">{t.studentStatus}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold">{user ? user.displayName : t.teacherName}</p>
                  <p className="text-xs text-[#636E72]">{user ? t.verifiedTeacher : t.guestTeacher}</p>
                </>
              )}
            </div>
            {(!loggedInStudentId || isTeacher) && (
              <button 
                onClick={handleExit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DFE6E9] hover:bg-[#D63031]/10 group transition-colors"
                title={t.exitTooltip}
              >
                <LogOut className="w-5 h-5 text-[#636E72] group-hover:text-[#D63031]" />
                <span className="font-bold text-[#636E72] group-hover:text-[#D63031] hidden sm:inline">{t.exit}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'classroom' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
          >
            {/* Class Summary Bar (Teacher only) */}
            {isTeacher && !loggedInStudentId && students.length > 0 && (
              <div className="col-span-full bg-white/80 backdrop-blur-md rounded-[2rem] p-4 border border-[#E1E4E8] flex flex-wrap items-center justify-center gap-6 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F1C40F]/10 rounded-lg flex items-center justify-center">
                    <Coins className="w-4 h-4 text-[#F39C12] fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">{t.totalClassCoins}</p>
                    <p className="text-sm font-black text-[#F39C12]">{students.reduce((acc, s) => acc + (s.coins || 0), 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#00B894]/10 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-[#00B894] fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">{t.totalClassExp}</p>
                    <p className="text-sm font-black text-[#00B894]">{students.reduce((acc, s) => acc + (s.exp || 0), 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#6C5CE7]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#6C5CE7]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">{t.totalStudents}</p>
                    <p className="text-sm font-black text-[#6C5CE7]">{students.length}</p>
                  </div>
                </div>
              </div>
            )}
            {/* Add Student Card - Square */}
            {isTeacher && !loggedInStudentId && (
              <button 
                onClick={() => setIsAddingStudent(true)}
                className="aspect-square bg-white border-2 border-dashed border-[#DFE6E9] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#00B894] hover:bg-[#F0FFF4] transition-all group shadow-sm"
              >
                <div className="w-10 h-10 bg-[#F1F3F5] rounded-xl flex items-center justify-center group-hover:bg-[#00B894] transition-colors">
                  <Plus className="w-5 h-5 text-[#636E72] group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black text-[#636E72] group-hover:text-[#00B894] text-center px-1">{t.addStudentBtn}</span>
              </button>
            )}

            {/* Student Password Button */}
            {isTeacher && !loggedInStudentId && (
              <button 
                onClick={() => setIsStudentPasswordModalOpen(true)}
                className="aspect-square bg-white border-2 border-dashed border-[#DFE6E9] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#6C5CE7] hover:bg-[#F5F3FF] transition-all group shadow-sm"
              >
                <div className="w-10 h-10 bg-[#F1F3F5] rounded-xl flex items-center justify-center group-hover:bg-[#6C5CE7] transition-colors">
                  <Lock className="w-5 h-5 text-[#636E72] group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black text-[#636E72] group-hover:text-[#6C5CE7] text-center px-1">{t.studentPassword}</span>
              </button>
            )}

            {students.map((student) => {
              const stage = Math.floor(student.points / 30);
              const isSelf = loggedInStudentId === student.id;
              const canClick = loggedInStudentId ? isSelf : isTeacher;
              
              let borderColor = 'border-[#E1E4E8]';
              let hoverBorderColor = 'hover:border-[#00B894]/30';
              
              if (stage >= 1 && stage <= 20) {
                borderColor = 'border-[#74b9ff]'; // Blue
                hoverBorderColor = 'hover:border-[#0984e3]';
              } else if (stage >= 21 && stage <= 30) {
                borderColor = 'border-[#ffeaa7]'; // Yellow
                hoverBorderColor = 'hover:border-[#d6a01e]';
              } else if (stage >= 31 && stage <= 40) {
                borderColor = 'border-[#a29bfe]'; // Purple
                hoverBorderColor = 'hover:border-[#6c5ce7]';
              } else if (stage > 40) {
                borderColor = 'border-[#fab1a0]'; // Red/Orange for higher levels
                hoverBorderColor = 'hover:border-[#e17055]';
              }

              return (
                <motion.div
                  key={student.id}
                  layoutId={student.id}
                  whileHover={canClick ? { y: -5 } : {}}
                  onClick={() => {
                    if (canClick) {
                      if (isTeacher) {
                        setSelectedStudent(student);
                      } else if (isSelf) {
                        // Students can view their own profile but not award points
                        setSelectedStudent(student);
                      }
                    } else if (loggedInStudentId) {
                      // Show feedback that they can't click others
                      alert(t.onlyOwnProfile);
                    }
                  }}
                  className={`bg-white rounded-3xl p-3 shadow-sm border-2 ${borderColor} flex flex-col items-center gap-2 relative overflow-hidden group transition-all hover:shadow-xl ${hoverBorderColor} ${!canClick ? 'opacity-60 grayscale-[0.5]' : 'cursor-pointer'}`}
                >
                {/* Edit Button */}
                {isTeacher && !loggedInStudentId && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStudent(student);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-[#F1F3F5] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E1E4E8] z-10"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#636E72]" />
                  </button>
                )}

                {/* Avatar Area - Rounded Square Box */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!(isTeacher && !loggedInStudentId) && !isSelf) return;
                    setPowerModalMode('avatar');
                    setPowerModalStudent(student);
                  }}
                  className={`w-full aspect-square bg-[#F1F3F5] rounded-2xl flex items-center justify-center overflow-hidden relative ${((isTeacher && !loggedInStudentId) || isSelf) ? 'cursor-pointer group/avatar' : ''}`}
                >
                  {student.equippedSpecialPet ? (
                    <img 
                      src={specialPets.find(p => p.id === student.equippedSpecialPet)?.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : student.equippedPet !== null ? (
                    <span className="text-5xl animate-bounce-slow">
                      {getPetEmoji(student.equippedPet)}
                    </span>
                  ) : (
                    <img 
                      src={student.avatar} 
                      alt={student.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {((isTeacher && !loggedInStudentId) || isSelf) && (
                    <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/5 transition-colors flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                  )}

                  {/* Medal Badge */}
                  {(student.medals || 0) > 0 && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-xl shadow-md border border-[#6C5CE7]/20 flex items-center gap-1 z-10 transition-all duration-500">
                      <Medal className="w-3.5 h-3.5 text-[#6C5CE7] fill-current" />
                      <span className="text-xs font-black text-[#6C5CE7]">{student.medals}</span>
                    </div>
                  )}
                </div>
                
                <div className="text-center w-full">
                  <h3 className="font-black text-sm text-[#2D3436] uppercase tracking-wider truncate px-1">{student.name}</h3>
                </div>
                
                {/* Info Stack */}
                <div className="w-full space-y-1.5">
                  {/* Points Pill - Moved Above Level */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTeacher) {
                        setSelectedStudent(student);
                      } else if (isSelf) {
                        setSelectedStudent(student);
                      }
                    }}
                    className="w-full py-1 rounded-xl bg-[#F1F3F5] border border-[#E1E4E8]/50 flex items-center justify-center gap-1.5 hover:bg-[#E1E4E8] transition-colors"
                  >
                    <Star className="w-3 h-3 text-[#F1C40F] fill-current" />
                    <span className="text-[9px] font-black text-[#636E72]">
                      {student.points} {t.pointsUnit}
                    </span>
                  </button>

                  {/* Stage Pill */}
                  <div className="w-full py-1 rounded-xl bg-[#F1F3F5] flex items-center justify-center gap-1.5 border border-[#E1E4E8]/50">
                    <Award className="w-3 h-3 text-[#0984E3] fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#636E72]">
                      {t.stage} {Math.floor((student.points || 0) / 30)}
                    </span>
                  </div>

                  {/* Power Pill */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!(isTeacher && !loggedInStudentId) && !isSelf) return;
                      setPowerModalMode('pet');
                      setPowerModalStudent(student);
                    }}
                    className={`w-full py-1 rounded-xl bg-[#F1F3F5] flex items-center justify-center gap-1.5 border border-[#E1E4E8]/50 transition-colors ${((isTeacher && !loggedInStudentId) || isSelf) ? 'hover:bg-[#E1E4E8]' : ''}`}
                  >
                    <Zap className="w-3 h-3 text-[#6C5CE7] fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#636E72]">
                      {t.power}: {getPetPower(student)}
                    </span>
                  </button>

                  {/* Coins Pill - Restored */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isTeacher) return;
                      setCoinsModalStudent(student);
                    }}
                    className="w-full py-1 rounded-xl bg-[#F1F3F5] border border-[#E1E4E8]/50 flex items-center justify-center gap-1.5 hover:bg-[#E1E4E8] transition-colors"
                  >
                    <Coins className="w-3 h-3 text-[#F39C12] fill-current" />
                    <span className="text-[9px] font-black text-[#636E72]">
                      {student.coins || 0} {t.coins}
                    </span>
                  </button>
                </div>

                {/* Progress Bar (Experience) */}
                <div className="w-full px-2 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-[#B2BEC3] uppercase tracking-wider">{t.exp}: {(student.points || 0) * 10}</span>
                    <span className="text-[9px] font-black text-[#00B894] bg-[#00B894]/10 px-1.5 rounded-md">
                      {t.stage} {Math.floor((student.points || 0) / 30)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden border border-[#E1E4E8]/30">
                    <div 
                      className="h-full bg-[#00B894] transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,184,148,0.4)]" 
                      style={{ width: `${(((student.points || 0) % 30) / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'story' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            {/* Create Post */}
            {isTeacher && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E1E4E8]">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#DFE6E9] flex-shrink-0" />
                  <div className="flex-1">
                    <textarea 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={t.postPlaceholder}
                      className="w-full border-none focus:ring-0 text-lg resize-none h-24 placeholder-[#B2BEC3]"
                    />
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F1F3F5]">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors text-[#00B894] flex items-center gap-2 font-semibold text-sm">
                          <Camera className="w-5 h-5" />
                          {t.photo}
                        </button>
                        <button className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors text-[#0984E3] flex items-center gap-2 font-semibold text-sm">
                          <BookOpen className="w-5 h-5" />
                          {t.file}
                        </button>
                      </div>
                      <button 
                        onClick={handleCreatePost}
                        disabled={isPosting || !newPostContent.trim()}
                        className="bg-[#00B894] text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-[#00B894]/20 hover:bg-[#00A383] transition-colors disabled:opacity-50"
                      >
                        {isPosting ? t.posting : t.post}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E1E4E8]">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#DFE6E9]" />
                    <div>
                      <p className="font-bold">{post.author}</p>
                      <p className="text-xs text-[#636E72]">{post.timestamp}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-[#F1F3F5] rounded-full">
                    <MoreHorizontal className="w-5 h-5 text-[#636E72]" />
                  </button>
                </div>
                <div className="px-6 pb-4">
                  <p className="text-[#2D3436] leading-relaxed">{post.content}</p>
                </div>
                {post.imageUrl && (
                  <div className="flex justify-center bg-black/5 relative group">
                    <img 
                      src={post.imageUrl} 
                      alt="Post content" 
                      className="max-w-full max-h-[500px] h-auto object-contain cursor-zoom-in"
                      referrerPolicy="no-referrer"
                      onClick={() => {
                        setViewingImageUrl(post.imageUrl!);
                        setImageZoom(1);
                      }}
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-4 bg-[#FAFAFA] flex items-center gap-6">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#636E72] hover:text-[#D63031] transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    {post.likes} {t.likes}
                  </button>
                  <button className="flex items-center gap-2 text-sm font-semibold text-[#636E72] hover:text-[#00B894] transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {t.comments}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
              <div className="p-8 bg-[#6C5CE7] text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md relative z-10">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black relative z-10">
                  {leaderboardTab === 'exp' ? t.expLeaderboard : t.powerLeaderboard}
                </h2>
                <p className="text-white/70 text-sm font-bold mt-1 relative z-10">
                  {leaderboardTab === 'exp' ? t.expStarTagline : t.powerStarTagline}
                </p>

                {/* Tab Switcher */}
                <div className="flex gap-2 mt-6 p-1 bg-black/10 backdrop-blur-sm rounded-2xl relative z-10 max-w-xs mx-auto">
                  <button
                    onClick={() => setLeaderboardTab('exp')}
                    className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${
                      leaderboardTab === 'exp' 
                        ? 'bg-white text-[#6C5CE7] shadow-lg' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t.expLeaderboard}
                  </button>
                  <button
                    onClick={() => setLeaderboardTab('power')}
                    className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${
                      leaderboardTab === 'power' 
                        ? 'bg-white text-[#6C5CE7] shadow-lg' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {t.powerLeaderboard}
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-8">
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {[...students]
                    .map(s => ({ ...s, power: getPetPower(s) }))
                    .sort((a, b) => {
                      if (leaderboardTab === 'exp') {
                        return (b.points || 0) - (a.points || 0);
                      }
                      return b.power - a.power || (b.points || 0) - (a.points || 0);
                    })
                    .map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${
                          index === 0 ? 'bg-[#F1C40F]/10 border-2 border-[#F1C40F]/20' : 'bg-[#F8F9FA]'
                        }`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center font-black text-lg text-[#636E72]">
                          {index === 0 ? (
                            <Crown className="w-6 h-6 text-[#F1C40F] fill-current" />
                          ) : (
                            `${t.rankPrefix}${index + 1}${t.rankSuffix}`
                          )}
                        </div>
                        
                        <div className="relative w-12 h-12 rounded-2xl bg-[#F1F3F5] flex items-center justify-center overflow-hidden shadow-sm">
                          {student.equippedSpecialPet ? (
                            <img src={specialPets.find(p => p.id === student.equippedSpecialPet)?.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : student.equippedPet !== null ? (
                            <span className="text-2xl">
                              {getPetEmoji(student.equippedPet)}
                            </span>
                          ) : (
                            <img 
                              src={student.avatar} 
                              alt={student.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-[#2D3436]">{student.name}</h3>
                          <div className="flex gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] font-black text-[#F39C12] uppercase tracking-wider">
                              <Coins className="w-3 h-3 fill-current" />
                              {student.coins || 0}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-[#00B894] uppercase tracking-wider">
                              <Star className="w-3 h-3 fill-current" />
                              {(student.points || 0) * 10} {t.exp}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-[#6C5CE7] uppercase tracking-wider">
                              <Medal className="w-3 h-3 fill-current" />
                              {student.medals || 0}
                            </div>
                            <div className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">
                              {(student.ownedPets || []).length} 隻寵物
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-[#6C5CE7]">
                            {leaderboardTab === 'exp' ? (student.points || 0) * 10 : student.power}
                          </div>
                          <div className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">
                            {leaderboardTab === 'exp' ? 'EXP' : '能量'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'boss' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {!bossDifficulty ? (
              <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-[#E1E4E8] text-center">
                <h2 className="text-3xl font-black mb-8">{t.bossBattle}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button 
                    onClick={() => startBossBattle('simple')}
                    className="p-8 rounded-[2rem] border-4 border-[#00B894] hover:bg-[#00B894]/5 transition-all group"
                  >
                    <div className="text-4xl mb-4">🦖</div>
                    <div className="text-2xl font-black text-[#00B894]">{t.simple}</div>
                    <div className="text-[#636E72] font-bold mt-2">HP: 3500</div>
                  </button>
                  <button 
                    onClick={() => startBossBattle('medium')}
                    className="p-8 rounded-[2rem] border-4 border-[#F1C40F] hover:bg-[#F1C40F]/5 transition-all group"
                  >
                    <div className="text-4xl mb-4">🐉</div>
                    <div className="text-2xl font-black text-[#F1C40F]">{t.medium}</div>
                    <div className="text-[#636E72] font-bold mt-2">HP: 5000</div>
                  </button>
                  <button 
                    onClick={() => startBossBattle('hard')}
                    className="p-8 rounded-[2rem] border-4 border-[#E74C3C] hover:bg-[#E74C3C]/5 transition-all group"
                  >
                    <div className="text-4xl mb-4">👹</div>
                    <div className="text-2xl font-black text-[#E74C3C]">{t.hard}</div>
                    <div className="text-[#636E72] font-bold mt-2">HP: 8800</div>
                  </button>
                  <button 
                    onClick={() => startBossBattle('demon')}
                    className="p-8 rounded-[2rem] border-4 border-[#9B59B6] hover:bg-[#9B59B6]/5 transition-all group"
                  >
                    <div className="text-4xl mb-4">👿</div>
                    <div className="text-2xl font-black text-[#9B59B6]">{t.demon}</div>
                    <div className="text-[#636E72] font-bold mt-2">HP: 12500</div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-[#E1E4E8] text-center relative overflow-hidden">
                  {isBossDefeated && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-md z-10 flex flex-col items-center justify-start p-8 overflow-y-auto custom-scrollbar"
                    >
                      <div className="flex flex-col items-center py-8 w-full max-w-md">
                        <Trophy className="w-20 h-20 text-[#F1C40F] mb-4 shrink-0" />
                        <h2 className="text-4xl font-black text-[#2D3436] mb-2">{t.victory}</h2>
                        <p className="text-[#636E72] font-bold mb-8">{t.rewards}</p>
                        
                        <div className="w-full space-y-3 mb-8">
                          {Object.entries(damageDealt)
                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                            .map(([id, damage], index) => {
                              const student = students.find(s => s.id === id);
                              return (
                                <div key={id} className="flex items-center justify-between bg-[#F8F9FA] p-4 rounded-2xl border border-[#E1E4E8]">
                                  <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white ${
                                      index === 0 ? 'bg-[#F1C40F]' : index === 1 ? 'bg-[#BDC3C7]' : index === 2 ? 'bg-[#E67E22]' : 'bg-[#DFE6E9] text-[#636E72]'
                                    }`}>
                                      {index + 1}
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                                      {student?.equippedSpecialPet ? (
                                        <img src={specialPets.find(p => p.id === student.equippedSpecialPet)?.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : student?.equippedPet !== null ? (
                                        <span className="text-xl">
                                          {getPetEmoji(student?.equippedPet)}
                                        </span>
                                      ) : (
                                        <img src={student?.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      )}
                                    </div>
                                    <span className="font-bold">{student?.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-[#636E72]">{damage} DMG</span>
                                    <div className="flex gap-1">
                                      {index === 0 && <div className="flex items-center gap-1 text-[#6C5CE7] font-black text-sm"><Medal className="w-4 h-4 fill-current"/>3</div>}
                                      {index === 1 && <div className="flex items-center gap-1 text-[#6C5CE7] font-black text-sm"><Medal className="w-4 h-4 fill-current"/>2</div>}
                                      {index === 2 && <div className="flex items-center gap-1 text-[#6C5CE7] font-black text-sm"><Medal className="w-4 h-4 fill-current"/>1</div>}
                                      {index > 2 && <div className="flex items-center gap-1 text-[#F39C12] font-black text-sm"><Coins className="w-4 h-4 fill-current"/>50</div>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>

                        <button 
                          onClick={() => setBossDifficulty(null)}
                          className="bg-[#6C5CE7] text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-[#6C5CE7]/20 hover:scale-105 transition-transform shrink-0"
                        >
                          {t.save}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="relative inline-block mb-6">
                    <motion.div 
                      animate={bossHp > 0 ? { 
                        y: [0, -10, 0],
                        rotate: [-1, 1, -1]
                      } : { scale: 0.8, opacity: 0.5 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-8xl"
                    >
                      {bossDifficulty === 'simple' && '🦖'}
                      {bossDifficulty === 'medium' && '🐉'}
                      {bossDifficulty === 'hard' && '👹'}
                      {bossDifficulty === 'demon' && '👿'}
                    </motion.div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-black text-[#636E72] uppercase tracking-wider">{t.bossHp}</span>
                      <span className="text-lg font-black text-[#2D3436]">{bossHp} / {maxBossHp}</span>
                    </div>
                    <div className="h-6 bg-[#F1F3F5] rounded-full overflow-hidden border-2 border-[#E1E4E8]">
                      <motion.div 
                        initial={{ width: '100%' }}
                        animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                        className={`h-full transition-all duration-500 ${
                          bossDifficulty === 'simple' ? 'bg-[#00B894]' :
                          bossDifficulty === 'medium' ? 'bg-[#F1C40F]' :
                          bossDifficulty === 'hard' ? 'bg-[#E74C3C]' : 'bg-[#9B59B6]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
                  {students.map(student => (
                    <motion.button
                      key={student.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAttackBoss(student)}
                      disabled={isBossDefeated}
                      className="bg-white p-2 rounded-2xl border border-[#E1E4E8] shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                      <div className="relative w-12 h-12 mx-auto mb-2 bg-[#F1F3F5] rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        {student.equippedSpecialPet ? (
                          <img 
                            src={specialPets.find(p => p.id === student.equippedSpecialPet)?.imageUrl} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : student.equippedPet !== null ? (
                          <span className="text-3xl">
                            {getPetEmoji(student.equippedPet)}
                          </span>
                        ) : (
                          <img 
                            src={student.avatar} 
                            alt={student.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <p className="font-bold text-sm text-[#2D3436] truncate">{student.name}</p>
                      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black text-[#6C5CE7] uppercase tracking-wider">
                        <Zap className="w-3 h-3 fill-current" />
                        {getPetPower(student)}
                      </div>
                      
                      {damageDealt[student.id] > 0 && (
                        <div className="absolute top-2 right-2 bg-[#6C5CE7] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                          {damageDealt[student.id]}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#E1E4E8] text-center">
                <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-1">總分數</p>
                <p className="text-3xl font-black text-[#00B894]">{totalPoints}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#E1E4E8] text-center">
                <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-1">總金幣</p>
                <p className="text-3xl font-black text-[#F39C12]">{students.reduce((acc, s) => acc + (s.coins || 0), 0)}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#E1E4E8] text-center">
                <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-1">總經驗值</p>
                <p className="text-3xl font-black text-[#6C5CE7]">{students.reduce((acc, s) => acc + (s.points * 10), 0)}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#E1E4E8] text-center">
                <p className="text-[10px] font-bold text-[#636E72] uppercase tracking-wider mb-1">{t.studentCount}</p>
                <p className="text-3xl font-black text-[#0984E3]">{students.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E1E4E8] overflow-hidden">
              <div className="p-8 border-b border-[#F1F3F5]">
                <h2 className="text-xl font-bold">{t.studentPerformance}</h2>
              </div>
              <div className="p-4">
                {students.sort((a, b) => b.points - a.points).map((student, index) => (
                  <div key={student.id} className="flex items-center gap-4 p-4 hover:bg-[#F8F9FA] rounded-2xl transition-colors">
                    <span className="w-8 font-black text-[#B2BEC3]">#{index + 1}</span>
                    <div className="w-10 h-10 rounded-xl bg-[#F1F3F5] flex items-center justify-center overflow-hidden">
                      {student.equippedPet !== null ? (
                        <span className="text-xl">
                          {getPetEmoji(student.equippedPet)}
                        </span>
                      ) : (
                        <img src={student.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <span className="flex-1 font-bold">{student.name}</span>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#636E72] uppercase">金幣</span>
                        <span className="font-bold text-[#F39C12]">{student.coins || 0}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#636E72] uppercase">經驗</span>
                        <span className="font-bold text-[#6C5CE7]">{(student.points || 0) * 10}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#636E72] uppercase">獎章</span>
                        <span className="font-bold text-[#6C5CE7]">{student.medals || 0}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#636E72] uppercase">分數</span>
                        <span className="font-bold text-[#00B894]">{student.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Chest Modal */}
      <AnimatePresence>
        {isChestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!chestReward) setIsChestModalOpen(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              {chestReward ? (
                <div className="p-8 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    className={`w-24 h-24 ${chestReward.petId ? 'bg-[#6C5CE7]' : 'bg-[#F1C40F]'} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  >
                    {chestReward.petId ? (
                      <span className="text-5xl">{PETS.find(p => p.id === chestReward.petId)?.emoji}</span>
                    ) : (
                      <Coins className="w-12 h-12 text-white fill-current" />
                    )}
                  </motion.div>
                  <h2 className="text-3xl font-black text-[#2D3436] mb-2">{t.congratulations}</h2>
                  {chestReward.petId ? (
                    <p className="text-3xl font-black text-[#6C5CE7] mb-6">
                      {t.newPet}{t[`pet_${chestReward.petId}`] || PETS.find(p => p.id === chestReward.petId)?.name}
                    </p>
                  ) : (
                    <p className="text-5xl font-black text-[#F39C12] mb-6">+{chestReward.amount} {t.coins}</p>
                  )}
                  <button 
                    onClick={() => setChestReward(null)}
                    className="w-full bg-[#6C5CE7] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#5849BE] transition-all"
                  >
                    {t.awesome}
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-6 bg-[#6C5CE7] text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6" />
                      <h2 className="text-xl font-black">{t.chest}</h2>
                    </div>
                    <button onClick={() => setIsChestModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {CHESTS.map((chest) => (
                      <div key={chest.level} className="bg-[#F8F9FA] p-5 rounded-3xl border-2 border-[#E1E4E8] hover:border-[#6C5CE7] transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Gift className="w-6 h-6 text-[#6C5CE7]" />
                            </div>
                            <div>
                              <h3 className="font-black text-[#2D3436]">Level {chest.level} {t.chest}</h3>
                              <div className="flex items-center gap-1 text-[#6C5CE7] font-bold text-sm">
                                <Medal className="w-3 h-3 fill-current" />
                                {chest.cost} {t.medals}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleOpenChest(chest.level)}
                            disabled={(students.find(s => s.id === loggedInStudentId)?.medals || 0) < chest.cost}
                            className="bg-[#6C5CE7] text-white px-6 py-2 rounded-xl font-black disabled:bg-[#DFE6E9] disabled:cursor-not-allowed hover:bg-[#5849BE] transition-all shadow-md"
                          >
                            {t.openChest}
                          </button>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-3 space-y-2">
                          <p className="text-[10px] font-black text-[#636E72] uppercase tracking-wider mb-1">{t.chestRewards}：</p>
                          <div className="grid grid-cols-2 gap-2">
                            {chest.rewards.map((reward, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs font-bold">
                                {reward.type === 'pet' ? (
                                  <span className="text-[#6C5CE7]">{PETS.find(p => p.id === reward.petId)?.name}</span>
                                ) : (
                                  <span className="text-[#F39C12]">{reward.amount} 金幣</span>
                                )}
                                <span className="text-[#B2BEC3]">{reward.weight}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Power Selection Modal */}
      <AnimatePresence>
        {powerModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPowerModalStudent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="p-8 text-center border-b border-[#F1F3F5]">
                <div className="w-20 h-20 bg-[#6C5CE7] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#6C5CE7]/20 overflow-hidden">
                  {powerModalStudent.equippedSpecialPet ? (
                    <img 
                      src={specialPets.find(p => p.id === powerModalStudent.equippedSpecialPet)?.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : powerModalStudent.equippedPet !== null ? (
                    <span className="text-5xl">{getPetEmoji(powerModalStudent.equippedPet)}</span>
                  ) : (
                    <img 
                      src={powerModalStudent.avatar} 
                      alt={powerModalStudent.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <h2 className="text-2xl font-bold">
                  {powerModalMode === 'pet' ? t.yourPet : t.changeAvatar}
                </h2>
                <p className="text-[#636E72] mt-1">
                  {powerModalMode === 'pet' 
                    ? t.choosePetFor.replace('{name}', powerModalStudent.name) 
                    : t.chooseAvatarFor.replace('{name}', powerModalStudent.name)}
                </p>
                {powerModalMode === 'pet' && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-[#F1C40F]/10 px-4 py-2 rounded-2xl border border-[#F1C40F]/20">
                    <Coins className="w-4 h-4 text-[#F1C40F] fill-current" />
                    <span className="text-[#F39C12] font-black">{powerModalStudent.coins || 0} {t.coins}</span>
                  </div>
                )}
              </div>
              
              {powerModalMode === 'avatar' && (
                <div className="p-4 bg-[#F8F9FA] border-b border-[#F1F3F5] flex gap-4 justify-center">
                  <button 
                    onClick={() => setPowerModalMode('avatar')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${powerModalMode === 'avatar' ? 'bg-[#6C5CE7] text-white' : 'bg-white text-[#636E72]'}`}
                  >
                    {t.baseAvatar}
                  </button>
                  <button 
                    onClick={() => setPowerModalMode('pet')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${powerModalMode === 'pet' ? 'bg-[#6C5CE7] text-white' : 'bg-white text-[#636E72]'}`}
                  >
                    {t.petAvatar}
                  </button>
                </div>
              )}

              {powerModalMode === 'pet' ? (
                <>
                  <div className="p-4 bg-[#F8F9FA] border-b border-[#F1F3F5] overflow-x-auto whitespace-nowrap flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(tier => {
                      const currentStage = Math.floor(powerModalStudent.points / 30);
                      const isLocked = tier > 1 && currentStage < tier;
                      
                      return (
                        <button
                          key={tier}
                          disabled={isLocked}
                          onClick={() => setSelectedPetTier(tier)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                            selectedPetTier === tier 
                              ? 'bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/20' 
                              : isLocked
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-white text-[#636E72] border border-[#E1E4E8] hover:border-[#6C5CE7]/30'
                          }`}
                        >
                          {isLocked && <Lock className="w-3 h-3" />}
                          {t.level} {tier}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="p-8 grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                    {(() => {
                      const currentStage = Math.floor(powerModalStudent.points / 30);
                      const isTierLocked = selectedPetTier > 1 && currentStage < selectedPetTier;
                      
                      if (isTierLocked) {
                        return (
                          <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                              <Lock className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{t.levelLocked.replace('{level}', selectedPetTier.toString())}</h3>
                            <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
                              {t.needToReach} <span className="font-black text-[#6C5CE7]">{t.stage} {selectedPetTier}</span> {t.toUnlockPets}。
                              <br />
                              <span className="text-[10px] mt-1 block">({t.currentStageLabel}: {currentStage})</span>
                            </p>
                          </div>
                        );
                      }

                      return PETS.filter(p => p.tier === selectedPetTier).sort((a, b) => a.price - b.price).map(pet => {
                        const isOwned = (powerModalStudent.ownedPets || []).includes(pet.id);
                        const isEquipped = powerModalStudent.equippedPet === pet.id;
                        const canAfford = (powerModalStudent.coins || 0) >= pet.price;
                        
                        return (
                          <button
                            key={pet.id}
                            disabled={!isOwned && (pet.isSpecial || !canAfford)}
                            onClick={() => handleSelectPet(powerModalStudent.id, pet.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all relative group ${
                              isEquipped 
                                ? 'bg-[#F1F3F5] ring-2 ring-[#6C5CE7]' 
                                : !isOwned && (pet.isSpecial || !canAfford)
                                  ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50' 
                                  : 'hover:bg-[#F1F3F5]'
                            }`}
                          >
                            {!isOwned && (pet.isSpecial || !canAfford) && (
                              <div className="absolute top-2 right-2">
                                <Lock className="w-3 h-3 text-[#636E72]" />
                              </div>
                            )}
                            <span className="text-4xl group-hover:scale-110 transition-transform">{pet.emoji}</span>
                            <span className="text-sm font-bold">{t[`pet_${pet.id}`] || pet.name}</span>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-black text-[#6C5CE7] bg-[#6C5CE7]/10 px-2 py-0.5 rounded-full">
                                {pet.power} {t.energyUnit}
                              </span>
                              <span className={`text-[10px] font-black flex items-center gap-1 ${isEquipped ? 'text-[#00B894]' : isOwned ? 'text-[#0984E3]' : 'text-[#F39C12]'}`}>
                                {isEquipped ? t.equipped : isOwned ? t.owned : pet.isSpecial ? t.inLevel3Chest : `${pet.price} ${t.coins}`}
                              </span>
                            </div>
                          </button>
                        );
                      });
                    })()}
                    <button
                      onClick={() => handleSelectPet(powerModalStudent.id, 0)}
                      className="col-span-2 mt-2 py-3 rounded-xl text-sm font-bold text-[#D63031] hover:bg-[#FFF5F5] transition-colors"
                    >
                      {t.removePet}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                  {['bottts', 'avataaars', 'pixel-art', 'micah', 'miniavs'].map(style => (
                    <button
                      key={style}
                      onClick={() => handleUpdateAvatar(powerModalStudent.id, `https://api.dicebear.com/7.x/${style}/svg?seed=${powerModalStudent.name}`)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-[#F1F3F5] transition-all group"
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/${style}/svg?seed=${powerModalStudent.name}`} 
                        alt={style}
                        className="w-16 h-16 rounded-xl bg-white group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] font-bold text-[#636E72] capitalize">{style}</span>
                    </button>
                  ))}
                  {/* Random seeds */}
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <button
                      key={i}
                      onClick={() => handleUpdateAvatar(powerModalStudent.id, `https://api.dicebear.com/7.x/bottts/svg?seed=${powerModalStudent.name}${i}`)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-[#F1F3F5] transition-all group"
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${powerModalStudent.name}${i}`} 
                        alt="random"
                        className="w-16 h-16 rounded-xl bg-white group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] font-bold text-[#636E72]">風格 {i}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6 bg-[#F8F9FA] flex justify-center">
                <button 
                  onClick={() => setPowerModalStudent(null)}
                  className="text-sm font-bold text-[#636E72] hover:text-[#2D3436]"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Award Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            >
              <div className="p-8 text-center border-b border-[#F1F3F5]">
                <div 
                  onClick={() => {
                    if (loggedInStudentId === selectedStudent.id) {
                      setPowerModalMode('avatar');
                      setPowerModalStudent(selectedStudent);
                      setSelectedStudent(null);
                    }
                  }}
                  className={`relative mx-auto mb-4 w-24 h-24 rounded-full bg-[#F1F3F5] flex items-center justify-center overflow-hidden ${loggedInStudentId === selectedStudent.id ? 'cursor-pointer group' : ''}`}
                >
                  {selectedStudent.equippedSpecialPet ? (
                    <img 
                      src={specialPets.find(p => p.id === selectedStudent.equippedSpecialPet)?.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : selectedStudent.equippedPet !== null ? (
                    <span className="text-5xl">{getPetEmoji(selectedStudent.equippedPet)}</span>
                  ) : (
                    <img 
                      src={selectedStudent.avatar} 
                      alt={selectedStudent.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {loggedInStudentId === selectedStudent.id && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Zap className="text-white w-8 h-8" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{t.feedbackFor} {selectedStudent.name}</h2>
                
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    onClick={() => setModalTab('positive')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      modalTab === 'positive' 
                        ? 'bg-[#00B894] text-white shadow-lg shadow-[#00B894]/20' 
                        : 'bg-[#F1F3F5] text-[#636E72]'
                    }`}
                  >
                    {t.positive}
                  </button>
                  <button 
                    onClick={() => setModalTab('needsWork')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      modalTab === 'needsWork' 
                        ? 'bg-[#D63031] text-white shadow-lg shadow-[#D63031]/20' 
                        : 'bg-[#F1F3F5] text-[#636E72]'
                    }`}
                  >
                    {t.needsWork}
                  </button>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-3 gap-4">
                {(modalTab === 'positive' ? SKILLS : NEEDS_WORK_SKILLS).map(skill => (
                  <button
                    key={skill.id}
                    disabled={!isTeacher || !!loggedInStudentId}
                    onClick={() => handleAwardPoints(skill)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all group ${
                      (!isTeacher || !!loggedInStudentId) ? 'opacity-50 cursor-not-allowed' :
                      modalTab === 'positive' ? 'hover:bg-[#F0FFF4] hover:text-[#00B894]' : 'hover:bg-[#FFF5F5] hover:text-[#D63031]'
                    }`}
                  >
                    <div className={`w-14 h-14 bg-[#F1F3F5] rounded-2xl flex items-center justify-center transition-colors ${
                      modalTab === 'positive' ? 'group-hover:bg-[#00B894]' : 'group-hover:bg-[#D63031]'
                    } group-hover:text-white`}>
                      <SkillIcon name={skill.icon} className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-center leading-tight">{t[`skill_${skill.id}`] || skill.name}</span>
                    <span className={`text-[10px] font-black ${skill.points > 0 ? 'text-[#00B894]' : 'text-[#D63031]'}`}>
                      {skill.points > 0 ? `+${skill.points}` : skill.points}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-6 bg-[#F8F9FA] flex justify-center">
                <button 
                  onClick={closeModal}
                  className="text-sm font-bold text-[#636E72] hover:text-[#2D3436]"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingStudent(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8"
            >
              <h2 className="text-2xl font-bold mb-6">{t.addStudent}</h2>
              <form onSubmit={handleAddStudent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#636E72] mb-2">{t.studentName}</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-[#E1E4E8] focus:ring-2 focus:ring-[#00B894] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsAddingStudent(false)}
                      className="flex-1 px-6 py-3 rounded-xl font-bold text-[#636E72] hover:bg-[#F1F3F5] transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-[#00B894] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#00B894]/20 hover:bg-[#00A383] transition-colors"
                    >
                      {t.addStudentBtn}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingStudent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t.editStudent}</h2>
                <button 
                  onClick={() => handleDeleteStudent(editingStudent.id)}
                  className="p-2 text-[#D63031] hover:bg-[#D63031]/10 rounded-xl transition-colors"
                  title={t.delete}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStudent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#636E72] mb-2">{t.studentName}</label>
                    <input 
                      autoFocus
                      type="text" 
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full px-4 py-3 rounded-xl border border-[#E1E4E8] focus:ring-2 focus:ring-[#00B894] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="flex-1 px-6 py-3 rounded-xl font-bold text-[#636E72] hover:bg-[#F1F3F5] transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-[#00B894] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#00B894]/20 hover:bg-[#00A383] transition-colors"
                    >
                      {t.saveChanges}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coins Award Modal */}
      <AnimatePresence>
        {coinsModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCoinsModalStudent(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xs rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-[#F1C40F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-[#F1C40F] fill-current" />
              </div>
              <h2 className="text-xl font-bold mb-2">獎勵金幣</h2>
              <p className="text-sm text-[#636E72] mb-6">為 {coinsModalStudent.name} 選擇獎勵金額</p>
              
              <div className="grid grid-cols-2 gap-3">
                {[10, 20, 30, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      handleUpdateCoins(coinsModalStudent.id, amount);
                      setCoinsModalStudent(null);
                    }}
                    className="py-3 bg-[#F8F9FA] hover:bg-[#F1C40F]/10 hover:text-[#F39C12] rounded-2xl font-black transition-all active:scale-95 border border-[#E1E4E8] hover:border-[#F1C40F]/30"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setCoinsModalStudent(null)}
                className="mt-6 text-sm font-bold text-[#636E72] hover:text-[#2D3436]"
              >
                {t.cancel}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E1E4E8] sm:hidden z-20">
        <div className="flex justify-around p-2">
          <button 
            onClick={() => setActiveTab('classroom')}
            className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'classroom' ? 'text-[#00B894]' : 'text-[#636E72]'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold mt-1">{t.classroom}</span>
          </button>
          {(!loggedInStudentId || isTeacher) && (
            <>
              <button 
                onClick={() => setActiveTab('story')}
                className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'story' ? 'text-[#00B894]' : 'text-[#636E72]'}`}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">{t.story}</span>
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'reports' ? 'text-[#00B894]' : 'text-[#636E72]'}`}
              >
                <Award className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">{t.reports}</span>
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Timer Modal */}
      <AnimatePresence>
        {isTimerModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[80] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTimerModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] p-10 shadow-2xl max-w-sm w-full text-center"
            >
              <button 
                onClick={() => setIsTimerModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#F1F3F5] rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-[#636E72]" />
              </button>

              <div className="w-20 h-20 bg-[#00B894]/10 rounded-[30px] flex items-center justify-center mx-auto mb-8">
                <Clock className="w-10 h-10 text-[#00B894]" />
              </div>

              <h2 className="text-2xl font-black text-[#2D3436] mb-8">倒計時</h2>

              {showTimeUp && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8 p-4 bg-[#FAB1A0] text-[#D63031] rounded-2xl font-black text-lg shadow-lg shadow-[#FAB1A0]/30 animate-pulse"
                >
                  時間到！ 🔔
                </motion.div>
              )}

              <div className="flex items-center justify-center gap-4 mb-8">
                <button 
                  onClick={playBellSound}
                  className="flex items-center gap-2 px-4 py-2 bg-[#F1F3F5] text-[#636E72] rounded-xl hover:bg-[#E1E4E8] transition-colors text-xs font-bold"
                >
                  <Volume2 className="w-4 h-4" />
                  測試鈴聲
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mb-10">
                {(() => {
                  const hrs = Math.floor(timeLeft / 3600);
                  const mins = Math.floor((timeLeft % 3600) / 60);
                  const secs = timeLeft % 60;
                  const h = hrs.toString().padStart(2, '0');
                  const m = mins.toString().padStart(2, '0');
                  const s = secs.toString().padStart(2, '0');

                  const TimerDigit = ({ value, type }: { value: string, type: 'h' | 'm' | 's' }) => (
                    <div className="flex flex-col items-center gap-2">
                      <button 
                        onClick={() => {
                          if (isTimerRunning) return;
                          if (type === 'h') setTimeLeft(prev => prev + 3600);
                          if (type === 'm') setTimeLeft(prev => prev + 60);
                          if (type === 's') setTimeLeft(prev => prev + 1);
                        }}
                        className="text-5xl font-black text-[#2D3436] hover:text-[#00B894] transition-colors tabular-nums"
                      >
                        {value}
                      </button>
                      <span className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-widest">
                        {type === 'h' ? '時' : type === 'm' ? '分' : '秒'}
                      </span>
                    </div>
                  );

                  return (
                    <>
                      <TimerDigit value={h} type="h" />
                      <span className="text-4xl font-black text-[#DFE6E9] mb-6">:</span>
                      <TimerDigit value={m} type="m" />
                      <span className="text-4xl font-black text-[#DFE6E9] mb-6">:</span>
                      <TimerDigit value={s} type="s" />
                    </>
                  );
                })()}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
                    isTimerRunning 
                      ? 'bg-[#FAB1A0] text-[#D63031] shadow-[#FAB1A0]/30' 
                      : 'bg-[#00B894] text-white shadow-[#00B894]/30 hover:bg-[#00A383]'
                  }`}
                >
                  {isTimerRunning ? '暫停' : '開始'}
                </button>
                <button 
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimeLeft(0);
                    setShowTimeUp(false);
                  }}
                  className="px-6 py-4 bg-[#F1F3F5] text-[#636E72] rounded-2xl font-black hover:bg-[#E1E4E8] transition-colors"
                >
                  重置
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Password Management Modal */}
      <AnimatePresence>
        {isStudentPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsStudentPasswordModalOpen(false);
                setPasswordModalStudent(null);
                setTempStudentPassword('');
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-[#F1F3F5] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-[#6C5CE7]" />
                  </div>
                  <h2 className="text-2xl font-bold">{t.studentPassword}</h2>
                </div>
                <button 
                  onClick={() => {
                    setIsStudentPasswordModalOpen(false);
                    setPasswordModalStudent(null);
                    setTempStudentPassword('');
                  }}
                  className="p-2 hover:bg-[#F1F3F5] rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-[#636E72]" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                {passwordModalStudent ? (
                  <form onSubmit={handleSetStudentPassword} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl">
                      <img src={passwordModalStudent.avatar} className="w-12 h-12 rounded-xl bg-white" alt="" />
                      <div>
                        <p className="text-xs font-black text-[#B2BEC3] uppercase tracking-wider">正在設定</p>
                        <p className="text-lg font-bold text-[#2D3436]">{passwordModalStudent.name}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2 px-1">
                        {t.setStudentPassword}
                      </label>
                      <input 
                        autoFocus
                        type="text"
                        maxLength={6}
                        value={tempStudentPassword}
                        onChange={(e) => setTempStudentPassword(e.target.value.replace(/\D/g, ''))}
                        placeholder={t.passwordPlaceholder}
                        className="w-full bg-[#F1F3F5] border-2 border-transparent rounded-2xl px-6 py-4 text-2xl font-bold text-center tracking-[0.5em] outline-none focus:border-[#6C5CE7] transition-all"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => {
                          setPasswordModalStudent(null);
                          setTempStudentPassword('');
                        }}
                        className="flex-1 py-4 bg-[#F1F3F5] text-[#636E72] rounded-2xl font-black hover:bg-[#E1E4E8] transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        type="submit"
                        disabled={tempStudentPassword.length !== 6}
                        className="flex-1 bg-[#6C5CE7] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#6C5CE7]/30 hover:bg-[#5849BE] disabled:opacity-50 transition-all"
                      >
                        {t.save}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    {students.map(student => (
                      <button
                        key={student.id}
                        onClick={() => {
                          setPasswordModalStudent(student);
                          setTempStudentPassword(student.password || '');
                        }}
                        className="w-full flex items-center justify-between p-4 bg-[#F8F9FA] hover:bg-[#F1F3F5] rounded-2xl transition-all group border border-transparent hover:border-[#6C5CE7]/20"
                      >
                        <div className="flex items-center gap-3">
                          <img src={student.avatar} className="w-10 h-10 rounded-xl bg-white" alt="" />
                          <span className="font-bold text-[#2D3436]">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.password ? (
                            <span className="text-xs font-mono font-bold text-[#00B894] bg-[#00B894]/10 px-2 py-1 rounded-lg">
                              {student.password}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-[#B2BEC3]">未設定</span>
                          )}
                          <ChevronRight className="w-4 h-4 text-[#B2BEC3] group-hover:text-[#6C5CE7] transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Homework Modal */}
      <AnimatePresence>
        {isHomeworkModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[80] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsHomeworkModalOpen(false);
                setIsAddingHomework(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-[#F1F3F5] flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#6C5CE7]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#2D3436]">{t.homeworkTitle}</h2>
                </div>
                <button 
                  onClick={() => {
                    setIsHomeworkModalOpen(false);
                    setIsAddingHomework(false);
                  }}
                  className="p-2 hover:bg-[#F1F3F5] rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-[#636E72]" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                {isTeacher && !loggedInStudentId && !isAddingHomework && (
                  <button 
                    onClick={() => setIsAddingHomework(true)}
                    className="w-full py-4 border-2 border-dashed border-[#DFE6E9] rounded-2xl flex items-center justify-center gap-2 text-[#6C5CE7] font-bold hover:bg-[#6C5CE7]/5 hover:border-[#6C5CE7] transition-all mb-6"
                  >
                    <Plus className="w-5 h-5" />
                    {t.addHomework}
                  </button>
                )}

                {isAddingHomework ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.question}</label>
                      <textarea 
                        value={newHomework.question}
                        onChange={(e) => setNewHomework({...newHomework, question: e.target.value})}
                        className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all h-24"
                        placeholder={t.questionPlaceholder}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.image} (選填)</label>
                      <input 
                        type="file"
                        ref={homeworkFileInputRef}
                        onChange={handleHomeworkImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={() => homeworkFileInputRef.current?.click()}
                          className="flex-1 bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none border-2 border-dashed border-[#E1E4E8] hover:border-[#6C5CE7] hover:bg-[#6C5CE7]/5 transition-all flex items-center justify-center gap-2 text-[#636E72] hover:text-[#6C5CE7]"
                        >
                          <Upload className="w-5 h-5" />
                          {t.uploadImage}
                        </button>
                        {newHomework.imageUrl && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#6C5CE7] shrink-0">
                            <img src={newHomework.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              onClick={() => setNewHomework({ ...newHomework, imageUrl: '' })}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.teacherAnswer}</label>
                      <input 
                        type="text"
                        value={newHomework.answer}
                        onChange={(e) => setNewHomework({...newHomework, answer: e.target.value})}
                        className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
                        placeholder={t.homeworkAnswerPlaceholder}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.coins} {t.reward}</label>
                        <input 
                          type="number"
                          value={newHomework.coinsReward}
                          onChange={(e) => setNewHomework({...newHomework, coinsReward: parseInt(e.target.value)})}
                          className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.exp} {t.reward}</label>
                        <input 
                          type="number"
                          value={newHomework.expReward}
                          onChange={(e) => setNewHomework({...newHomework, expReward: parseInt(e.target.value)})}
                          className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.medals} {t.reward}</label>
                        <input 
                          type="number"
                          value={newHomework.medalsReward}
                          onChange={(e) => setNewHomework({...newHomework, medalsReward: parseInt(e.target.value)})}
                          className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#6C5CE7] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.expiryTime}</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: t.oneDay, val: 1 },
                          { label: t.twoDays, val: 2 },
                          { label: t.threeDays, val: 3 },
                          { label: t.oneWeek, val: 7 }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            onClick={() => {
                              const date = new Date();
                              date.setDate(date.getDate() + opt.val);
                              setNewHomework({ ...newHomework, expiresAt: date.toISOString() });
                            }}
                            className={`py-2 rounded-xl font-bold text-xs transition-all ${
                              new Date(newHomework.expiresAt!).getDate() === new Date(Date.now() + opt.val * 24 * 60 * 60 * 1000).getDate()
                                ? 'bg-[#6C5CE7] text-white'
                                : 'bg-[#F1F3F5] text-[#636E72] hover:bg-[#E1E4E8]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setIsAddingHomework(false)}
                        className="flex-1 py-4 bg-[#F1F3F5] text-[#636E72] rounded-2xl font-black hover:bg-[#E1E4E8] transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={async () => {
                          if (!newHomework.question || !newHomework.answer) return;
                          const hw: Homework = {
                            id: Date.now().toString(),
                            question: newHomework.question!,
                            answer: newHomework.answer!,
                            coinsReward: newHomework.coinsReward || 0,
                            expReward: newHomework.expReward || 0,
                            medalsReward: newHomework.medalsReward || 0,
                            imageUrl: newHomework.imageUrl,
                            completedBy: [],
                            expiresAt: newHomework.expiresAt || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                          };
                          
                          if (user && activeClassId) {
                            try {
                              const hwRef = doc(collection(db, 'homeworks'));
                              await setDoc(hwRef, { ...hw, id: hwRef.id, classId: activeClassId });
                            } catch (e) { console.error(e); }
                          } else {
                            setHomeworks([...homeworks, hw]);
                          }
                          
                          setNewHomework({ 
                            question: '', 
                            answer: '', 
                            coinsReward: 10, 
                            expReward: 10, 
                            imageUrl: '',
                            expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
                          });
                          setIsAddingHomework(false);
                        }}
                        className="flex-1 py-4 bg-[#6C5CE7] text-white rounded-2xl font-black shadow-lg shadow-[#6C5CE7]/30 hover:bg-[#5849BE] transition-colors"
                      >
                        {t.save}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {homeworks.filter(hw => new Date(hw.expiresAt) > new Date()).length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-[#F1F3F5] rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-[#B2BEC3]" />
                        </div>
                        <p className="text-[#B2BEC3] font-bold">{t.noHomework}</p>
                      </div>
                    )}
                    {homeworks
                      .filter(hw => new Date(hw.expiresAt) > new Date())
                      .map((hw) => {
                        const timeLeftMs = new Date(hw.expiresAt).getTime() - Date.now();
                        const daysLeft = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
                        const hoursLeft = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        
                        return (
                          <div key={hw.id} className="bg-[#F8F9FA] rounded-[2.5rem] p-6 border-2 border-[#F1F3F5] space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1 flex-1">
                                <h3 className="text-lg font-black text-[#2D3436] leading-tight">{hw.question}</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#D63031]">
                                  <Clock className="w-3 h-3" />
                                  {t.expiresIn}: {daysLeft > 0 ? `${daysLeft}d ` : ''}{hoursLeft}h
                                </div>
                              </div>
                              {isTeacher && !loggedInStudentId && (
                                <button 
                                  onClick={async () => {
                                    if (user) {
                                      try { await deleteDoc(doc(db, 'homeworks', hw.id)); } catch (e) {}
                                    } else {
                                      setHomeworks(homeworks.filter(h => h.id !== hw.id));
                                    }
                                  }}
                                  className="p-2 text-[#D63031] hover:bg-[#D63031]/10 rounded-xl transition-colors ml-4"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
                            {hw.imageUrl && (
                              <div className="flex justify-center relative group">
                                <img 
                                  src={hw.imageUrl} 
                                  alt="Homework" 
                                  className="max-w-full max-h-[400px] rounded-2xl h-auto shadow-sm object-contain cursor-zoom-in"
                                  referrerPolicy="no-referrer"
                                  onClick={() => {
                                    setViewingImageUrl(hw.imageUrl!);
                                    setImageZoom(1);
                                  }}
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <div className="bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              </div>
                            )}
    
                            <div className="flex flex-wrap gap-2">
                              <div className="px-3 py-1 bg-[#F1C40F]/10 text-[#F39C12] rounded-lg text-[10px] font-black border border-[#F1C40F]/20 flex items-center gap-1.5">
                                <Coins className="w-3 h-3 fill-current" />
                                +{hw.coinsReward}
                              </div>
                              <div className="px-3 py-1 bg-[#00B894]/10 text-[#00B894] rounded-lg text-[10px] font-black border border-[#00B894]/20 flex items-center gap-1.5">
                                <Star className="w-3 h-3 fill-current" />
                                +{hw.expReward} EXP
                              </div>
                              <div className="px-3 py-1 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-lg text-[10px] font-black border border-[#6C5CE7]/20 flex items-center gap-1.5">
                                <Medal className="w-3 h-3 fill-current" />
                                +{hw.medalsReward || 0} {t.medals}
                              </div>
                            </div>
    
                            {!isTeacher && (
                              <div className="pt-4 border-t border-[#F1F3F5] space-y-4">
                                {hw.completedBy?.includes(loggedInStudentId || '') ? (
                                  <div className="flex items-center justify-center p-4 bg-[#00B894]/10 rounded-2xl border border-[#00B894]/20">
                                    <span className="text-[#00B894] font-black flex items-center gap-2">
                                      <CheckCircle2 className="w-5 h-5" />
                                      已完成此功課
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex gap-2">
                                      <input 
                                        type="text"
                                        value={studentAnswers[hw.id] || ''}
                                        onChange={(e) => setStudentAnswers({...studentAnswers, [hw.id]: e.target.value})}
                                        placeholder={t.enterAnswer}
                                        className="flex-1 bg-white border-2 border-[#E1E4E8] rounded-xl px-4 py-2 font-bold outline-none focus:border-[#6C5CE7] transition-all"
                                      />
                                      <button 
                                        onClick={async () => {
                                          const answer = studentAnswers[hw.id]?.trim();
                                          if (!answer) return;
                                          
                                          if (answer === hw.answer) {
                                            setHomeworkFeedback({...homeworkFeedback, [hw.id]: {type: 'success', message: t.correct}});
                                            playSound('success');
                                            
                                            // Award rewards to the logged-in student
                                            if (loggedInStudentId && activeClassId) {
                                              try {
                                                const classRef = doc(db, 'classes', activeClassId);
                                                const classSnap = await getDoc(classRef);
                                                if (classSnap.exists()) {
                                                  const currentStudents = classSnap.data().students || [];
                                                  const updatedStudents = currentStudents.map((s: any) => {
                                                    if (s.id === loggedInStudentId) {
                                                      return {
                                                        ...s,
                                                        points: (s.points || 0) + Math.floor(hw.expReward / 10),
                                                        coins: (s.coins || 0) + hw.coinsReward,
                                                        medals: (s.medals || 0) + (hw.medalsReward || 0)
                                                      };
                                                    }
                                                    return s;
                                                  });
                                                  await updateDoc(classRef, { students: updatedStudents });
                                                }

                                                // Update homework completedBy in Firestore
                                                if (user) {
                                                  const hwRef = doc(db, 'homeworks', hw.id);
                                                  await updateDoc(hwRef, {
                                                    completedBy: arrayUnion(loggedInStudentId)
                                                  });
                                                } else {
                                                  // Handle guest mode locally
                                                  setHomeworks(homeworks.map(h => 
                                                    h.id === hw.id ? { ...h, completedBy: [...(h.completedBy || []), loggedInStudentId] } : h
                                                  ));
                                                }
                                              } catch (e) {
                                                console.error("Error awarding homework rewards:", e);
                                              }
                                            }
                                          } else {
                                            setHomeworkFeedback({...homeworkFeedback, [hw.id]: {type: 'error', message: t.wrong}});
                                            playSound('error');
                                          }
                                        }}
                                        className="bg-[#6C5CE7] text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-[#6C5CE7]/20 hover:bg-[#5849BE] transition-colors"
                                      >
                                        {t.submit}
                                      </button>
                                    </div>
                                    {homeworkFeedback[hw.id] && (
                                      <motion.p 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-sm font-black flex items-center gap-2 ${homeworkFeedback[hw.id]?.type === 'success' ? 'text-[#00B894]' : 'text-[#D63031]'}`}
                                      >
                                        {homeworkFeedback[hw.id]?.type === 'success' ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <XCircle className="w-4 h-4" />
                                        )}
                                        {homeworkFeedback[hw.id]?.message}
                                      </motion.p>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
    
                            {isTeacher && !loggedInStudentId && (
                              <div className="pt-4 border-t border-[#F1F3F5]">
                                <p className="text-xs font-black text-[#B2BEC3] uppercase tracking-widest mb-1">{t.teacherAnswer}</p>
                                <p className="font-bold text-[#6C5CE7]">{hw.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Special Pet Modal */}
      <AnimatePresence>
        {isSpecialPetModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[80] p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSpecialPetModalOpen(false);
                setIsAddingSpecialPet(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-[#F1F3F5] flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F368E0]/10 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#F368E0]" />
                  </div>
                  <h2 className="text-2xl font-black text-[#2D3436]">{t.specialPet}</h2>
                </div>
                <button 
                  onClick={() => {
                    setIsSpecialPetModalOpen(false);
                    setIsAddingSpecialPet(false);
                  }}
                  className="p-2 hover:bg-[#F1F3F5] rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-[#636E72]" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 text-center">
                {isTeacher && !loggedInStudentId && !isAddingSpecialPet && (
                  <button 
                    onClick={() => setIsAddingSpecialPet(true)}
                    className="w-full py-4 border-2 border-dashed border-[#DFE6E9] rounded-2xl flex items-center justify-center gap-2 text-[#F368E0] font-bold hover:bg-[#F368E0]/5 hover:border-[#F368E0] transition-all mb-6"
                  >
                    <Plus className="w-5 h-5" />
                    {t.addSpecialPet}
                  </button>
                )}

                {isAddingSpecialPet ? (
                  <div className="space-y-6 text-left">
                    <div>
                      <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.petName}</label>
                      <input 
                        type="text"
                        value={newSpecialPet.name}
                        onChange={(e) => setNewSpecialPet({...newSpecialPet, name: e.target.value})}
                        className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#F368E0] transition-all"
                        placeholder={t.petName}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.petPhoto}</label>
                      <input 
                        type="file"
                        ref={specialPetFileInputRef}
                        onChange={handleSpecialPetImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={() => specialPetFileInputRef.current?.click()}
                          className="flex-1 bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none border-2 border-dashed border-[#E1E4E8] hover:border-[#F368E0] hover:bg-[#F368E0]/5 transition-all flex items-center justify-center gap-2 text-[#636E72] hover:text-[#F368E0]"
                        >
                          <Upload className="w-5 h-5" />
                          {t.uploadImage}
                        </button>
                        {newSpecialPet.imageUrl && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#F368E0] shrink-0">
                            <img src={newSpecialPet.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              onClick={() => setNewSpecialPet({ ...newSpecialPet, imageUrl: '' })}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.petPrice}</label>
                        <input 
                          type="number"
                          value={newSpecialPet.price}
                          onChange={(e) => setNewSpecialPet({...newSpecialPet, price: Math.max(0, parseInt(e.target.value) || 0)})}
                          className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#F368E0] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-[#636E72] uppercase tracking-widest mb-2">{t.petPower}</label>
                        <input 
                          type="number"
                          value={newSpecialPet.power}
                          onChange={(e) => setNewSpecialPet({...newSpecialPet, power: Math.max(0, parseInt(e.target.value) || 0)})}
                          className="w-full bg-[#F1F3F5] rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#F368E0] transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setIsAddingSpecialPet(false)}
                        className="flex-1 py-4 bg-[#F1F3F5] text-[#636E72] rounded-2xl font-black hover:bg-[#E1E4E8] transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={handleCreateSpecialPet}
                        className="flex-1 py-4 bg-[#F368E0] text-white rounded-2xl font-black shadow-lg shadow-[#F368E0]/30 hover:bg-[#D6308E] transition-colors"
                      >
                        {t.save}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {specialPets.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <p className="text-[#B2BEC3] font-bold">目前沒有特別寵物</p>
                      </div>
                    )}
                    {specialPets.map((pet) => {
                      const student = students.find(s => s.id === loggedInStudentId);
                      const isOwned = student?.ownedSpecialPets?.includes(pet.id);
                      
                      return (
                        <div key={pet.id} className="bg-[#F8F9FA] rounded-[2.5rem] p-6 border-2 border-[#F1F3F5] flex flex-col items-center gap-4 relative">
                          {isTeacher && !loggedInStudentId && (
                            <button 
                              onClick={async () => {
                                if (window.confirm('確定要刪除這隻寵物嗎？')) {
                                  try { await deleteDoc(doc(db, 'specialPets', pet.id)); } catch (e) {}
                                }
                              }}
                              className="absolute top-4 right-4 p-2 text-[#D63031] hover:bg-[#D63031]/10 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white shadow-md border-2 border-white flex items-center justify-center">
                            <img src={pet.imageUrl} className="w-full h-full object-cover" alt={pet.name} referrerPolicy="no-referrer" />
                          </div>
                          
                          <div className="text-center">
                            <h3 className="text-xl font-black text-[#2D3436]">{pet.name}</h3>
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-lg text-[10px] font-black">
                                +{pet.power} Power
                              </span>
                            </div>
                          </div>

                          {!isTeacher && loggedInStudentId && (
                            <button 
                              onClick={() => handleBuySpecialPet(pet)}
                              disabled={isOwned}
                              className={`w-full py-3 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                                isOwned 
                                  ? 'bg-[#00B894]/10 text-[#00B894] cursor-default' 
                                  : 'bg-[#F1C40F] text-white shadow-lg shadow-[#F1C40F]/30 hover:scale-105 active:scale-95'
                              }`}
                            >
                              {isOwned ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  {t.alreadyOwned}
                                </>
                              ) : (
                                <>
                                  <Coins className="w-4 h-4 fill-current" />
                                  {pet.price} {t.buy}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewingImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 md:p-8"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <div className="flex items-center bg-white/10 rounded-full p-1 backdrop-blur-md">
                <button 
                  onClick={() => setImageZoom(prev => Math.max(0.5, prev - 0.25))}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                >
                  <ZoomOut className="w-6 h-6" />
                </button>
                <span className="px-3 text-white font-bold min-w-[60px] text-center">
                  {Math.round(imageZoom * 100)}%
                </span>
                <button 
                  onClick={() => setImageZoom(prev => Math.min(3, prev + 0.25))}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
              </div>
              <button 
                onClick={() => setViewingImageUrl(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full h-full flex items-center justify-center overflow-auto p-4 custom-scrollbar">
              <motion.img
                src={viewingImageUrl}
                alt="Zoomed view"
                style={{ scale: imageZoom }}
                className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-2 rounded-full text-white/60 text-sm font-medium backdrop-blur-sm">
              滾動或點擊按鈕來縮放圖片
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
