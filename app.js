/**
 * F16 智慧自動化排班系統 - 核心邏輯 (app.js)
 */

// 1. 預設資料庫初始化
const DEFAULT_GRADES = [
  { id: 'S', name: 'S 級 (最高階)', rank: 5, description: '可擔任所有等級班別，專責最高階班別' },
  { id: 'A', name: 'A 級 (次高階)', rank: 4, description: '可擔任 A、B、C、D 等級班別' },
  { id: 'B', name: 'B 級 (進階)', rank: 3, description: '可擔任 B、C、D 等級班別' },
  { id: 'C', name: 'C 級 (標準)', rank: 2, description: '可擔任 C、D 等級班別' },
  { id: 'D', name: 'D 級 (基礎)', rank: 1, description: '僅可擔任 D 級班別' }
];

const LEAVE_SHIFTS = [
  { id: '休', name: '休', label: '休假 (休)', bg: '#FFC7CE', text: '#9C0006', isLeave: true, minGrade: 'D', genderReq: 'ANY' },
  { id: '停', name: '停', label: '停休 (停)', bg: '#262626', text: '#FFFFFF', isLeave: true, minGrade: 'D', genderReq: 'ANY' },
  { id: '粉', name: '粉', label: '粉假 (粉)', bg: '#FCE4D6', text: '#C65911', isLeave: true, minGrade: 'D', genderReq: 'ANY' },
  { id: '綠', name: '綠', label: '綠假 (綠)', bg: '#C6EFCE', text: '#006100', isLeave: true, minGrade: 'D', genderReq: 'ANY' },
  { id: '藍', name: '藍', label: '藍假 (藍)', bg: '#BDD7EE', text: '#1F4E78', isLeave: true, minGrade: 'D', genderReq: 'ANY' }
];

