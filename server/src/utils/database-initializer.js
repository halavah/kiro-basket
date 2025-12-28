const fs = require('fs');
const path = require('path');

/**
 * 数据库初始化工具
 * 每次启动时检查并初始化数据库表结构和数据
 */

/**
 * 检查 MySQL 表是否存在
 * @param {Sequelize} mysqlDb - Sequelize 实例
 * @returns {Promise<boolean>} - 表是否存在
 */
async function checkMySQLTables(mysqlDb) {
  try {
    // 检查关键表是否存在（检查 captains 表即可，因为所有表一起创建）
    const [results] = await mysqlDb.query(
      "SHOW TABLES LIKE 'captains'"
    );
    return results.length > 0;
  } catch (error) {
    console.error('检查 MySQL 表失败:', error.message);
    return false;
  }
}

/**
 * 智能分割 SQL 语句
 * 正确处理字符串内的分号、注释等
 * @param {string} sql - 完整的 SQL 内容
 * @returns {string[]} - SQL 语句数组
 */
function smartSplitSQL(sql) {
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // 处理行注释 --
    if (!inString && !inBlockComment && char === '-' && nextChar === '-') {
      inLineComment = true;
      i++; // 跳过第二个 -
      continue;
    }

    // 行注释在换行时结束
    if (inLineComment && char === '\n') {
      inLineComment = false;
      continue;
    }

    // 如果在行注释中，跳过字符
    if (inLineComment) {
      continue;
    }

    // 处理块注释 /* */
    if (!inString && !inBlockComment && char === '/' && nextChar === '*') {
      inBlockComment = true;
      i++; // 跳过 *
      continue;
    }

    // 块注释结束
    if (inBlockComment && char === '*' && nextChar === '/') {
      inBlockComment = false;
      i++; // 跳过 /
      continue;
    }

    // 如果在块注释中，跳过字符
    if (inBlockComment) {
      continue;
    }

    // 处理字符串
    if ((char === "'" || char === '"' || char === '`') && !inString) {
      inString = true;
      stringChar = char;
      currentStatement += char;
      continue;
    }

    // 字符串结束（需要检查转义）
    if (char === stringChar && inString) {
      // 检查是否是转义的引号
      if (sql[i - 1] !== '\\') {
        inString = false;
        stringChar = null;
      }
      currentStatement += char;
      continue;
    }

    // 处理分号（只有不在字符串和注释中的分号才是语句结束）
    if (char === ';' && !inString) {
      currentStatement += char;
      const trimmed = currentStatement.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      currentStatement = '';
      continue;
    }

    // 普通字符
    currentStatement += char;
  }

  // 处理最后一条语句（如果没有分号结尾）
  const trimmed = currentStatement.trim();
  if (trimmed.length > 0) {
    statements.push(trimmed);
  }

  return statements;
}

/**
 * 执行 SQL 文件
 * @param {Sequelize} mysqlDb - Sequelize 实例
 * @param {string} sqlFilePath - SQL 文件路径
 */
