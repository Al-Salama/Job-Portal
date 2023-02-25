// Using MariaDB database

const mariaDB = require('mariadb');
class SqlConnection {

	static pool = mariaDB.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		charset: 'utf8mb4',
		connectionLimit: 15,
		trace: true
	});

	constructor() {
		this.connection = false;
	};

	async connect() {
		try {
			const myConnection = await SqlConnection.pool.getConnection();
			this.connection = myConnection;
			return [true, myConnection];
		} catch (error) {
			return [false, error];
		};
	};

	async query(queryString, args) {

		try {
			const result = await this.connection.query(queryString, args);
			return [true, result];
		} catch (error) {
			return [false, error];
		}
    }

	async disconnect(){
		try {
			await this.connection.release() // return the connection to the pool;
			return [true, false];
		} catch (error) {
			return [false, error];
		}
	}
}

module.exports = {
	SqlConnection
}