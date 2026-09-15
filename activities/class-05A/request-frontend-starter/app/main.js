// Entrega 05A — Frontend para Request API v5
// Sin mocks: integra con tu API real (clase 05) usando autenticación, propiedad y permisos.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// DECISIÓN DOCUMENTADA: el token vive en memoria (variable JS).
// Se pierde al recargar la página — limitación honesta de esta estrategia.
// Si eliges sessionStorage u otra alternativa accesible desde JS, documenta
// el riesgo de XSS en el README. Nunca hardcodees un token.
// Riesgo XSS reconocido: al almacenar el token en memoria accesible desde JavaScript,
// cualquier vulnerabilidad XSS en la aplicación permitiría a un atacante robar el token
// y suplantar la sesión del usuario. En producción, evaluar httpOnly cookies.
let accessToken = null;
let currentUser = null;

// Un solo cliente para toda la app: agrega el token cuando existe y separa
// "respuesta con error del contrato" de "no hay backend".
async function api(method, path, body) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    // Red caída o CORS: no hay respuesta HTTP que interpretar.
    return { status: 0, body: null };
  }
  const text = await response.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* no-json */ }
  return { status: response.status, body: parsed };
}

// --- elementos DOM ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authFeedback = document.getElementById('auth-feedback');
const authPanel = document.getElementById('auth-panel');
const requestsPanel = document.getElementById('requests-panel');
const requestsState = document.getElementById('requests-state');
const requestsList = document.getElementById('requests-list');
const sessionUser = document.getElementById('session-user');
const logoutBtn = document.getElementById('logout-btn');
const createRequestBtn = document.getElementById('create-request-btn');
const createRequestForm = document.getElementById('create-request-form');
const createRequestFeedback = document.getElementById('create-request-feedback');
const cancelCreateBtn = document.getElementById('cancel-create-btn');
const filterForm = document.getElementById('filter-form');
const detailPanel = document.getElementById('detail-panel');
const detailContent = document.getElementById('detail-content');
const detailFeedback = document.getElementById('detail-feedback');
const closeDetailBtn = document.getElementById('close-detail-btn');
const editRequestForm = document.getElementById('edit-request-form');
const editRequestFeedback = document.getElementById('edit-request-feedback');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const historyPanel = document.getElementById('history-panel');
const historyContent = document.getElementById('history-content');
const historyFeedback = document.getElementById('history-feedback');
const closeHistoryBtn = document.getElementById('close-history-btn');
const agentActions = document.getElementById('agent-actions');
const changePriorityForm = document.getElementById('change-priority-form');
const changePriorityFeedback = document.getElementById('change-priority-feedback');
const changeStatusForm = document.getElementById('change-status-form');
const changeStatusFeedback = document.getElementById('change-status-feedback');

let currentRequestId = null;
let currentRequestData = null;

// Estados de transición válidos según el contrato del backend (clase 3)
const STATUS_TRANSITIONS = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved: ['reopened'],
  cancelled: ['reopened'],
  reopened: ['in_progress', 'cancelled']
};

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function setFeedback(element, message, kind) {
  element.textContent = message;
  element.className = `feedback${kind ? ` is-${kind}` : ''}`;
}

function showPanel(panel) {
  [authPanel, requestsPanel, detailPanel, historyPanel].forEach(p => p.hidden = true);
  panel.hidden = false;
}

function showDetailPanel() {
  showPanel(detailPanel);
}

function showHistoryPanel() {
  showPanel(historyPanel);
}

function showRequestsPanel() {
  showPanel(requestsPanel);
}

function showAuthPanel() {
  showPanel(authPanel);
}

