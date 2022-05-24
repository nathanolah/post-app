# Bulletin Board

A Full stack application where users can post messages publicly, and vote on each other's posts.

Check out the deployed application at https://nolah.xyz

## Features
- Users can register/login
- Logout
- Forgot Password
- Users can create and post messages
- Users can update and delete their messages
- Users can up or down vote each other's posts
- View top posts on the bulletin board
- Paginate through most recent posts
- Dark/light mode

## Architecture

Frontend deployed on Vercel and backend deployed on a DigitalOcean VPS. 

Dokku managing multiple Docker containers running on the virtual machine.

PostgreSQL and Redis database containers linked to the API container.

Nginx sitting in front of the NodeJS server proxying requests.

### Backend
- Express - server 
- TypeORM - ORM framework
- Apollo Server - GraphQL server
- GraphQL - query language
- PostgreSQL - database
- Redis - database (stores user sessions)

### Frontend
- Next.js
- Chakra UI
- Apollo Client
- GraphQL
- GraphQL Codegen
