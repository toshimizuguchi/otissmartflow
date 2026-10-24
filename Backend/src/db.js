import pg from 'pg';
import dotenv from 'dotenv';
import {
  INITIAL_EQUIPMENTS,
  INITIAL_TECHNICIANS,
  INITIAL_CALLS,
  INITIAL_CONTRACTS,
  INITIAL_PARTS,
  INITIAL_PART_REQUESTS,
  INITIAL_EMPLOYEES,
  INITIAL_TIME_PUNCHES,
  INITIAL_CAMPAIGNS,
  INITIAL_ALERTS
} from './data/mockData.js';

dotenv.config();

const { Pool } = pg;

// Remove sslmode=require da string para permitir o override de rejectUnauthorized: false
const rawDbUrl = process.env.DATABASE_URL || '';
const cleanDbUrl = rawDbUrl.split('?')[0];

export const pool = new Pool({
  connectionString: cleanDbUrl || rawDbUrl,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Cache em memória para resposta instantânea e fallback seguro
export const store = {
  equipments: [...INITIAL_EQUIPMENTS],
  technicians: [...INITIAL_TECHNICIANS],
  calls: [...INITIAL_CALLS],
  contracts: [...INITIAL_CONTRACTS],
  parts: [...INITIAL_PARTS],
  partRequests: [...INITIAL_PART_REQUESTS],
  employees: [...INITIAL_EMPLOYEES],
  timePunches: [...INITIAL_TIME_PUNCHES],
  campaigns: [...INITIAL_CAMPAIGNS],
  alerts: [...INITIAL_ALERTS]
};

// Inicialização do banco Supabase
export async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ [Supabase PostgreSQL] Conexão SSL estabelecida com sucesso!');

    // Criação de tabelas principais se não existirem
    await client.query(`
      CREATE TABLE IF NOT EXISTS equipments (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50),
        model VARCHAR(100),
        client_name VARCHAR(150),
        city VARCHAR(100),
        status VARCHAR(50),
        risk_level VARCHAR(50),
        data JSONB
      );

      CREATE TABLE IF NOT EXISTS calls (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50),
        equipment_id VARCHAR(50),
        client_name VARCHAR(150),
        status VARCHAR(50),
        priority VARCHAR(50),
        technician_id VARCHAR(50),
        technician_name VARCHAR(150),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        data JSONB
      );

      CREATE TABLE IF NOT EXISTS technicians (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150),
        city VARCHAR(100),
        status VARCHAR(50),
        data JSONB
      );
    `);

    client.release();
    console.log('✅ [Supabase PostgreSQL] Tabelas verificadas/criadas no Supabase.');

    await loadCallsFromDatabase();
  } catch (err) {
    console.warn('⚠️ [Supabase PostgreSQL] Aviso de conexão:', err.message);
  }
}

// Carrega os chamados persistidos no Supabase para o cache em memória.
// O banco é a fonte da verdade: registros do banco sobrescrevem os dados de exemplo com o mesmo id.
export async function loadCallsFromDatabase() {
  const { rows } = await pool.query('SELECT data FROM calls WHERE data IS NOT NULL ORDER BY created_at DESC');
  const dbCalls = rows.map(r => r.data).filter(c => c && c.id);
  const dbIds = new Set(dbCalls.map(c => c.id));
  store.calls = [...dbCalls, ...store.calls.filter(c => !dbIds.has(c.id))];
  console.log(`✅ [Supabase PostgreSQL] ${dbCalls.length} chamado(s) carregado(s) do banco.`);
}

// Persiste (insert/update) um chamado completo no Supabase.
export async function persistCall(call) {
  try {
    await pool.query(
      `INSERT INTO calls (id, code, equipment_id, client_name, status, priority, technician_id, technician_name, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         code = EXCLUDED.code,
         equipment_id = EXCLUDED.equipment_id,
         client_name = EXCLUDED.client_name,
         status = EXCLUDED.status,
         priority = EXCLUDED.priority,
         technician_id = EXCLUDED.technician_id,
         technician_name = EXCLUDED.technician_name,
         data = EXCLUDED.data`,
      [
        call.id,
        call.callNumber || call.code || call.id,
        call.equipmentId || '',
        call.customerName || '',
        call.status || '',
        call.priority || '',
        call.technicianId || '',
        call.technicianName || '',
        call
      ]
    );
    return true;
  } catch (err) {
    console.warn(`⚠️ [Supabase PostgreSQL] Falha ao persistir chamado ${call.id}:`, err.message);
    return false;
  }
}