// Cada código merece su propio mensaje. Un único mensaje genérico NO cumple.
function describeError(status, body, context = '') {
  if (status === 0) return 'No se pudo contactar al backend. ¿Está encendido? ¿CORS configurado?';
  if (status === 400) {
    const code = body?.error?.code;
    if (code === 'INVALID_FILTER') return 'Filtro inválido. Usa status/priority válidos.';
    if (code === 'SERVER_CONTROLLED_FIELD') return 'Intentaste enviar un campo que controla el servidor.';
    if (code === 'INVALID_EMAIL') return 'Formato de email inválido.';
    if (code === 'INVALID_PASSWORD') return 'Password debe tener 15-128 caracteres.';
    if (code === 'INVALID_STATUS_TRANSITION') return body?.error?.message ?? 'Transición de estado no permitida.';
    if (code === 'REQUEST_IN_TERMINAL_STATUS') return 'La solicitud está en estado terminal y no puede modificarse.';
    return body?.error?.message ?? 'La petición no cumplió el contrato (400).';
  }
  if (status === 401) {
    const code = body?.error?.code;
    if (code === 'INVALID_CREDENTIALS') return 'Email o password incorrectos.';
    if (code === 'INVALID_TOKEN') return 'Tu sesión expiró o es inválida. Vuelve a entrar.';
    return 'Autenticación requerida. Inicia sesión.';
  }
  if (status === 403) return 'Tu rol no permite esta operación.';
  if (status === 404) return 'Esa solicitud no existe (o no es tuya).';
  if (status === 409) {
    const code = body?.error?.code;
    if (code === 'ACCOUNT_CANNOT_BE_CREATED') return 'No se pudo crear la cuenta (email en uso o error).';
    return body?.error?.message ?? 'Conflicto con el estado actual de la solicitud.';
  }
  if (status >= 500) return 'El servidor tuvo un problema inesperado. Intenta de nuevo.';
  return body?.error?.message ?? `Error ${status}: la petición falló.`;
}

// Renderizado de lista de solicitudes
function renderRequestItem(request, isAgent) {
  const item = document.createElement('li');
  item.className = 'request-item';
  item.dataset.id = request.id;

  const title = document.createElement('span');
  title.className = 'request-title';
  title.textContent = `#${request.id.slice(0, 8)} · ${request.title}`;

  const meta = document.createElement('span');
  meta.className = 'request-meta';
  const statusBadge = document.createElement('span');
  statusBadge.className = `badge status-${request.status}`;
  statusBadge.textContent = request.status;
  const priorityBadge = document.createElement('span');
  priorityBadge.className = `badge priority-${request.priority}`;
  priorityBadge.textContent = request.priority;
  meta.append(statusBadge, priorityBadge);

  item.append(title, meta);

  item.addEventListener('click', () => openDetail(request.id));
  return item;
}

async function loadRequests() {
  setFeedback(requestsState, 'Cargando…');
  requestsList.replaceChildren();

  const queryParams = new URLSearchParams();
  const statusFilter = document.getElementById('filter-status').value;
  const priorityFilter = document.getElementById('filter-priority').value;
  if (statusFilter) queryParams.set('status', statusFilter);
  if (priorityFilter) queryParams.set('priority', priorityFilter);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const result = await api('GET', `/requests${query}`);
  if (result.status !== 200) {
    setFeedback(requestsState, describeError(result.status, result.body), 'error');
    return;
  }
  if (result.body.length === 0) {
    setFeedback(requestsState, 'Todavía no hay solicitudes. Crea la primera.', 'ok');
    return;
  }
  setFeedback(requestsState, `${result.body.length} solicitud(es)${query ? ' (filtradas)' : ''}.`, 'ok');
  const isAgent = currentUser?.role === 'agent';
  for (const request of result.body) {
    requestsList.append(renderRequestItem(request, isAgent));
  }
}

// Detalle de solicitud
async function openDetail(id) {
  currentRequestId = id;
  setFeedback(detailFeedback, 'Cargando detalle…');
  showDetailPanel();
  detailContent.replaceChildren();

  const result = await api('GET', `/requests/${id}`);
  if (result.status !== 200) {
    setFeedback(detailFeedback, describeError(result.status, result.body), 'error');
    return;
  }
  currentRequestData = result.body;
  setFeedback(detailFeedback, '', 'ok');
  renderDetail(result.body);
}

