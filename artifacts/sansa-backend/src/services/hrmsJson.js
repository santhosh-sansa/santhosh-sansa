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

module.exports = {
  listEmployees,
  addEmployee,
  deleteEmployee,
  listAttendance,
  addAttendance,
  exportEmployeesCsv,
  exportAttendanceCsv,
};
