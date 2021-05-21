const env = process.env;

const config = {
  db: { 
    host: env.DB_HOST || 'localhost',
    port: env.DB_PORT || '5432',
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD || 'root',
    database: env.DB_NAME || 'carrental',
  },
  listPerPage: env.LIST_PER_PAGE || 10,
};

module.exports = config;