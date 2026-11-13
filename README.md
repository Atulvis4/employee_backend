# Employee Directory Backend

## Libraries Used

- **express** (`^5.3.0`): Web framework for building REST API endpoints.
- **mysql2** (`^3.24.6`): MySQL client supporting connection pooling with promises.
- **cors** (`^2.8.6`): Enables Cross-Origin Resource Sharing for frontend requests.
- **dotenv** (`^18.0.10`): Loads configuration values from the `.env` file.
- **zod** (`^4.6.7`): Schema validation and type safety for incoming request bodies.
- **nodemon** (`^3.1.14`) *(devDependency)*: Automatically restarts the server upon file changes.

---

## API Versioning

All API routes are prefixed under the **`v1`** namespace:
- **Base URL:** `http://localhost:5000/api/v1`

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/employees` | Fetch all employees (supports `?search=` and `?page=&limit=`) |
| `GET` | `/api/v1/employees/:id` | Fetch a single employee by ID |
| `POST` | `/api/v1/employees` | Add a new employee (`name`, `email`, `role`) |
| `PUT` | `/api/v1/employees/:id` | Update an existing employee (`name`, `email`, `role`) |
| `DELETE` | `/api/v1/employees/:id` | Delete an employee by ID |
