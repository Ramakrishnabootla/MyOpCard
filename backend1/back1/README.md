# MyOpCard Backend

A robust Node.js backend for the MyOpCard healthcare platform, built with Express.js and MongoDB.

## Features

- **Patient Management**: Complete CRUD operations for patient records
- **File Upload**: Secure handling of Aadhaar and candidate photos
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: Helmet for security headers, rate limiting, CORS
- **Logging**: Morgan for request logging in development
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/myopcard
   JWT_SECRET=your_super_secret_jwt_key_here
   UPLOAD_PATH=uploads/
   CLIENT_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Patients

- `GET /api/patients` - Get all patients (paginated)
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/card/:opCardNumber` - Get patient by OP card number
- `POST /api/patients` - Create new patient (with file uploads)
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Health Check

- `GET /api/health` - Server health status

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   └── patientController.js # Patient business logic
├── middlewares/
│   ├── errorHandler.js      # Error handling middleware
│   ├── upload.js           # File upload configuration
│   └── validation.js       # Input validation rules
├── models/
│   └── Patient.js          # Patient data model
├── routes/
│   └── patients.js         # Patient routes
├── utils/                  # Utility functions
├── app.js                  # Main application file
├── package.json
├── .env                    # Environment variables
└── .gitignore
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/myopcard |
| `JWT_SECRET` | JWT signing secret | - |
| `UPLOAD_PATH` | File upload directory | uploads/ |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## Security Features

- Input validation and sanitization
- File type and size restrictions
- Rate limiting
- Security headers (Helmet)
- CORS configuration
- Error message sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.