function renderDetail(request) {
  detailContent.replaceChildren();

  const card = document.createElement('div');
  card.className = 'detail-card';

  // Header
  const header = document.createElement('div');
  header.className = 'detail-header';
  const title = document.createElement('h3');
  title.textContent = request.title;
  const badges = document.createElement('div');
  badges.className = 'detail-badges';
  const statusBadge = document.createElement('span');
  statusBadge.className = `badge status-${request.status}`;
  statusBadge.textContent = request.status;
  const priorityBadge = document.createElement('span');
  priorityBadge.className = `badge priority-${request.priority}`;
  priorityBadge.textContent = request.priority;
  badges.append(statusBadge, priorityBadge);
  header.append(title, badges);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.innerHTML = `
    <p><strong>ID:</strong> ${request.id}</p>
    <p><strong>Creada por:</strong> ${request.createdBy ?? 'desconocido (heredada)'}</p>
    <p><strong>Creada:</strong> ${new Date(request.createdAt).toLocaleString()}</p>
    <p><strong>Actualizada:</strong> ${new Date(request.updatedAt).toLocaleString()}</p>
  `;

  // Description
  const desc = document.createElement('div');
  desc.className = 'detail-description';
  desc.innerHTML = `<strong>Descripción:</strong><p>${request.description ?? '(sin descripción)'}</p>`;

  // Actions
  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const isOwner = request.createdBy === currentUser?.id;
  const isOpen = request.status === 'open';
  const isAgent = currentUser?.role === 'agent';

  // Editar (solo dueño y abierta)
  if (isOwner && isOpen) {
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Editar título/descripción';
    editBtn.addEventListener('click', () => openEdit(request));
    actions.append(editBtn);
  }

  // Historial
  const historyBtn = document.createElement('button');
  historyBtn.type = 'button';
  historyBtn.textContent = 'Ver historial';
  historyBtn.addEventListener('click', () => openHistory(request.id));
  actions.append(historyBtn);

  // Agent actions
  if (isAgent) {
    agentActions.hidden = false;
    renderAgentActions(request);
  } else {
    agentActions.hidden = true;
  }

  card.append(header, meta, desc, actions);
  detailContent.append(card);
}

function renderAgentActions(request) {
  // Cambiar prioridad
  const prioritySelect = document.getElementById('priority-select');
  prioritySelect.value = request.priority;

  // Cambiar estado - solo transiciones disponibles
  const statusSelect = document.getElementById('status-select');
  statusSelect.innerHTML = '';
  const available = STATUS_TRANSITIONS[request.status] || [];
  if (available.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Sin transiciones disponibles (estado terminal)';
    opt.disabled = true;
    statusSelect.append(opt);
  } else {
    for (const next of available) {
      const opt = document.createElement('option');
      opt.value = next;
      opt.textContent = next;
      statusSelect.append(opt);
    }
  }
}

// Editar solicitud
function openEdit(request) {
  currentRequestData = request;
  document.getElementById('edit-title').value = request.title;
  document.getElementById('edit-description').value = request.description ?? '';
  editRequestForm.hidden = false;
  setFeedback(editRequestFeedback, '');
  window.scrollTo({ top: editRequestForm.offsetTop, behavior: 'smooth' });
}

cancelEditBtn.addEventListener('click', () => {
  editRequestForm.hidden = true;
  editRequestForm.reset();
});

editRequestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentRequestData) return;
  setFeedback(editRequestFeedback, 'Guardando…');
  const body = {
    title: document.getElementById('edit-title').value.trim(),
    description: document.getElementById('edit-description').value.trim()
  };
  const result = await api('PATCH', `/requests/${currentRequestData.id}`, body);
  if (result.status !== 200) {
    setFeedback(editRequestFeedback, describeError(result.status, result.body), 'error');
    return;
  }
  setFeedback(editRequestFeedback, 'Solicitud actualizada.', 'ok');
  editRequestForm.hidden = true;
  await openDetail(currentRequestData.id);
  await loadRequests();
});

// Historial
async function openHistory(id) {
  setFeedback(historyFeedback, 'Cargando historial…');
  showHistoryPanel();
  historyContent.replaceChildren();

  const result = await api('GET', `/requests/${id}/history`);
  if (result.status !== 200) {
    setFeedback(historyFeedback, describeError(result.status, result.body), 'error');
    return;
  }
  setFeedback(historyFeedback, '', 'ok');
  renderHistory(result.body);
}

function renderHistory(events) {
  historyContent.replaceChildren();
  if (events.length === 0) {
    historyContent.textContent = 'Sin historial.';
    return;
  }
  const list = document.createElement('ul');
  list.className = 'history-list';
  for (const event of events) {
    const item = document.createElement('li');
    const from = event.fromStatus ?? 'NULL';
    const to = event.toStatus;
    const by = event.changedBy ? `por ${event.changedBy.slice(0, 8)}` : 'por sistema';
    const when = new Date(event.changedAt).toLocaleString();
    item.textContent = `${from} → ${to} ${by} · ${when}`;
    list.append(item);
  }
  historyContent.append(list);
}

closeDetailBtn.addEventListener('click', () => {
  detailPanel.hidden = true;
  showRequestsPanel();
});

closeHistoryBtn.addEventListener('click', () => {
  historyPanel.hidden = true;
  showRequestsPanel();
});