async function executeSQLFile(mysqlDb, sqlFilePath) {
  try {
    console.log(`\n📄 执行 SQL 文件: ${path.basename(sqlFilePath)}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // 使用智能分割方法
    const statements = smartSplitSQL(sql);

    console.log(`   共解析出 ${statements.length} 条 SQL 语句`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    // 逐条执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // 跳过空语句和注释
      if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
        skipCount++;
        continue;
      }

      try {
        await mysqlDb.query(statement);
        successCount++;

        // 对 INSERT/TRUNCATE 等重要操作记录日志
        const stmtType = statement.substring(0, 50).trim();
        if (stmtType.startsWith('INSERT INTO')) {
          const tableName = stmtType.match(/INSERT INTO\s+`?(\w+)`?/i)?.[1];
          process.stdout.write(`   ✓ [${i + 1}/${statements.length}] INSERT → ${tableName}\r`);
        } else if (stmtType.startsWith('TRUNCATE')) {
          const tableName = stmtType.match(/TRUNCATE TABLE\s+`?(\w+)`?/i)?.[1];
          console.log(`   ✓ [${i + 1}/${statements.length}] TRUNCATE → ${tableName}`);
        } else if (stmtType.startsWith('DROP TABLE')) {
          const tableName = stmtType.match(/DROP TABLE.*?`?(\w+)`?/i)?.[1];
          console.log(`   ✓ [${i + 1}/${statements.length}] DROP → ${tableName}`);
        } else if (stmtType.startsWith('CREATE TABLE')) {
          const tableName = stmtType.match(/CREATE TABLE\s+`?(\w+)`?/i)?.[1];
          console.log(`   ✓ [${i + 1}/${statements.length}] CREATE → ${tableName}`);
        }

      } catch (err) {
        // 某些错误可以忽略
        const canIgnore = err.message.includes('already exists') ||
                         err.message.includes("doesn't exist");

        if (canIgnore) {
          skipCount++;
          const stmtType = statement.substring(0, 30).trim();
          console.log(`   ⊘ [${i + 1}/${statements.length}] 跳过: ${err.message.substring(0, 60)}`);
        } else {
          errorCount++;
          const errorInfo = {
            index: i + 1,
            statement: statement.substring(0, 100) + (statement.length > 100 ? '...' : ''),
            error: err.message
          };
          errors.push(errorInfo);
          console.error(`   ✗ [${i + 1}/${statements.length}] 失败: ${err.message}`);
          console.error(`     语句: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log(`\n   执行结果: ✓ 成功 ${successCount} | ⊘ 跳过 ${skipCount} | ✗ 失败 ${errorCount}`);

    if (errors.length > 0) {
      console.error(`\n   ⚠️  发现 ${errors.length} 个错误:`);
      errors.forEach(e => {
        console.error(`      [${e.index}] ${e.error}`);
        console.error(`           ${e.statement}`);
      });
    }

    console.log(`✓ SQL 文件执行完成: ${path.basename(sqlFilePath)}\n`);

    // 如果有致命错误，抛出异常
    if (errorCount > 0) {
      throw new Error(`执行 SQL 文件时发生 ${errorCount} 个错误`);
    }

  } catch (error) {
    console.error(`\n❌ 执行 SQL 文件失败 (${sqlFilePath}):`, error.message);
    throw error;
  }
}

/**
 * 验证表数据完整性
 * @param {Sequelize} mysqlDb - Sequelize 实例
 * @returns {Promise<Object>} - 验证结果
 */
async function verifyTableData(mysqlDb) {
  console.log('\n📊 验证数据完整性...\n');

  // 预期的表记录数
  const expectedCounts = {
    captains: 2,
    residents: 20,
    categories: 5,
    products: 65,
    orders: 160,
    order_items: 494,
    commissions: 112,
    carts: 19
  };

  const results = {};
  let allCorrect = true;

  for (const [tableName, expectedCount] of Object.entries(expectedCounts)) {
    try {
      const [rows] = await mysqlDb.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const actualCount = parseInt(rows[0].count);
      const isCorrect = actualCount === expectedCount;

      results[tableName] = {
        expected: expectedCount,
        actual: actualCount,
        correct: isCorrect
      };

      if (isCorrect) {
        console.log(`   ✓ ${tableName.padEnd(15)} : ${actualCount} 条记录 (预期: ${expectedCount})`);
      } else {
        console.error(`   ✗ ${tableName.padEnd(15)} : ${actualCount} 条记录 (预期: ${expectedCount}) - 不匹配!`);
        allCorrect = false;
      }
    } catch (error) {
      console.error(`   ✗ ${tableName.padEnd(15)} : 查询失败 - ${error.message}`);
      results[tableName] = {
        expected: expectedCount,
        actual: 0,
        correct: false,
        error: error.message
      };
      allCorrect = false;
    }
  }

  console.log('');
  return { allCorrect, results };
}

/**
 * 初始化 MySQL 数据库
 * @param {Sequelize} mysqlDb - Sequelize 实例
 */
async function initializeMySQL(mysqlDb) {
  try {
    // 读取环境变量，默认为 false（安全优先）
    const forceReinit = process.env.FORCE_DB_REINIT === 'true';

    const schemaPath = path.join(__dirname, '../../db/mysql/schema.sql');
    const seedPath = path.join(__dirname, '../../db/mysql/seed.sql');

    console.log('\n========================================');
    console.log(`🔧 数据库初始化模式: ${forceReinit ? '强制重新初始化' : '智能检查'}`);
    console.log(`📌 环境变量 FORCE_DB_REINIT = ${process.env.FORCE_DB_REINIT || '(未设置，默认 false)'}`);
    console.log('========================================\n');

    if (forceReinit) {
      // ========== 模式 A：强制重新初始化 ==========
      console.log('⚠️  === 强制重新初始化模式 ===');
      console.log('⚠️  注意：所有现有数据将被清空并重置为初始状态\n');

      // 1. 执行 schema.sql（删除所有表并重新创建）
      console.log('📋 步骤 1/2: 执行 schema.sql (删除并重建表结构)...');
      await executeSQLFile(mysqlDb, schemaPath);
      console.log('✓ 表结构重建完成\n');

      // 2. 执行 seed.sql（插入初始数据）
      console.log('📋 步骤 2/2: 执行 seed.sql (插入初始数据)...');
      await executeSQLFile(mysqlDb, seedPath);
      console.log('✓ 初始数据插入完成');

      // 3. 验证数据完整性
      const verification = await verifyTableData(mysqlDb);
      if (!verification.allCorrect) {
        console.warn('⚠️  数据验证发现问题，但初始化流程已完成');
      } else {
        console.log('✅ 所有表数据验证通过');
      }

      console.log('\n✅ MySQL 数据库强制重新初始化完成\n');

    } else {
      // ========== 模式 B：智能检查模式 ==========
      console.log('🔍 === 智能检查模式 ===');
      console.log('📝 将检查表结构和数据状态，仅在必要时初始化\n');

      const tablesExist = await checkMySQLTables(mysqlDb);

      if (!tablesExist) {
        // 表不存在，需要完整初始化
        console.log('📋 检测到表不存在，开始创建表结构和插入数据...\n');

        // 1. 执行 schema.sql（创建表结构）
        console.log('📋 步骤 1/2: 执行 schema.sql (创建表结构)...');
        await executeSQLFile(mysqlDb, schemaPath);
        console.log('✓ 表结构创建完成\n');

        // 2. 执行 seed.sql（插入初始数据）
        console.log('📋 步骤 2/2: 执行 seed.sql (插入初始数据)...');
        await executeSQLFile(mysqlDb, seedPath);
        console.log('✓ 初始数据插入完成');

        // 3. 验证数据完整性
        const verification = await verifyTableData(mysqlDb);
        if (!verification.allCorrect) {
          console.warn('⚠️  数据验证发现问题，但初始化流程已完成');
        } else {
          console.log('✅ 所有表数据验证通过');
        }

        console.log('\n✅ MySQL 数据库初始化完成\n');

      } else {
        // 表已存在，检查数据
        console.log('✓ 表已存在，检查数据状态...\n');

        try {
          const [captains] = await mysqlDb.query("SELECT COUNT(*) as count FROM captains");
          const captainCount = captains[0].count;

          console.log(`📊 当前 captains 表记录数: ${captainCount}`);

          if (captainCount === 0) {
            console.log('⚠️  检测到表中无数据，开始插入初始数据...\n');
            await executeSQLFile(mysqlDb, seedPath);
            console.log('✓ 初始数据插入完成');

            // 验证数据完整性
            const verification = await verifyTableData(mysqlDb);
            if (!verification.allCorrect) {
              console.warn('⚠️  数据验证发现问题');
            } else {
              console.log('✅ 所有表数据验证通过');
            }

            console.log('\n✅ 数据初始化完成\n');
          } else {
            console.log('✓ 数据已存在，跳过初始化');

            // 可选：验证现有数据
            const verification = await verifyTableData(mysqlDb);
            if (!verification.allCorrect) {
              console.warn('⚠️  现有数据与预期不符，如需重置请设置 FORCE_DB_REINIT=true');
            }

            console.log('\n✅ 数据库状态正常，无需初始化\n');
          }
        } catch (checkError) {
          console.warn('⚠️  检查数据时出错:', checkError.message);
          console.warn('⚠️  跳过数据检查，继续启动服务\n');
        }
      }
    }
  } catch (error) {
    console.error('\n❌ MySQL 数据库初始化失败:', error.message);
    console.error('详细错误:', error);
    throw error;
  }
}

/**
 * 检查 MongoDB 集合是否存在
 * @param {Mongoose} mongoDb - Mongoose 连接实例
 * @returns {Promise<boolean>} - 集合是否存在
 */
async function checkMongoDBCollections(mongoDb) {
  try {
    const collections = await mongoDb.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // 检查关键集合是否存在
    const requiredCollections = ['login_logs', 'stock_logs', 'notifications'];
    const hasCollections = requiredCollections.some(name =>
      collectionNames.includes(name)
    );

    return hasCollections;
  } catch (error) {
    console.error('检查 MongoDB 集合失败:', error.message);
    return false;
  }
}

/**
 * 初始化 MongoDB 数据库
 * @param {Mongoose} mongoDb - Mongoose 连接实例
 */
async function initializeMongoDB(mongoDb) {
  try {
    const collectionsExist = await checkMongoDBCollections(mongoDb);

    if (collectionsExist) {
      console.log('✓ MongoDB 集合已存在，跳过初始化');
      return;
    }

    console.log('开始初始化 MongoDB 数据库...');

    const db = mongoDb.connection.db;

    // 创建集合和索引
    const collections = [
      { name: 'login_logs', indexes: [
        { key: { user_type: 1, user_id: 1 } },
        { key: { login_time: -1 } },
        { key: { status: 1 } }
      ]},
      { name: 'stock_logs', indexes: [
        { key: { product_id: 1 } },
        { key: { created_at: -1 } },
        { key: { type: 1 } }
      ]},
      { name: 'notifications', indexes: [
        { key: { user_type: 1, user_id: 1 } },
        { key: { is_read: 1 } },
        { key: { created_at: -1 } }
      ]},
      { name: 'order_status_logs', indexes: [
        { key: { order_id: 1 } },
        { key: { created_at: 1 } }
      ]},
      { name: 'dashboard_stats', indexes: [
        { key: { date: -1 }, options: { unique: true } }
      ]},
      { name: 'operation_logs', indexes: [
        { key: { module: 1 } },
        { key: { operator_id: 1 } },
        { key: { created_at: -1 } }
      ]}
    ];

    // 创建所有集合和索引
    for (const coll of collections) {
      await db.createCollection(coll.name);
      console.log(`✓ 创建集合: ${coll.name}`);

      for (const index of coll.indexes) {
        await db.collection(coll.name).createIndex(index.key, index.options || {});
      }
      console.log(`  创建索引: ${coll.indexes.length} 个`);
    }

    console.log('✓ MongoDB 数据库初始化完成');
  } catch (error) {
    console.error('❌ MongoDB 数据库初始化失败:', error.message);
    // MongoDB 初始化失败不应该阻止服务启动
    console.warn('⚠️  MongoDB 初始化失败，但服务将继续启动');
  }
}

/**
 * 初始化所有数据库
 * @param {Sequelize} mysqlDb - Sequelize 实例
 * @param {Mongoose} mongoDb - Mongoose 连接实例
 */
async function initializeDatabases(mysqlDb, mongoDb) {
  console.log('\n========================================');
  console.log('🔄 开始数据库初始化检查...');
  console.log('========================================\n');

  try {
    // 初始化 MySQL（必须成功）
    await initializeMySQL(mysqlDb);

    // 初始化 MongoDB（失败不影响启动）
    await initializeMongoDB(mongoDb);

    console.log('\n========================================');
    console.log('✅ 数据库初始化完成');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ 数据库初始化失败');
    console.error('========================================\n');
    throw error;
  }
}

module.exports = {
  initializeDatabases,
  initializeMySQL,
  initializeMongoDB,
  checkMySQLTables,
  checkMongoDBCollections,
  verifyTableData
};
