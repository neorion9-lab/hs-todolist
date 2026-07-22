import { useState, useEffect } from 'react'
import Header from './components/Header'
import SummaryGrid from './components/SummaryGrid'
import Timeline from './components/Timeline'
import MinwonModal from './components/MinwonModal'

// 기본 데이터 구조
const defaultData = {
  summary: {
    school: { main: [], gongmun: [], minwon: [] },
    personal: { main: [], health_diet: [], health_exercise: [], gratitude: [] }
  },
  timeline: [],
  customMinutes: {}
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [planData, setPlanData] = useState(defaultData)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
  const updateTimeline = (newTimelineItems) => {
    const newData = {
      ...planData,
      timeline: newTimelineItems
    }
    savePlanData(newData)
  }

  // 타임라인 분 설정 업데이트 핸들러
  const updateCustomMinutes = (newCustomMinutes) => {
    const newData = {
      ...planData,
      customMinutes: newCustomMinutes
    }
    savePlanData(newData)
  }

  // 모달 제어
  const openMinwonModal = (initialData = null) => {
    setModalData(initialData)
    setIsModalOpen(true)
  }
  const closeMinwonModal = () => {
    setIsModalOpen(false)
    setModalData(null)
  }

  // 민원 저장 핸들러
  const handleMinwonSave = (minwonDetail) => {
    // 타임라인 업데이트 로직 (모달 데이터에 time, category가 있다고 가정)
    if (modalData && modalData.time) {
      const existingTimeline = [...planData.timeline]
      const index = existingTimeline.findIndex(
        (t) => t.time === modalData.time && t.category === modalData.category
      )
      
      const newEntry = {
        time: modalData.time,
        category: modalData.category,
        minwon_detail: minwonDetail
      }

      if (index >= 0) {
        existingTimeline[index] = newEntry
      } else {
        existingTimeline.push(newEntry)
      }
      updateTimeline(existingTimeline)
    }
    closeMinwonModal()
  }

  return (
    <div className="container">
      <Header currentDate={currentDate} setCurrentDate={setCurrentDate} />
      
      <SummaryGrid 
        summary={planData.summary} 
        updateSummary={updateSummary} 
        openMinwonModal={openMinwonModal}
      />
      
      <Timeline 
        timeline={planData.timeline} 
        updateTimeline={updateTimeline}
        openMinwonModal={openMinwonModal}
        customMinutes={planData.customMinutes || {}}
        updateCustomMinutes={updateCustomMinutes}
      />

      {isModalOpen && (
        <MinwonModal 
          onClose={closeMinwonModal} 
          onSave={handleMinwonSave}
          initialData={modalData}
        />
      )}
    </div>
  )
}

export default App
