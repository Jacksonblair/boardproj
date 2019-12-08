### NOTES

post

	# CORE FEATURES

		Tools for board feed editing
			- Edit button
				- Pressing it shows checkboxes for every post
				- Save as... (saves as a post-link to one of your boards)
				- Delete (Should only show if user is owner of board)

# Post-links?
	+ Add a post to your board from another board.
	If the original is deleted?
		Make post-link a new type of schema in the db
		Or just add it as a post to the board? With a post_link_id, post_link_orig_author, post_link_orig_board

			What if someone updates the linked post?
				Whenever a post is updated, it should look for posts that have a post_link_id matching the post id
				... And then update those posts to match.

				...

			What if someone deletes the linked post?
				If a post is deleted, it can look for matching post links, and update them to show that the original post has been deleted.



ALTER TABLE posts
ADD COLUMN 
post_link_id INTEGER REFERENCES posts (id) DEFAULT NULL,
post_link_orig_author VARCHAR(100) DEFAULT NULL,
post_link_orig_board INTEGER REFERENCES posts (board_id) DEFAULT NULL,
post_link_orig_exists BOOLEAN DEFAULT FALSE;


CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
	title VARCHAR(150) NOT NULL,
	description VARCHAR(300),
	content TEXT,
	category VARCHAR(50) NOT NULL,
	board_id INTEGER REFERENCES boards (id),
  	created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  	target_date TIMESTAMP,
  	author VARCHAR(100),
  	author_id INTEGER REFERENCES users (id) NOT NULL,
  	pinned BOOLEAN DEFAULT false NOT NULL
);




		Settings page for boards
			- Delete button
			- Public setting
			- Add users access

		Activity page for index
			- Last x posts for boards;

		FINAL STYLING

		BROWSER COMPATABILITY

		THEN DONZO, NEXT PROJECT


	# NON-CORE FEATURES




