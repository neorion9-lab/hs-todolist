import React, { useState } from 'react'

const SummaryGrid = ({ summary, updateSummary, openMinwonModal }) => {
  const [inputs, setInputs] = useState({
    school_main: '', school_gongmun: '', school_minwon: '',
    personal_main: '', personal_health_diet: '', personal_health_exercise: '', personal_gratitude: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  const handleAdd = (zone, category, inputName) => {
    const val = inputs[inputName].trim()
    if (!val) return
    const currentList = summary[zone][category] || []
    if (currentList.length >= 5) {
      alert('최대 5개까지만 입력할 수 있습니다.')
      return
    }
    
    // 민원 영역이면 바로 모달을 열어 상세 정보 입력 유도
    if (category === 'minwon') {
      openMinwonModal({ zone, category, defaultTitle: val })
    } else {
      updateSummary(zone, category, [...currentList, val])
    }
    
    setInputs(prev => ({ ...prev, [inputName]: '' }))
  }

  const handleKeyPress = (e, zone, category, inputName) => {
    if (e.key === 'Enter') {
      handleAdd(zone, category, inputName)
    }
  }

  const handleDelete = (zone, category, index) => {
    const currentList = summary[zone][category]
    const newList = [...currentList]
    newList.splice(index, 1)
    updateSummary(zone, category, newList)
  }

  return (
    <div className="grid-container">
      {/* 학교 요약 */}
      <div className="school-zone">
        <h2 className="section-title">학교 (School)</h2>
        <div className="grid-row">
          <Column zone="school" category="main" title="주요일정" inputName="school_main" summary={summary} inputs={inputs} handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleAdd={handleAdd} handleDelete={handleDelete} />
          <Column zone="school" category="gongmun" title="처리업무(공문)" inputName="school_gongmun" summary={summary} inputs={inputs} handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleAdd={handleAdd} handleDelete={handleDelete} />
          <Column zone="school" category="minwon" title="처리업무(민원)" inputName="school_minwon" summary={summary} inputs={inputs} handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleAdd={handleAdd} handleDelete={handleDelete} />
        </div>
      </div>

      {/* 개인 요약 */}
      <div className="personal-zone">
        <h2 className="section-title">개인 (Personal)</h2>
        <div className="grid-row">
          <Column zone="personal" category="main" title="주요일정" inputName="personal_main" summary={summary} inputs={inputs} handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleAdd={handleAdd} handleDelete={handleDelete} />
          <Column zone="personal" category="health_diet" title="건강(식사)" inputName="personal_health_diet" summary={summary} inputs={inputs} handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleAdd={handleAdd} handleDelete={handleDelete} />
          <Column zone="personal" category="health_exercise" title="건강(운동)" inputName="personal_health_exercise" summary={summary} inputs={inputs} handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleAdd={handleAdd} handleDelete={handleDelete} />
          <Column zone="personal" category="gratitude" title="감사일기" inputName="personal_gratitude" summary={summary} inputs={inputs} handleInputChange={handleInputChange} handleKeyPress={handleKeyPress} handleAdd={handleAdd} handleDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

const Column = ({ zone, category, title, inputName, summary, inputs, handleInputChange, handleKeyPress, handleAdd, handleDelete }) => {
  const items = summary[zone][category] || []
  return (
    <div className="grid-col">
      <div className="col-header">{title}</div>
      <div className="col-content">
        {items.map((item, idx) => (
          <div key={idx} className="item-row">
            <span>{idx + 1}.</span>
            <span style={{flex: 1}}>{item.title || item}</span>
            <button onClick={() => handleDelete(zone, category, idx)} style={{border: 'none', background: 'transparent', cursor: 'pointer', color: '#999'}}>X</button>
          </div>
        ))}
        {items.length < 5 && (
          <input 
            type="text" 
            className="input-field" 
            placeholder="추가 (Enter)" 
            name={inputName}
            value={inputs[inputName]}
            onChange={handleInputChange}
            onKeyPress={(e) => handleKeyPress(e, zone, category, inputName)}
          />
        )}
      </div>
    </div>
  )
}

export default SummaryGrid
