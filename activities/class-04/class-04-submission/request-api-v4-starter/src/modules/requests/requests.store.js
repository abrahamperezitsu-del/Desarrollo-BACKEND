const { pool } = require('../../database/pool');
const { withTransaction } = require('../../database/transaction');

async function findAll(filters = {}) {
  let query = 'SELECT * FROM requests';
  const params = [];

  // Filtro SQL dinámico
  if (filters.status) {
    query += ' WHERE status = $1';
    params.push(filters.status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const { rows } = await pool.query(query, params);
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
  return rows[0] || null; // Ausencia controlada
}

async function create(input) {
  // Unidad atómica: Crea el request Y el historial de nacimiento
  return withTransaction(async (client) => {
    const requestResult = await client.query(
      `INSERT INTO requests (title, priority, status) 
       VALUES ($1, $2, 'open') 
       RETURNING *`,
      [input.title, input.priority]
    );
    
    const newRequest = requestResult.rows[0];

    await client.query(
      `INSERT INTO request_status_history (request_id, previous_status, new_status) 
       VALUES ($1, null, 'open')`,
      [newRequest.id]
    );

    return newRequest;
  });
}

async function update(id, changes, previousStatus) {
  // Unidad atómica: Actualiza el estado Y registra la transición
  return withTransaction(async (client) => {
    const updateResult = await client.query(
      `UPDATE requests 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [changes.status, id]
    );

    if (updateResult.rows.length === 0) return null;

    const updatedRequest = updateResult.rows[0];

    await client.query(
      `INSERT INTO request_status_history (request_id, previous_status, new_status) 
       VALUES ($1, $2, $3)`,
      [id, previousStatus, changes.status]
    );

    return updatedRequest;
  });
}

async function findHistory(requestId) {
  const { rows } = await pool.query(
    'SELECT * FROM request_status_history WHERE request_id = $1 ORDER BY changed_at DESC',
    [requestId]
  );
  return rows;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  findHistory,
};