SELECT target_date, json_object_agg('post', (json_object_agg('title', title)) FROM posts GROUP BY target_date;


you can use json_agg to aggregate arrays over:

	SELECT json_build_object(concat(name, r_id), json_agg(json_build_array("data".value,created_at))) 
	FROM data group by concat(name, r_id);

	SELECT target_date, 
		TO_CHAR(target_date, 'MON') As month,
		EXTRACT(DAY from target_date) AS day,
		EXTRACT(YEAR from target_date) AS year,
		json_agg(
			json_build_object('title', title, 'author', author, 'description', description, 'content', content, 'author_id', author_id)
		) AS posts
	FROM posts group by target_date;



	SELECT json_build_object(
		target_date, 
		json_agg(title, id)
		)
	FROM posts

	SELECT target_date, 
		array_agg(title) as title,
		array_agg(description) as description,
		array_agg(json_build_object(content) as content,
		array_agg(category) as category, 
		array_agg(author) as author,
		array_agg(author_id) as author_id, 
		array_agg(id) as author,
		array_agg(TO_CHAR(target_date, 'MON')) As month, 
		array_agg(EXTRACT(DAY from target_date)) AS day,
		array_agg(EXTRACT(YEAR from target_date)) AS year
		FROM posts GROUP BY target_date;

	getPostsByBoardId: function(id) {
		return (`SELECT title, description, content, category, author, author_id, id,
				TO_CHAR(target_date, 'MON') AS month,
				EXTRACT(DAY from target_date) AS day,
				EXTRACT(YEAR from target_date) AS year
				FROM posts 
				WHERE board_id = ${id} 
				ORDER BY created`);
	},


INSERT INTO posts (title, description, content, category, target_date, board_id, author, author_id)
SELECT title, description, content, category, target_date, board_id, author, author_id
FROM posts WHERE id = 14;



CREATE TABLE boards (
	id SERIAL PRIMARY KEY,
	owner_id INTEGER,
	name VARCHAR(300) NOT NULL,
	public BOOLEAN DEFAULT false NOT NULL,
	FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR(300),
	password VARCHAR(300),
	username VARCHAR(69)
);

CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
	title VARCHAR(150) NOT NULL,
	description VARCHAR(300),
	content TEXT,
	category VARCHAR(50) NOT NULL,
	board_id INTEGER REFERENCES boards (id),
  	created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  	target_date TIMESTAMP,
  	author VARCHAR(100),
  	author_id INTEGER REFERENCES users (id) NOT NULL,
  	pinned BOOLEAN DEFAULT false NOT NULL
);


ALTER TABLE posts 
ADD COLUMN board_id SERIAL REFERENCES boards(id)
;


ALTER TABLE posts
ADD COLUMN
post_link_orig_exists BOOLEAN DEFAULT FALSE;

ALTER TABLE posts
ADD COLUMN 
post_link_id INTEGER REFERENCES posts (id) DEFAULT NULL,
post_link_orig_author VARCHAR(100) DEFAULT NULL,
post_link_orig_board INTEGER DEFAULT NULL,
post_link_orig_exists BOOLEAN DEFAULT FALSE;

ALTER TABLE posts
ADD COLUMN pinned BOOLEAN DEFAULT false NOT NULL;


SELECT * FROM posts 
WHERE category IN ('EVENT', 'ANNOUNCEMENT', 'REMINDER')
AND description LIKE ('%orgies%') OR title LIKE ('%party%') OR content LIKE ('%party%');




	Add in pin functionality

	Edit side menu functionality
		- Profile
		- Boards
		- Messages
		- Settings









ALTER TABLE posts ADD target_date DATE;

	INSERT INTO posts (title, description, content, category, target_date)
	VALUES ("Bus booking to Sydney", "No description", "

	Bus booking
	22nd December 2019
	CANBERRA

	Jolimont Centre, Bay 6/7
	65-67 Northbourne Ave
	Sunday, 22 December 2019
	1:00 PM

	To

	SYDNEY AIRPORT
	International Terminal T1
	Level 2, Departures Level
	Sunday, 22 December 2019
	4:15 PM *

	Baggage allowance 1x suitcase. max weight 32kg.

	Don\'t forget your ID

	Photo ID in the form of a driver's licence or passport will be required. Concession/student cards may be required when boarding. Failure to produce photo ID / concession cards may result in your ticket being cancelled.

	Boarding commences 30 minutes prior to departure. You must be at this departure point no later than 10 minutes prior.
	", "REMINDER", "2019-12-22");

	-----

	Bus booking
	22nd December 2019
	CANBERRA

	Jolimont Centre, Bay 6/7
	65-67 Northbourne Ave
	Sunday, 22 December 2019
	1:00 PM

	To

	SYDNEY AIRPORT
	International Terminal T1
	Level 2, Departures Level
	Sunday, 22 December 2019
	4:15 PM *

	Baggage allowance 1x suitcase. max weight 32kg.

	Don't forget your ID

	Photo ID in the form of a driver's licence or passport will be required. Concession/student cards may be required when boarding. Failure to produce photo ID / concession cards may result in your ticket being cancelled.

	Boarding commences 30 minutes prior to departure. You must be at this departure point no later than 10 minutes prior.

	-----

	Flight: Brisbane to Sydney

	TT 382 Sydney to Brisbane
	Date Sun 22 Dec 2019 - Departs 6:00 PM - Arrives 6:30 PM

	Baggage limits, 20k each

	booking reference P4DRGI

	Light Fares include 7kg of carry on baggage only.

	-----

	Return Flight: Taipei to Tokyo, Tokyo to Taipei

	Taipei (TPE) → Tokyo (NRT) RETURN
	12 Jan. 2020 - 23 Jan. 2020 , 2 return tickets

	Taipei > Tokyo
	duration: 3h 0m
	TPE  4:20 pm
	Terminal 2
	NRT  8:20 pm  
	Terminal 2
	China Airlines  106
 
	Tokyo > Taipei
	duration: 4h 10m
	NRT  2:35 pm
	Terminal 2
	TPE  5:45 pm  
	Terminal 2
	China Airlines  101
	 
	China Airlines  101

	-----

	Travel dates
	28 Dec. 2019 - 30 Jan. 2020

	Itinerary #
	7471992652605

	Return Flight: Brisbane to Taipei, Taipei to Sydney

	Confirmation
	T6P6LQ (China Airlines)

	Booking ID
	T6P6LQ

	Departure
	Sat., 28 Dec.
	China Airlines 54

	Brisbane (BNE)
	11:10 pm
	Terminal: 1

	Taipei (TPE)
	5:50 am +1 day
	Terminal: 2
	Arrives on 29 Dec. 2019

	Cabin: Economy (R)
	8h 40m duration

	Seat: 49J, 49K | Confirm or change seats with the airline

	Total duration: 8h 40m

	Departure
	Thu., 30 Jan.
	China Airlines 55

	Taipei (TPE)
	7:35 am
	Terminal: 2	flight to	

	Sydney (SYD)
	8:05 pm
	Terminal: 1

	Cabin: Economy (R)
	9h 30m duration
	Seat: 45A, 45B | Confirm or change seats with the airline*

	Total duration: 9h 30m

	Traveller(s):
	jackson thomas blair
	Pei-yi Hsu

	-----

	Hotel: Mustard Hotel Asakusa Hostel
	12 Jan 2020 - 23 Jan 2020 , 1 room | 11 nights

	1-7-11 Hanakawado, Tokyo, 111-0033 Japan
	Tel: 81 (3) 58307481, Fax: 81 (3) 58307482

	Check-in time starts at 2:00 PM
	Check-in time ends at midnight
	Minimum check-in age is 18
	If a late check-in is planned, contact this property directly for their late check-in policy.

	Important Hotel Information
	This reservation is non-refundable and cannot be cancelled or changed.

	Dormitory Single Room (For 2 persons, 2 Single Beds)
	Reserved for
	jackson thomas blair
	2 adults

	Requests	 	 
	2 Twin Beds, non-smoking room




