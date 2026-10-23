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
  } catch (err) {
    console.warn('⚠️ [Supabase PostgreSQL] Aviso de conexão:', err.message);
  }
}