const WORK_SHIFTS = [
  { id: '組', name: '組', label: '組長哨 (組)', bg: '#EDE9FE', text: '#5B21B6', isLeave: false, minGrade: 'S', genderReq: 'ANY', defaultDemand: 1 },
  { id: '中控', name: '中控', label: '中控監控 (中控)', bg: '#E0E7FF', text: '#3730A3', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 3 },
  { id: '機-1', name: '機-1', label: '機巡一組', bg: '#F1F5F9', text: '#1E293B', isLeave: false, minGrade: 'A', genderReq: 'ANY', defaultDemand: 1 },
  { id: '機-2', name: '機-2', label: '機巡二組', bg: '#F1F5F9', text: '#1E293B', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: '機-3', name: '機-3', label: '機巡三組', bg: '#F1F5F9', text: '#1E293B', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: '機-4', name: '機-4', label: '機巡四組', bg: '#F1F5F9', text: '#1E293B', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: '機動', name: '機動', label: '機動巡查', bg: '#F1F5F9', text: '#1E293B', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: '機巡', name: '機巡', label: '機動專巡', bg: '#F1F5F9', text: '#1E293B', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: '4F', name: '4F', label: '4樓一般哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 4 },
  { id: '4F-1', name: '4F-1', label: '4樓副哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 },
  { id: '5F', name: '5F', label: '5樓主哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: '2F', name: '2F', label: '2樓主哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: '5', name: '5', label: '5號哨點', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 1 },
  { id: '_1', name: '_1', label: '1號哨點', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 3 },
  { id: '_1F', name: '_1F', label: '1樓主哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 3 },
  { id: '_1F-1', name: '_1F-1', label: '1樓副哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 },
  { id: '_2', name: '_2', label: '2號哨點', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 1 },
  { id: '_2-1', name: '_2-1', label: '2號副哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 2 },
  { id: '_3', name: '_3', label: '3號哨點', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 3 },
  { id: '_4', name: '_4', label: '4號哨點', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 2 },
  { id: '_5', name: '_5', label: '5號哨點', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 4 },
  { id: '_6', name: '_6', label: '6號哨點', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 2 },
  { id: 'A1', name: 'A1', label: 'A1區域哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 },
  { id: 'A1m', name: 'A1m', label: 'A1m專用哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 1 },
  { id: 'A2', name: 'A2', label: 'A2區域哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 },
  { id: 'A2S', name: 'A2S', label: 'A2S特別哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'A', genderReq: 'ANY', defaultDemand: 2 },
  { id: 'L2', name: 'L2', label: 'L2連通道哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 },
  { id: 'LD', name: 'LD', label: 'LD大門哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 },
  { id: '9碼', name: '9碼', label: '9碼哨站', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'C', genderReq: 'ANY', defaultDemand: 2 },
  { id: '北', name: '北', label: '北側大門哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 },
  { id: '南', name: '南', label: '南側大門哨', bg: '#F8FAFC', text: '#0F172A', isLeave: false, minGrade: 'B', genderReq: 'ANY', defaultDemand: 2 }
];

const INITIAL_EMPLOYEES = [
  { id: 1, title: '組長', name: '羅乙弼', gender: 'M', grade: 'S', initialShifts: { '16': '組', '17': '組', '18': '組' } },
  { id: 2, title: '哨長', name: '袁國峻', gender: 'M', grade: 'A', initialShifts: { '16': '機-1', '17': '機-1', '18': '機-1' } },
  { id: 3, title: '哨長', name: '何峻岱', gender: 'M', grade: 'A', initialShifts: { '16': '休', '17': '休', '18': '' } },
  { id: 4, title: '哨長', name: '彭昱盛', gender: 'M', grade: 'A', initialShifts: { '16': '休', '17': '機-4', '18': '機-4' } },
  { id: 5, title: '哨長', name: '何佳燕', gender: 'F', grade: 'A', initialShifts: { '16': '機-4', '17': '休', '18': '4F' } },
  { id: 6, title: '哨長', name: '江純宜', gender: 'F', grade: 'A', initialShifts: { '16': '_1F', '17': '4F', '18': '_1F' } },
  { id: 7, title: '哨長', name: '游淑萍', gender: 'F', grade: 'A', initialShifts: { '16': '休', '17': '休', '18': '_1F' } },
  { id: 8, title: '保全員', name: '羅慧容', gender: 'F', grade: 'B', initialShifts: { '16': '綠', '17': '綠', '18': '綠' } },
  { id: 9, title: '保全員', name: '李宜芬', gender: 'F', grade: 'B', initialShifts: { '16': '機動', '17': '_1F', '18': '4F' } },
  { id: 10, title: '保全員', name: '王麗婷', gender: 'F', grade: 'B', initialShifts: { '16': '停', '17': '5F', '18': '北' } },
  { id: 11, title: '保全員', name: '陳佳伶', gender: 'F', grade: 'B', initialShifts: { '16': '4F', '17': 'LD', '18': '2F' } },
  { id: 12, title: '保全員', name: '羅舒萍', gender: 'F', grade: 'B', initialShifts: { '16': '休', '17': '休', '18': '機動' } },
  { id: 13, title: '保全員', name: '陳蕙涵', gender: 'F', grade: 'B', initialShifts: { '16': '4F', '17': 'A2S', '18': '4F' } },
  { id: 14, title: '保全員', name: '陳玉佳', gender: 'F', grade: 'B', initialShifts: { '16': 'A1m', '17': '4F', '18': '_1F-1' } },
  { id: 15, title: '保全員', name: '陳佳真', gender: 'F', grade: 'B', initialShifts: { '16': '4F', '17': '_1F-1', '18': '4F-1' } },
  { id: 16, title: '保全員', name: '蔣精晏', gender: 'F', grade: 'B', initialShifts: { '16': '休', '17': '粉', '18': 'A2' } },
  { id: 17, title: '保全員', name: '林宛樺', gender: 'F', grade: 'B', initialShifts: { '16': 'L2', '17': '4F-1', '18': 'A1' } },
  { id: 18, title: '保全員', name: '吳昱璇', gender: 'F', grade: 'B', initialShifts: { '16': '5F', '17': '_1F', '18': '5F' } },
  { id: 19, title: '保全員', name: '杜怡嫺', gender: 'F', grade: 'B', initialShifts: { '16': '_1F-1', '17': 'A1', '18': 'LD' } },
  { id: 20, title: '保全員', name: '楊雅雯', gender: 'F', grade: 'B', initialShifts: { '16': '2F', '17': 'L2', '18': '休' } },
  { id: 21, title: '保全員', name: '古謹綾', gender: 'F', grade: 'B', initialShifts: { '16': '休', '17': '2F', '18': 'A2S' } },
  { id: 22, title: '保全員', name: '陳文鈴', gender: 'F', grade: 'B', initialShifts: { '16': '北', '17': '北', '18': '9碼' } },
  { id: 23, title: '保全員', name: '周庭羽', gender: 'F', grade: 'B', initialShifts: { '16': '_1F', '17': 'A1m', '18': 'L2' } },
  { id: 24, title: '保全員', name: '林芝瑩', gender: 'F', grade: 'B', initialShifts: { '16': '4F-1', '17': '4F', '18': '休' } },
  { id: 25, title: '保全員', name: '蔣俊琳', gender: 'F', grade: 'B', initialShifts: { '16': '_3', '17': '_3', '18': '_3' } },
  { id: 26, title: '保全員', name: '雷裕明', gender: 'M', grade: 'B', initialShifts: { '16': '_2', '17': '_2', '18': '_2' } },
  { id: 27, title: '保全員', name: '連忠得', gender: 'M', grade: 'B', initialShifts: { '16': '粉', '17': '停', '18': '' } },
  { id: 28, title: '保全員', name: '陳萬春', gender: 'M', grade: 'B', initialShifts: { '16': '9碼', '17': '_5', '18': '_5' } },

  { id: 29, title: '保全員', name: '林佳慶', gender: 'M', grade: 'B', initialShifts: { '16': '_5', '17': '休', '18': '休' } },
  { id: 30, title: '保全員', name: '陳盈州', gender: 'M', grade: 'B', initialShifts: { '16': '_5', '17': '_3', '18': '機巡' } },
  { id: 31, title: '保全員', name: '邱逸楓', gender: 'M', grade: 'B', initialShifts: { '16': '機-3', '17': '_3', '18': '綠' } },
  { id: 32, title: '保全員', name: '曾介鴻', gender: 'M', grade: 'B', initialShifts: { '16': '_1', '17': '休', '18': '粉' } },
  { id: 33, title: '保全員', name: '林坤億', gender: 'M', grade: 'B', initialShifts: { '16': '_3', '17': '9碼', '18': '_3' } },
  { id: 34, title: '保全員', name: '陳信豪', gender: 'M', grade: 'B', initialShifts: { '16': '機巡', '17': '停', '18': '停' } },
  { id: 35, title: '保全員', name: '劉迪明', gender: 'M', grade: 'B', initialShifts: { '16': '休', '17': '休', '18': '_4' } },
  { id: 36, title: '保全員', name: '錢霆諺', gender: 'M', grade: 'B', initialShifts: { '16': '_1', '17': '_1', '18': '_1' } },
  { id: 37, title: '保全員', name: '吳桂揚', gender: 'M', grade: 'B', initialShifts: { '16': '機-2', '17': '休', '18': '休' } },
  { id: 38, title: '保全員', name: '林建宏', gender: 'M', grade: 'B', initialShifts: { '16': '_1', '17': '_1', '18': '_1' } },
  { id: 39, title: '保全員', name: '郭聰志', gender: 'M', grade: 'B', initialShifts: { '16': '_3', '17': '休', '18': '休' } },
  { id: 40, title: '保全員', name: '黃崇偉', gender: 'M', grade: 'B', initialShifts: { '16': '南', '17': '機-2', '18': '_3' } },
  { id: 41, title: '保全員', name: '陳文安', gender: 'M', grade: 'B', initialShifts: { '16': '_6', '17': '機巡', '18': '休' } },
  { id: 42, title: '保全員', name: '賴錦洲', gender: 'M', grade: 'B', initialShifts: { '16': '_2-1', '17': '_5', '18': '_5' } },
  { id: 43, title: '保全員', name: '蔣明哲', gender: 'M', grade: 'B', initialShifts: { '16': 'LD', '17': '停', '18': '_6' } },
  { id: 44, title: '保全員', name: '陳萬富', gender: 'M', grade: 'B', initialShifts: { '16': 'A2S', '17': '機-3', '18': '機-2' } },
  { id: 45, title: '保全員', name: '廖晉兆', gender: 'M', grade: 'B', initialShifts: { '16': 'A2', '17': '_2-1', '18': '_2-1' } },
  { id: 46, title: '保全員', name: '蕭良全', gender: 'M', grade: 'B', initialShifts: { '16': 'A1', '17': '綠', '18': '休' } },
  { id: 47, title: '保全員', name: '冉天福', gender: 'M', grade: 'B', initialShifts: { '16': '', '17': '_6', '18': '機-3' } },
  { id: 48, title: '保全員', name: '廖瑞則', gender: 'M', grade: 'B', initialShifts: { '16': '5', '17': '5', '18': '' } },
  { id: 49, title: '保全員', name: '林季鋒', gender: 'M', grade: 'B', initialShifts: { '16': '休', '17': '_4', '18': '_5' } },
  { id: 50, title: '保全員', name: '劉杰峰', gender: 'M', grade: 'B', initialShifts: { '16': '休', '17': '南', '18': '南' } },
  { id: 51, title: '保全員', name: '王律友', gender: 'M', grade: 'B', initialShifts: { '16': '_4', '17': '_1', '18': '_1' } },
  { id: 52, title: '保全員', name: '陳志明', gender: 'M', grade: 'B', initialShifts: { '16': '停', '17': 'A2', '18': '南' } },
  { id: 53, title: '中控', name: '林怡宣', gender: 'F', grade: 'B', initialShifts: { '16': '中控', '17': '中控', '18': '中控' } },
  { id: 54, title: '中控', name: '林晏德', gender: 'M', grade: 'B', initialShifts: { '16': '中控', '17': '中控', '18': '中控' } },
  { id: 55, title: '中控', name: '丁建華', gender: 'M', grade: 'B', initialShifts: { '16': '藍', '17': '藍', '18': '藍' } },
  { id: 56, title: '中控', name: '陳佩雯', gender: 'F', grade: 'B', initialShifts: { '16': '中控', '17': '休', '18': '休' } }
];

// 全域狀態
let state = {
  year: 2026,
  month: 9,
  employees: JSON.parse(JSON.stringify(INITIAL_EMPLOYEES)),
  shifts: [...LEAVE_SHIFTS, ...WORK_SHIFTS],
  grades: JSON.parse(JSON.stringify(DEFAULT_GRADES)),
  rulesConfig: {
    maxConsecutiveDays: 5,
    excludedTitles: ['中控'],
    conflicts: [
      { id: 'c1', empId1: 2, empId2: 3, reason: '袁國峻 與 何峻岱 哨長不可在同一個班別' }
    ],
    workingHoursPerDay: 12
  },
  schedule: {},
  lockedCells: {},
  viewMode: 'standard', // 'standard' | 'split'
  highlightCell: null,
  activeSettingsTab: 'rules',
  activePicker: null
};

// 初始化排班表資料
function initSchedule() {
  state.schedule = {};
  state.employees.forEach(emp => {
    state.schedule[emp.id] = {};
    for (let d = 1; d <= 31; d++) {
      const dStr = String(d);
      state.schedule[emp.id][dStr] = emp.initialShifts?.[dStr] || '';
    }
  });
}
initSchedule();

// 工具函式：計算當月天數與星期
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
function getWeekdayName(year, month, day) {
  const d = new Date(year, month - 1, parseInt(day, 10));
  return WEEKDAYS_ZH[d.getDay()];
}

function getDatesArray() {
  const total = getDaysInMonth(state.year, state.month);
  return Array.from({ length: total }, (_, i) => String(i + 1));
}

// 2. 規則檢驗中心 (Validator)
function validateSchedule() {
  const violations = [];
  const shiftMap = new Map(state.shifts.map(s => [s.id, s]));
  const gradeRankMap = new Map(state.grades.map(g => [g.id, g.rank]));
  const empMap = new Map(state.employees.map(e => [e.id, e]));
  const dates = getDatesArray();
  const maxConsecutive = state.rulesConfig.maxConsecutiveDays || 5;

  // 1. 連續上班天數上限
  state.employees.forEach(emp => {
    if (state.rulesConfig.excludedTitles?.includes(emp.title)) return;
    let streak = 0;
    dates.forEach(d => {
      const sId = state.schedule[emp.id]?.[d];
      const sObj = shiftMap.get(sId);
      if (sId && sObj && !sObj.isLeave) {
        streak++;
        if (streak > maxConsecutive) {
          violations.push({
            id: `streak-${emp.id}-${d}`,
            type: 'CONSECUTIVE_OVERLIMIT',
            category: '連上超額',
            empId: emp.id,
            empName: emp.name,
            empTitle: emp.title,
            date: d,
            message: `連續上班達 ${streak} 天 (上限 ${maxConsecutive} 天)`
          });
        }
      } else {
        streak = 0;
      }
    });
  });

  // 2. 等級階層相符
  state.employees.forEach(emp => {
    const empRank = gradeRankMap.get(emp.grade) || 0;
    dates.forEach(d => {
      const sId = state.schedule[emp.id]?.[d];
      if (!sId) return;
      const sObj = shiftMap.get(sId);
      if (!sObj || sObj.isLeave) return;
      const reqRank = gradeRankMap.get(sObj.minGrade) || 0;
      if (empRank < reqRank) {
        violations.push({
          id: `grade-${emp.id}-${d}`,
          type: 'GRADE_MISMATCH',
          category: '等級不符',
          empId: emp.id,
          empName: emp.name,
          empTitle: emp.title,
          date: d,
          message: `人員等級 (${emp.grade}) 低於班別「${sObj.name}」要求 (${sObj.minGrade})`
        });
      }
    });
  });

  // 3. 性別限制
  state.employees.forEach(emp => {
    dates.forEach(d => {
      const sId = state.schedule[emp.id]?.[d];
      if (!sId) return;
      const sObj = shiftMap.get(sId);
      if (!sObj || sObj.isLeave) return;
      if (sObj.genderReq === 'M' && emp.gender !== 'M') {
        violations.push({
          id: `gender-${emp.id}-${d}`,
          type: 'GENDER_MISMATCH',
          category: '性別不符',
          empId: emp.id,
          empName: emp.name,
          empTitle: emp.title,
          date: d,
          message: `班別「${sObj.name}」僅限男性擔任，人員為女性`
        });
      } else if (sObj.genderReq === 'F' && emp.gender !== 'F') {
        violations.push({
          id: `gender-${emp.id}-${d}`,
          type: 'GENDER_MISMATCH',
          category: '性別不符',
          empId: emp.id,
          empName: emp.name,
          empTitle: emp.title,
          date: d,
          message: `班別「${sObj.name}」僅限女性擔任，人員為男性`
        });
      }
    });
  });

  // 4. 互斥同班
  (state.rulesConfig.conflicts || []).forEach(c => {
    const emp1 = empMap.get(c.empId1);
    const emp2 = empMap.get(c.empId2);
    if (!emp1 || !emp2) return;
    dates.forEach(d => {
      const s1 = state.schedule[emp1.id]?.[d];
      const s2 = state.schedule[emp2.id]?.[d];
      if (!s1 || !s2) return;
      const obj1 = shiftMap.get(s1);
      if (s1 === s2 && obj1 && !obj1.isLeave) {
        violations.push({
          id: `conflict-${c.id}-${d}`,
          type: 'MUTUAL_CONFLICT',
          category: '互斥衝突',
          empId: emp1.id,
          empName: `${emp1.name} & ${emp2.name}`,
          empTitle: `${emp1.title}/${emp2.title}`,
          date: d,
          message: `互斥同班：${emp1.name} 與 ${emp2.name} 於 ${d} 號同時排入同班「${s1}」`
        });
      }
    });
  });

  return violations;
}

// 3. 自動排班演算法 (Auto-Scheduler)
function runAutoSchedule() {
  const shiftMap = new Map(state.shifts.map(s => [s.id, s]));
  const gradeRankMap = new Map(state.grades.map(g => [g.id, g.rank]));
  const maxConsecutive = state.rulesConfig.maxConsecutiveDays || 5;
  const dates = getDatesArray();

  // 複製並保留假別或鎖定儲存格
  const newSched = {};
  state.employees.forEach(emp => {
    newSched[emp.id] = {};
    dates.forEach(d => {
      const exist = state.schedule[emp.id]?.[d];
      const isLocked = state.lockedCells[`${emp.id}_${d}`];
      const sObj = shiftMap.get(exist);
      if (exist && (sObj?.isLeave || isLocked)) {
        newSched[emp.id][d] = exist;
      } else {
        newSched[emp.id][d] = '';
      }
    });
  });

  const activeEmps = state.employees.filter(emp => {
    if (state.rulesConfig.excludedTitles?.includes(emp.title)) return false;
    return true;
  });

  // 互斥表
  const conflictMap = new Map();
  (state.rulesConfig.conflicts || []).forEach(c => {
    if (!conflictMap.has(c.empId1)) conflictMap.set(c.empId1, new Set());
    if (!conflictMap.has(c.empId2)) conflictMap.set(c.empId2, new Set());
    conflictMap.get(c.empId1).add(c.empId2);
    conflictMap.get(c.empId2).add(c.empId1);
  });

  const empWorkCount = new Map(activeEmps.map(e => [e.id, 0]));
  const getConsecutive = (empId, upToIdx) => {
    let streak = 0;
    for (let i = upToIdx; i >= 0; i--) {
      const d = dates[i];
      const sId = newSched[empId]?.[d];
      const sObj = shiftMap.get(sId);
      if (sId && sObj && !sObj.isLeave) streak++;
      else break;
    }
    return streak;
  };

  const workShifts = state.shifts
    .filter(s => !s.isLeave && s.id !== '中控')
    .sort((a, b) => (gradeRankMap.get(b.minGrade) || 0) - (gradeRankMap.get(a.minGrade) || 0));

  dates.forEach((d, dIdx) => {
    const dayAssignments = new Map();
    workShifts.forEach(s => dayAssignments.set(s.id, []));
    const todayAssigned = new Set();

    activeEmps.forEach(emp => {
      const sId = newSched[emp.id][d];
      if (sId) {
        todayAssigned.add(emp.id);
        if (dayAssignments.has(sId)) dayAssignments.get(sId).push(emp.id);
      }
    });

    workShifts.forEach(shift => {
      const reqRank = gradeRankMap.get(shift.minGrade) || 1;
      const currentCount = (dayAssignments.get(shift.id) || []).length;
      const needed = (shift.defaultDemand || 1) - currentCount;
      if (needed <= 0) return;

      let candidates = activeEmps.filter(emp => {
        if (todayAssigned.has(emp.id)) return false;
        if ((gradeRankMap.get(emp.grade) || 1) < reqRank) return false;
        if (shift.genderReq === 'M' && emp.gender !== 'M') return false;
        if (shift.genderReq === 'F' && emp.gender !== 'F') return false;
        if (getConsecutive(emp.id, dIdx - 1) >= maxConsecutive) return false;

        const inShift = dayAssignments.get(shift.id) || [];
        const confs = conflictMap.get(emp.id);
        if (confs && inShift.some(id => confs.has(id))) return false;
        return true;
      });

      // 排序候選人 (等級差距小且累積工時少者優先)
      candidates.sort((a, b) => {
        const diffA = (gradeRankMap.get(a.grade) || 1) - reqRank;
        const diffB = (gradeRankMap.get(b.grade) || 1) - reqRank;
        if (diffA !== diffB) return diffA - diffB;
        return (empWorkCount.get(a.id) || 0) - (empWorkCount.get(b.id) || 0);
      });

      let filled = 0;
      for (const cand of candidates) {
        if (filled >= needed) break;
        newSched[cand.id][d] = shift.id;
        todayAssigned.add(cand.id);
        dayAssignments.get(shift.id).push(cand.id);
        empWorkCount.set(cand.id, (empWorkCount.get(cand.id) || 0) + 1);
        filled++;
      }
    });

    // 今日剩餘未排班人員補入「休」
    activeEmps.forEach(emp => {
      if (!newSched[emp.id][d]) newSched[emp.id][d] = '休';
    });
  });

  // 保留排除人員原排班 (如中控)
  state.employees.forEach(emp => {
    if (state.rulesConfig.excludedTitles?.includes(emp.title)) {
      dates.forEach(d => {
        newSched[emp.id][d] = state.schedule[emp.id]?.[d] || emp.initialShifts?.[d] || '中控';
      });
    }
  });

  state.schedule = newSched;
  renderApp();

  if (window.confetti) {
    window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  }
}

// 4. 表格渲染 (標準寬表 & 對稱雙欄)
function renderApp() {
  const dates = getDatesArray();
  const violations = validateSchedule();
  const violationSet = new Set(violations.map(v => `${v.empId}_${v.date}`));
  const shiftMap = new Map(state.shifts.map(s => [s.id, s]));
  const rocYear = state.year - 1911;

  // 更新頂部標題與狀態
  document.getElementById('standard-title-text').innerText = 
    `📅 F16日班 ${rocYear}.${String(state.month).padStart(2, '0')}月份排班表 (全體人員完整檢視)`;
  document.getElementById('stat-emp-count').innerText = state.employees.length;
  document.getElementById('stat-max-consecutive').innerText = state.rulesConfig.maxConsecutiveDays || 5;
  document.getElementById('stat-locked-count').innerText = Object.values(state.lockedCells).filter(Boolean).length;

  // 更新違規徽章
  const badge = document.getElementById('violation-badge');
  const label = document.getElementById('inspector-label');
  const btnInsp = document.getElementById('btn-inspector');
  if (violations.length > 0) {
    badge.style.display = 'inline-flex';
    badge.innerText = violations.length;
    label.innerText = '規則違規檢視';
    btnInsp.className = 'btn btn-violation';
  } else {
    badge.style.display = 'none';
    label.innerText = '規則完全符合';
    btnInsp.className = 'btn btn-success';
  }

  // A. 渲染標準全寬度表格
  renderStandardTable(dates, shiftMap, violationSet);

  // B. 渲染對稱雙欄表格
  renderSplitTable(dates, shiftMap, violationSet, rocYear);

  // C. 渲染檢驗中心清單
  renderInspectorModal(violations);
}

function renderStandardTable(dates, shiftMap, violationSet) {
  const table = document.getElementById('table-standard');
  let html = '<thead><tr>';
  html += '<th class="col-sticky-1" rowspan="2" style="z-index:35">編號</th>';
  html += '<th class="col-sticky-2" rowspan="2" style="z-index:35">職稱</th>';
  html += '<th class="col-sticky-3" rowspan="2" style="z-index:35">姓名</th>';
  dates.forEach(d => {
    html += `<th style="background:#ede9fe; color:#4338ca">${d}號</th>`;
  });
  html += '<th class="col-stat" rowspan="2" style="background:#fee2e2; color:#991b1b; z-index:25">休假天數</th>';
  html += '<th class="col-stat" rowspan="2" style="background:#e0e7ff; color:#3730a3; z-index:25">總工時(12H)</th>';
  html += '</tr><tr>';

  dates.forEach(d => {
    const w = getWeekdayName(state.year, state.month, d);
    const isWk = w.includes('六') || w.includes('日');
    html += `<th style="background:${isWk ? '#fef3c7' : '#f8fafc'}; color:${isWk ? '#b45309' : 'var(--text-muted)'}; font-size:0.75rem">${w.replace('星期', '週')}</th>`;
  });
  html += '</tr></thead><tbody>';

  state.employees.forEach(emp => {
    let leaves = 0, works = 0;
    dates.forEach(d => {
      const sId = state.schedule[emp.id]?.[d];
      const sObj = shiftMap.get(sId);
      if (sId && sObj) {
        if (sObj.isLeave) leaves++;
        else works++;
      }
    });

    html += `<tr>`;
    html += `<td class="col-sticky-1" style="font-weight:600; color:var(--text-muted)">${emp.id}</td>`;
    html += `<td class="col-sticky-2"><span style="font-size:0.76rem; font-weight:600">${emp.title}</span></td>`;
    html += `<td class="col-sticky-3"><div style="display:flex; align-items:center; justify-content:center; gap:4px">`;
    html += `<span class="${emp.gender === 'F' ? 'female-name' : ''}">${emp.name}</span>`;
    if (emp.gender === 'F') html += `<span class="female-badge">女</span>`;
    html += `<span class="grade-badge grade-${emp.grade}">${emp.grade}</span>`;
    html += `</div></td>`;

    dates.forEach(d => {
      const sId = state.schedule[emp.id]?.[d] || '';
      const sObj = shiftMap.get(sId);
      const cellKey = `${emp.id}_${d}`;
      const isLocked = !!state.lockedCells[cellKey];
      const hasViol = violationSet.has(cellKey);
      const isHigh = state.highlightCell === cellKey;
      const bg = sObj?.bg || 'transparent';
      const text = sObj?.text || 'inherit';

      html += `<td id="cell-${cellKey}" class="shift-cell ${isLocked ? 'is-locked' : ''} ${hasViol ? 'has-violation' : ''}" 
        style="background-color:${bg}; color:${text}; ${isHigh ? 'box-shadow:0 0 0 3px #ef4444 inset;' : ''}"
        onclick="openQuickPicker(event, ${emp.id}, '${d}')">${sId}</td>`;
    });

    html += `<td class="col-stat" style="color:#be123c; font-weight:700">${leaves}</td>`;
    html += `<td class="col-stat" style="color:#1e40af; font-weight:700">${works * 12}h</td>`;
    html += `</tr>`;
  });

  // 出勤人數列
  html += '<tr class="row-attendance">';
  html += '<td class="col-sticky-1" colspan="3" style="z-index:35">每日出勤人數</td>';
  dates.forEach(d => {
    let count = 0;
    state.employees.forEach(emp => {
      const sId = state.schedule[emp.id]?.[d];
      const sObj = shiftMap.get(sId);
      if (sId && sObj && !sObj.isLeave) count++;
    });
    html += `<td style="font-weight:800">${count}</td>`;
  });
  html += '<td class="col-stat" colspan="2" style="font-size:0.78rem; color:var(--text-muted)">12H / 班</td>';
  html += '</tr></tbody>';

  table.innerHTML = html;
}

function renderSplitTable(dates, shiftMap, violationSet, rocYear) {
  const table = document.getElementById('table-split');
  const half = Math.ceil(state.employees.length / 2);
  const leftEmps = state.employees.slice(0, half);
  const rightEmps = state.employees.slice(half);
  const maxRows = Math.max(leftEmps.length, rightEmps.length);

  let html = '<thead>';
  // Row 1
  html += `<tr style="background:#1e293b; color:white">`;
  html += `<th colspan="${3 + dates.length}" style="font-size:1rem; padding:6px; color:white; background:#1e293b">F16日班</th>`;
  html += `<th style="width:12px; background:#e2e8f0; border:none"></th>`;
  html += `<th colspan="${3 + dates.length}" style="font-size:1rem; padding:6px; color:white; background:#1e293b">F16日班</th>`;
  html += `</tr>`;

  // Row 2
  html += `<tr style="background:#f1f5f9">`;
  html += `<th colspan="3" style="font-weight:800; color:#334155">${rocYear}.${String(state.month).padStart(2, '0')}月份班表</th>`;
  dates.forEach(d => html += `<th style="background:#ede9fe; color:#4338ca; font-weight:800">${d}</th>`);
  html += `<th style="width:12px; background:#e2e8f0; border:none"></th>`;
  html += `<th colspan="3" style="font-weight:800; color:#334155">${rocYear}.${String(state.month).padStart(2, '0')}月份班表</th>`;
  dates.forEach(d => html += `<th style="background:#ede9fe; color:#4338ca; font-weight:800">${d}</th>`);
  html += `</tr>`;

  // Row 3
  html += `<tr style="background:#f8fafc; font-size:0.72rem">`;
  html += `<th style="min-width:35px">號</th><th style="min-width:55px">職稱</th><th style="min-width:70px">姓名</th>`;
  dates.forEach(d => html += `<th>${getWeekdayName(state.year, state.month, d).replace('星期', '週')}</th>`);
  html += `<th style="width:12px; background:#e2e8f0; border:none"></th>`;
  html += `<th style="min-width:35px">號</th><th style="min-width:55px">職稱</th><th style="min-width:70px">姓名</th>`;
  dates.forEach(d => html += `<th>${getWeekdayName(state.year, state.month, d).replace('星期', '週')}</th>`);
  html += `</tr></thead><tbody>`;

  for (let r = 0; r < maxRows; r++) {
    const eL = leftEmps[r];
    const eR = rightEmps[r];
    html += '<tr>';
    // Left
    if (eL) {
      html += `<td style="font-weight:600; color:#64748b">${eL.id}</td><td style="font-size:0.75rem; font-weight:600">${eL.title}</td>`;
      html += `<td><span class="${eL.gender === 'F' ? 'female-name' : ''}" style="font-weight:600">${eL.name}</span></td>`;
      dates.forEach(d => {
        const sId = state.schedule[eL.id]?.[d] || '';
        const sObj = shiftMap.get(sId);
        const cellKey = `${eL.id}_${d}`;
        html += `<td class="shift-cell ${state.lockedCells[cellKey] ? 'is-locked' : ''} ${violationSet.has(cellKey) ? 'has-violation' : ''}"
          style="background-color:${sObj?.bg || 'transparent'}; color:${sObj?.text || 'inherit'}"
          onclick="openQuickPicker(event, ${eL.id}, '${d}')">${sId}</td>`;
      });
    } else {
      html += `<td colspan="${3 + dates.length}"></td>`;
    }

    html += `<td style="width:12px; background:#e2e8f0; border:none"></td>`;

    // Right
    if (eR) {
      html += `<td style="font-weight:600; color:#64748b">${eR.id}</td><td style="font-size:0.75rem; font-weight:600">${eR.title}</td>`;
      html += `<td><span class="${eR.gender === 'F' ? 'female-name' : ''}" style="font-weight:600">${eR.name}</span></td>`;
      dates.forEach(d => {
        const sId = state.schedule[eR.id]?.[d] || '';
        const sObj = shiftMap.get(sId);
        const cellKey = `${eR.id}_${d}`;
        html += `<td class="shift-cell ${state.lockedCells[cellKey] ? 'is-locked' : ''} ${violationSet.has(cellKey) ? 'has-violation' : ''}"
          style="background-color:${sObj?.bg || 'transparent'}; color:${sObj?.text || 'inherit'}"
          onclick="openQuickPicker(event, ${eR.id}, '${d}')">${sId}</td>`;
      });
    } else {
      html += `<td colspan="${3 + dates.length}"></td>`;
    }
    html += '</tr>';
  }

  // Attendance
  html += '<tr style="background:#f1f5f9; font-weight:800">';
  html += '<td colspan="3" style="color:#1e293b">出勤人數</td>';
  dates.forEach(d => {
    let count = 0;
    state.employees.forEach(e => {
      const s = state.schedule[e.id]?.[d];
      const obj = shiftMap.get(s);
      if (s && obj && !obj.isLeave) count++;
    });
    html += `<td style="color:#4338ca; font-weight:800">${count}</td>`;
  });
  html += '<td style="width:12px; background:#e2e8f0; border:none"></td>';
  html += '<td colspan="3" style="color:#1e293b">出勤人數</td>';
  dates.forEach(d => {
    let count = 0;
    state.employees.forEach(e => {
      const s = state.schedule[e.id]?.[d];
      const obj = shiftMap.get(s);
      if (s && obj && !obj.isLeave) count++;
    });
    html += `<td style="color:#4338ca; font-weight:800">${count}</td>`;
  });
  html += '</tr></tbody>';

  table.innerHTML = html;
}

// 5. 快速選班彈出層 (Quick Picker)
window.openQuickPicker = function(e, empId, dateStr) {
  e.stopPropagation();
  const emp = state.employees.find(x => x.id === empId);
  if (!emp) return;

  state.activePicker = { empId, dateStr };
  const cellKey = `${empId}_${dateStr}`;
  const isLocked = !!state.lockedCells[cellKey];
  const currentShift = state.schedule[empId]?.[dateStr] || '';

  document.getElementById('picker-emp-name').innerText = emp.name;
  document.getElementById('picker-date-info').innerText = `${dateStr} 號 (${emp.title})`;

  const lockBtn = document.getElementById('btn-picker-lock');
  lockBtn.innerText = isLocked ? '🔓 解除鎖定 (排班可覆蓋)' : '🔒 鎖定此格 (排班不覆蓋)';
  lockBtn.className = `btn ${isLocked ? 'btn-danger' : 'btn-secondary'}`;

  // 渲染假別 Chips
  const leaveWrap = document.getElementById('picker-leave-chips');
  leaveWrap.innerHTML = state.shifts.filter(s => s.isLeave).map(s => `
    <div class="shift-chip" style="background-color:${s.bg}; color:${s.text}; font-weight:700; border:${currentShift === s.id ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.15)'}"
      onclick="selectShift('${s.id}')">${s.name}</div>
  `).join('');

  // 渲染工作班 Chips
  const workWrap = document.getElementById('picker-work-chips');
  workWrap.innerHTML = state.shifts.filter(s => !s.isLeave).map(s => `
    <div class="shift-chip" style="background-color:${s.bg}; color:${s.text}; font-weight:600; border:${currentShift === s.id ? '2px solid var(--primary)' : '1px solid var(--border-color)'}"
      onclick="selectShift('${s.id}')">${s.name}</div>
  `).join('');

  const popover = document.getElementById('quick-picker');
  const rect = e.currentTarget.getBoundingClientRect();
  const left = Math.min(Math.max(10, rect.left), window.innerWidth - 340);
  const top = Math.min(Math.max(10, rect.bottom + 6), window.innerHeight - 380);

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.classList.add('active');
};

window.selectShift = function(shiftId) {
  if (!state.activePicker) return;
  const { empId, dateStr } = state.activePicker;
  state.schedule[empId][dateStr] = shiftId;
  closeQuickPicker();
  renderApp();
};

function closeQuickPicker() {
  document.getElementById('quick-picker').classList.remove('active');
  state.activePicker = null;
}

// 6. 彈窗控制與檢驗中心
window.openModal = function(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'modal-settings') renderSettingsTabs();
  if (id === 'modal-export') initExportOptions();
};

window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
};

function renderInspectorModal(violations) {
  const badge = document.getElementById('inspector-modal-badge');
  badge.innerText = `${violations.length} 項未符設定`;
  badge.style.background = violations.length > 0 ? '#fee2e2' : '#dcfce7';
  badge.style.color = violations.length > 0 ? '#b91c1c' : '#15803d';

  const streakCount = violations.filter(v => v.type === 'CONSECUTIVE_OVERLIMIT').length;
  const gradeCount = violations.filter(v => v.type === 'GRADE_MISMATCH').length;
  const genderCount = violations.filter(v => v.type === 'GENDER_MISMATCH').length;
  const conflictCount = violations.filter(v => v.type === 'MUTUAL_CONFLICT').length;

  document.getElementById('stat-count-streak').innerText = streakCount;
  document.getElementById('stat-count-streak').style.color = streakCount > 0 ? '#e11d48' : '#059669';
  document.getElementById('stat-count-grade').innerText = gradeCount;
  document.getElementById('stat-count-grade').style.color = gradeCount > 0 ? '#d97706' : '#059669';
  document.getElementById('stat-count-gender').innerText = genderCount;
  document.getElementById('stat-count-gender').style.color = genderCount > 0 ? '#e11d48' : '#059669';
  document.getElementById('stat-count-conflict').innerText = conflictCount;
  document.getElementById('stat-count-conflict').style.color = conflictCount > 0 ? '#e11d48' : '#059669';

  const list = document.getElementById('inspector-violations-list');
  if (violations.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted)">
        <div style="font-size:2rem; margin-bottom:0.5rem">🎉</div>
        <div style="font-size:1.05rem; font-weight:700; color:#047857">太棒了！沒有發現任何違規項目</div>
        <p style="font-size:0.85rem; margin-top:0.25rem">所有人員均符合連續上班天數限制（≤ ${state.rulesConfig.maxConsecutiveDays || 5} 天）、等級位階資格與互斥條件。</p>
      </div>`;
  } else {
    list.innerHTML = violations.map(v => `
      <div class="violation-card" onclick="jumpToCell('${v.empId}_${v.date}')">
        <div class="violation-info">
          <div style="display:flex; align-items:center; gap:0.5rem">
            <span class="violation-emp">${v.empName} (${v.empTitle})</span>
            <span style="font-size:0.75rem; padding:1px 6px; border-radius:4px; background:#fee2e2; color:#991b1b; font-weight:700">${v.category}</span>
            <span style="font-size:0.78rem; color:var(--text-muted)">📅 日期: ${v.date} 號</span>
          </div>
          <div class="violation-desc">${v.message}</div>
        </div>
        <div style="display:flex; align-items:center; color:#e11d48; font-size:0.82rem; font-weight:700">前往定位 &rarr;</div>
      </div>
    `).join('');
  }
}

window.jumpToCell = function(cellKey) {
  closeModal('modal-inspector');
  state.highlightCell = cellKey;
  renderApp();
  setTimeout(() => {
    const el = document.getElementById(`cell-${cellKey}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }, 150);
  setTimeout(() => {
    state.highlightCell = null;
    renderApp();
  }, 3500);
};

// 7. 系統設定 (Settings)
window.switchSettingsTab = function(tabName) {
  state.activeSettingsTab = tabName;
  ['rules', 'grades', 'shifts', 'employees'].forEach(t => {
    document.getElementById(`tab-pane-${t}`).style.display = t === tabName ? 'block' : 'none';
    document.getElementById(`tab-btn-${t}`).className = `tab-btn ${t === tabName ? 'active' : ''}`;
  });
};

function renderSettingsTabs() {
  // A. Rules tab
  document.getElementById('input-max-consecutive').value = state.rulesConfig.maxConsecutiveDays || 5;
  const allTitles = Array.from(new Set(state.employees.map(e => e.title)));
  const titleWrap = document.getElementById('excluded-titles-checkboxes');
  titleWrap.innerHTML = allTitles.map(t => {
    const checked = state.rulesConfig.excludedTitles?.includes(t) ? 'checked' : '';
    return `<label style="display:flex; align-items:center; gap:6px; font-size:0.86rem; cursor:pointer">
      <input type="checkbox" onchange="toggleExcludedTitle('${t}', this.checked)" ${checked} /> 排除 <strong>${t}</strong>
    </label>`;
  }).join('');

  // 互斥下拉選單
  const sel1 = document.getElementById('conflict-emp1');
  const sel2 = document.getElementById('conflict-emp2');
  const empOpts = '<option value="">選擇員工...</option>' + state.employees.map(e => `<option value="${e.id}">${e.id}. ${e.name} (${e.title})</option>`).join('');
  sel1.innerHTML = empOpts;
  sel2.innerHTML = empOpts;

  // 互斥清單
  const confList = document.getElementById('conflicts-list');
  const empMap = new Map(state.employees.map(e => [e.id, e]));
  confList.innerHTML = (state.rulesConfig.conflicts || []).map(c => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:0.5rem 0.75rem; background:var(--bg-surface); border-radius:6px; border:1px solid var(--border-color)">
      <div style="font-size:0.85rem">
        <span style="font-weight:700; color:#e11d48">${empMap.get(c.empId1)?.name || c.empId1}</span>
        <span style="margin:0 6px; color:var(--text-muted)">與</span>
        <span style="font-weight:700; color:#e11d48">${empMap.get(c.empId2)?.name || c.empId2}</span>
        <span style="margin-left:12px; font-size:0.78rem; color:var(--text-muted)">(${c.reason})</span>
      </div>
      <button type="button" onclick="deleteConflict('${c.id}')" style="background:none; border:none; color:#e11d48; cursor:pointer; font-size:16px">&times;</button>
    </div>
  `).join('');

  // B. Grades tab
  const gBody = document.getElementById('grades-table-body');
  gBody.innerHTML = state.grades.map((g, idx) => `
    <tr style="border-bottom:1px solid var(--border-color)">
      <td style="padding:8px; font-weight:700">第 ${idx + 1} 階</td>
      <td style="padding:8px"><span class="grade-badge grade-${g.id}">${g.id}</span></td>
      <td style="padding:8px">${g.name}</td>
      <td style="padding:8px; font-weight:700">${g.rank}</td>
      <td style="padding:8px"><button type="button" onclick="deleteGrade('${g.id}')" style="background:none; border:none; color:#e11d48; cursor:pointer">&times;</button></td>
    </tr>
  `).join('');

  // C. Shifts tab
  const sGradeSel = document.getElementById('input-shift-mingrade');
  sGradeSel.innerHTML = state.grades.map(g => `<option value="${g.id}">${g.id} 級以上</option>`).join('');
  const sBody = document.getElementById('shifts-table-body');
  sBody.innerHTML = state.shifts.map(s => `
    <tr style="border-bottom:1px solid var(--border-color)">
      <td style="padding:6px"><span style="padding:2px 8px; border-radius:4px; background-color:${s.bg}; color:${s.text}; font-weight:700">${s.name}</span></td>
      <td style="padding:6px; font-weight:600">${s.id}</td>
      <td style="padding:6px">${s.isLeave ? '<span style="color:#e11d48; font-weight:700">休假別</span>' : '工作班'}</td>
      <td style="padding:6px"><span class="grade-badge grade-${s.minGrade}">${s.minGrade} 級以上</span></td>
      <td style="padding:6px">${s.genderReq === 'M' ? '限男' : s.genderReq === 'F' ? '限女' : '不限'}</td>
      <td style="padding:6px">${s.isLeave ? '-' : `${s.defaultDemand || 1} 人`}</td>
      <td style="padding:6px"><button type="button" onclick="deleteShift('${s.id}')" style="background:none; border:none; color:#e11d48; cursor:pointer">&times;</button></td>
    </tr>
  `).join('');

  // D. Employees tab
  const eGradeSel = document.getElementById('input-emp-grade');
  eGradeSel.innerHTML = state.grades.map(g => `<option value="${g.id}">${g.id} 級</option>`).join('');
  renderEmployeeTable(state.employees);
}

function renderEmployeeTable(list) {
  const eBody = document.getElementById('employees-table-body');
  eBody.innerHTML = list.map(emp => `
    <tr style="border-bottom:1px solid var(--border-color)">
      <td style="padding:6px; font-weight:600; color:var(--text-muted)">${emp.id}</td>
      <td style="padding:6px"><input type="text" value="${emp.title}" class="form-input" style="padding:2px 6px; font-size:0.82rem; width:90px" onchange="updateEmpField(${emp.id}, 'title', this.value)" /></td>
      <td style="padding:6px"><input type="text" value="${emp.name}" class="form-input" style="padding:2px 6px; font-size:0.82rem; width:100px; color:${emp.gender === 'F' ? '#dc2626' : 'inherit'}; font-weight:${emp.gender === 'F' ? 700 : 400}" onchange="updateEmpField(${emp.id}, 'name', this.value)" /></td>
      <td style="padding:6px">
        <select class="form-select" style="padding:2px 6px; font-size:0.82rem; width:80px" onchange="updateEmpField(${emp.id}, 'gender', this.value)">
          <option value="M" ${emp.gender === 'M' ? 'selected' : ''}>男</option>
          <option value="F" ${emp.gender === 'F' ? 'selected' : ''}>女 (紅字)</option>
        </select>
      </td>
      <td style="padding:6px">
        <select class="form-select" style="padding:2px 6px; font-size:0.82rem; width:80px" onchange="updateEmpField(${emp.id}, 'grade', this.value)">
          ${state.grades.map(g => `<option value="${g.id}" ${emp.grade === g.id ? 'selected' : ''}>${g.id} 級</option>`).join('')}
        </select>
      </td>
      <td style="padding:6px"><button type="button" onclick="deleteEmp(${emp.id})" style="background:none; border:none; color:#e11d48; cursor:pointer">&times;</button></td>
    </tr>
  `).join('');
}

window.toggleExcludedTitle = function(title, isExcluded) {
  if (isExcluded) {
    if (!state.rulesConfig.excludedTitles.includes(title)) state.rulesConfig.excludedTitles.push(title);
  } else {
    state.rulesConfig.excludedTitles = state.rulesConfig.excludedTitles.filter(t => t !== title);
  }
};

window.deleteConflict = function(cId) {
  state.rulesConfig.conflicts = state.rulesConfig.conflicts.filter(c => c.id !== cId);
  renderSettingsTabs();
  renderApp();
};

window.deleteGrade = function(gId) {
  if (state.grades.length <= 1) return alert('至少需保留一個等級！');
  state.grades = state.grades.filter(g => g.id !== gId);
  renderSettingsTabs();
  renderApp();
};

window.deleteShift = function(sId) {
  if (state.shifts.length <= 1) return alert('至少需保留一個班別！');
  state.shifts = state.shifts.filter(s => s.id !== sId);
  renderSettingsTabs();
  renderApp();
};

window.updateEmpField = function(empId, field, val) {
  const emp = state.employees.find(e => e.id === empId);
  if (emp) emp[field] = val;
  renderApp();
};

window.deleteEmp = function(empId) {
  if (confirm('確定刪除此位員工嗎？')) {
    state.employees = state.employees.filter(e => e.id !== empId);
    renderSettingsTabs();
    renderApp();
  }
};

// 8. 匯出功能 (Excel & 手機對稱圖片)
let exportMode = 'ALL';
function initExportOptions() {
  const dates = getDatesArray();
  document.getElementById('btn-range-all').innerText = `當月全月份 (1~${dates.length}日)`;
  const startSel = document.getElementById('export-start-date');
  const endSel = document.getElementById('export-end-date');
  startSel.innerHTML = dates.map(d => `<option value="${d}">${d} 號</option>`).join('');
  endSel.innerHTML = dates.map(d => `<option value="${d}">${d} 號</option>`).join('');
  startSel.value = '1';
  endSel.value = String(dates.length);
}

function getExportDates() {
  const dates = getDatesArray();
  if (exportMode === 'SAMPLE') return ['16', '17', '18'].filter(d => dates.includes(d));
  if (exportMode === 'CUSTOM') {
    const s = parseInt(document.getElementById('export-start-date').value, 10);
    const e = parseInt(document.getElementById('export-end-date').value, 10);
    return dates.filter(d => parseInt(d) >= Math.min(s, e) && parseInt(d) <= Math.max(s, e));
  }
  return dates;
}

// 匯出 Excel
async function doExportExcel() {
  if (!window.ExcelJS) {
    alert('ExcelJS 尚未完成載入，請確認網路連線正常。');
    return;
  }
  const dates = getExportDates();
  const rocYear = state.year - 1911;
  const layout = document.getElementById('export-excel-layout').value;
  const workbook = new window.ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`115.09月份班表`);
  const shiftMap = new Map(state.shifts.map(s => [s.id, s]));

  const hexToArgb = (hex) => {
    if (!hex) return 'FFFFFFFF';
    const clean = hex.replace('#', '').toUpperCase();
    return clean.length === 6 ? 'FF' + clean : clean;
  };

  if (layout === 'standard') {
    // A2:C2 合併
    worksheet.mergeCells('A2:C2');
    const titleCell = worksheet.getCell('A2');
    titleCell.value = `${rocYear}.${state.month}月班表`;
    titleCell.font = { name: '微軟正黑體', size: 11, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    worksheet.getCell('A3').value = '編號';
    worksheet.getCell('B3').value = '職稱';
    worksheet.getCell('C3').value = '姓名';

    dates.forEach((dStr, idx) => {
      const col = 4 + idx;
      const dNum = parseInt(dStr, 10);
      worksheet.getRow(1).getCell(col).value = `${dNum}號`;
      worksheet.getRow(2).getCell(col).value = getWeekdayName(state.year, state.month, dNum);
      worksheet.getRow(3).getCell(col).value = `${dNum}`;
    });

    const leaveCol = 4 + dates.length;
    const hoursCol = 5 + dates.length;
    worksheet.getCell(3, leaveCol).value = '休假天數';
    worksheet.getCell(3, hoursCol).value = '總工時(H)';

    let r = 4;
    state.employees.forEach(emp => {
      const row = worksheet.getRow(r);
      row.getCell(1).value = emp.id;
      row.getCell(2).value = emp.title;
      const c3 = row.getCell(3);
      c3.value = emp.name;
      if (emp.gender === 'F') {
        c3.font = { name: '微軟正黑體', color: { argb: 'FFFF0000' }, bold: true };
      }

      let lCount = 0, wCount = 0;
      dates.forEach((dStr, idx) => {
        const cell = row.getCell(4 + idx);
        const sId = state.schedule[emp.id]?.[dStr] || '';
        cell.value = sId;
        const sObj = shiftMap.get(sId);
        if (sObj?.isLeave) {
          lCount++;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(sObj.bg) } };
          cell.font = { name: '微軟正黑體', bold: true, color: { argb: hexToArgb(sObj.text) } };
        } else if (sId) {
          wCount++;
        }
      });

      row.getCell(leaveCol).value = lCount;
      row.getCell(hoursCol).value = wCount * 12;
      r++;
    });

    // 末行出勤人數
    worksheet.mergeCells(`A${r}:C${r}`);
    worksheet.getCell(`A${r}`).value = '出勤人數';
    dates.forEach((dStr, idx) => {
      let count = 0;
      state.employees.forEach(e => {
        const s = state.schedule[e.id]?.[dStr];
        const obj = shiftMap.get(s);
        if (s && obj && !obj.isLeave) count++;
      });
      worksheet.getRow(r).getCell(4 + idx).value = count;
    });
  } else {
    // 對稱雙欄版型 (原檔版型)
    const half = Math.ceil(state.employees.length / 2);
    const leftEmps = state.employees.slice(0, half);
    const rightEmps = state.employees.slice(half);

    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'F16日班';
    worksheet.mergeCells('H1:M1');
    worksheet.getCell('H1').value = 'F16日班';

    worksheet.mergeCells('A2:C2');
    worksheet.getCell('A2').value = `${rocYear}.${state.month}月份班表`;
    worksheet.mergeCells('H2:J2');
    worksheet.getCell('H2').value = `${rocYear}.${state.month}月份班表`;

    dates.forEach((d, i) => {
      worksheet.getCell(2, 4 + i).value = d;
      worksheet.getCell(2, 11 + i).value = d;
    });

    for (let i = 0; i < Math.max(leftEmps.length, rightEmps.length); i++) {
      const row = worksheet.getRow(3 + i);
      const eL = leftEmps[i];
      const eR = rightEmps[i];
      if (eL) {
        row.getCell(1).value = eL.id;
        row.getCell(2).value = eL.title;
        row.getCell(3).value = eL.name;
        if (eL.gender === 'F') row.getCell(3).font = { color: { argb: 'FFFF0000' }, bold: true };
        dates.forEach((d, dI) => {
          const s = state.schedule[eL.id]?.[d] || '';
          const c = row.getCell(4 + dI);
          c.value = s;
          const obj = shiftMap.get(s);
          if (obj?.isLeave) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(obj.bg) } };
        });
      }
      if (eR) {
        row.getCell(8).value = eR.id;
        row.getCell(9).value = eR.title;
        row.getCell(10).value = eR.name;
        if (eR.gender === 'F') row.getCell(10).font = { color: { argb: 'FFFF0000' }, bold: true };
        dates.forEach((d, dI) => {
          const s = state.schedule[eR.id]?.[d] || '';
          const c = row.getCell(11 + dI);
          c.value = s;
          const obj = shiftMap.get(s);
          if (obj?.isLeave) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(obj.bg) } };
        });
      }
    }

    const lastR = 3 + Math.max(leftEmps.length, rightEmps.length);
    worksheet.mergeCells(`A${lastR}:C${lastR}`);
    worksheet.getCell(`A${lastR}`).value = '出勤人數';
    worksheet.mergeCells(`H${lastR}:J${lastR}`);
    worksheet.getCell(`H${lastR}`).value = '出勤人數';
    dates.forEach((d, i) => {
      let count = 0;
      state.employees.forEach(e => {
        const s = state.schedule[e.id]?.[d];
        const obj = shiftMap.get(s);
        if (s && obj && !obj.isLeave) count++;
      });
      worksheet.getCell(lastR, 4 + i).value = count;
      worksheet.getCell(lastR, 11 + i).value = count;
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `F16日班_${rocYear}.${String(state.month).padStart(2, '0')}月份排班表.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// 匯出手機對稱圖片
async function doExportImage() {
  if (!window.html2canvas) {
    alert('html2canvas 載入中，請稍候重試。');
    return;
  }
  const el = document.getElementById('split-view-capture-area');
  // 若未顯示對稱雙欄，暫時切換以渲染
  const wasHidden = document.getElementById('container-split-view').style.display === 'none';
  if (wasHidden) document.getElementById('container-split-view').style.display = 'block';

  try {
    const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `F16日班_${state.year - 1911}.${state.month}月份手機對稱班表.png`;
    a.click();
  } catch (err) {
    console.error('Image export failed:', err);
    alert('圖片產生失敗，請重試。');
  } finally {
    if (wasHidden && state.viewMode === 'standard') {
      document.getElementById('container-split-view').style.display = 'none';
    }
  }
}

// 9. 事件綁定初始化
document.addEventListener('DOMContentLoaded', () => {
  // 年月份切換
  document.getElementById('select-year').addEventListener('change', (e) => {
    state.year = parseInt(e.target.value, 10);
    renderApp();
  });
  document.getElementById('select-month').addEventListener('change', (e) => {
    state.month = parseInt(e.target.value, 10);
    renderApp();
  });

  // 檢視模式切換
  document.getElementById('view-mode-standard').addEventListener('click', () => {
    state.viewMode = 'standard';
    document.getElementById('view-mode-standard').classList.add('active');
    document.getElementById('view-mode-split').classList.remove('active');
    document.getElementById('container-standard-view').style.display = 'block';
    document.getElementById('container-split-view').style.display = 'none';
  });

  document.getElementById('view-mode-split').addEventListener('click', () => {
    state.viewMode = 'split';
    document.getElementById('view-mode-split').classList.add('active');
    document.getElementById('view-mode-standard').classList.remove('active');
    document.getElementById('container-split-view').style.display = 'block';
    document.getElementById('container-standard-view').style.display = 'none';
  });

  // 頂部按鈕事件
  document.getElementById('btn-auto-schedule').addEventListener('click', runAutoSchedule);
  document.getElementById('btn-inspector').addEventListener('click', () => openModal('modal-inspector'));
  document.getElementById('btn-settings').addEventListener('click', () => openModal('modal-settings'));
  document.getElementById('btn-export').addEventListener('click', () => openModal('modal-export'));

  document.getElementById('btn-clear-schedule').addEventListener('click', () => {
    if (confirm('確定清空非鎖定的排班嗎？已預排的假別及已鎖定之班別將會保留。')) {
      const dates = getDatesArray();
      const shiftMap = new Map(state.shifts.map(s => [s.id, s]));
      state.employees.forEach(emp => {
        dates.forEach(d => {
          const s = state.schedule[emp.id]?.[d];
          const isL = state.lockedCells[`${emp.id}_${d}`];
          const obj = shiftMap.get(s);
          if (!isL && (!obj || !obj.isLeave)) {
            state.schedule[emp.id][d] = '';
          }
        });
      });
      renderApp();
    }
  });

  // 快速選班事件
  document.getElementById('btn-picker-close').addEventListener('click', closeQuickPicker);
  document.getElementById('btn-picker-clear').addEventListener('click', () => selectShift(''));
  document.getElementById('btn-picker-lock').addEventListener('click', () => {
    if (!state.activePicker) return;
    const { empId, dateStr } = state.activePicker;
    const key = `${empId}_${dateStr}`;
    state.lockedCells[key] = !state.lockedCells[key];
    closeQuickPicker();
    renderApp();
  });

  document.addEventListener('click', (e) => {
    const picker = document.getElementById('quick-picker');
    if (picker.classList.contains('active') && !picker.contains(e.target)) {
      closeQuickPicker();
    }
  });

  // 設定表單事件
  document.getElementById('input-max-consecutive').addEventListener('change', (e) => {
    state.rulesConfig.maxConsecutiveDays = parseInt(e.target.value, 10) || 5;
    renderApp();
  });

  document.getElementById('form-add-conflict').addEventListener('submit', (e) => {
    e.preventDefault();
    const id1 = parseInt(document.getElementById('conflict-emp1').value, 10);
    const id2 = parseInt(document.getElementById('conflict-emp2').value, 10);
    if (!id1 || !id2 || id1 === id2) return alert('請選擇兩位不同的員工！');
    state.rulesConfig.conflicts.push({
      id: `c_${Date.now()}`,
      empId1: id1,
      empId2: id2,
      reason: document.getElementById('conflict-reason').value.trim() || '自訂不可在同一個班別'
    });
    document.getElementById('conflict-reason').value = '';
    renderSettingsTabs();
    renderApp();
  });

  document.getElementById('form-add-grade').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-grade-id').value.trim().toUpperCase();
    if (state.grades.some(g => g.id === id)) return alert('已有相同等級代號！');
    state.grades.push({
      id,
      name: document.getElementById('input-grade-name').value.trim() || `${id} 級`,
      rank: parseInt(document.getElementById('input-grade-rank').value, 10) || 1
    });
    state.grades.sort((a, b) => b.rank - a.rank);
    document.getElementById('input-grade-id').value = '';
    document.getElementById('input-grade-name').value = '';
    renderSettingsTabs();
    renderApp();
  });

  document.getElementById('form-add-shift').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('input-shift-name').value.trim();
    if (state.shifts.some(s => s.id === name)) return alert('已有相同代號之班別！');
    const isLeave = document.getElementById('input-shift-category').value === 'leave';
    state.shifts.push({
      id: name,
      name: name,
      label: `${name} (${isLeave ? '休假' : '工作班'})`,
      bg: document.getElementById('input-shift-bg').value,
      text: document.getElementById('input-shift-text').value,
      isLeave: isLeave,
      minGrade: document.getElementById('input-shift-mingrade').value,
      genderReq: document.getElementById('input-shift-gender').value,
      defaultDemand: parseInt(document.getElementById('input-shift-demand').value, 10) || 1
    });
    document.getElementById('input-shift-name').value = '';
    renderSettingsTabs();
    renderApp();
  });

  document.getElementById('form-add-employee').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('input-emp-name').value.trim();
    if (!name) return;
    const maxId = state.employees.reduce((m, emp) => Math.max(m, emp.id), 0);
    state.employees.push({
      id: maxId + 1,
      title: document.getElementById('input-emp-title').value.trim() || '保全員',
      name: name,
      gender: document.getElementById('input-emp-gender').value,
      grade: document.getElementById('input-emp-grade').value,
      initialShifts: {}
    });
    document.getElementById('input-emp-name').value = '';
    renderSettingsTabs();
    renderApp();
  });

  document.getElementById('input-search-emp').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = state.employees.filter(emp => emp.name.toLowerCase().includes(q) || emp.title.toLowerCase().includes(q) || emp.grade.toLowerCase().includes(q));
    renderEmployeeTable(filtered);
  });

  // 匯出按鈕事件
  document.getElementById('btn-range-all').addEventListener('click', () => {
    exportMode = 'ALL';
    document.getElementById('btn-range-all').className = 'btn btn-primary';
    document.getElementById('btn-range-sample').className = 'btn btn-secondary';
    document.getElementById('btn-range-custom').className = 'btn btn-secondary';
    document.getElementById('wrap-range-custom').style.display = 'none';
  });
  document.getElementById('btn-range-sample').addEventListener('click', () => {
    exportMode = 'SAMPLE';
    document.getElementById('btn-range-sample').className = 'btn btn-primary';
    document.getElementById('btn-range-all').className = 'btn btn-secondary';
    document.getElementById('btn-range-custom').className = 'btn btn-secondary';
    document.getElementById('wrap-range-custom').style.display = 'none';
  });
  document.getElementById('btn-range-custom').addEventListener('click', () => {
    exportMode = 'CUSTOM';
    document.getElementById('btn-range-custom').className = 'btn btn-primary';
    document.getElementById('btn-range-all').className = 'btn btn-secondary';
    document.getElementById('btn-range-sample').className = 'btn btn-secondary';
    document.getElementById('wrap-range-custom').style.display = 'flex';
  });

  document.getElementById('btn-do-export-excel').addEventListener('click', doExportExcel);
  document.getElementById('btn-do-export-image').addEventListener('click', doExportImage);

  // 初始化首次渲染
  renderApp();
});
