/**
 * F16 智慧自動化排班系統 - 核心邏輯 (app.js)
 * 整合版本：支援手機版型直觀檢視、班別/假別/等級即時編輯、專屬班別限制、
 * 職稱自訂下拉選單、Excel 色塊匯入、純數字/中文星期匯出、圖片指定時段匯出
 */

// 1. 初始資料庫
const DEFAULT_TITLES = ['組長', '哨長', '保全員', '中控'];

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

// 全域狀態管理 (支援裝置本機儲存 localStorage)
const STORAGE_KEY = 'f16_schedule_v1';

function saveState() {
  try {
    const toSave = {
      year: state.year,
      month: state.month,
      dateRangeMode: state.dateRangeMode,
      customStartDay: state.customStartDay,
      customEndDay: state.customEndDay,
      jobTitles: state.jobTitles,
      employees: state.employees,
      shifts: state.shifts,
      grades: state.grades,
      rulesConfig: state.rulesConfig,
      schedule: state.schedule,
      lockedCells: state.lockedCells
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    const el = document.getElementById('stat-save-status');
    if (el) { el.innerText = '💾 已自動儲存'; el.style.color = '#059669'; }
  } catch(e) {
    console.warn('localStorage save failed:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    if (saved.year) state.year = saved.year;
    if (saved.month) state.month = saved.month;
    if (saved.dateRangeMode) state.dateRangeMode = saved.dateRangeMode;
    if (saved.customStartDay) state.customStartDay = saved.customStartDay;
    if (saved.customEndDay) state.customEndDay = saved.customEndDay;
    if (saved.jobTitles && saved.jobTitles.length) state.jobTitles = saved.jobTitles;
    if (saved.employees && saved.employees.length) state.employees = saved.employees;
    if (saved.shifts && saved.shifts.length) state.shifts = saved.shifts;
    if (saved.grades && saved.grades.length) state.grades = saved.grades;
    if (saved.rulesConfig) state.rulesConfig = Object.assign(state.rulesConfig, saved.rulesConfig);
    if (saved.schedule) state.schedule = saved.schedule;
    if (saved.lockedCells) state.lockedCells = saved.lockedCells;
    return true;
  } catch(e) {
    console.warn('localStorage load failed:', e);
    return false;
  }
}

// 清空所有排班 (使用者需求：新增一個按鈕，可以清空所有排班)
function clearAllSchedule() {
  if (!confirm('確定要清空所有排班嗎？所有員工在目前與所有日期的排班資料都將被清空。')) return;
  state.employees.forEach(emp => {
    state.schedule[emp.id] = {};
    for (let d = 1; d <= 31; d++) {
      state.schedule[emp.id][String(d)] = '';
    }
  });
  state.lockedCells = {};
  renderApp();
  alert('已清空所有排班資料！');
}

// 回到目前預設值 (使用者需求：新增一個按鈕回到目前預設值)
function resetToDefaults() {
  if (!confirm('確定要回到目前預設值嗎？這將重設所有自訂員工、班別、等級、規則與排班設定，恢復至系統初始預設值。')) return;
  localStorage.removeItem(STORAGE_KEY);
  state.year = 2026;
  state.month = 9;
  state.dateRangeMode = 'MONTH';
  state.customStartDay = 1;
  state.customEndDay = 18;
  state.jobTitles = [...DEFAULT_TITLES];
  state.employees = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));
  state.shifts = [...LEAVE_SHIFTS, ...WORK_SHIFTS];
  state.grades = JSON.parse(JSON.stringify(DEFAULT_GRADES));
  state.rulesConfig = {
    maxConsecutiveDays: 5,
    excludedTitles: ['中控'],
    conflicts: [{ id: 'c1', empId1: 2, empId2: 3, reason: '袁國峻 與 何峻岱 哨長不可在同一個班別' }],
    specificShifts: [],
    workingHoursPerDay: 12
  };
  state.schedule = {};
  state.lockedCells = {};
  state.highlightCell = null;
  // sync selects
  const ySel = document.getElementById('select-year');
  const mSel = document.getElementById('select-month');
  if (ySel) ySel.value = '2026';
  if (mSel) mSel.value = '9';
  initSchedule();
  renderApp();
  saveState();
  alert('已成功恢復至系統預設值！');
}

let state = {
  year: 2026,
  month: 9,
  dateRangeMode: 'MONTH', // 'MONTH' | 'SAMPLE' | 'CUSTOM'
  customStartDay: 1,
  customEndDay: 18,
  jobTitles: [...DEFAULT_TITLES],
  employees: JSON.parse(JSON.stringify(INITIAL_EMPLOYEES)),
  shifts: [...LEAVE_SHIFTS, ...WORK_SHIFTS],
  grades: JSON.parse(JSON.stringify(DEFAULT_GRADES)),
  rulesConfig: {
    maxConsecutiveDays: 5,
    excludedTitles: ['中控'],
    conflicts: [
      { id: 'c1', empId1: 2, empId2: 3, reason: '袁國峻 與 何峻岱 哨長不可在同一個班別' }
    ],
    specificShifts: [],
    workingHoursPerDay: 12
  },
  schedule: {},
  lockedCells: {},
  viewMode: 'standard',
  highlightCell: null,
  activeSettingsTab: 'rules',
  activePicker: null,
  filterInspectorCategory: 'ALL'
};

// 初始化排班表
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
// 嘗試從 localStorage 載入已儲存狀態
loadState();

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// 星期中文單字對照 (純中文一、二、三... 日期純數字 1、2、3...)
const WEEKDAYS_CLEAN = ['日', '一', '二', '三', '四', '五', '六'];
function getCleanWeekday(year, month, day) {
  const d = new Date(year, month - 1, parseInt(day, 10));
  return WEEKDAYS_CLEAN[d.getDay()];
}

// 支援自訂日期區間、原檔區間(16~18)與當月全月份
function getDatesArray() {
  const total = getDaysInMonth(state.year, state.month);
  if (state.dateRangeMode === 'SAMPLE') {
    return ['16', '17', '18'].filter(d => parseInt(d, 10) <= total);
  } else if (state.dateRangeMode === 'CUSTOM') {
    const s = Math.max(1, Math.min(state.customStartDay || 1, total));
    const e = Math.max(s, Math.min(state.customEndDay || total, total));
    const arr = [];
    for (let i = s; i <= e; i++) arr.push(String(i));
    return arr;
  }
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

  // 5. 指定員工專屬班別限制
  (state.rulesConfig.specificShifts || []).forEach(rule => {
    const emp = empMap.get(rule.empId);
    if (!emp) return;
    dates.forEach(d => {
      const sId = state.schedule[emp.id]?.[d];
      if (!sId) return;
      const sObj = shiftMap.get(sId);
      if (sObj && !sObj.isLeave && !rule.allowedShiftIds.includes(sId)) {
        violations.push({
          id: `specific-${emp.id}-${d}`,
          type: 'SPECIFIC_SHIFT_MISMATCH',
          category: '專屬班別限制',
          empId: emp.id,
          empName: emp.name,
          empTitle: emp.title,
          date: d,
          message: `人員限定僅可上 [${rule.allowedShiftIds.join(', ')}]，目前排入「${sId}」`
        });
      }
    });
  });

  return violations;
}

