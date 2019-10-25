module.exports = {
	initial: `SELECT title, description, content, category,
				EXTRACT(MONTH from CREATED) AS month,
				EXTRACT(DAY from CREATED) AS day,
				EXTRACT(YEAR from CREATED) AS year 
				FROM posts ORDER BY created;`
}