// Crear solicitud
createRequestBtn.addEventListener('click', () => {
  createRequestForm.hidden = false;
  setFeedback(createRequestFeedback, '');
  createRequestForm.reset();
  window.scrollTo({ top: createRequestForm.offsetTop, behavior: 'smooth' });
});

cancelCreateBtn.addEventListener('click', () => {
  createRequestForm.hidden = true;
  createRequestForm.reset();
});

createRequestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFeedback(createRequestFeedback, 'Creando…');
  const body = {
    title: document.getElementById('create-title').value.trim(),
    description: document.getElementById('create-description').value.trim(),
    priority: document.getElementById('create-priority').value
  };
  const result = await api('POST', '/requests', body);
  if (result.status !== 201) {
    setFeedback(createRequestFeedback, describeError(result.status, result.body), 'error');
    return;
  }
  setFeedback(createRequestFeedback, 'Solicitud creada.', 'ok');
  createRequestForm.hidden = true;
  createRequestForm.reset();
  await loadRequests();
});

// Filtros
filterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loadRequests();
});

document.getElementById('clear-filters-btn').addEventListener('click', () => {
  filterForm.reset();
  loadRequests();
});

// Agent: cambiar prioridad
changePriorityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentRequestData) return;
  setFeedback(changePriorityFeedback, 'Cambiando prioridad…');
  const priority = document.getElementById('priority-select').value;
  const result = await api('PATCH', `/requests/${currentRequestData.id}`, { priority });
  if (result.status !== 200) {
    setFeedback(changePriorityFeedback, describeError(result.status, result.body), 'error');
    return;
  }
  setFeedback(changePriorityFeedback, 'Prioridad actualizada.', 'ok');
  await openDetail(currentRequestData.id);
  await loadRequests();
});

// Agent: cambiar estado
changeStatusForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentRequestData) return;
  setFeedback(changeStatusFeedback, 'Cambiando estado…');
  const status = document.getElementById('status-select').value;
  if (!status) return;
  const result = await api('PATCH', `/requests/${currentRequestData.id}`, { status });
  if (result.status !== 200) {
    setFeedback(changeStatusFeedback, describeError(result.status, result.body), 'error');
    return;
  }
  setFeedback(changeStatusFeedback, 'Estado actualizado.', 'ok');
  await openDetail(currentRequestData.id);
  await loadRequests();
});

// Auth: login
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  setFeedback(authFeedback, 'Entrando…');

  const login = await api('POST', '/auth/login', {
    email: data.get('email'),
    password: data.get('password')
  });
  if (login.status !== 200) {
    setFeedback(authFeedback, describeError(login.status, login.body), 'error');
    return;
  }
  accessToken = login.body.accessToken;

  const me = await api('GET', '/auth/me');
  if (me.status !== 200) {
    setFeedback(authFeedback, describeError(me.status, me.body), 'error');
    accessToken = null;
    return;
  }
  currentUser = me.body;
  sessionUser.textContent = `${currentUser.email} · ${currentUser.role}`;
  logoutBtn.hidden = false;
  authPanel.hidden = true;
  requestsPanel.hidden = false;
  setFeedback(authFeedback, '');
  loadRequests();
});

// Auth: registro
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  setFeedback(authFeedback, 'Registrando…');

  const result = await api('POST', '/auth/register', {
    email: data.get('email'),
    password: data.get('password')
  });
  if (result.status !== 201) {
    setFeedback(authFeedback, describeError(result.status, result.body), 'error');
    return;
  }
  setFeedback(authFeedback, 'Cuenta creada. Ahora inicia sesión.', 'ok');
  registerForm.reset();
});

// Logout local
logoutBtn.addEventListener('click', () => {
  accessToken = null;
  currentUser = null;
  sessionUser.textContent = 'Sin sesión';
  logoutBtn.hidden = true;
  requestsPanel.hidden = true;
  detailPanel.hidden = true;
  historyPanel.hidden = true;
  authPanel.hidden = false;
  loginForm.reset();
  registerForm.reset();
});

// Toggle registro/login
document.getElementById('show-register').addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.hidden = true;
  registerForm.hidden = false;
  setFeedback(authFeedback, '');
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.hidden = true;
  loginForm.hidden = false;
  setFeedback(authFeedback, '');
});

// Inicialización: verificar si hay token guardado (no hay en memoria, pero se puede extender)
function init() {
  // Aquí se podría restaurar de sessionStorage si se documenta y acepta el riesgo XSS
  // Para esta entrega: solo memoria, logout al recargar.
  showAuthPanel();
}

init();