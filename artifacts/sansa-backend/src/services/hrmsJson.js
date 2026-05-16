const fs = require('fs/promises');
const path = require('path');

const dataPath = path.join(__dirname, '..', '..', 'data', 'hrms.json');

async function readState() {
  try {
    return JSON.parse(await fs.readFile(dataPath, 'utf8'));
  } catch {
    return { employees: [], attendance: [] };
  }
}

async function writeState(next) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(next, null, 2));
}

async function listEmployees() {
  const { employees } = await readState();
  return [...employees].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

async function addEmployee(body = {}) {
  const state = await readState();
  const name = String(body.name || '').trim();
  if (!name) {
    const err = new Error('Employee name is required.');
    err.status = 422;
    throw err;
  }
  const row = {
    id: `emp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name,
    role: String(body.role || 'Staff').trim(),
    department: String(body.department || 'General').trim(),
    joinedAt: new Date().toISOString().slice(0, 10),
  };
  state.employees.unshift(row);
  await writeState(state);
  return row;
}

async function deleteEmployee(id) {
  const state = await readState();
  const eid = String(id || '');
  const before = state.employees.length;
  state.employees = state.employees.filter((e) => e.id !== eid);
  state.attendance = state.attendance.filter((a) => a.employeeId !== eid);
  if (state.employees.length === before) {
    const err = new Error('Employee not found.');
    err.status = 404;
    throw err;
  }
  await writeState(state);
  return { ok: true };
}

async function listAttendance() {
  const state = await readState();
  return [...state.attendance].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

async function addAttendance(body = {}) {
  const state = await readState();
  const employeeId = String(body.employeeId || '').trim();
  if (!employeeId || !state.employees.some((e) => e.id === employeeId)) {
    const err = new Error('Valid employeeId is required.');
    err.status = 422;
    throw err;
  }
  const row = {
    id: `att-${Date.now()}`,
    employeeId,
    date: String(body.date || new Date().toISOString().slice(0, 10)),
    status: String(body.status || 'present').toLowerCase(),
    note: String(body.note || '').trim(),
  };
  state.attendance.unshift(row);
  await writeState(state);
  return row;
}

function escapeCsvCell(val) {
  const s = String(val ?? '');
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvLine(cells) {
  return `${cells.map(escapeCsvCell).join(',')}\r\n`;
}

async function exportEmployeesCsv() {
  const rows = await listEmployees();
  let out = csvLine(['id', 'name', 'role', 'department', 'joinedAt']);
  for (const e of rows) {
    out += csvLine([e.id, e.name, e.role, e.department, e.joinedAt]);
  }
  return out;
}

async function exportAttendanceCsv() {
  const state = await readState();
  const nameById = new Map(state.employees.map((emp) => [emp.id, emp.name]));
  const rows = await listAttendance();
  let out = csvLine(['id', 'employeeId', 'employeeName', 'date', 'status', 'note']);
  for (const r of rows) {
    out += csvLine([r.id, r.employeeId, nameById.get(r.employeeId) || '', r.date, r.status, r.note || '']);
  }
  return out;
}

async function leaveBalancesForYear(year) {
  const y = parseInt(String(year || new Date().getFullYear()), 10);
  const safeY = Number.isFinite(y) ? y : new Date().getFullYear();
  const state = await readState();
  const yPrefix = `${safeY}-`;
  const byEmp = new Map(state.employees.map((e) => [e.id, { employeeId: e.id, name: e.name, daysPresent: 0, daysLeave: 0, daysAbsent: 0 }]));
  for (const a of state.attendance) {
    if (!a.date || !String(a.date).startsWith(yPrefix)) continue;
    const row = byEmp.get(a.employeeId);
    if (!row) continue;
    const st = String(a.status || '').toLowerCase();
    if (st === 'leave') row.daysLeave += 1;
    else if (st === 'absent') row.daysAbsent += 1;
    else row.daysPresent += 1;
  }
  const annualEntitlement = 12;
  return [...byEmp.values()].map((r) => ({
    ...r,
    year: safeY,
    leaveTaken: r.daysLeave,
    leaveBalance: Math.max(0, annualEntitlement - r.daysLeave),
    note: 'Demo: balance = 12 annual minus leave rows this calendar year.',
  }));
}

async function payrollStub(employeeId, month, dailyRateIn) {
  const state = await readState();
  const emp = state.employees.find((e) => e.id === String(employeeId || '').trim());
  if (!emp) {
    const err = new Error('Employee not found.');
    err.status = 404;
    throw err;
  }
  const m = String(month || '').trim();
  if (!/^\d{4}-\d{2}$/.test(m)) {
    const err = new Error('month must be YYYY-MM (e.g. 2026-05).');
    err.status = 422;
    throw err;
  }
  const envRate = Number(process.env.SANSA_PAYROLL_DEMO_DAILY || 0);
  const dailyRate = Number.isFinite(Number(dailyRateIn)) ? Number(dailyRateIn) : envRate;
  let present = 0;
  let leave = 0;
  let absent = 0;
  for (const a of state.attendance) {
    if (a.employeeId !== emp.id) continue;
    if (!String(a.date).startsWith(m)) continue;
    const st = String(a.status || '').toLowerCase();
    if (st === 'leave') leave += 1;
    else if (st === 'absent') absent += 1;
    else present += 1;
  }
  const workingPayDays = present + leave * 0.5;
  const gross = Math.round(workingPayDays * dailyRate);
  return {
    ok: true,
    employee: { id: emp.id, name: emp.name, role: emp.role, department: emp.department },
    period: m,
    counts: { present, leave, absent, workingPayDays },
    dailyRate,
    earnings: [{ label: 'Base (attendance × daily rate, demo)', amount: gross }],
    deductions: [],
    demoNote: 'Pass ?dailyRate= on the API or set SANSA_PAYROLL_DEMO_DAILY. Leave counts as half pay day in workingPayDays.',
    net: gross,
  };
}

module.exports = {
  listEmployees,
  addEmployee,
  deleteEmployee,
  listAttendance,
  addAttendance,
  exportEmployeesCsv,
  exportAttendanceCsv,
  leaveBalancesForYear,
  payrollStub,
};
