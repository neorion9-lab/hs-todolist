import { useState, useEffect } from 'react'
import Header from './components/Header'
import SummaryGrid from './components/SummaryGrid'
import Timeline from './components/Timeline'
import MinwonModal from './components/MinwonModal'
import ScheduleModal from './components/ScheduleModal'
import SettingsModal from './components/SettingsModal'
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// 기본 데이터 구조
const defaultData = {
  summary: {
    school: { main: [], gongmun: [], minwon: [] },
    personal: { main: [], health_diet: [], health_exercise: [], gratitude: [] }
  },
  timeline: []
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [planData, setPlanData] = useState(defaultData)
  const [modalType, setModalType] = useState(null) // 'minwon' | 'schedule' | 'settings' | null
  const [modalData, setModalData] = useState(null) // 선택된 타임라인이나 민원 데이터
  const [userSettings, setUserSettings] = useState({ hiddenCategories: [] })
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isDataLoading, setIsDataLoading] = useState(false)

  const dateString = currentDate.toISOString().split('T')[0]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 데이터베이스에서 데이터 로드 (user, dateString 변경 시)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsDataLoading(true);
      try {
        const docRef = doc(db, "users", user.uid, "plans", dateString);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPlanData(docSnap.data());
        } else {
          setPlanData(defaultData);
        }
      } catch (error) {
        console.error("Error loading data: ", error);
        setPlanData(defaultData);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, [dateString, user]);

  // 설정 데이터 로드
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid, "settings", "preferences");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserSettings(docSnap.data());
        } else {
          setUserSettings({ hiddenCategories: [] });
        }
      } catch (error) {
        console.error("Error loading settings: ", error);
      }
    };
    fetchSettings();
  }, [user]);

  // 데이터 변경 시 데이터베이스에 저장
  const savePlanData = async (newData) => {
    setPlanData(newData);
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "plans", dateString);
        await setDoc(docRef, newData);
      } catch (error) {
        console.error("Error saving data: ", error);
      }
    }
  }

  // 상단 요약 업데이트 핸들러
  const updateSummary = (zone, category, newItems) => {
    const newData = {
      ...planData,
      summary: {
        ...planData.summary,
        [zone]: {
          ...planData.summary[zone],
          [category]: newItems
        }
      }
    }
    savePlanData(newData)
  }

  // 타임라인 업데이트 핸들러
  const updateTimeline = (newTimelineItems, addedContent = null, zone = null, category = null, removedContent = null) => {
    let newSummary = JSON.parse(JSON.stringify(planData.summary))

    if (removedContent && zone && category) {
      const currentList = newSummary[zone][category] || []
      newSummary[zone][category] = currentList.filter(item => (item.title || item) !== removedContent)
    }

    if (addedContent && zone && category) {
      const currentList = newSummary[zone][category] || []
      const exists = currentList.some(item => (item.title || item) === addedContent)
      if (!exists && currentList.length < 5) {
        newSummary[zone][category] = [...currentList, addedContent]
      }
    }

    const newData = {
      ...planData,
      summary: newSummary,
      timeline: newTimelineItems
    }
    savePlanData(newData)
  }

  // 모달 제어
  const openModal = (type, initialData = null) => {
    setModalType(type)
    setModalData(initialData)
  }
  const closeModal = () => {
    setModalType(null)
    setModalData(null)
  }

  // 일반 일정 저장 핸들러
  const handleScheduleSave = (data) => {
    const timeToSave = data.time || (modalData && modalData.time);

    if (modalData && timeToSave) {
      const existingTimeline = [...planData.timeline]
      let index = -1
      
      let zone = 'school';
      let cat = 'main';
      let timelineCategory = modalData.category;

      if (modalData.zone) { // From SummaryGrid
          zone = modalData.zone;
          cat = modalData.category.replace(`${zone}_`, '');
          timelineCategory = `${zone}_${cat}`;
      } else {
          zone = modalData.category.startsWith('school') ? 'school' : 'personal';
          cat = modalData.category.replace(`${zone}_`, '');
          timelineCategory = modalData.category;
      }

      if (modalData.id || modalData.content) {
        index = existingTimeline.findIndex(t => 
          (modalData.id && t.id === modalData.id) || 
          (!modalData.id && t.category === timelineCategory && t.time === (modalData.time || timeToSave) && t.content === (modalData.content || data.content))
        )
      }

      let removedContent = null;

      if (data.delete) {
        if (index >= 0) {
          removedContent = existingTimeline[index].content;
          existingTimeline.splice(index, 1);
          updateTimeline(existingTimeline, null, zone, cat, removedContent);
        }
      } else {
        if (index >= 0) {
          removedContent = existingTimeline[index].content;
        }

        const newEntry = {
          id: modalData.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          time: timeToSave,
          category: timelineCategory,
          content: data.content,
          status: data.status,
          memo: data.memo
        }

        if (index >= 0) {
          existingTimeline[index] = newEntry
        } else {
          existingTimeline.push(newEntry)
        }
        
        updateTimeline(existingTimeline, data.content, zone, cat, removedContent)
      }
    } else if (modalData && modalData.zone) {
      // Just update summary if no time is provided
      let newSummary = JSON.parse(JSON.stringify(planData.summary))
      const currentList = newSummary[modalData.zone][modalData.category] || []
      const exists = currentList.some(item => (item.title || item.content || item) === data.content)
      if (!exists && currentList.length < 5) {
        newSummary[modalData.zone][modalData.category] = [...currentList, data.content]
        const newData = {
          ...planData,
          summary: newSummary
        }
        savePlanData(newData)
      }
    }
    closeModal()
  }

  // 민원 저장 핸들러
  const handleMinwonSave = (minwonDetail) => {
    // 타임라인 업데이트 로직 (모달 데이터에 time, category가 있다고 가정)
    const timeToSave = minwonDetail.time || (modalData && modalData.time);

    if (modalData && timeToSave) {
      const existingTimeline = [...planData.timeline]
      let index = -1
      
      let zone = 'school';
      let cat = 'minwon';
      let timelineCategory = modalData.category;

      if (modalData.zone) { 
          zone = modalData.zone;
          cat = modalData.category.replace(`${zone}_`, '');
          timelineCategory = `${zone}_${cat}`;
      } else {
          zone = modalData.category.startsWith('school') ? 'school' : 'personal';
          cat = modalData.category.replace(`${zone}_`, '');
          timelineCategory = modalData.category;
      }

      if (modalData.id || modalData.minwon_detail) {
        index = existingTimeline.findIndex(t => 
          (modalData.id && t.id === modalData.id) || 
          (!modalData.id && t.category === timelineCategory && t.time === (modalData.time || timeToSave) && t.minwon_detail?.title === modalData.minwon_detail?.title)
        )
      }
      
      let removedContent = null;

      if (minwonDetail.delete) {
        if (index >= 0) {
          removedContent = existingTimeline[index].minwon_detail.title;
          existingTimeline.splice(index, 1);
          updateTimeline(existingTimeline, null, zone, cat, removedContent);
        }
      } else {
        if (index >= 0) {
          removedContent = existingTimeline[index].minwon_detail.title;
        }

        const newEntry = {
          id: modalData.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          time: timeToSave,
          category: timelineCategory,
          minwon_detail: minwonDetail
        }

        if (index >= 0) {
          existingTimeline[index] = newEntry
        } else {
          existingTimeline.push(newEntry)
        }
        
        updateTimeline(existingTimeline, minwonDetail.title, zone, cat, removedContent)
      }
    } else if (modalData && modalData.zone) {
      // Just update summary if no time is provided
      let newSummary = JSON.parse(JSON.stringify(planData.summary))
      const currentList = newSummary[modalData.zone][modalData.category] || []
      const exists = currentList.some(item => (item.title || item) === minwonDetail.title)
      if (!exists && currentList.length < 5) {
        newSummary[modalData.zone][modalData.category] = [...currentList, minwonDetail.title]
        const newData = {
          ...planData,
          summary: newSummary
        }
        savePlanData(newData)
      }
    }
    closeModal()
  }

  // CSV 다운로드 핸들러
  const handleDownloadCSV = () => {
    const headers = ['시간', '분류', '내용/제목'];
    
    const categoryMap = {
      'school_main': '주요일정(학교)',
      'school_gongmun': '처리업무(공문)',
      'school_minwon': '처리업무(민원)',
      'personal_main': '주요일정(개인)',
      'personal_health_diet': '건강(식사)',
      'personal_health_exercise': '건강(운동)',
      'personal_gratitude': '감사일기'
    };

    const rows = planData.timeline.map(item => {
      let content = item.content || '';
      if (item.category === 'school_minwon' && item.minwon_detail) {
        content = item.minwon_detail.title || '';
      }
      const escapedContent = `"${content.replace(/"/g, '""')}"`;
      const catName = categoryMap[item.category] || item.category;
      
      return `${item.time},${catName},${escapedContent}`;
    });

    rows.sort();

    const csvContent = "\uFEFF" + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `planner_${dateString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("로그인 실패:", error)
      alert("로그인에 실패했습니다. 다시 시도해주세요.")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("로그아웃 실패:", error)
    }
  }

  const handleSettingsSave = async (newSettings) => {
    setUserSettings(newSettings);
    if (user) {
      try {
        const docRef = doc(db, "users", user.uid, "settings", "preferences");
        await setDoc(docRef, newSettings, { merge: true });
      } catch (error) {
        console.error("Error saving settings: ", error);
      }
    }
    closeModal();
  }

  if (isAuthLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#7cb342' }}>로딩중... (Loading)</div>
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
        <img src="/tree_logo.png" alt="SSAM Tree" style={{ width: '150px', height: '150px', marginBottom: '20px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
        <h1 style={{ color: '#7cb342', marginBottom: '10px', fontSize: '2rem' }}>쌤트리 (SSAM Tree)</h1>
        <p style={{ marginBottom: '10px', color: '#666' }}>나만의 학교 & 개인 일정 관리 마법사 ✨</p>
        <p style={{ marginBottom: '30px', color: '#888', fontSize: '0.95rem' }}>하루하루가 쌓여 열매를 맺는 공간 🌳</p>
        <button 
          onClick={handleLogin}
          style={{ padding: '12px 24px', fontSize: '1.1rem', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
        >
          <svg width="24" height="24" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google 계정으로 로그인
        </button>
        <div style={{ position: 'absolute', bottom: '20px', color: '#999', fontSize: '0.8rem' }}>
          저작권: &copy; 2026 Hyunsil_ORION. All rights reserved.
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {isDataLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: '#7cb342', fontWeight: 'bold' }}>데이터 불러오는 중...</div>
        </div>
      )}
      <Header currentDate={currentDate} setCurrentDate={setCurrentDate} onDownloadCSV={handleDownloadCSV} onLogout={handleLogout} user={user} onOpenSettings={() => openModal('settings')} />
      
      <SummaryGrid 
        summary={planData.summary} 
        updateSummary={updateSummary} 
        openMinwonModal={(data) => openModal('minwon', data)} 
        openScheduleModal={(data) => openModal('schedule', data)}
        userSettings={userSettings}
      />
      
      <Timeline 
        timeline={planData.timeline} 
        updateTimeline={updateTimeline}
        openModal={openModal}
        userSettings={userSettings}
      />

      {modalType === 'minwon' && (
        <MinwonModal 
          onClose={closeModal} 
          onSave={handleMinwonSave}
          initialData={modalData}
        />
      )}
      
      {modalType === 'schedule' && (
        <ScheduleModal 
          onClose={closeModal} 
          onSave={handleScheduleSave}
          initialData={modalData}
        />
      )}

      {modalType === 'settings' && (
        <SettingsModal 
          onClose={closeModal} 
          onSave={handleSettingsSave}
          initialSettings={userSettings}
        />
      )}

      <footer className="footer">
        저작권: &copy; 2026 Hyunsil_ORION. All rights reserved.
      </footer>
    </div>
  )
}

export default App
