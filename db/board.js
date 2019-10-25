module.exports = {
	getBoardsByOwnerId: function(id) {
		return (`SELECT * FROM boards WHERE owner_id = ${id}`);
	},
	getPostsByBoardId: function(id) {
		return (`SELECT title, description, content, category,
				EXTRACT(MONTH from target_date) AS month,
				EXTRACT(DAY from target_date) AS day,
				EXTRACT(YEAR from target_date) AS year
				FROM posts 
				WHERE board_id = ${id} 
				ORDER BY created`);
	},
	getBoardByBoardId: function(id) {
		return (`SELECT * FROM boards WHERE id = ${id}`);
	},
	createPost: function(post, board_id) {
		return (`INSERT INTO posts (title, description, content, category, target_date, board_id) 
				VALUES ('${post.title}', '${post.description}', '${post.content}', '${post.category}', '${post.target_date}', '${board_id}')`)
	}
}