// 3. 自動排班演算法 (Auto-Scheduler) - 依設定規則嚴格排班，除非沒辦法才適度放寬軟性限制
function runAutoSchedule() {
  if (!confirm('確定要依照目前設定的各項規則執行一鍵自動化排班嗎？')) return;

  const shiftMap = new Map(state.shifts.map(s => [s.id, s]));
  const gradeRankMap = new Map(state.grades.map(g => [g.id, g.rank]));
  const maxConsecutive = state.rulesConfig.maxConsecutiveDays || 5;
  const dates = getDatesArray();

  // 建立專屬班別限制對照表: empId -> Set of allowedShiftIds
  const specificMap = new Map();
  (state.rulesConfig.specificShifts || []).forEach(r => {
    specificMap.set(r.empId, new Set(r.allowedShiftIds));
  });

  // 複製原表，嚴格保留手動鎖定及已排之假別
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

      // 第一階段：嚴格滿足所有設定規則 (等級、性別、專屬班別、互斥、連續上班天數)
      let candidates = activeEmps.filter(emp => {
        if (todayAssigned.has(emp.id)) return false;

        // 專屬班別限制：若該員工有限定班別，則只能排入限定名單內
        const allowedSet = specificMap.get(emp.id);
        if (allowedSet && !allowedSet.has(shift.id)) return false;

        // 等級限制
        if ((gradeRankMap.get(emp.grade) || 1) < reqRank) return false;
        // 性別限制
        if (shift.genderReq === 'M' && emp.gender !== 'M') return false;
        if (shift.genderReq === 'F' && emp.gender !== 'F') return false;
        // 連續上班天數限制
        if (getConsecutive(emp.id, dIdx - 1) >= maxConsecutive) return false;

        // 互斥限制
        const inShift = dayAssignments.get(shift.id) || [];
        const confs = conflictMap.get(emp.id);
        if (confs && inShift.some(id => confs.has(id))) return false;
        return true;
      });

      // 排序候選人：適配度最高、工作次數最少者優先
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

      // 第二階段：「除非沒辦法」時放寬連上天數，但硬性規定(等級、性別、專屬、互斥)仍嚴格守護
      if (filled < needed) {
        let fallbackCandidates = activeEmps.filter(emp => {
          if (todayAssigned.has(emp.id)) return false;
          const allowedSet = specificMap.get(emp.id);
          if (allowedSet && !allowedSet.has(shift.id)) return false;
          if ((gradeRankMap.get(emp.grade) || 1) < reqRank) return false;
          if (shift.genderReq === 'M' && emp.gender !== 'M') return false;
          if (shift.genderReq === 'F' && emp.gender !== 'F') return false;
          const inShift = dayAssignments.get(shift.id) || [];
          const confs = conflictMap.get(emp.id);
          if (confs && inShift.some(id => confs.has(id))) return false;
          return true;
        });

        fallbackCandidates.sort((a, b) => (empWorkCount.get(a.id) || 0) - (empWorkCount.get(b.id) || 0));
        for (const cand of fallbackCandidates) {
          if (filled >= needed) break;
          newSched[cand.id][d] = shift.id;
          todayAssigned.add(cand.id);
          dayAssignments.get(shift.id).push(cand.id);
          empWorkCount.set(cand.id, (empWorkCount.get(cand.id) || 0) + 1);
          filled++;
        }
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

// 4. 表格渲染 (標準寬表)
function renderApp() {
  const dates = getDatesArray();
  const violations = validateSchedule();
  const violationSet = new Set(violations.map(v => `${v.empId}_${v.date}`));
  const shiftMap = new Map(state.shifts.map(s => [s.id, s]));
  const rocYear = state.year - 1911;

  // 同步年月下拉選單
  const ySel = document.getElementById('select-year');
  const mSel = document.getElementById('select-month');
  if (ySel && ySel.value !== String(state.year)) ySel.value = String(state.year);
  if (mSel && mSel.value !== String(state.month)) mSel.value = String(state.month);

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

  // 同步主畫面日期區間按鈕外觀
  const btnMonth = document.getElementById('btn-view-range-month');
  const btnSample = document.getElementById('btn-view-range-sample');
  const btnCustom = document.getElementById('btn-view-range-custom');
  const wrapCustom = document.getElementById('wrap-view-range-custom');
  if (btnMonth && btnSample && btnCustom) {
    btnMonth.className = state.dateRangeMode === 'MONTH' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    btnSample.className = state.dateRangeMode === 'SAMPLE' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    btnCustom.className = state.dateRangeMode === 'CUSTOM' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary';
    if (wrapCustom) wrapCustom.style.display = state.dateRangeMode === 'CUSTOM' ? 'inline-flex' : 'none';
  }

  // 同步手機版規則檢驗按鈕
  const badgeM = document.getElementById('violation-badge-m');
  const labelM = document.getElementById('inspector-label-m');
  const btnInspM = document.getElementById('btn-inspector-m');
  if (btnInspM) {
    if (violations.length > 0) {
      if (badgeM) { badgeM.style.display = 'inline-flex'; badgeM.innerText = violations.length; }
      if (labelM) labelM.innerText = `規則違規(${violations.length})`;
      btnInspM.className = 'btn btn-violation';
    } else {
      if (badgeM) badgeM.style.display = 'none';
      if (labelM) labelM.innerText = '規則檢視';
      btnInspM.className = 'btn btn-success';
    }
  }

  renderStandardTable(dates, shiftMap, violationSet);
  renderSplitTable(dates, shiftMap, new Set(), rocYear); // 保持隱藏的對稱表同步
  renderInspectorModal(violations);

  // 儲存狀態
  saveState();
}

function renderStandardTable(dates, shiftMap, violationSet) {
  const table = document.getElementById('table-standard');
  let html = '<thead><tr>';
  html += '<th class="col-sticky-1" rowspan="2" style="z-index:35">編號</th>';
  html += '<th class="col-sticky-2" rowspan="2" style="z-index:35">職稱</th>';
  html += '<th class="col-sticky-3" rowspan="2" style="z-index:35">姓名</th>';
  dates.forEach(d => {
    html += `<th style="background:#ede9fe; color:#4338ca">${d}</th>`;
  });
  html += '<th class="col-stat" rowspan="2" style="background:#fee2e2; color:#991b1b; z-index:25">休假</th>';
  html += '<th class="col-stat" rowspan="2" style="background:#e0e7ff; color:#3730a3; z-index:25">工時(12H)</th>';
  html += '</tr><tr>';

  dates.forEach(d => {
    const w = getCleanWeekday(state.year, state.month, d);
    const isWk = w === '六' || w === '日';
    html += `<th style="background:${isWk ? '#fef3c7' : '#f8fafc'}; color:${isWk ? '#b45309' : 'var(--text-muted)'}; font-size:0.75rem">${w}</th>`;
  });
  html += '</tr></thead><tbody>';

  // 依照員工編號 (ID) 嚴格由小至大排序呈現班表
  const sortedEmployees = [...state.employees].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

  sortedEmployees.forEach(emp => {
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
    html += `<td class="col-sticky-3"><div style="display:flex; align-items:center; justify-content:center; gap:3px">`;
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
  html += '<td class="col-sticky-1" colspan="3" style="z-index:35">出勤人數</td>';
  dates.forEach(d => {
    let count = 0;
    state.employees.forEach(emp => {
      const sId = state.schedule[emp.id]?.[d];
      const sObj = shiftMap.get(sId);
      if (sId && sObj && !sObj.isLeave) count++;
    });
    html += `<td style="font-weight:800">${count}</td>`;
  });
  html += '<td class="col-stat" colspan="2" style="font-size:0.75rem; color:var(--text-muted)">12H/班</td>';
  html += '</tr></tbody>';

  table.innerHTML = html;
}

function renderSplitTable(dates, shiftMap, violationSet, rocYear) {
  const table = document.getElementById('table-split');
  // 依照員工編號排序後，分為左右等份
  const sorted = [...state.employees].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  const half = Math.ceil(sorted.length / 2);
  const leftEmps = sorted.slice(0, half);
  const rightEmps = sorted.slice(half);
  const maxRows = Math.max(leftEmps.length, rightEmps.length);

  let html = '<thead>';
  html += `<tr style="background:#1e293b; color:white">`;
  html += `<th colspan="${3 + dates.length}" style="font-size:0.95rem; padding:5px; color:white; background:#1e293b">F16日班</th>`;
  html += `<th style="width:10px; background:#e2e8f0; border:none"></th>`;
  html += `<th colspan="${3 + dates.length}" style="font-size:0.95rem; padding:5px; color:white; background:#1e293b">F16日班</th>`;
  html += `</tr>`;

  html += `<tr style="background:#f1f5f9">`;
  html += `<th colspan="3" style="font-weight:800; color:#334155">${rocYear}.${String(state.month).padStart(2, '0')}月份班表</th>`;
  dates.forEach(d => html += `<th style="background:#ede9fe; color:#4338ca; font-weight:800">${d}</th>`);
  html += `<th style="width:10px; background:#e2e8f0; border:none"></th>`;
  html += `<th colspan="3" style="font-weight:800; color:#334155">${rocYear}.${String(state.month).padStart(2, '0')}月份班表</th>`;
  dates.forEach(d => html += `<th style="background:#ede9fe; color:#4338ca; font-weight:800">${d}</th>`);
  html += `</tr>`;

  html += `<tr style="background:#f8fafc; font-size:0.72rem">`;
  html += `<th style="min-width:32px">號</th><th style="min-width:50px">職稱</th><th style="min-width:65px">姓名</th>`;
  dates.forEach(d => html += `<th>${getCleanWeekday(state.year, state.month, d)}</th>`);
  html += `<th style="width:10px; background:#e2e8f0; border:none"></th>`;
  html += `<th style="min-width:32px">號</th><th style="min-width:50px">職稱</th><th style="min-width:65px">姓名</th>`;
  dates.forEach(d => html += `<th>${getCleanWeekday(state.year, state.month, d)}</th>`);
  html += `</tr></thead><tbody>`;

  for (let r = 0; r < maxRows; r++) {
    const eL = leftEmps[r];
    const eR = rightEmps[r];
    html += '<tr>';
    if (eL) {
      html += `<td style="font-weight:600; color:#64748b">${eL.id}</td><td style="font-size:0.74rem; font-weight:600">${eL.title}</td>`;
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

    html += `<td style="width:10px; background:#e2e8f0; border:none"></td>`;

    if (eR) {
      html += `<td style="font-weight:600; color:#64748b">${eR.id}</td><td style="font-size:0.74rem; font-weight:600">${eR.title}</td>`;
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
  html += '<td style="width:10px; background:#e2e8f0; border:none"></td>';
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

// 5. 快速選班彈出層
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

  // 假別 Chips
  const leaveWrap = document.getElementById('picker-leave-chips');
  leaveWrap.innerHTML = state.shifts.filter(s => s.isLeave).map(s => `
    <div class="shift-chip" style="background-color:${s.bg}; color:${s.text}; font-weight:700; border:${currentShift === s.id ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.15)'}"
      onclick="selectShift('${s.id}')">${s.name}</div>
  `).join('');

  // 工作班 Chips
  const workWrap = document.getElementById('picker-work-chips');
  workWrap.innerHTML = state.shifts.filter(s => !s.isLeave).map(s => `
    <div class="shift-chip" style="background-color:${s.bg}; color:${s.text}; font-weight:600; border:${currentShift === s.id ? '2px solid var(--primary)' : '1px solid var(--border-color)'}"
      onclick="selectShift('${s.id}')">${s.name}</div>
  `).join('');

  const popover = document.getElementById('quick-picker');
  const rect = e.currentTarget.getBoundingClientRect();
  const left = Math.min(Math.max(10, rect.left), window.innerWidth - 330);
  const top = Math.min(Math.max(10, rect.bottom + 6), window.innerHeight - 390);

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
  const specificCount = violations.filter(v => v.type === 'SPECIFIC_SHIFT_MISMATCH').length;

  document.getElementById('stat-count-streak').innerText = streakCount;
  document.getElementById('stat-count-streak').style.color = streakCount > 0 ? '#e11d48' : '#059669';
  document.getElementById('stat-count-grade').innerText = gradeCount;
  document.getElementById('stat-count-grade').style.color = gradeCount > 0 ? '#d97706' : '#059669';
  document.getElementById('stat-count-gender').innerText = genderCount;
  document.getElementById('stat-count-gender').style.color = genderCount > 0 ? '#e11d48' : '#059669';
  document.getElementById('stat-count-conflict').innerText = conflictCount;
  document.getElementById('stat-count-conflict').style.color = conflictCount > 0 ? '#e11d48' : '#059669';
  document.getElementById('stat-count-specific').innerText = specificCount;
  document.getElementById('stat-count-specific').style.color = specificCount > 0 ? '#e11d48' : '#059669';

  const list = document.getElementById('inspector-violations-list');
  if (violations.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding:2rem 1rem; color:var(--text-muted)">
        <div style="font-size:2rem; margin-bottom:0.5rem">🎉</div>
        <div style="font-size:1.05rem; font-weight:700; color:#047857">太棒了！沒有發現任何違規項目</div>
        <p style="font-size:0.82rem; margin-top:0.25rem">所有人員均符合連續上班天數限制（≤ ${state.rulesConfig.maxConsecutiveDays || 5} 天）、等級位階、專屬班別與互斥條件。</p>
      </div>`;
  } else {
    list.innerHTML = violations.map(v => `
      <div class="violation-card" onclick="jumpToCell('${v.empId}_${v.date}')">
        <div class="violation-info">
          <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap">
            <span class="violation-emp">${v.empName} (${v.empTitle})</span>
            <span style="font-size:0.74rem; padding:1px 6px; border-radius:4px; background:#fee2e2; color:#991b1b; font-weight:700">${v.category}</span>
            <span style="font-size:0.76rem; color:var(--text-muted)">📅 日期: ${v.date} 號</span>
          </div>
          <div class="violation-desc">${v.message}</div>
        </div>
        <div style="display:flex; align-items:center; color:#e11d48; font-size:0.8rem; font-weight:700">定位 &rarr;</div>
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
  ['rules', 'grades', 'shifts', 'employees', 'titles'].forEach(t => {
    const pane = document.getElementById(`tab-pane-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (pane) pane.style.display = t === tabName ? 'block' : 'none';
    if (btn) btn.className = `tab-btn ${t === tabName ? 'active' : ''}`;
  });
};

function renderSettingsTabs() {
  // A. Rules tab
  document.getElementById('input-max-consecutive').value = state.rulesConfig.maxConsecutiveDays || 5;
  const titleWrap = document.getElementById('excluded-titles-checkboxes');
  titleWrap.innerHTML = state.jobTitles.map(t => {
    const checked = state.rulesConfig.excludedTitles?.includes(t) ? 'checked' : '';
    return `<label style="display:flex; align-items:center; gap:6px; font-size:0.84rem; cursor:pointer">
      <input type="checkbox" onchange="toggleExcludedTitle('${t}', this.checked)" ${checked} /> 排除 <strong>${t}</strong>
    </label>`;
  }).join('');

  // 專屬班別限制員工選單與班別勾選區
  const specEmpSel = document.getElementById('specific-emp-select');
  specEmpSel.innerHTML = '<option value="">選擇員工...</option>' + state.employees.map(e => `<option value="${e.id}">${e.id}. ${e.name} (${e.title})</option>`).join('');
  const specShiftsWrap = document.getElementById('specific-shifts-checkboxes');
  specShiftsWrap.innerHTML = state.shifts.filter(s => !s.isLeave).map(s => `
    <label style="display:inline-flex; align-items:center; gap:3px; font-size:0.78rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; cursor:pointer">
      <input type="checkbox" name="spec-shift-cb" value="${s.id}" /> ${s.name}
    </label>
  `).join('');

  renderSpecificShiftsList();

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
    <div style="display:flex; align-items:center; justify-content:space-between; padding:0.4rem 0.65rem; background:var(--bg-surface); border-radius:6px; border:1px solid var(--border-color)">
      <div style="font-size:0.82rem">
        <span style="font-weight:700; color:#e11d48">${empMap.get(c.empId1)?.name || c.empId1}</span>
        <span style="margin:0 4px; color:var(--text-muted)">≠</span>
        <span style="font-weight:700; color:#e11d48">${empMap.get(c.empId2)?.name || c.empId2}</span>
        <span style="margin-left:8px; font-size:0.75rem; color:var(--text-muted)">(${c.reason})</span>
      </div>
      <button type="button" onclick="deleteConflict('${c.id}')" style="background:none; border:none; color:#e11d48; cursor:pointer; font-size:16px">&times;</button>
    </div>
  `).join('');

  // B. Grades tab (支援直接在表格編輯)
  const gBody = document.getElementById('grades-table-body');
  gBody.innerHTML = state.grades.map(g => `
    <tr style="border-bottom:1px solid var(--border-color)">
      <td style="padding:6px"><span class="grade-badge grade-${g.id}">${g.id}</span></td>
      <td style="padding:6px">
        <input type="text" class="form-input" style="padding:2px 6px; font-size:0.82rem; width:150px" value="${g.name}" onchange="updateGradeField('${g.id}', 'name', this.value)" />
      </td>
      <td style="padding:6px">
        <input type="number" min="1" max="20" class="form-input" style="padding:2px 6px; font-size:0.82rem; width:70px" value="${g.rank}" onchange="updateGradeField('${g.id}', 'rank', parseInt(this.value,10)||1)" />
      </td>
      <td style="padding:6px">
        <button type="button" onclick="deleteGrade('${g.id}')" style="background:none; border:none; color:#e11d48; cursor:pointer">&times;</button>
      </td>
    </tr>
  `).join('');

  // C. Shifts tab (支援直接在表格編輯)
  const sGradeSel = document.getElementById('input-shift-mingrade');
  sGradeSel.innerHTML = state.grades.map(g => `<option value="${g.id}">${g.id} 級以上</option>`).join('');
  const sBody = document.getElementById('shifts-table-body');
  sBody.innerHTML = state.shifts.map(s => `
    <tr style="border-bottom:1px solid var(--border-color)">
      <td style="padding:4px">
        <span id="shift-badge-${s.id}" style="padding:2px 6px; border-radius:4px; background-color:${s.bg}; color:${s.text}; font-weight:700; font-size:0.8rem">
          ${s.name}
        </span>
      </td>
      <td style="padding:4px">
        <input type="text" class="form-input" style="padding:2px 5px; font-size:0.8rem; width:85px" value="${s.name}" onchange="updateShiftField('${s.id}', 'name', this.value)" />
      </td>
      <td style="padding:4px; white-space:nowrap">
        <input type="color" value="${s.bg}" style="border:none; width:22px; height:22px; cursor:pointer; vertical-align:middle" onchange="updateShiftField('${s.id}', 'bg', this.value)" title="修改背景色" />
        <input type="color" value="${s.text}" style="border:none; width:22px; height:22px; cursor:pointer; vertical-align:middle; margin-left:3px" onchange="updateShiftField('${s.id}', 'text', this.value)" title="修改文字色" />
      </td>
      <td style="padding:4px">
        <select class="form-select" style="padding:2px 4px; font-size:0.78rem; width:75px" onchange="updateShiftField('${s.id}', 'isLeave', this.value === 'true')">
          <option value="false" ${!s.isLeave ? 'selected' : ''}>工作班</option>
          <option value="true" ${s.isLeave ? 'selected' : ''}>休假別</option>
        </select>
      </td>
      <td style="padding:4px">
        <select class="form-select" style="padding:2px 4px; font-size:0.78rem; width:75px" onchange="updateShiftField('${s.id}', 'minGrade', this.value)">
          ${state.grades.map(g => `<option value="${g.id}" ${s.minGrade === g.id ? 'selected' : ''}>${g.id} 級</option>`).join('')}
        </select>
      </td>
      <td style="padding:4px">
        <select class="form-select" style="padding:2px 4px; font-size:0.78rem; width:70px" onchange="updateShiftField('${s.id}', 'genderReq', this.value)">
          <option value="ANY" ${s.genderReq === 'ANY' ? 'selected' : ''}>不限</option>
          <option value="M" ${s.genderReq === 'M' ? 'selected' : ''}>限男</option>
          <option value="F" ${s.genderReq === 'F' ? 'selected' : ''}>限女</option>
        </select>
      </td>
      <td style="padding:4px">
        <input type="number" min="1" max="20" class="form-input" style="padding:2px 4px; font-size:0.78rem; width:55px" value="${s.defaultDemand || 1}" ${s.isLeave ? 'disabled' : ''} onchange="updateShiftField('${s.id}', 'defaultDemand', parseInt(this.value,10)||1)" />
      </td>
      <td style="padding:4px">
        <button type="button" onclick="deleteShift('${s.id}')" style="background:none; border:none; color:#e11d48; cursor:pointer">&times;</button>
      </td>
    </tr>
  `).join('');

  // D. Employees tab (職稱下拉式選單)
  const empTitleSel = document.getElementById('input-emp-title-select');
  empTitleSel.innerHTML = state.jobTitles.map(t => `<option value="${t}">${t}</option>`).join('');
  const eGradeSel = document.getElementById('input-emp-grade');
  eGradeSel.innerHTML = state.grades.map(g => `<option value="${g.id}">${g.id} 級</option>`).join('');
  renderEmployeeTable(state.employees);

  // E. Titles tab
  renderTitlesTable();
}

function renderSpecificShiftsList() {
  const wrap = document.getElementById('specific-shifts-list');
  const empMap = new Map(state.employees.map(e => [e.id, e]));
  wrap.innerHTML = (state.rulesConfig.specificShifts || []).map(r => {
    const emp = empMap.get(r.empId);
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:0.35rem 0.6rem; background:var(--bg-surface); border-radius:6px; border:1px solid var(--border-color)">
        <div style="font-size:0.8rem">
          <strong>${emp?.name || r.empId}</strong> (${emp?.title || ''}) 限定只上: 
          <span style="color:var(--primary); font-weight:700">[ ${r.allowedShiftIds.join(', ')} ]</span>
        </div>
        <button type="button" onclick="deleteSpecificShift('${r.id}')" style="background:none; border:none; color:#e11d48; cursor:pointer">&times;</button>
      </div>`;
  }).join('');
}

window.deleteSpecificShift = function(id) {
  state.rulesConfig.specificShifts = state.rulesConfig.specificShifts.filter(r => r.id !== id);
  renderSpecificShiftsList();
  renderApp();
};

function renderEmployeeTable(list) {
  const eBody = document.getElementById('employees-table-body');
  eBody.innerHTML = list.map(emp => `
    <tr style="border-bottom:1px solid var(--border-color)">
      <td style="padding:4px">
        <input type="number" min="1" max="999" value="${emp.id}" class="form-input" style="padding:2px 4px; font-size:0.8rem; width:60px; font-weight:600; color:var(--text-muted)" onchange="updateEmpId(${emp.id}, parseInt(this.value,10)||${emp.id})" />
      </td>
      <td style="padding:4px">
        <select class="form-select" style="padding:2px 4px; font-size:0.8rem; width:95px" onchange="updateEmpField(${emp.id}, 'title', this.value)">
          ${state.jobTitles.map(t => `<option value="${t}" ${emp.title === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </td>
      <td style="padding:4px">
        <input type="text" value="${emp.name}" class="form-input" style="padding:2px 4px; font-size:0.8rem; width:90px; color:${emp.gender === 'F' ? '#dc2626' : 'inherit'}; font-weight:${emp.gender === 'F' ? 700 : 400}" onchange="updateEmpField(${emp.id}, 'name', this.value)" />
      </td>
      <td style="padding:4px">
        <select class="form-select" style="padding:2px 4px; font-size:0.8rem; width:75px" onchange="updateEmpField(${emp.id}, 'gender', this.value)">
          <option value="M" ${emp.gender === 'M' ? 'selected' : ''}>男</option>
          <option value="F" ${emp.gender === 'F' ? 'selected' : ''}>女 (紅)</option>
        </select>
      </td>
      <td style="padding:4px">
        <select class="form-select" style="padding:2px 4px; font-size:0.8rem; width:75px" onchange="updateEmpField(${emp.id}, 'grade', this.value)">
          ${state.grades.map(g => `<option value="${g.id}" ${emp.grade === g.id ? 'selected' : ''}>${g.id} 級</option>`).join('')}
        </select>
      </td>
      <td style="padding:4px">
        <button type="button" onclick="deleteEmp(${emp.id})" style="background:none; border:none; color:#e11d48; cursor:pointer">×</button>
      </td>
    </tr>
  `).join('');
}

function renderTitlesTable() {
  const tBody = document.getElementById('titles-table-body');
  tBody.innerHTML = state.jobTitles.map(t => {
    const count = state.employees.filter(e => e.title === t).length;
    return `
      <tr style="border-bottom:1px solid var(--border-color)">
        <td style="padding:6px; font-weight:700">${t}</td>
        <td style="padding:6px">${count} 人</td>
        <td style="padding:6px">
          <button type="button" onclick="deleteJobTitle('${t}')" style="background:none; border:none; color:#e11d48; cursor:pointer">&times;</button>
        </td>
      </tr>`;
  }).join('');
}

window.deleteJobTitle = function(title) {
  const usedCount = state.employees.filter(e => e.title === title).length;
  if (usedCount > 0) {
    if (!confirm(`目前有 ${usedCount} 位員工使用「${title}」職稱，刪除後將會將其移為其他職稱。確認刪除？`)) return;
  }
  state.jobTitles = state.jobTitles.filter(t => t !== title);
  renderSettingsTabs();
  renderApp();
};

window.updateShiftField = function(shiftId, field, val) {
  const s = state.shifts.find(x => x.id === shiftId);
  if (s) {
    s[field] = val;
    renderApp();
  }
};

window.updateGradeField = function(gradeId, field, val) {
  const g = state.grades.find(x => x.id === gradeId);
  if (g) {
    g[field] = val;
    state.grades.sort((a, b) => b.rank - a.rank);
    renderApp();
  }
};

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

window.updateEmpId = function(oldId, newId) {
  if (isNaN(newId) || newId <= 0) return;
  if (newId === oldId) return;
  if (state.employees.some(e => e.id === newId)) {
    alert('已存在此編號的員工！');
    renderEmployeeTable(state.employees);
    return;
  }
  const emp = state.employees.find(e => e.id === oldId);
  if (!emp) return;
  // 更新 schedule keys
  if (state.schedule[oldId]) {
    state.schedule[newId] = state.schedule[oldId];
    delete state.schedule[oldId];
  }
  // 更新 lockedCells keys
  const newLocked = {};
  Object.keys(state.lockedCells).forEach(k => {
    if (k.startsWith(`${oldId}_`)) {
      newLocked[`${newId}_${k.slice(String(oldId).length + 1)}`] = state.lockedCells[k];
    } else {
      newLocked[k] = state.lockedCells[k];
    }
  });
  state.lockedCells = newLocked;
  // 更新 conflicts
  (state.rulesConfig.conflicts || []).forEach(c => {
    if (c.empId1 === oldId) c.empId1 = newId;
    if (c.empId2 === oldId) c.empId2 = newId;
  });
  (state.rulesConfig.specificShifts || []).forEach(r => {
    if (r.empId === oldId) r.empId = newId;
  });
  emp.id = newId;
  // 重新排序
  state.employees.sort((a, b) => a.id - b.id);
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

// 8. Excel 色塊匯入功能 (Import Excel with Color & Text Mapping)
async function handleImportExcel(file) {
  if (!window.ExcelJS) {
    alert('ExcelJS 載入中，請稍候重試。');
    return;
  }
  if (!confirm(`確定要匯入「${file.name}」嗎？這將會依照色塊與文字更新系統內的排班資料。`)) {
    return;
  }
  try {
    const arrayBuffer = await file.arrayBuffer();
    const wb = new window.ExcelJS.Workbook();
    await wb.xlsx.load(arrayBuffer);
    const ws = wb.worksheets[0];

    // 色塊代號映射表 - 支援多種 6位 ARGB hex
    const colorToShiftMap = {
      'FFC7CE': '休',  // 紅色系休假
      'FFCCCC': '休',  // 淡紅
      'FF0000': '休',  // 純紅
      '262626': '停',  // 停休 (深灰近黑)
      '000000': '停',  // 純黑
      '1F1F1F': '停',  // 深灰
      'FCE4D6': '粉',  // 粉假
      'F4CCCC': '粉',  // 淡粉
      'FFD9C2': '粉',  // 暖橙
      'C6EFCE': '綠',  // 綠假
      'D9EAD3': '綠',  // 淡綠
      'BDD7EE': '藍',  // 藍假
      'CFE2F3': '藍',  // 淡藍
      'D9E1F2': '藍'   // 淡藍紫
    };

    function matchColor(hex) {
      if (!hex || hex.length < 6) return null;
      try {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        if (r > 200 && g < 170 && b < 210) return '休';
        if (r < 50 && g < 50 && b < 50) return '停';
        if (g > 190 && r < 220 && b < 220 && g > r && g > b) return '綠';
        if (b > 180 && r < 220 && g < 240 && b > g && b > r) return '藍';
        if (r > 220 && g > 200 && b < 200) return '粉';
      } catch(_) {}
      return null;
    }

    function getShiftFromCell(cell) {
      if (!cell) return '';
      // 1. 檢查色塊
      if (cell.fill) {
        const argb = cell.fill.fgColor?.argb || cell.fill.bgColor?.argb || '';
        if (argb) {
          const hex = String(argb).slice(-6).toUpperCase();
          if (colorToShiftMap[hex]) return colorToShiftMap[hex];
          const matched = matchColor(hex);
          if (matched) return matched;
        }
      }
      // 2. 文字值
      const txt = String(cell.value ?? '').trim();
      return txt;
    }

    // 掃描第2列（或第1列）獲取左半部與右半部日期欄位
    let leftDateCols = [];
    let rightDateCols = [];

    for (let c = 4; c <= Math.min(10, ws.columnCount); c++) {
      const v = ws.getRow(2).getCell(c).value ?? ws.getRow(1).getCell(c).value;
      if (v !== null && v !== undefined && String(v).trim() !== '' && !isNaN(Number(v))) {
        leftDateCols.push({ col: c, day: String(Number(v)) });
      }
    }

    for (let c = 11; c <= Math.min(20, ws.columnCount); c++) {
      const v = ws.getRow(2).getCell(c).value ?? ws.getRow(1).getCell(c).value;
      if (v !== null && v !== undefined && String(v).trim() !== '' && !isNaN(Number(v))) {
        rightDateCols.push({ col: c, day: String(Number(v)) });
      }
    }

    // 若非對稱左右欄，則掃描全欄 (例如標準30天)
    if (leftDateCols.length === 0) {
      for (let c = 4; c <= Math.min(35, ws.columnCount); c++) {
        const v = ws.getRow(2).getCell(c).value ?? ws.getRow(1).getCell(c).value;
        if (v !== null && v !== undefined && String(v).trim() !== '' && !isNaN(Number(v))) {
          leftDateCols.push({ col: c, day: String(Number(v)) });
        }
      }
    }

    const importedEmployees = [];
    const importedSchedule = {};
    const newTitles = new Set(state.jobTitles);
    const discoveredShifts = new Set();

    // 讀取左半部員工 (Row 3 到 rowCount)
    for (let r = 3; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const id = row.getCell(1).value;
      const title = row.getCell(2).value;
      const nameCell = row.getCell(3);
      const name = nameCell.value;

      if (!name || name === '出勤人數' || typeof name !== 'string') continue;

      const titleStr = String(title || '保全員').trim();
      newTitles.add(titleStr);

      const fontColor = String(nameCell.font?.color?.argb || '');
      const isFemale = fontColor.includes('FF0000') || fontColor.slice(-6).toUpperCase() === 'FF0000' ||
        ['燕', '宜', '萍', '容', '芬', '婷', '伶', '涵', '佳', '真', '晏', '樺', '璇', '嫺', '雯', '綾', '鈴', '羽', '瑩', '琳', '宣'].some(ch => name.includes(ch));

      const empId = (typeof id === 'number' && id > 0) ? id : (importedEmployees.length + 1);
      const empObj = {
        id: empId,
        title: titleStr,
        name: name.trim(),
        gender: isFemale ? 'F' : 'M',
        grade: titleStr === '組長' ? 'S' : (titleStr === '哨長' ? 'A' : 'B'),
        initialShifts: {}
      };

      importedSchedule[empObj.id] = {};
      leftDateCols.forEach(({ col, day }) => {
        const cell = row.getCell(col);
        const shiftVal = getShiftFromCell(cell);
        importedSchedule[empObj.id][day] = shiftVal;
        empObj.initialShifts[day] = shiftVal;
        if (shiftVal) discoveredShifts.add(shiftVal);
      });

      importedEmployees.push(empObj);
    }

    // 讀取右半部員工 (Col 8~13) 若存在
    if (rightDateCols.length > 0 && ws.columnCount >= 10) {
      for (let r = 3; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        const id = row.getCell(8).value;
        const title = row.getCell(9).value;
        const nameCell = row.getCell(10);
        const name = nameCell.value;

        if (!name || name === '出勤人數' || typeof name !== 'string') continue;

        const titleStr = String(title || '保全員').trim();
        newTitles.add(titleStr);

        const fontColor = String(nameCell.font?.color?.argb || '');
        const isFemale = fontColor.includes('FF0000') || fontColor.slice(-6).toUpperCase() === 'FF0000' ||
          ['燕', '宜', '萍', '容', '芬', '婷', '伶', '涵', '佳', '真', '晏', '樺', '璇', '嫺', '雯', '綾', '鈴', '羽', '瑩', '琳', '宣'].some(ch => name.includes(ch));

        const empId = (typeof id === 'number' && id > 0) ? id : (importedEmployees.length + 1);
        const empObj = {
          id: empId,
          title: titleStr,
          name: name.trim(),
          gender: isFemale ? 'F' : 'M',
          grade: titleStr === '組長' ? 'S' : (titleStr === '哨長' ? 'A' : 'B'),
          initialShifts: {}
        };

        importedSchedule[empObj.id] = {};
        rightDateCols.forEach(({ col, day }) => {
          const cell = row.getCell(col);
          const shiftVal = getShiftFromCell(cell);
          importedSchedule[empObj.id][day] = shiftVal;
          empObj.initialShifts[day] = shiftVal;
          if (shiftVal) discoveredShifts.add(shiftVal);
        });

        importedEmployees.push(empObj);
      }
    }

    if (importedEmployees.length === 0) {
      alert('未能在所選 Excel 檔案中解析到員工資料，請確認格式。');
      return;
    }

    // 確保所有出現過的班別都在 state.shifts 中，以保證色塊完整出現
    const existingShiftMap = new Map(state.shifts.map(s => [s.id, s]));
    discoveredShifts.forEach(shiftId => {
      if (!existingShiftMap.has(shiftId)) {
        state.shifts.push({
          id: shiftId,
          name: shiftId,
          label: `${shiftId} (匯入班別)`,
          bg: '#E2E8F0',
          text: '#1E293B',
          isLeave: ['休', '停', '粉', '綠', '藍'].includes(shiftId),
          minGrade: 'D',
          genderReq: 'ANY',
          defaultDemand: 1
        });
      }
    });

    // 依照編號排序
    importedEmployees.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    state.jobTitles = Array.from(newTitles);
    state.employees = importedEmployees;
    state.schedule = importedSchedule;

    // 自動同步日期區間至檔案所屬區間
    if (leftDateCols.length > 0) {
      const days = leftDateCols.map(x => parseInt(x.day, 10)).sort((a, b) => a - b);
      if (days.length <= 10) {
        state.dateRangeMode = (days[0] === 16 && days[days.length - 1] === 18) ? 'SAMPLE' : 'CUSTOM';
        state.customStartDay = days[0];
        state.customEndDay = days[days.length - 1];
      }
    }

    renderSettingsTabs();
    renderApp();
    alert(`成功匯入 ${importedEmployees.length} 位員工與色塊排班資料！`);
  } catch (err) {
    console.error('Import error:', err);
    alert('匯入失敗：' + err.message);
  }
}

// 9. 匯出功能 (Excel 日期純數字/中文星期單字，圖片支援指定時段)
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
  updateExportHint();
}

function updateExportHint() {
  const dates = getExportDates();
  document.getElementById('export-range-hint').innerText = `(共選取 ${dates.length} 天: ${dates[0]}~${dates[dates.length - 1]}日)`;
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

// 匯出 Excel (日期純數字 1, 2, 3...，星期純一, 二, 三...)
async function doExportExcel() {
  if (!confirm('確定要匯出目前班表為 Excel 檔案嗎？')) return;
  if (!window.ExcelJS) return alert('ExcelJS 載入中，請稍候重試。');
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
    worksheet.mergeCells('A2:C2');
    const titleCell = worksheet.getCell('A2');
    titleCell.value = `${rocYear}.${state.month}月班表`;
    titleCell.font = { name: '微軟正黑體', size: 11, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

    worksheet.getCell('A3').value = '編號';
    worksheet.getCell('B3').value = '職稱';
    worksheet.getCell('C3').value = '姓名';

    // D1, E1... 日期純數字 (1, 2, 3...)
    // D2, E2... 星期純一、二、三...
    dates.forEach((dStr, idx) => {
      const col = 4 + idx;
      const dNum = parseInt(dStr, 10);
      worksheet.getRow(1).getCell(col).value = dNum; // 純數字
      worksheet.getRow(2).getCell(col).value = getCleanWeekday(state.year, state.month, dNum); // 純 一、二、三...
      worksheet.getRow(3).getCell(col).value = dNum;
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

    // 日期純數字
    dates.forEach((d, i) => {
      const dNum = parseInt(d, 10);
      worksheet.getCell(2, 4 + i).value = dNum;
      worksheet.getCell(2, 11 + i).value = dNum;
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

// 匯出手機對稱圖片 (支援指定日期時段裁切)
async function doExportImage() {
  if (!confirm('確定要產生並下載手機對稱圖片嗎？')) return;
  if (!window.html2canvas) return alert('html2canvas 載入中，請稍候重試。');
  const targetDates = getExportDates();
  const rocYear = state.year - 1911;
  const shiftMap = new Map(state.shifts.map(s => [s.id, s]));

  // 更新隱藏的對稱雙欄表格
  renderSplitTable(targetDates, shiftMap, new Set(), rocYear);
  const container = document.getElementById('container-split-view');
  
  // 暫時顯示於可見位置以供 html2canvas 截圖
  const origStyle = container.getAttribute('style');
  container.setAttribute('style', 'position:fixed; left:0; top:0; overflow:visible; visibility:visible; z-index:-100; background:#fff;');

  try {
    const el = document.getElementById('split-view-capture-area');
    const canvas = await window.html2canvas(el, { 
      scale: 2, 
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    });
    const imgData = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `F16日班_${rocYear}.${state.month}月份手機對稱班表_${targetDates[0]}-${targetDates[targetDates.length - 1]}日.png`;
    a.click();
  } catch (err) {
    console.error('Image export failed:', err);
    alert('圖片產生失敗，請重試。');
  } finally {
    // 恢復隱藏狀態
    container.setAttribute('style', origStyle || 'position:absolute; left:-9999px; top:-9999px; overflow:visible; visibility:hidden;');
    renderSplitTable(getDatesArray(), shiftMap, new Set(), rocYear);
  }
}


// 10. 事件綁定初始化
document.addEventListener('DOMContentLoaded', () => {
  function updateMainDateRangeDropdowns() {
    const total = getDaysInMonth(state.year, state.month);
    const startSel = document.getElementById('view-start-date');
    const endSel = document.getElementById('view-end-date');
    if (!startSel || !endSel) return;
    let opts = '';
    for (let i = 1; i <= total; i++) {
      opts += `<option value="${i}">${i} 日</option>`;
    }
    startSel.innerHTML = opts;
    endSel.innerHTML = opts;
    startSel.value = String(Math.min(state.customStartDay || 1, total));
    endSel.value = String(Math.min(state.customEndDay || Math.min(18, total), total));
  }

  // 年月份變更
  document.getElementById('select-year').addEventListener('change', (e) => {
    state.year = parseInt(e.target.value, 10);
    updateMainDateRangeDropdowns();
    renderApp();
  });
  document.getElementById('select-month').addEventListener('change', (e) => {
    state.month = parseInt(e.target.value, 10);
    updateMainDateRangeDropdowns();
    renderApp();
  });

  // 主畫面班表日期區間按鈕
  document.getElementById('btn-view-range-month')?.addEventListener('click', () => {
    state.dateRangeMode = 'MONTH';
    renderApp();
  });
  document.getElementById('btn-view-range-sample')?.addEventListener('click', () => {
    state.dateRangeMode = 'SAMPLE';
    renderApp();
  });
  document.getElementById('btn-view-range-custom')?.addEventListener('click', () => {
    state.dateRangeMode = 'CUSTOM';
    updateMainDateRangeDropdowns();
    renderApp();
  });
  document.getElementById('view-start-date')?.addEventListener('change', (e) => {
    state.customStartDay = parseInt(e.target.value, 10);
    if (state.customEndDay < state.customStartDay) state.customEndDay = state.customStartDay;
    const endSel = document.getElementById('view-end-date');
    if (endSel) endSel.value = String(state.customEndDay);
    renderApp();
  });
  document.getElementById('view-end-date')?.addEventListener('change', (e) => {
    state.customEndDay = parseInt(e.target.value, 10);
    if (state.customStartDay > state.customEndDay) state.customStartDay = state.customEndDay;
    const startSel = document.getElementById('view-start-date');
    if (startSel) startSel.value = String(state.customStartDay);
    renderApp();
  });

  // 頂部按鈕
  document.getElementById('btn-auto-schedule').addEventListener('click', runAutoSchedule);
  document.getElementById('btn-inspector').addEventListener('click', () => openModal('modal-inspector'));
  document.getElementById('btn-settings').addEventListener('click', () => openModal('modal-settings'));
  document.getElementById('btn-export').addEventListener('click', () => openModal('modal-export'));

  // 清空排班與回到預設值
  document.getElementById('btn-clear-schedule').addEventListener('click', clearAllSchedule);
  document.getElementById('btn-reset-defaults').addEventListener('click', resetToDefaults);

  // 手機版底部工具列按鈕綁定
  document.getElementById('m-tool-import')?.addEventListener('click', () => document.getElementById('btn-import-excel').click());
  document.getElementById('m-tool-clear')?.addEventListener('click', clearAllSchedule);
  document.getElementById('m-tool-reset')?.addEventListener('click', resetToDefaults);
  document.getElementById('m-tool-settings')?.addEventListener('click', () => openModal('modal-settings'));
  document.getElementById('m-tool-export')?.addEventListener('click', () => openModal('modal-export'));

  // 匯入 Excel 觸發
  const fileInput = document.getElementById('input-import-file');
  document.getElementById('btn-import-excel').addEventListener('click', () => {
    if (confirm('確定要選擇並匯入 Excel 班表檔案嗎？')) {
      fileInput.click();
    }
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImportExcel(e.target.files[0]);
      e.target.value = '';
    }
  });

  // 快速選班事件
  document.getElementById('btn-picker-close').addEventListener('click', closeQuickPicker);
  document.getElementById('btn-picker-clear').addEventListener('click', () => {
    if (confirm('確定要清除此格排班嗎？')) {
      selectShift('');
    }
  });
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

  // 專屬班別限制表單
  document.getElementById('form-add-specific-shift').addEventListener('submit', (e) => {
    e.preventDefault();
    const empId = parseInt(document.getElementById('specific-emp-select').value, 10);
    if (!empId) return alert('請選擇員工！');
    const checked = Array.from(document.querySelectorAll('input[name="spec-shift-cb"]:checked')).map(cb => cb.value);
    if (checked.length === 0) return alert('請至少勾選一個限定班別！');
    if (!confirm('確定要新增此員工專屬班別限制嗎？')) return;

    const exist = (state.rulesConfig.specificShifts || []).find(r => r.empId === empId);
    if (exist) {
      exist.allowedShiftIds = checked;
    } else {
      if (!state.rulesConfig.specificShifts) state.rulesConfig.specificShifts = [];
      state.rulesConfig.specificShifts.push({
        id: `spec_${Date.now()}`,
        empId,
        allowedShiftIds: checked
      });
    }
    renderSpecificShiftsList();
    renderApp();
  });

  // 互斥表單
  document.getElementById('form-add-conflict').addEventListener('submit', (e) => {
    e.preventDefault();
    const id1 = parseInt(document.getElementById('conflict-emp1').value, 10);
    const id2 = parseInt(document.getElementById('conflict-emp2').value, 10);
    if (!id1 || !id2 || id1 === id2) return alert('請選擇兩位不同的員工！');
    if (!confirm('確定要新增此互斥衝突限制嗎？')) return;
    state.rulesConfig.conflicts.push({
      id: `c_${Date.now()}`,
      empId1: id1,
      empId2: id2,
      reason: document.getElementById('conflict-reason').value.trim() || '自訂不可同班'
    });
    document.getElementById('conflict-reason').value = '';
    renderSettingsTabs();
    renderApp();
  });

  // 等級表單
  document.getElementById('form-add-grade').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-grade-id').value.trim().toUpperCase();
    if (state.grades.some(g => g.id === id)) return alert('已有相同等級代號！');
    if (!confirm(`確定要新增等級「${id}」嗎？`)) return;
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

  // 班別表單
  document.getElementById('form-add-shift').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('input-shift-name').value.trim();
    if (state.shifts.some(s => s.id === name)) return alert('已有相同名稱班別！');
    if (!confirm(`確定要新增班別「${name}」嗎？`)) return;
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
      defaultDemand: parseInt(document.getElementById('input-shift-demand')?.value, 10) || 1
    });
    document.getElementById('input-shift-name').value = '';
    renderSettingsTabs();
    renderApp();
  });

  // 員工表單 (下拉式職稱，支援自訂/自動編號)
  document.getElementById('form-add-employee').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('input-emp-name').value.trim();
    if (!name) return;
    const customIdVal = document.getElementById('input-emp-id')?.value;
    let newId;
    if (customIdVal && !isNaN(parseInt(customIdVal, 10)) && parseInt(customIdVal, 10) > 0) {
      newId = parseInt(customIdVal, 10);
      if (state.employees.some(emp => emp.id === newId)) {
        return alert(`員工編號 ${newId} 已經存在！請使用其他編號。`);
      }
    } else {
      newId = state.employees.reduce((m, emp) => Math.max(m, emp.id), 0) + 1;
    }
    if (!confirm(`確定要新增員工「${name}」(編號: ${newId}) 嗎？`)) return;
    state.employees.push({
      id: newId,
      title: document.getElementById('input-emp-title-select').value,
      name: name,
      gender: document.getElementById('input-emp-gender').value,
      grade: document.getElementById('input-emp-grade').value,
      initialShifts: {}
    });
    state.employees.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    document.getElementById('input-emp-name').value = '';
    if (document.getElementById('input-emp-id')) document.getElementById('input-emp-id').value = '';
    renderSettingsTabs();
    renderApp();
  });

  // 職稱管理表單
  document.getElementById('form-add-title').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = document.getElementById('input-custom-title').value.trim();
    if (!t) return;
    if (state.jobTitles.includes(t)) return alert('已存在此職稱！');
    if (!confirm(`確定要新增職稱「${t}」嗎？`)) return;
    state.jobTitles.push(t);
    document.getElementById('input-custom-title').value = '';
    renderSettingsTabs();
    renderApp();
  });

  // 搜尋員工
  document.getElementById('input-search-emp').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = state.employees.filter(emp => emp.name.toLowerCase().includes(q) || emp.title.toLowerCase().includes(q) || emp.grade.toLowerCase().includes(q));
    renderEmployeeTable(filtered);
  });

  // 匯出按鈕區間
  document.getElementById('btn-range-all').addEventListener('click', () => {
    exportMode = 'ALL';
    document.getElementById('btn-range-all').className = 'btn btn-primary';
    document.getElementById('btn-range-sample').className = 'btn btn-secondary';
    document.getElementById('btn-range-custom').className = 'btn btn-secondary';
    document.getElementById('wrap-range-custom').style.display = 'none';
    updateExportHint();
  });
  document.getElementById('btn-range-sample').addEventListener('click', () => {
    exportMode = 'SAMPLE';
    document.getElementById('btn-range-sample').className = 'btn btn-primary';
    document.getElementById('btn-range-all').className = 'btn btn-secondary';
    document.getElementById('btn-range-custom').className = 'btn btn-secondary';
    document.getElementById('wrap-range-custom').style.display = 'none';
    updateExportHint();
  });
  document.getElementById('btn-range-custom').addEventListener('click', () => {
    exportMode = 'CUSTOM';
    document.getElementById('btn-range-custom').className = 'btn btn-primary';
    document.getElementById('btn-range-all').className = 'btn btn-secondary';
    document.getElementById('btn-range-sample').className = 'btn btn-secondary';
    document.getElementById('wrap-range-custom').style.display = 'flex';
    updateExportHint();
  });
  document.getElementById('export-start-date').addEventListener('change', updateExportHint);
  document.getElementById('export-end-date').addEventListener('change', updateExportHint);

  document.getElementById('btn-do-export-excel').addEventListener('click', doExportExcel);
  document.getElementById('btn-do-export-image').addEventListener('click', doExportImage);

  // 初始化自訂區間下拉選單與首次渲染
  updateMainDateRangeDropdowns();
  renderApp();
});
