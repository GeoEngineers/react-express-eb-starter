export const up = async (knex) => {
	return knex.raw(`CREATE SCHEMA ${process.env.DB_NAME}`)
};

export const down = async (knex) => {
	return knex.schema.dropSchemaIfExists(`${process.env.DB_NAME}`, true)
};
