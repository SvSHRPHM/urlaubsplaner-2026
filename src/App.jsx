import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, LogOut } from 'lucide-react';

const UrlaubsPlaner = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [requests, setRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '', workingSaturdayDates: [] });
  const [viewMode, setViewMode] = useState('personal');
  const [visibleEmployees, setVisibleEmployees] = useState({});
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const [showSaturdayQuestion, setShowSaturdayQuestion] = useState(false);
  const [saturdayInRange, setSaturdayInRange] = useState([]);
  const [globalMessage, setGlobalMessage] = useState('');

  const colleagues = [
    { id: 1, name: 'Zafiriadis, Kosta', role: 'shiftleader', color: '#82E0AA' },
    { id: 2, name: 'Schilling, Matthias', role: 'deputy shiftleader', color: '#4ECDC4' },
    { id: 3, name: 'Heinz, Mara', role: 'employee', color: '#45B7D1' },
    { id: 4, name: 'Krieger, Jan', role: 'employee', color: '#FFA07A' },
    { id: 5, name: 'Majer, Michael', role: 'employee', color: '#98D8C8' },
    { id: 6, name: 'Müller, Matthias', role: 'employee', color: '#F7DC6F' },
    { id: 7, name: 'Ruess, Hans-Peter', role: 'employee', color: '#BB8FCE' },
    { id: 8, name: 'Scholz, Sven', role: 'employee', color: '#85C1E2' },
    { id: 9, name: 'Tscheuschner, Michael', role: 'employee', color: '#FF6B6B' },
    { id: 10, name: 'Schwenk, Daniel', role: 'employee', color: '#F8B88B' },
    { id: 11, name: 'Zipperer, Florian', role: 'employee', color: '#D7BDE2' },
  ];

  const holidays2026 = [
    { date: '2026-01-01', name: 'Neujahrstag' },
    { date: '2026-01-06', name: 'Heilige Drei Könige' },
    { date: '2026-04-10', name: 'Karfreitag' },
    { date: '2026-04-13', name: 'Ostermontag' },
    { date: '2026-05-01', name: 'Tag der Arbeit' },
    { date: '2026-05-21', name: 'Christi Himmelfahrt' },
    { date: '2026-06-01', name: 'Pfingstmontag' },
    { date: '2026-06-11', name: 'Fronleichnam' },
    { date: '2026-08-15', name: 'Mariä Himmelfahrt' },
    { date: '2026-10-03', name: 'Tag der Deutschen Einheit' },
    { date: '2026-10-31', name: 'Reformationstag' },
    { date: '2026-11-01', name: 'Allerheiligen' },
    { date: '2026-11-18', name: 'Buß- und Bettag' },
    { date: '2026-12-25', name: '1. Weihnachtstag' },
    { date: '2026-12-26', name: '2. Weihnachtstag' },
  ];

  const schoolHolidays2026 = [
    { start: '2026-02-16', end: '2026-02-20', name: 'Faschingsferien' },
    { start: '2026-03-30', end: '2026-04-10', name: 'Osterferien' },
    { start: '2026-05-26', end: '2026-06-05', name: 'Pfingstferien' },
    { start: '2026-07-30', end: '2026-09-12', name: 'Sommerferien' },
    { start: '2026-10-26', end: '2026-10-31', name: 'Herbstferien' },
    { start: '2026-12-23', end: '2027-01-09', name: 'Weihnachtsferien' },
  ];

  const isHoliday = (dateStr) => holidays2026.some(h => h.date === dateStr);
  const isSchoolHoliday = (dateStr) => schoolHolidays2026.some(h => dateStr >= h.start && dateStr <= h.end);
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const countBusinessDays = (start, end, workingSats = []) => {
    let count = 0;
    const current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getDay();
      const isSaturday = dayOfWeek === 6;
      const isSunday = dayOfWeek === 0;
      const isWorkingSat = workingSats && workingSats.includes(dateStr);
      
      if (!isHoliday(dateStr) && !isSchoolHoliday(dateStr)) {
        if (!isSunday && (isSaturday ? isWorkingSat : true)) {
          count++;
        }
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const getVacationDays = (userId) => {
    const userRequests = requests.filter(r => r.userId === userId && r.status === 'approved');
    return userRequests.reduce((sum, r) => sum + countBusinessDays(r.startDate, r.endDate, r.workingSaturdayDates || []), 0);
  };

  const getSaturdaysInRange = (start, end) => {
    const saturdays = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      if (current.getDay() === 6) {
        saturdays.push(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    return saturdays;
  };

  const handleDateClick = (day) => {
    const dateStr = `2026-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (!selectedDates.start) {
      setSelectedDates({ start: dateStr, end: null });
    } else if (!selectedDates.end) {
      if (dateStr >= selectedDates.start) {
        const sats = getSaturdaysInRange(selectedDates.start, dateStr);
        setSelectedDates({ start: selectedDates.start, end: dateStr });
        
        if (sats.length > 0) {
          setSaturdayInRange(sats);
          setFormData({ ...formData, workingSaturdayDates: [] });
          setShowSaturdayQuestion(true);
        } else {
          setFormData({
            ...formData,
            startDate: selectedDates.start,
            endDate: dateStr,
            workingSaturdayDates: []
          });
        }
      } else {
        setGlobalMessage('❌ Enddatum muss nach Startdatum liegen');
        setTimeout(() => setGlobalMessage(''), 3000);
      }
    } else {
      setSelectedDates({ start: dateStr, end: null });
    }
  };

  const handleSaturdayAnswer = (workingSats) => {
    setFormData({
      ...formData,
      startDate: selectedDates.start,
      endDate: selectedDates.end,
      workingSaturdayDates: workingSats
    });
    setShowSaturdayQuestion(false);
  };

  const handleRequestSubmit = () => {
    if (!formData.startDate || !formData.endDate) {
      setGlobalMessage('❌ Bitte Start- und Enddatum auswählen');
      setTimeout(() => setGlobalMessage(''), 3000);
      return;
    }

    const daysRequested = countBusinessDays(formData.startDate, formData.endDate, formData.workingSaturdayDates);
    const daysRemaining = 39 - getVacationDays(currentUser.id);

    if (daysRequested > daysRemaining) {
      setGlobalMessage(`❌ Sie beantragen ${daysRequested} Tage, haben aber nur noch ${daysRemaining} Tage übrig.`);
      setTimeout(() => setGlobalMessage(''), 3000);
      return;
    }

    const newRequest = {
      id: Date.now(),
      userId: currentUser.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      workingSaturdayDates: formData.workingSaturdayDates || [],
      requestedAt: new Date().toLocaleDateString('de-DE'),
    };
    setRequests([...requests, newRequest]);
    setFormData({ startDate: '', endDate: '', reason: '', workingSaturdayDates: [] });
    setShowRequestForm(false);
    setSelectedDates({ start: null, end: null });
    setGlobalMessage(`✅ Urlaubsantrag (${daysRequested} Tage) erfolgreich eingereicht.`);
    setTimeout(() => setGlobalMessage(''), 3000);
  };

  const approveRequest = (requestId) => {
    setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
  };

  const rejectRequest = (requestId) => {
    setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
  };

  useEffect(() => {
    const initialVisible = {};
    colleagues.forEach(c => {
      initialVisible[c.id] = true;
    });
    setVisibleEmployees(initialVisible);
  }, []);

  const toggleEmployeeVisibility = (employeeId) => {
    setVisibleEmployees(prev => ({ ...prev, [employeeId]: !prev[employeeId] }));
  };

  const getMonthCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, 2026);
    const firstDay = getFirstDayOfMonth(selectedMonth, 2026);
    const days = [];
    const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const countVacationsOnDate = (dateStr) => {
    return requests.filter(r => r.status === 'approved' && dateStr >= r.startDate && dateStr <= r.endDate).length;
  };

  const getCollisions = () => {
    const collisions = [];
    for (let d = 0; d < 366; d++) {
      const date = new Date(2026, 0, 1);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      const vacationsOnDate = requests.filter(r => visibleEmployees[r.userId] && r.status === 'approved' && dateStr >= r.startDate && dateStr <= r.endDate);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(dateStr) && vacationsOnDate.length > 1) {
        collisions.push({ dateStr, day: date.getDate(), month: date.getMonth(), vacations: vacationsOnDate });
      }
    }
    return collisions;
  };

  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="flex flex-col items-center mb-8">
              <Calendar className="text-red-600 mb-3" size={40} />
              <h1 className="text-3xl font-extrabold text-gray-900">Urlaubsplaner A-Schicht 2026</h1>
              <p className="text-lg text-gray-500">Ihre Werkbank für die Urlaubsplanung</p>
            </div>
            <p className="text-center text-gray-600 mb-6 font-semibold">Bitte wählen Sie Ihre Kennung:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colleagues.map(colleague => (
                <button
                  key={colleague.id}
                  onClick={() => setCurrentUser(colleague)}
                  className={`p-4 text-center border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-red-50 hover:border-red-500 transition shadow-sm ${colleague.role === 'shiftleader' ? 'border-indigo-400 bg-indigo-50 font-bold' : ''}`}
                >
                  <div className="font-semibold text-gray-800">{colleague.name.split(',')[1]?.trim() || colleague.name}</div>
                  <div className="text-xs text-gray-500">{colleague.role === 'shiftleader' ? 'Schichtleitung' : 'Mitarbeiter'}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-8">
          {globalMessage && (
            <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-xl z-50">
              {globalMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <Calendar className="text-red-600 mr-3 hidden sm:block" size={36} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Urlaubsplaner A-Schicht 2026</h1>
                <p className="text-gray-600 text-sm">Angemeldet als: <span className="font-semibold">{currentUser.name}</span></p>
              </div>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-red-100 border border-gray-300 transition text-sm"
            >
              <LogOut size={16} /> Abmelden
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode('personal')}
              className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm ${viewMode === 'personal' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Persönliche Ansicht
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm ${viewMode === 'overview' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Gesamtkalender & Kollisionen
            </button>
          </div>

          {viewMode === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{monthNames[selectedMonth]} 2026</h2>
                  <div className="flex gap-2">
                    <button onClick={() => selectedMonth > 0 && setSelectedMonth(selectedMonth - 1)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50" disabled={selectedMonth === 0}>←</button>
                    <button onClick={() => selectedMonth < 11 && setSelectedMonth(selectedMonth + 1)} className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50" disabled={selectedMonth === 11}>→</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center font-bold text-gray-600 py-1 text-sm">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {getMonthCalendar().map((day, idx) => {
                    if (!day) return <div key={idx} className="h-12" />;
                    const dateStr = `2026-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayOfWeek = new Date(dateStr).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isHol = isHoliday(dateStr);
                    const isSchool = isSchoolHoliday(dateStr);
                    const isUserVacation = requests.some(r => r.userId === currentUser.id && r.status === 'approved' && dateStr >= r.startDate && dateStr <= r.endDate);
                    const isSelected = selectedDates.start === dateStr || selectedDates.end === dateStr;
                    const isInRange = selectedDates.start && selectedDates.end && dateStr >= selectedDates.start && dateStr <= selectedDates.end;

                    let bgColor = 'bg-white';
                    let textColor = 'text-gray-800';
                    
                    if (isUserVacation) {
                      bgColor = 'bg-yellow-400/80';
                    } else if (isHol) {
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-700 font-bold';
                    } else if (isSchool) {
                      bgColor = 'bg-blue-100';
                      textColor = 'text-blue-700';
                    } else if (isWeekend) {
                      bgColor = 'bg-gray-200';
                    }
                    
                    if (isInRange) bgColor = 'bg-blue-300';
                    if (isSelected) bgColor = 'bg-blue-600 text-white';

                    return (
                      <div key={day} onClick={() => handleDateClick(day)} className={`h-12 flex items-center justify-center rounded-lg text-sm font-semibold border cursor-pointer hover:opacity-80 transition ${bgColor} ${textColor}`}>
                        {day}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 border border-gray-300 rounded" /><span>Mein Urlaub</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 border border-red-300 rounded" /><span>Feiertag</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" /><span>Schulferien</span></div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-red-500" /> Urlaubskontingent</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2"><p className="text-sm text-gray-600">Tariflicher Urlaub</p><p className="text-xl font-bold text-red-600">30 Tage</p></div>
                    <div className="flex justify-between items-center border-b pb-2"><p className="text-sm text-gray-600">Zusatztage / T-ZUG</p><p className="text-xl font-bold text-red-600">9 Tage</p></div>
                    <hr className="my-3" />
                    <div className="flex justify-between items-center"><p className="text-sm text-gray-600">Gesamt verfügbar</p><p className="text-2xl font-bold text-green-700">39 Tage</p></div>
                    <div className="flex justify-between items-center"><p className="text-sm text-gray-600">Genehmigte Tage</p><p className="text-2xl font-bold text-orange-600">{getVacationDays(currentUser.id)} Tage</p></div>
                    <div className="flex justify-between items-center pt-2 border-t mt-2"><p className="text-sm text-gray-600">Verbleibend</p><p className="text-3xl font-extrabold text-red-800">{39 - getVacationDays(currentUser.id)}</p></div>
                  </div>
                </div>

                <button onClick={() => setShowRequestForm(!showRequestForm)} className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">
                  {showRequestForm ? 'Antrag abbrechen' : 'Urlaub beantragen'}
                </button>

                {showRequestForm && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <p className="text-base font-semibold text-gray-700 mb-3">Neuer Urlaubsantrag - Klicken Sie auf Daten im Kalender</p>
                    <div className="mb-3 p-2 bg-white rounded border border-gray-300">
                      <p className="text-xs text-gray-600">Start: <span className="font-bold">{formData.startDate || 'Nicht gewählt'}</span></p>
                      <p className="text-xs text-gray-600">Ende: <span className="font-bold">{formData.endDate || 'Nicht gewählt'}</span></p>
                      {formData.startDate && formData.endDate && (
                        <p className="text-xs font-bold text-blue-600 mt-2">Gesamt: {countBusinessDays(formData.startDate, formData.endDate, formData.workingSaturdayDates)} Tage</p>
                      )}
                    </div>
                    <input type="text" placeholder="Grund (z.B. Familienurlaub)" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-sm" />
                    <button onClick={handleRequestSubmit} disabled={!formData.startDate || !formData.endDate} className="w-full px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 text-sm disabled:opacity-50">
                      Antrag absenden
                    </button>
                  </div>
                )}

                {showSaturdayQuestion && (
                  <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Arbeiten Sie an einem Samstag?</p>
                    <div className="space-y-2 mb-3">
                      {saturdayInRange.map(sat => (
                        <label key={sat} className="flex items-center gap-2">
                          <input type="checkbox" value={sat} onChange={(e) => { if (e.target.checked) { setFormData({ ...formData, workingSaturdayDates: [...(formData.workingSaturdayDates || []), sat] }); } else { setFormData({ ...formData, workingSaturdayDates: (formData.workingSaturdayDates || []).filter(d => d !== sat) }); } }} className="w-4 h-4" />
                          <span className="text-sm text-gray-700">{sat}</span>
                        </label>
                      ))}
                    </div>
                    <button onClick={() => handleSaturdayAnswer(formData.workingSaturdayDates || [])} className="w-full px-3 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 text-sm">
                      Bestätigen
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Gesamtkalender 2026 - Jahresübersicht</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-gray-200">
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 12 }, (_, monthIdx) => {
                      const monthDays = getDaysInMonth(monthIdx, 2026);
                      const firstDay = getFirstDayOfMonth(monthIdx, 2026);
                      const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
                      const calendarDays = [];
                      for (let i = 0; i < startOffset; i++) calendarDays.push(null);
                      for (let i = 1; i <= monthDays; i++) calendarDays.push(i);
                      
                      return (
                        <div key={monthIdx} className="border border-gray-300 bg-white rounded-lg p-2">
                          <h4 className="text-center font-bold text-xs mb-1 text-gray-700">{monthNames[monthIdx]}</h4>
                          <div className="grid grid-cols-7 gap-0.5">
                            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
                              <div key={d} className="text-center text-xs font-bold text-gray-400 w-5">{d[0]}</div>
                            ))}
                            {calendarDays.map((day, idx) => {
                              if (!day) return <div key={`empty-${idx}`} className="w-5 h-5" />;
                              const dateStr = `2026-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const dayOfWeek = new Date(dateStr).getDay();
                              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                              const isHol = isHoliday(dateStr);
                              const isSchool = isSchoolHoliday(dateStr);
                              const visibleVacations = requests.filter(v => visibleEmployees[v.userId] && v.status === 'approved' && dateStr >= v.startDate && dateStr <= v.endDate);
                              const totalVacationsOnDate = countVacationsOnDate(dateStr);
                              const isCollision = totalVacationsOnDate > 1 && visibleVacations.length > 0;
                              
                              let bgColor = 'bg-white';
                              if (visibleVacations.length > 0) {
                                bgColor = isCollision ? 'bg-red-500 text-white' : 'bg-yellow-300';
                              } else if (isHol) {
                                bgColor = 'bg-red-100';
                              } else if (isSchool) {
                                bgColor = 'bg-blue-100';
                              } else if (isWeekend) {
                                bgColor = 'bg-gray-200';
                              }
                              
                              return (
                                <div key={day} onMouseEnter={() => setHoveredDate({ day, monthIdx, dateStr, vacations: visibleVacations })} onMouseLeave={() => setHoveredDate(null)} className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold border border-gray-300 cursor-pointer relative group ${bgColor}`}>
                                  {visibleVacations.length > 0 ? visibleVacations.length : ''}
                                  {hoveredDate && hoveredDate.dateStr === dateStr && visibleVacations.length > 0 && (
                                    <div className="absolute left-0 top-full mt-1 bg-gray-800 text-white text-xs rounded p-2 whitespace-nowrap z-50 shadow-lg">
                                      <div className="font-bold mb-1">{day}. {monthNames[monthIdx]}</div>
                                      {visibleVacations.map(v => {
                                        const emp = colleagues.find(c => c.id === v.userId);
                                        return <div key={v.id} className="py-0.5">{emp?.name}</div>;
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-300">
                  <h4 className="font-bold text-red-800 mb-3 text-lg">⚠️ Kollisionen 2026</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getCollisions().length > 0 ? (
                      getCollisions().map((collision) => {
                        const employeeNames = collision.vacations.map(v => {
                          const emp = colleagues.find(c => c.id === v.userId);
                          return emp?.name;
                        }).join(', ');
                        return (
                          <div key={collision.dateStr} className="bg-white p-2 rounded border border-red-200 text-sm">
                            <div className="font-semibold text-red-700">{collision.day}. {monthNames[collision.month]}</div>
                            <div className="text-gray-700 text-xs">{employeeNames}</div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-600 italic">Keine Kollisionen gefunden ✓</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-yellow-300 border border-gray-300 rounded" /><span>Urlaub (1 Person)</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-red-500 border border-gray-300 rounded" /><span>Kollision (mehrere)</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-red-100 border border-red-300 rounded" /><span>Feiertag</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded" /><span>Schulferien</span></div>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 mt-6">
                <h4 className="font-bold text-gray-800 mb-3">Mitarbeiter anzeigen/verbergen:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {colleagues.map(colleague => (
                    <button key={colleague.id} onClick={() => toggleEmployeeVisibility(colleague.id)} className={`p-2 rounded text-xs font-semibold flex items-center gap-1 transition ${visibleEmployees[colleague.id] ? 'bg-blue-300 text-gray-800' : 'bg-gray-300 text-gray-600 opacity-50'}`}>
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: colleague.color }} />
                      <span>{colleague.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {currentUser.role === 'shiftleader' ? 'Alle Urlaubsanträge' : 'Meine Anträge'}
            </h3>
            <div className="space-y-3">
              {requests.filter(r => currentUser.role === 'shiftleader' || r.userId === currentUser.id).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map(request => {
                const employee = colleagues.find(c => c.id === request.userId);
                const statusColors = { pending: 'border-orange-400 bg-orange-50 text-orange-700', approved: 'border-green-400 bg-green-50 text-green-700', rejected: 'border-red-400 bg-red-50 text-red-700' };
                return (
                  <div key={request.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-l-4 shadow-sm ${statusColors[request.status]}`}>
                    <div className="flex-1 mb-3 sm:mb-0">
                      <p className="font-bold text-gray-800">{employee?.name} {currentUser.role === 'shiftleader' && <span className="text-xs font-normal text-gray-500 ml-2">({request.startDate} bis {request.endDate})</span>}</p>
                      <p className="text-sm font-semibold">{request.startDate} bis {request.endDate} <span className="text-xs font-normal bg-gray-200 px-2 py-0.5 rounded-full ml-3">{countBusinessDays(request.startDate, request.endDate, request.workingSaturdayDates)} Arbeitstage</span></p>
                      {request.reason && <p className="text-xs text-gray-600 truncate mt-1">Grund: {request.reason}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {request.status === 'pending' && <div className="flex items-center gap-1 font-semibold text-orange-600"><Clock size={16} /> Ausstehend</div>}
                      {request.status === 'approved' && <div className="flex items-center gap-1 font-semibold text-green-600"><CheckCircle size={16} /> Genehmigt</div>}
                      {request.status === 'rejected' && <div className="flex items-center gap-1 font-semibold text-red-600"><AlertCircle size={16} /> Abgelehnt</div>}
                      {currentUser.role === 'shiftleader' && request.status === 'pending' && (
                        <div className="flex gap-2 ml-2">
                          <button onClick={() => approveRequest(request.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">✓ Genehmigen</button>
                          <button onClick={() => rejectRequest(request.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">✗ Ablehnen</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {requests.filter(r => currentUser.role === 'shiftleader' || r.userId === currentUser.id).length === 0 && (
                <p className="text-center text-gray-500 py-8">Keine Anträge vorhanden</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlaubsPlaner;
