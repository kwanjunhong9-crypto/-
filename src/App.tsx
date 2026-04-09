import React, { useState, useEffect } from 'react';
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
  Menu,
  Languages,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StoryPost, Skill } from './types';
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
  serverTimestamp
} from 'firebase/firestore';

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
];

type Language = 'zh' | 'ms' | 'en';

const TRANSLATIONS = {
  zh: {
    myClasses: '我的班級',
    newClass: '新班級',
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
    comments: '評論'
  },
  ms: {
    myClasses: 'Kelas Saya',
    newClass: 'Kelas Baru',
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
    comments: 'Komen'
  },
  en: {
    myClasses: 'My Classes',
    newClass: 'New Class',
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
    comments: 'Comments'
  }
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'createClass' | 'app'>('landing');
  const [isGuest, setIsGuest] = useState(false);
  const [className, setClassName] = useState('');
  const [activeTab, setActiveTab] = useState<'classroom' | 'story' | 'reports' | 'leaderboard'>('classroom');
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
  const [language, setLanguage] = useState<Language>('zh');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [coinsModalStudent, setCoinsModalStudent] = useState<Student | null>(null);
  const [powerModalMode, setPowerModalMode] = useState<'pet' | 'avatar'>('pet');
  const [selectedPetTier, setSelectedPetTier] = useState<number>(1);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [myClasses, setMyClasses] = useState<{id: string, name: string}[]>([]);
  
  // Timer & Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerEditMode, setTimerEditMode] = useState<'h' | 'm' | 's' | null>(null);
  const [showTimeUp, setShowTimeUp] = useState(false);

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
          setIsTeacher(user?.uid === data.teacherId);
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
  }, [activeClassId, user]);

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

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setHasExited(false);
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to ensure users can switch accounts if they want
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError('登入視窗被攔截了！請點擊右上角的「在新分頁開啟」按鈕，或允許此網站彈出視窗。');
      } else {
        setLoginError('登入失敗，請稍後再試。');
      }
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
                  onClick={() => { setLanguage('zh'); setIsLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${language === 'zh' ? 'bg-[#00B894]/10 text-[#00B894]' : 'text-[#636E72] hover:bg-[#F1F3F5]'}`}
                >
                  華文 (Chinese)
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
    if (user && isTeacher && activeClassId) {
      try {
        await updateDoc(doc(db, 'classes', activeClassId), {
          students: newStudents
        });
      } catch (error) {
        console.error('Failed to sync students', error);
      }
    }
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
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl font-bold text-[#2D3436] shadow-sm hover:shadow-md transition-all border border-[#E1E4E8] active:scale-95"
          >
            {user ? (
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

        {user ? (
          <div className="max-w-5xl w-full mx-auto mt-20 z-10">
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
                  <div className="absolute top-6 right-6">
                    <Crown className="w-5 h-5 text-[#F1C40F]" />
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#00B894]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Globe className="w-10 h-10 text-[#00B894]" />
                    </div>
                    <h3 className="text-lg font-black text-[#2D3436] mb-2">{cls.name}</h3>
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
            <h2 className="text-2xl font-black text-[#2D3436]">創建您的班級</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-[#636E72] uppercase tracking-widest mb-2 block px-1">班級名稱</label>
              <input 
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="例如：三年二班"
                className="w-full bg-[#F1F3F5] border-2 border-transparent rounded-2xl px-6 py-4 text-xl font-bold outline-none focus:border-[#00B894] transition-all"
              />
            </div>
            
            <button 
              disabled={!className.trim()}
              onClick={handleCreateClass}
              className="w-full bg-[#00B894] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#00A383] disabled:bg-[#DFE6E9] disabled:text-[#B2BEC3] disabled:cursor-not-allowed transition-all shadow-lg shadow-[#00B894]/30"
            >
              開始管理班級
            </button>
            
            <button 
              onClick={() => setView('landing')}
              className="w-full text-[#636E72] font-bold text-sm hover:text-[#2D3436] transition-colors"
            >
              返回上一步
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
          return { ...s, equippedPet: petId };
        } else if (pet && (s.coins || 0) >= pet.price) {
          // Purchase new pet
          return { 
            ...s, 
            coins: s.coins - pet.price,
            ownedPets: [...(s.ownedPets || []), petId],
            equippedPet: petId, // Auto-equip on purchase
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

  const getPetEmoji = (petId: number | null | undefined) => {
    if (petId === null || petId === undefined) return null;
    return PETS.find(p => p.id === petId)?.emoji || null;
  };

  const getPetPower = (student: Student) => {
    if (!student.ownedPets) return 0;
    return student.ownedPets.reduce((total, petId) => {
      const pet = PETS.find(p => p.id === petId);
      return total + (pet?.power || 0);
    }, 0);
  };

  const handleAwardPoints = (skill: Skill) => {
    if (selectedStudent) {
      const newStudents = students.map(s => {
        if (s.id === selectedStudent.id) {
          const newPoints = Math.max(0, s.points + skill.points);
          const newLevel = Math.floor(newPoints / 10);
          const currentMaxLevel = s.maxLevelReached || 0;
          
          // If level increased beyond the highest level ever reached, add bonus coins
          let bonusCoins = 0;
          let newMaxLevel = currentMaxLevel;
          
          if (newLevel > currentMaxLevel) {
            bonusCoins = (newLevel - currentMaxLevel) * 10;
            newMaxLevel = newLevel;
          }

          return { 
            ...s, 
            points: newPoints,
            coins: (s.coins || 0) + bonusCoins,
            maxLevelReached: newMaxLevel
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

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('確定要刪除這位學生嗎？此操作無法撤銷。')) return;

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
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-[#F1F3F5] rounded-xl transition-colors text-[#636E72]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#00B894] rounded-xl flex items-center justify-center shadow-lg shadow-[#00B894]/20">
                <Users className="text-white w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight">{className || t.myClasses}</h1>
              </div>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-[#F1F3F5] p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('classroom')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'classroom' 
                  ? 'bg-white text-[#00B894] shadow-sm' 
                  : 'text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              {t.classroom}
            </button>
            <button 
              onClick={() => setActiveTab('story')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'story' 
                  ? 'bg-white text-[#00B894] shadow-sm' 
                  : 'text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              {t.story}
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'reports' 
                  ? 'bg-white text-[#00B894] shadow-sm' 
                  : 'text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              {t.reports}
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'leaderboard' 
                  ? 'bg-white text-[#00B894] shadow-sm' 
                  : 'text-[#636E72] hover:text-[#2D3436]'
              }`}
            >
              {t.leaderboard}
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold">{user ? user.displayName : '史密斯老師'}</p>
              <p className="text-xs text-[#636E72]">{user ? '認證教師' : '遊客教師'}</p>
            </div>
            <button 
              onClick={handleExit}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DFE6E9] hover:bg-[#D63031]/10 group transition-colors"
              title="退出並返回首頁"
            >
              <LogOut className="w-5 h-5 text-[#636E72] group-hover:text-[#D63031]" />
              <span className="font-bold text-[#636E72] group-hover:text-[#D63031] hidden sm:inline">{t.exit}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'classroom' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {/* Add Student Card - Square */}
            {isTeacher && (
              <button 
                onClick={() => setIsAddingStudent(true)}
                className="aspect-square bg-white border-2 border-dashed border-[#DFE6E9] rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-[#00B894] hover:bg-[#F0FFF4] transition-all group shadow-sm"
              >
                <div className="w-12 h-12 bg-[#F1F3F5] rounded-2xl flex items-center justify-center group-hover:bg-[#00B894] transition-colors">
                  <Plus className="w-6 h-6 text-[#636E72] group-hover:text-white" />
                </div>
                <span className="text-sm font-black text-[#636E72] group-hover:text-[#00B894]">{t.addStudentBtn}</span>
              </button>
            )}

            {students.map((student) => (
              <motion.div
                key={student.id}
                layoutId={student.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2.5rem] p-4 shadow-sm border-2 border-[#E1E4E8] flex flex-col items-center gap-3 relative overflow-hidden group transition-all hover:shadow-xl hover:border-[#00B894]/30"
              >
                {/* Edit Button */}
                {isTeacher && (
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
                  onClick={() => {
                    if (!isTeacher) return;
                    setPowerModalMode('avatar');
                    setPowerModalStudent(student);
                  }}
                  className={`w-full aspect-square bg-[#F1F3F5] rounded-[2rem] flex items-center justify-center overflow-hidden relative ${isTeacher ? 'cursor-pointer group/avatar' : ''}`}
                >
                  {student.equippedPet !== null ? (
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
                  {isTeacher && (
                    <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/5 transition-colors flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity drop-shadow-md" />
                    </div>
                  )}
                </div>
                
                <div className="text-center w-full">
                  <h3 className="font-black text-base text-[#2D3436] uppercase tracking-wider truncate px-2">{student.name}</h3>
                </div>
                
                {/* Info Stack */}
                <div className="w-full space-y-2">
                  {/* Points Pill - Moved Above Level */}
                  <button 
                    onClick={() => isTeacher && setSelectedStudent(student)}
                    className="w-full py-1.5 rounded-xl bg-[#F1F3F5] border border-[#E1E4E8]/50 flex items-center justify-center gap-2 hover:bg-[#E1E4E8] transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-[#F1C40F] fill-current" />
                    <span className="text-[10px] font-black text-[#636E72]">
                      {student.points} {t.pointsUnit}
                    </span>
                  </button>

                  {/* Level Pill */}
                  <div className="w-full py-1.5 rounded-xl bg-[#F1F3F5] flex items-center justify-center gap-2 border border-[#E1E4E8]/50">
                    <Award className="w-3.5 h-3.5 text-[#0984E3] fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">
                      {t.level} {Math.floor(student.points / 10)}
                    </span>
                  </div>

                  {/* Power Pill */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isTeacher) return;
                      setPowerModalMode('pet');
                      setPowerModalStudent(student);
                    }}
                    className="w-full py-1.5 rounded-xl bg-[#F1F3F5] border border-[#E1E4E8]/50 flex items-center justify-center gap-2 hover:bg-[#E1E4E8] transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#6C5CE7] fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#636E72]">
                      POWER: {getPetPower(student)}
                    </span>
                  </button>

                  {/* Coins Pill - Restored */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isTeacher) return;
                      setCoinsModalStudent(student);
                    }}
                    className="w-full py-1.5 rounded-xl bg-[#F1F3F5] border border-[#E1E4E8]/50 flex items-center justify-center gap-2 hover:bg-[#E1E4E8] transition-colors"
                  >
                    <Coins className="w-3.5 h-3.5 text-[#F39C12] fill-current" />
                    <span className="text-[10px] font-black text-[#636E72]">
                      {student.coins || 0}
                    </span>
                  </button>
                </div>

                {/* Progress Bar (Experience) */}
                <div className="w-full px-2 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-[#B2BEC3] uppercase tracking-wider">EXP: {student.points * 10}</span>
                    <span className="text-[9px] font-black text-[#00B894] bg-[#00B894]/10 px-1.5 rounded-md">
                      階段 {Math.floor(student.points / 30)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden border border-[#E1E4E8]/30">
                    <div 
                      className="h-full bg-[#00B894] transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,184,148,0.4)]" 
                      style={{ width: `${((student.points % 30) / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
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
                  <img 
                    src={post.imageUrl} 
                    alt="Post content" 
                    className="w-full aspect-video object-cover"
                    referrerPolicy="no-referrer"
                  />
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
              <div className="p-8 bg-[#6C5CE7] text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black">能量排行榜</h2>
                <p className="text-white/70 text-sm font-bold mt-1">誰的寵物最強大？</p>
              </div>

              <div className="p-4 sm:p-8">
                <div className="space-y-4">
                  {students
                    .map(s => ({ ...s, power: getPetPower(s) }))
                    .sort((a, b) => b.power - a.power || b.points - a.points)
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
                            `第 ${index + 1} 名`
                          )}
                        </div>
                        
                        <div className="relative">
                          <img 
                            src={student.avatar} 
                            alt={student.name}
                            className="w-12 h-12 rounded-2xl bg-white shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          {student.equippedPet !== null && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-md flex items-center justify-center text-sm">
                              {getPetEmoji(student.equippedPet)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-[#2D3436]">{student.name}</h3>
                          <p className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">
                            擁有 {(student.ownedPets || []).length} 隻寵物
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-[#6C5CE7]">
                            {student.power}
                          </div>
                          <div className="text-[10px] font-black text-[#636E72] uppercase tracking-wider">
                            能量
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E1E4E8] text-center">
                <p className="text-sm font-bold text-[#636E72] uppercase tracking-wider mb-2">總分數</p>
                <p className="text-5xl font-black text-[#00B894]">{totalPoints}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E1E4E8] text-center">
                <p className="text-sm font-bold text-[#636E72] uppercase tracking-wider mb-2">平均分數</p>
                <p className="text-5xl font-black text-[#0984E3]">{averagePoints}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#E1E4E8] text-center">
                <p className="text-sm font-bold text-[#636E72] uppercase tracking-wider mb-2">學生人數</p>
                <p className="text-5xl font-black text-[#6C5CE7]">{students.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E1E4E8] overflow-hidden">
              <div className="p-8 border-b border-[#F1F3F5]">
                <h2 className="text-xl font-bold">學生表現</h2>
              </div>
              <div className="p-4">
                {students.sort((a, b) => b.points - a.points).map((student, index) => (
                  <div key={student.id} className="flex items-center gap-4 p-4 hover:bg-[#F8F9FA] rounded-2xl transition-colors">
                    <span className="w-8 font-black text-[#B2BEC3]">#{index + 1}</span>
                    <img src={student.avatar} alt="" className="w-10 h-10 rounded-full bg-[#F1F3F5]" referrerPolicy="no-referrer" />
                    <span className="flex-1 font-bold">{student.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-[#F1F3F5] rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-[#00B894]" 
                          style={{ width: `${(student.points / Math.max(...students.map(s => s.points))) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-black text-[#00B894]">{student.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

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
                  {powerModalStudent.equippedPet !== null ? (
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
                  {powerModalMode === 'pet' ? '你的寵物' : '你的寵物頭像'}
                </h2>
                <p className="text-[#636E72] mt-1">為 {powerModalStudent.name} 選擇一個寵物頭像</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-[#F1C40F]/10 px-4 py-2 rounded-2xl border border-[#F1C40F]/20">
                  <Coins className="w-4 h-4 text-[#F1C40F] fill-current" />
                  <span className="text-[#F39C12] font-black">{powerModalStudent.coins || 0} 金幣</span>
                </div>
              </div>
              
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
                      等級 {tier}
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
                        <h3 className="text-lg font-bold text-gray-900">等級 {selectedPetTier} 已鎖定</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
                          你需要達到 <span className="font-black text-[#6C5CE7]">階段 {selectedPetTier}</span> 才能解鎖此等級的寵物。
                          <br />
                          <span className="text-[10px] mt-1 block">(目前階段: {currentStage})</span>
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
                        disabled={!isOwned && !canAfford}
                        onClick={() => handleSelectPet(powerModalStudent.id, pet.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all relative group ${
                          isEquipped 
                            ? 'bg-[#F1F3F5] ring-2 ring-[#6C5CE7]' 
                            : !isOwned && !canAfford 
                              ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50' 
                              : 'hover:bg-[#F1F3F5]'
                        }`}
                      >
                        {!isOwned && !canAfford && (
                          <div className="absolute top-2 right-2">
                            <Lock className="w-3 h-3 text-[#636E72]" />
                          </div>
                        )}
                        <span className="text-4xl group-hover:scale-110 transition-transform">{pet.emoji}</span>
                        <span className="text-sm font-bold">{pet.name}</span>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-black text-[#6C5CE7] bg-[#6C5CE7]/10 px-2 py-0.5 rounded-full">
                            {pet.power} 能量
                          </span>
                          <span className={`text-[10px] font-black flex items-center gap-1 ${isEquipped ? 'text-[#00B894]' : isOwned ? 'text-[#0984E3]' : 'text-[#F39C12]'}`}>
                            {isEquipped ? '使用中' : isOwned ? '已擁有' : `${pet.price} 金幣`}
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
                  移除頭像
                </button>
              </div>

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
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.name} 
                  className="w-24 h-24 rounded-full bg-[#F1F3F5] mx-auto mb-4"
                  referrerPolicy="no-referrer"
                />
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
                    onClick={() => handleAwardPoints(skill)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all group ${
                      modalTab === 'positive' ? 'hover:bg-[#F0FFF4] hover:text-[#00B894]' : 'hover:bg-[#FFF5F5] hover:text-[#D63031]'
                    }`}
                  >
                    <div className={`w-14 h-14 bg-[#F1F3F5] rounded-2xl flex items-center justify-center transition-colors ${
                      modalTab === 'positive' ? 'group-hover:bg-[#00B894]' : 'group-hover:bg-[#D63031]'
                    } group-hover:text-white`}>
                      <SkillIcon name={skill.icon} className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-center leading-tight">{skill.name}</span>
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
                      placeholder="輸入全名"
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
                      placeholder="輸入全名"
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
        </div>
      </footer>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-[70] p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-[#2D3436]">工具箱</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-[#F1F3F5] rounded-lg">
                  <X className="w-5 h-5 text-[#636E72]" />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setIsTimerModalOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex flex-col items-center gap-2 p-6 rounded-3xl border-2 border-[#F1F3F5] hover:border-[#00B894] hover:bg-[#00B894]/5 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#00B894]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-[#00B894]" />
                  </div>
                  <span className="font-bold text-[#2D3436]">倒計時</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
    </div>
  );
}
