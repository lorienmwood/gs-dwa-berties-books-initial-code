# Berties Books

A small web application built using Node.js, Express.js, and the EJS templating engine.

## Technologies Used

- Express.js – for handling web requests/routes
- Node.js – to run the server
- EJS - for dynamic HTML templates
- HTML – for the webpages

## How to Install and Run Locally

1. Clone the Github

```
git clone https://github.com/lorienmwood/06_berties_33827617.git
cd 06_berties_33827617
```

2. Install Node.js

```
npm install
```

3. Run the Server

```
node index.js
```

4. Open the Browser \
   Visit http://localhost:8000/ and the webpage will open.

## Routes

| Route           | Description                                          |
| --------------- | ---------------------------------------------------- |
| /               | Home page displaying other pages                     |
| / about         | About the shop                                       |
| / addbooks      | Add additional books to shop                         |
| / audit         | Shows login attempts                                 |
| / bargainbooks  | Shows books less than £20                            |
| / list          | List of books in shop                                |
| / login         | Login Page                                           |
| / loggedin      | When user logged in                                  |
| / register      | Register first name,last name and email of customers |
| / registered    | Registered users                                     |
| / search        | Search shop items                                    |
| / searchresults | Page to show results                                 |
| / survey        | Surveying customers first name ,last name and email  |

## dotenv

1. To avoid exposing database credentials in the source code, the application uses the dotenv module.
2. This stores sensitive details like the database host, username, password, and name in a separate .env file that isn’t committed to version control.
3. The variables are loaded at runtime and accessed via process.env, with the .env file added to .gitignore to keep it hidden from GitHub.
4. This helps keep sensitive data secure.

## audit

1. Audit is used to track if login attempts where successful failed login attempts.
2. All login attempts are recorded in an audit_log table, including the username, result, message, and timestamp.
3. Entries are added after each login attempt, and the /users/audit route displays this data, providing a simple way to monitor login activity and spot suspicious behaviour.

## Access Control

These pages check access and redirect to the login page if the user is not logged in:

/users/logout – only logged-in users can log out.

/books/addbook - the add-book form is restricted so only logged-in users can add books.

/books/bookadded – the POST route that actually inserts a new book into the database is also restricted.

/books/list – the full list of books is only shown to logged-in users.

/users/audit - the full list of login attempts

## Task 7: Sanitisation

#### For the register form:

I used express-sanitizer to protect the register form from XSS attacks.

The following fields are sanitised as they may be stored or displayed. This prevents users from injecting HTML or JavaScript into the system:

- First name
- Last name
- Username
- Email

The password field is not sanitised because it is never displayed and is only hashed and stored securely. Sanitising it could change the user’s input and break login without adding extra security.

#### Add Book form:

- The book name field is sanitised before being stored in the database to prevent users from injecting HTML or JavaScript (XSS attacks).

#### Seach form:

- The search keyword is sanitised before being processed or displayed to protect against malicious input.
- The price field is not sanitised because it is validated as a numeric value and should not be altered.

#### Login form:

- The username field is sanitised to prevent XSS attacks through malicious input.
- The password field is not sanitised because it is never displayed and is only used for secure comparison with the hashed password. Sanitising it could change the input and break authentication.

### Books API

GET /api/books, returns a JSON list of all books in the database.

##### Optional Query Parameters

| Parameter               | Description                           |
| ----------------------- | ------------------------------------- |
| `search`                | filters books by keyword              |
| `minprice` / `maxprice` | returns books within price ranges     |
| `sort`                  | sorts results by e.g a title or price |

##### Example Requests

/api/books
/api/books?search=world
/api/books?minprice=5&max_price=10
/api/books?sort=name
/api/books?sort=price
