import "dotenv/config";

export default {
	development: {
		client: "pg",
		connection: {
			host: process.env.HOSTNAME || "localhost",
			user: process.env.USERNAME || "postgres",
			password: process.env.PASSWORD || "",
			database: process.env.DB_NAME,
			port: process.env.PORT || 5432,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
			directory: "migrations/dev",
		},
		seeds: {
			directory: "seeds/dev",
		},
	},
	production: {
		client: "pg",
		connection: {
			host: process.env.RDS_HOSTNAME,
			user: process.env.RDS_USERNAME,
			password: process.env.RDS_PASSWORD,
			database: process.env.RDS_DB_NAME,
			port: process.env.RDS_PORT || 5432,
		},
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: "knex_migrations",
			directory: "migrations/prod",
		},
		// seeds: {
		//     directory: __dirname + '/db/seeds/prod',
		// },
	},
};
