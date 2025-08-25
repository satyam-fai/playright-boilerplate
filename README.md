# Todo App

A professional Next.js todo application with secure authentication and data persistence in JSON files.

## Features

- User authentication (login/registration)
- Todo management (create, read, update, delete)
- Data persistence using JSON files
- Responsive design with Tailwind CSS
- Animations and transitions for enhanced UX
- TypeScript for type safety
- Modern React patterns

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd todoapp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and visit `http://localhost:3000`

## UI Enhancements

The application now features a modern, visually appealing interface with:

- Glassmorphism design elements
- Gradient text and backgrounds
- Smooth animations and transitions
- Responsive layout for all device sizes
- Dark mode support
- Card-based design with hover effects
- Blob animations in the hero section

## Project Structure

```
todoapp/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── styles/           # CSS files
│   └── types/            # TypeScript types
├── data/                 # JSON data files
├── public/               # Static assets
└── package.json          # Project dependencies
```

### Data Persistence

User data and todos are stored in JSON files located in the `data/` directory:

- `users.json`: Stores user account information
- `todos.json`: Stores todo items for all users

### Authentication

The application uses a simple authentication system:

1. Users can register for a new account
2. Registered users can log in to access their dashboard
3. User sessions are managed using localStorage

### API Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/todos?userId=...` - Get all todos for a user
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo

## Development

### Technologies Used

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing
- [uuid](https://www.npmjs.com/package/uuid) - Unique ID generation

### Folder Structure Explanation

- `src/app`: Contains all the pages and API routes using the Next.js App Router
- `src/lib`: Utility functions for file operations and todo management
- `src/styles`: Global CSS styles and animations
- `data`: JSON files for data persistence

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a pull request

## License

This project is licensed under the MIT License.