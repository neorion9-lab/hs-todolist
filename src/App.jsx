import { useState, useEffect } from 'react'
import Header from './components/Header'
import SummaryGrid from './components/SummaryGrid'
import Timeline from './components/Timeline'
import MinwonModal from './components/MinwonModal'
import ScheduleModal from './components/ScheduleModal'

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

  const dateString = currentDate.toISOString().split('T')[0]

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
  const updateTimeline = (newTimelineItems, addedContent = null, zone = null, category = null) => {
    let newSummary = { ...planData.summary }

    if (addedContent && zone && category) {
      const currentList = newSummary[zone][category] || []
      const exists = currentList.some(item => (item.title || item) === addedContent)
      if (!exists && currentList.length < 5) {
        newSummary = {
          ...newSummary,
          [zone]: {
            ...newSummary[zone],
            [category]: [...currentList, addedContent]
          }
        }
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
        existingTimeline.splice(index, 1)
        updateTimeline(existingTimeline)
      }
    } else {
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
      
      const zone = data.category.startsWith('school') ? 'school' : 'personal'
      const cat = data.category.replace(`${zone}_`, '')
      updateTimeline(existingTimeline, data.content, zone, cat)
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
      
      const zone = modalData.category.startsWith('school') ? 'school' : 'personal'
      const cat = modalData.category.replace(`${zone}_`, '')
      updateTimeline(existingTimeline, minwonDetail.title, zone, cat)
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

  return (
    <div className="container">
      <Header currentDate={currentDate} setCurrentDate={setCurrentDate} onDownloadCSV={handleDownloadCSV} />
      
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
