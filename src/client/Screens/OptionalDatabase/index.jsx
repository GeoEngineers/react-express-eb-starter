function OptionalDatabase(){
    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Optional database</h2>
                <p className="card-text">
                    Apps commonly need a database. A simple Postgres setup is included here.
                </p>
                <p className="card-text">
                    The following instructions assume that Postgres is running on <code>localhost</code> and listening on port <code>5432</code>. Setup for production will require different environment variables.
                </p>
                <h3>Knex</h3>
                <p className="card-text">
                    This project assumes the developer is starting with blank database and suggests using <a href="https://knexjs.org">knex</a> to create and modify schema.
                    Knex is included in this project's dependencies and can be easily invoked using <code>npm run knex</code>. Knex can optionally be installed globally and be available using just <code>knex</code> from the command line. 
                </p>
                <p className="card-text">
                    Database connection configuration is stored in <code>src/db/knexfile.js</code>. This file contains information for both development and production environments, although any other environment can be created as well, for example, staging. 
                </p>
                <h3>Environment variables</h3>
                <p className="card-text">
                    The connection configuration file mentioned above references environment variables. This project automatically adds anything found in <code>.env</code> or <code>.env.local</code> to <code>process.env</code>.
                </p>
                <h3>Migrations</h3>
                <p className="card-text">
                    Migrations are the basic building block of schema using knex. Schema is defined using javascript, and each migration file includes instructions on how to add to the existing schema and how to roll back those changes, known respectively as "up" and "down" migrations.
                </p>
                <p className="card-text">
                    
                </p>
            </div>
        </div>
    )
}

export default OptionalDatabase;