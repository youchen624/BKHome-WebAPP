// /db.js
import fs from "fs/promises";
import path from "path";
import MySQL from "mysql2/promise";

import CONFIG from "../config.js";
import { cleanSQL } from "./utils.js";

const STMT = {
  users: {
    create: `
INSERT INTO users (username, password_hash, email)
VALUES (?, ?, ?);
`,
    get_by_id: `
SELECT
  u.id AS user_id,
  u.username,
  u.email,
  u.created_at,
  r.id AS role_id,
  r.name AS role
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.id = ?;
`,
    get_by_username: `
SELECT
  u.id AS user_id,
  u.username,
  u.password_hash,
  u.email,
  u.created_at,
  r.id AS role_id,
  r.name AS role
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.username = ?;
`,
  },
  questions: {
    create: `
INSERT INTO questions (title, description, grades)
VALUES (?, ?, ?);
`,
    get: `
SELECT * FROM questions
WHERE id = ?;
`,
  },
  submissions: {
    save: `
INSERT INTO submissions (user_id, question_id, language, file_path)
VALUES (?, ?, ?, ?);
`,
    get: `
SELECT * FROM submissions
WHERE id = ?;
`,
    get_by_qid: `
SELECT * FROM submissions
WHERE question_id = ?;
`,
    get_by_sub: `
SELECT * FROM submissions
WHERE user_id = ? AND question_id = ?;
`,
  },
  jobs: {
    create: `
INSERT INTO jobs (uuid, type, handler_id)
SELECT ?, jt.id, ?
FROM job_types jt
WHERE jt.name = ?;
`,
    get_by_uuid: `
SELECT
  j.id,
  j.uuid,
  j.handler_id,
  j.created_at,
  jt.name as type,
  jst.name as status
FROM jobs j
LEFT JOIN job_types jt ON j.type = jt.id
LEFT JOIN job_statuses jst ON j.status = jst.id
WHERE j.uuid = ?;
`,
    update_status: `
UPDATE jobs j
JOIN job_statuses s ON s.name = ?
SET j.status = s.id
WHERE j.uuid = ?;
`,
  },
  grades: {
    create_s: `INSERT INTO grades (user_id, question_id, score) VALUES ?;`,
  },
};

class Database {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
    this.STMT = STMT;
  }

  async begin(config) {
    if (this.isInitialized) return;
    try {
      this.pool = MySQL.createPool({
        /*
        host: config.HOST,
        port: config.PORT,
        user: config.USER,
        password: config.PASSWORD,
        database: config.DATABASE,
        */
        ...config,
        waitForConnections: true,
        multipleStatements: true, // multi-command
        // enableKeepAlive: true,
        // keepAliveInitialDelay: 0,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // init SQL
      const rawSQL_init = await fs
        .readFile(path.join(CONFIG.PATH_SQL, "init.sql"), "utf-8")
        .catch((e) => {
          if (e.code === "ENOENT") return "";
          else throw e;
        });
      const SQL_init = cleanSQL(rawSQL_init);
      if (SQL_init) await this.pool.query(SQL_init);

      // once SQL
      const rawSQL_once = await fs
        .readFile(path.join(CONFIG.PATH_SQL, "once.sql"), "utf-8")
        .catch((e) => {
          if (e.code === "ENOENT") return "";
          else throw e;
        });
      const SQL_once = cleanSQL(rawSQL_once);
      if (SQL_once) await this.pool.query(SQL_once);
      fs.rename(
        path.join(CONFIG.PATH_SQL, "once.sql"),
        path.join(CONFIG.PATH_SQL, "once.sql.d"),
      );

      // const _f_recursive = async (cPath, node) => {
      //   try {
      //     const files = await fs.readdir(cPath, { withFileTypes: true });
      //     for (const file of files) {
      //       if (file.isDirectory()) {
      //         if (file.name.startsWith('.')) continue;
      //         node[file.name] ??= {};
      //         await _f_recursive(path.join(cPath, file.name), node[file.name]);
      //       } else {
      //         if (!file.name.endsWith('.sql')) continue;
      //         const str = await fs.readFile(path.join(cPath, file.name), 'utf-8');
      //         const stmt_name = path.basename(file.name, '.sql');
      //         node[stmt_name] = await this.pool.prepare(str);
      //       }
      //     }
      //   } catch (e) { console.error(`[DB]❌/begin()/_f_recursive():>\n`, e); }
      // };

      // await _f_recursive(CONFIG.PATH_SQL, this.STMT);
      this.isInitialized = true;
    } catch (e) {
      console.error(`[DB]❌/begin():>\n`, e);
    }
  };

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
    }
  };



  /**
   * Executor
   * @param {Object} executor pool/connection instance
   * @param {string} sql SQL stmt
   * @param {Array} params array params
   * @param {boolean} isBulk batch writing
   */
  async _run(executor, sql, params = [], isBulk = false) {
    if (!this.isInitialized) {
      throw new Error('Database is not ready');
    }

    // batch
    if (isBulk) {
      if (!Array.isArray(params) || params.length === 0) {
        return { affectedRows: 0 };
      }
      const [result] = await executor.query(sql, [params]);
      return result;
    }

    // standard
    const [rows] = await executor.execute(sql, params);
    return rows;
  }

  /**
   * Single query
   * @param {string} sql SQL stmt
   * @param {Array} params array params
   * @param {Object} options Options { isBulk: boolean }
   */
  async query(sql, params = [], { isBulk = false } = {}) {
    return this._run(this.pool, sql, params, isBulk);
  };

  /**
   * Complex transaction
   * @param {Function} callback transaction callback(tx)
   */
  async transaction(callback) {
    if (!this.isInitialized) {
      throw new Error('Database is not ready');
    }

    const conn = await this.pool.getConnection();
    await conn.beginTransaction();

    // for callback used interface
    const tx = {
      STMT: this.STMT,
      query: (sql, params = [], { isBulk = false } = {}) => {
        return this._run(conn, sql, params, isBulk);
      },
    };

    try {
      const result = await callback(tx);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

export const database = new Database();
export default database;
