# Welcome to freelix-node-server app

## This is server of Movies and Series with all required CRUD operation listed below

## Routes

### Movies

- **Add Movie**: POST `/api/admin/add-movie`
- **Get Movies**: GET `/api/admin/movie/all`
- **Get Specific Movie**: GET `/api/admin/movie/:id`
- **Update Movie**: PUT `/api/admin/update-movie/:id`
- **Delete Movie**: DELETE `/api/admin/delete-movie/:id`

### Auth

- **Login as User**: POST `/api/login`
- **Login as Admin**: POST `/api/admin/login`
- **Signup as User**: POST `/api/signup/user`
- **Signup as Admin**: POST `/api/admin/signup`
- **Change Password**: PUT `/api/admin/change-password`
- **Reset Password**: PUT `/api/admin/reset-password`

### Filters

- **Search Movie**: GET `/api/movies/search`
- **Filter Movie**: GET `/api/movies/filter`

## Clone and Start Server

To clone and start the server, follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/Amrit-Raj12/freelix-node-server.git

   ```

2. Go to server directory

   ```sh
   cd freelix-node-server

   ```

3. Start the server
   ```sh
   npm run start-dev
   ```

## Example URL

- Base URL: `http://localhost:5000`
