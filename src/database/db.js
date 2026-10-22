/**
 * Banco de dados local (SQLite) do MEI Prático.
 *
 * Etapa 6 do cronograma (13/10 a 26/10) — EM ANDAMENTO.
 * Os dados ficam salvos no próprio celular, então o app funciona mesmo sem internet
 * e as informações dos clientes não saem do aparelho (LGPD).
 *
 * Tabelas:
 *  - prestador     -> dados do MEI (cadastro rápido, um único registro)
 *  - clientes      -> cadastro rápido de clientes, com endereço e coordenadas
 *  - servicos      -> tipos de serviço que o MEI oferece (sugestões no formulário)
 *  - atendimentos  -> cada visita ao cliente (agendado -> concluído)
 */
import * as SQLite from 'expo-sqlite';

let bancoPromise = null;

function abrirBanco() {
  if (!bancoPromise) {
    bancoPromise = SQLite.openDatabaseAsync('mei_pratico.db');
  }
  return bancoPromise;
}

export async function iniciarBanco() {
  const db = await abrirBanco();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS prestador (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nome TEXT NOT NULL,
      cnpj TEXT,
      telefone TEXT,
      atividade TEXT,
      criado_em TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      cep TEXT,
      logradouro TEXT,
      numero TEXT,
      bairro TEXT,
      cidade TEXT,
      uf TEXT,
      complemento TEXT,
      latitude REAL,
      longitude REAL,
      criado_em TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      preco_padrao REAL
    );

    CREATE TABLE IF NOT EXISTS atendimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      data TEXT NOT NULL,
      hora TEXT,
      observacoes TEXT,
      status TEXT NOT NULL DEFAULT 'agendado',
      valor_recebido REAL,
      forma_pagamento TEXT,
      observacoes_finais TEXT,
      finalizado_em TEXT,
      criado_em TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_atendimentos_data ON atendimentos(data);
  `);
}

/* ---------------- Prestador ---------------- */

export async function buscarPrestador() {
  const db = await abrirBanco();
  return db.getFirstAsync('SELECT * FROM prestador WHERE id = 1');
}

export async function salvarPrestador({ nome, cnpj, telefone, atividade }) {
  const db = await abrirBanco();
  await db.runAsync(
    `INSERT INTO prestador (id, nome, cnpj, telefone, atividade) VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, cnpj = excluded.cnpj,
       telefone = excluded.telefone, atividade = excluded.atividade`,
    [nome, cnpj, telefone, atividade]
  );
}

/* ---------------- Clientes ---------------- */

export async function listarClientes(busca = '') {
  const db = await abrirBanco();
  return db.getAllAsync('SELECT * FROM clientes WHERE nome LIKE ? ORDER BY nome COLLATE NOCASE', [`%${busca}%`]);
}

export async function buscarCliente(id) {
  const db = await abrirBanco();
  return db.getFirstAsync('SELECT * FROM clientes WHERE id = ?', [id]);
}

export async function salvarCliente(cliente) {
  const db = await abrirBanco();
  const valores = [
    cliente.nome,
    cliente.telefone ?? null,
    cliente.cep ?? null,
    cliente.logradouro ?? null,
    cliente.numero ?? null,
    cliente.bairro ?? null,
    cliente.cidade ?? null,
    cliente.uf ?? null,
    cliente.complemento ?? null,
    cliente.latitude ?? null,
    cliente.longitude ?? null,
  ];

  if (cliente.id) {
    await db.runAsync(
      `UPDATE clientes SET nome = ?, telefone = ?, cep = ?, logradouro = ?, numero = ?, bairro = ?,
         cidade = ?, uf = ?, complemento = ?, latitude = ?, longitude = ? WHERE id = ?`,
      [...valores, cliente.id]
    );
    return cliente.id;
  }

  const resultado = await db.runAsync(
    `INSERT INTO clientes (nome, telefone, cep, logradouro, numero, bairro, cidade, uf, complemento, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    valores
  );
  return resultado.lastInsertRowId;
}

export async function excluirCliente(id) {
  const db = await abrirBanco();
  await db.runAsync('DELETE FROM clientes WHERE id = ?', [id]);
}

/* ---------------- Serviços (sugestões) ---------------- */

export async function listarServicos() {
  const db = await abrirBanco();
  return db.getAllAsync('SELECT * FROM servicos ORDER BY nome COLLATE NOCASE');
}

async function lembrarServico(db, nome, preco) {
  await db.runAsync(
    `INSERT INTO servicos (nome, preco_padrao) VALUES (?, ?)
     ON CONFLICT(nome) DO UPDATE SET preco_padrao = excluded.preco_padrao`,
    [nome.trim(), preco]
  );
}

/* ---------------- Atendimentos ---------------- */

const SELECT_ATENDIMENTO = `
  SELECT a.*, c.nome AS cliente_nome, c.telefone AS cliente_telefone,
         c.logradouro, c.numero, c.bairro, c.cidade, c.uf, c.latitude, c.longitude
  FROM atendimentos a
  JOIN clientes c ON c.id = a.cliente_id
`;

export async function criarAtendimento({ clienteId, descricao, valor, data, hora, observacoes }) {
  const db = await abrirBanco();
  const resultado = await db.runAsync(
    `INSERT INTO atendimentos (cliente_id, descricao, valor, data, hora, observacoes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [clienteId, descricao.trim(), valor, data, hora || null, observacoes || null]
  );
  await lembrarServico(db, descricao, valor);
  return resultado.lastInsertRowId;
}

export async function buscarAtendimento(id) {
  const db = await abrirBanco();
  return db.getFirstAsync(`${SELECT_ATENDIMENTO} WHERE a.id = ?`, [id]);
}

export async function listarAtendimentosDoDia(dataISO) {
  const db = await abrirBanco();
  return db.getAllAsync(`${SELECT_ATENDIMENTO} WHERE a.data = ? ORDER BY a.status DESC, a.hora`, [dataISO]);
}

export async function finalizarAtendimento(id, { valorRecebido, formaPagamento, observacoesFinais }) {
  const db = await abrirBanco();
  await db.runAsync(
    `UPDATE atendimentos
     SET status = 'concluido', valor_recebido = ?, forma_pagamento = ?, observacoes_finais = ?,
         finalizado_em = datetime('now', 'localtime')
     WHERE id = ?`,
    [valorRecebido, formaPagamento, observacoesFinais || null, id]
  );
}

/**
 * Histórico de atendimentos concluídos de um mês ("AAAA-MM").
 * TODO (etapa 6): filtro por cliente e por período personalizado.
 */
export async function listarHistorico(anoMes) {
  const db = await abrirBanco();
  const itens = await db.getAllAsync(
    `${SELECT_ATENDIMENTO} WHERE a.status = 'concluido' AND substr(a.data, 1, 7) = ? ORDER BY a.data DESC, a.hora DESC`,
    [anoMes]
  );
  const total = itens.reduce((soma, item) => soma + (item.valor_recebido ?? item.valor ?? 0), 0);
  return { itens, total };
}
