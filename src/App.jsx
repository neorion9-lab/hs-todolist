import { useState, useEffect } from 'react'
import Header from './components/Header'
import SummaryGrid from './components/SummaryGrid'
import Timeline from './components/Timeline'
import MinwonModal from './components/MinwonModal'
import ScheduleModal from './components/ScheduleModal'
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from './firebase'

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
  const [modalType, setModalType] = useState(null) // 'minwon' | 'schedule' | null
  const [modalData, setModalData] = useState(null) // 선택된 타임라인이나 민원 데이터
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const dateString = currentDate.toISOString().split('T')[0]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 날짜 변경 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedData = localStorage.getItem(`planner_${dateString}`)
    if (savedData) {
      setPlanData(JSON.parse(savedData))
    } else {
      setPlanData(defaultData)
    }
  }, [dateString])

  // 데이터 변경 시 로컬 스토리지에 저장
  const savePlanData = (newData) => {
    setPlanData(newData)
    localStorage.setItem(`planner_${dateString}`, JSON.stringify(newData))
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
    const existingTimeline = [...planData.timeline]
    
    let index = -1
    if (modalData && (modalData.id || modalData.content)) {
      index = existingTimeline.findIndex(t => 
        (modalData.id && t.id === modalData.id) || 
        (!modalData.id && t.category === modalData.category && t.time === modalData.time && t.content === modalData.content)
      )
    }

    if (data.delete) {
      if (index >= 0) {
        const deletedEntry = existingTimeline[index];
        const zone = deletedEntry.category.startsWith('school') ? 'school' : 'personal';
        const cat = deletedEntry.category.replace(`${zone}_`, '');

        existingTimeline.splice(index, 1)
        updateTimeline(existingTimeline, null, zone, cat, deletedEntry.content)
      }
    } else {
      let removedContent = null;
      const zone = data.category.startsWith('school') ? 'school' : 'personal';
      const cat = data.category.replace(`${zone}_`, '');

      if (index >= 0) {
        removedContent = existingTimeline[index].content;
      }

      const newEntry = {
        id: data.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        time: data.time,
        category: data.category,
        content: data.content
      }
      if (index >= 0) {
        existingTimeline[index] = newEntry
      } else {
        existingTimeline.push(newEntry)
      }
      
      updateTimeline(existingTimeline, data.content, zone, cat, removedContent)
    }
    closeModal()
  }

  // 민원 저장 핸들러
  const handleMinwonSave = (minwonDetail) => {
    // 타임라인 업데이트 로직 (모달 데이터에 time, category가 있다고 가정)
    if (modalData && modalData.time) {
      const existingTimeline = [...planData.timeline]
      let index = -1
      if (modalData.id || modalData.minwon_detail) {
        index = existingTimeline.findIndex(t => 
          (modalData.id && t.id === modalData.id) || 
          (!modalData.id && t.category === modalData.category && t.time === modalData.time && t.minwon_detail?.title === modalData.minwon_detail?.title)
        )
      }
      
      let removedContent = null;
      const zone = modalData.category.startsWith('school') ? 'school' : 'personal';
      const cat = modalData.category.replace(`${zone}_`, '');

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
          time: modalData.time,
          category: modalData.category,
          minwon_detail: minwonDetail
        }

        if (index >= 0) {
          existingTimeline[index] = newEntry
        } else {
          existingTimeline.push(newEntry)
        }
        
        updateTimeline(existingTimeline, minwonDetail.title, zone, cat, removedContent)
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

  if (isAuthLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#7cb342' }}>로딩중... (Loading)</div>
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
        <h1 style={{ color: '#7cb342', marginBottom: '10px', fontSize: '2rem' }}>초초 플래너 (Chocho Planner)</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>나만의 학교 & 개인 일정 관리 마법사 ✨</p>
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
      </div>
    )
  }

  return (
    <div className="container">
      <Header currentDate={currentDate} setCurrentDate={setCurrentDate} onDownloadCSV={handleDownloadCSV} onLogout={handleLogout} user={user} />
      
      <SummaryGrid 
        summary={planData.summary} 
        updateSummary={updateSummary} 
        openMinwonModal={(data) => openModal('minwon', data)}
      />
      
      <Timeline 
        timeline={planData.timeline} 
        updateTimeline={updateTimeline}
        openModal={openModal}
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

      <footer className="footer">
        저작권: &copy; 2026 Hyunsil_ORION. All rights reserved.
      </footer>
    </div>
  )
}

export default App
