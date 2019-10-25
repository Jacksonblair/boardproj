module.exports = {
	getOneById: function(id) {
		return (`SELECT * FROM users WHERE id = ${id}`);
	},
	getOneByEmail: function(email) {
		return (`SELECT * FROM users WHERE email = '${email}'`);
	},
	createUser: function(email, password) {
		return (`INSERT INTO users(email, password) VALUES ('${email}', '${password}')`);
	}
}