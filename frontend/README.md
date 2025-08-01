# R.B Computer Frontend

This is the frontend application for the R.B Computer Student Management System.

## Project Structure

The project is built as a modern React Single-Page Application (SPA) with the following structure:

- `src/components`: Reusable UI components
- `src/pages`: Page components for different routes
- `src/services`: API services for backend communication
- `src/store`: Global state management with Zustand
- `src/utils`: Utility functions
- `src/mocks`: Mock data and API handlers for testing

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd RBComputer/frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Development

Start the development server:

```
npm start
```

The application will be available at http://localhost:3000.

## API Integration

The application integrates with the backend API using the following services:

- `apiClient.js`: Base axios client with interceptors for authentication and error handling
- `authService.js`: Authentication-related API calls
- `feeService.js`: Fee management API calls
- `studentService.js`: Student management API calls

## State Management

Global state is managed using Zustand with the following stores:

- `feeStore.js`: Manages fee-related state and API calls
- `studentStore.js`: Manages student-related state and API calls

## Testing

### Running Tests

Run all tests:

```
npm test
```

Run tests with coverage report:

```
npm run test:coverage
```

Run tests in CI mode (non-interactive):

```
npm run test:ci
```

### Test Structure

- Unit tests: Test individual components and functions
- Integration tests: Test interactions between components
- Mock API: Uses MSW (Mock Service Worker) to intercept and mock API calls

### Test Files

- `__tests__` directories contain test files
- `.test.js` or `.test.jsx` files are automatically picked up by Jest

## Error Handling

The application includes comprehensive error handling:

- API error handling with interceptors
- Component-level error boundaries
- Form validation with Formik and Yup
- Toast notifications for user feedback

## Responsive Design

The UI is fully responsive and works on:

- Desktop browsers
- Tablets
- Mobile devices

Responsive design is implemented using:

- Tailwind CSS for utility-based styling
- Media queries for specific breakpoints
- Flexible layouts with CSS Grid and Flexbox

## Build for Production

Create a production build:

```
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Linting and Formatting

Run ESLint:

```
npm run lint
```

Fix ESLint issues:

```
npm run lint:fix
```

Format code with Prettier:

```
npm run format
```
