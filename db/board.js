var _ = require('underscore');

module.exports = {
	getBoardsByOwnerId: function(id) {
		return (`SELECT * FROM boards WHERE owner_id = ${id}`);
	},
	getPostsByBoardId: function(id) {
		return (`SELECT target_date, 
				TO_CHAR(target_date, 'Month') As month,
				EXTRACT(DAY from target_date) AS day,
				EXTRACT(YEAR from target_date) AS year,
				json_agg(
					json_build_object('id', id, 'title', title, 'author', author, 'description', description, 'content', content, 'author_id', author_id, 'pinned', pinned)
				) AS posts
				FROM posts
				WHERE board_id = ${id}
				GROUP BY target_date`);
	},
	getBoardByBoardId: function(id) {
		return (`SELECT * FROM boards WHERE id = ${id}`);
	},
	getPostByPostId: function(id) {
		return (`SELECT title, description, 
				content, 
				category, author, author_id, id,
				TO_CHAR(target_date, 'Mon DD, YYYY') AS target_date
				FROM posts 
				WHERE id = ${id}`);
	},
	pinPosts: function(post_ids){ 
		// toggle boolean state
		console.log(`UPDATE posts SET pinned = NOT pinned WHERE id IN (${post_ids})`)
		return (`UPDATE posts SET pinned = NOT pinned WHERE id IN (${post_ids})`)
	},
	createPost: function(post, board_id, user) {

		// var content = post.content;
		// content = content.replace(/'/g, "''")
		// console.log(content);

		post.content = post.content.replace(/'/g, "''")

		if (!post.target_date) {
			post.target_date = null
		}

		if (!post.description) {
			post.description = 'no description'
		}

		return (`INSERT INTO posts (title, description, content, category, target_date, board_id, author, author_id) 
				VALUES ('${post.title}', '${post.description}', '${post.content}', '${post.category}', '${post.target_date}', ${board_id}, '${user.username}', ${user.id})`)
	},
	deletePost: function(post_id) {
		return (`DELETE FROM posts WHERE id = ${post_id}`);
	},
	editPost: function(post, post_id, user) {

		post.content = post.content.replace(/'/g, "''")

		console.log(post);

		if (!post.target_date) {
			post.target_date = null
		}

		if (!post.description) {
			post.description = 'no description'
		}

		return (`UPDATE posts 
				SET title = '${post.title}',
				description = '${post.description}',
				content = '${post.content}',
				category = '${post.category}',
				target_date = '${post.target_date}',
				author = '${user.username}' 
				WHERE id = ${post_id}
				`)
	},
	getFilteredPosts: function(filter, board_id) {
		var query = `SELECT target_date,
					TO_CHAR(target_date, 'Month') As month,
					EXTRACT(DAY from target_date) AS day,
					EXTRACT(YEAR from target_date) AS year,
					json_agg(
						json_build_object('id', id, 'title', title, 'author', author, 'description', description, 'content', content, 'author_id', author_id, 'pinned', pinned)
					) AS posts
					FROM posts
					WHERE board_id = ${board_id} AND `;

		/*filter by categories
		- Get allowed categories (which is an array), remove empties, add quotation marks, and join with commas (to parse in SQL query)
		- If no categories, just return a dud request */

		var allowedCategories 
		if (!(allowedCategories = this.getAllowedCategories(filter.categories)))
			return false;
		query += `category IN (${allowedCategories}) `;

		/*filter by search terms*/
		if (filter.search)
			query += `AND LOWER(description) LIKE ('%${filter.search}%') OR LOWER(title) LIKE ('%${filter.search}%') OR LOWER(content) LIKE ('%${filter.search}%') `

		/* filter by date function and date */
		if (filter.dateSetting) {
			switch(filter.dateSetting) {
				case "FROM":
					if (filter.date) {
						query += `AND target_date > (date '${filter.date}' - INTERVAL '1 DAY') `;
					}
					break;
				case "BEFORE":
					if (filter.date) {
						query += `AND target_date < ('${filter.date}') `;
					}
					break;
				case "RANGE":
					if (filter.startdate && filter.enddate) {
						query += `AND target_date BETWEEN '${filter.startdate}' AND '${filter.enddate}' `;
					}
					break;
			}
		}

		query += `GROUP BY target_date ORDER BY target_date`
		console.log(query);
		return query;
	},

	getAllowedCategories: function(categories) {
		// compares to returned database posts
		var availCategories = ["EVENT", "REMINDER", "ANNOUNCEMENT"];

		// checks truthyness of filter buttons for different categories and returns array to be checked against DB returned posts
		categories.forEach((category, index) => {
			if (!category) {
				availCategories[index] = "";
			}
		});

		return availCategories.filter(Boolean).map(function(cat) { return "'" + cat + "'" }).join(', ');;
	}

}