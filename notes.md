### NOTES

	Add menu bar to main page
		- Icons for filtering by type
			- Event
			- Note
			- Reminder
			- Announcement
			- Alert

		# Filtering logic
		- Every button/input calls a Update function when changed, that check if the form content is different.
		- If the form content is different, AJAX request to get new list content



		- Buttons for filtering by date
			- Day (arrows to move by one, click icon to pick specific day)
				< [ Today ] >
			- Month 
				< [ This month ] >
			- Year
				< [ This year ] >

		- Keyword search

		- View
			- List view (default)
			- Calendar view

	Edit side menu functionality
		- Profile
		- Boards
		- Messages
		- Settings