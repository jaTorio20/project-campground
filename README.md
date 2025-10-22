# PinoyCampground - Campground Review Application

A full-stack web application for discovering, reviewing, and managing campgrounds. Built with Node.js, Express, MongoDB, and featuring user authentication, image uploads, interactive maps, and more.

## Features

- **User Authentication**: Local registration/login and Google OAuth integration
- **Campground Management**: Create, edit, and delete campgrounds with images
- **Review System**: Rate and review campgrounds with star ratings
- **Interactive Maps**: Mapbox integration for campground locations
- **Image Upload**: Cloudinary integration for image storage
- **Security**: Password reset via email, rate limiting, input sanitization
- **Responsive Design**: Mobile-friendly Bootstrap interface
- **Real-time Updates**: Flash messages and dynamic content

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (local installation) or MongoDB Atlas account
- [Git](https://git-scm.com/)

## External Services Setup

This application requires several external services. Set up accounts for the following:

### 1. MongoDB Database
- **Option A**: Install MongoDB locally
- **Option B**: Use MongoDB Atlas (cloud)
  - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
  - Create a new cluster
  - Get your connection string

### 2. Cloudinary (Image Storage)
- Create account at [Cloudinary](https://cloudinary.com/)
- Get your cloud name, API key, and API secret from dashboard

### 3. Google OAuth (Optional)
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing
- Enable Google+ API
- Create OAuth 2.0 credentials
- Get Client ID and Client Secret

### 4. Gmail (Email Service)
- Use your Gmail account or create a new one
- Enable 2-factor authentication
- Generate an App Password for the application
   **Or**
   [Gmail service sender by Brevo]
- Use brevo account
- Get brevo api key
- Get brevo domain or own verified email at brevo

### 5. Mapbox (Maps)
- Create account at [Mapbox](https://www.mapbox.com/)
- Get your access token from the account dashboard

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/jaTorio20/project-campground.git
cd project-campground
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Variables Setup
Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_URL=mongodb://localhost:27017/campground
# For MongoDB Atlas: DB_URL=mongodb+srv://username:password@cluster.mongodb.net/campground

# Session Secret (generate a random string)
SECRET=your-super-secret-session-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET=your-cloudinary-api-secret

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gmail Configuration
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_PASS=your-gmail-app-password
 **Or**
 Brevo Configuration
 BREVO_API_KEY=yourBrevoApiKey
 BREVO_SENDER_EMAIL=yourbrevo@gmail.com

# Mapbox Token
MAPBOX_TOKEN=your-mapbox-access-token

# Environment
NODE_ENV=development
```

### Step 4: Database Setup
If using local MongoDB:
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Start MongoDB service (macOS/Linux)
sudo systemctl start mongod
```

### Step 5: Seed Database (Optional)
To populate the database with sample campgrounds:
```bash
node seeds/index.js
```

## Running the Application

### Development Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Production Mode
```bash
NODE_ENV=production npm start
```

## Usage Guide

### For Testers

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`

2. **Create an Account**
   - Click "Register" in the navigation
   - Fill out the registration form with:
     - Username (minimum 5 characters, no spaces)
     - Email address
     - Password (must include uppercase, lowercase, and number)
   - Or use "Login with Google" for quick access

3. **Explore Campgrounds**
   - Browse existing campgrounds on the home page
   - Click on any campground to view details
   - View interactive maps showing campground locations

4. **Create a Campground**
   - Click "Add New Campground" (requires login)
   - Fill out the form with:
     - Title and description
     - Price per night
     - Location
     - Upload images
     - Set location on map
   - Submit to create your campground

5. **Add Reviews**
   - Navigate to any campground
   - Scroll to the reviews section
   - Rate the campground (1-5 stars)
   - Write a review
   - Submit your review

6. **Manage Your Content**
   - Edit or delete campgrounds you've created
   - Edit or delete your own reviews
   - Update your profile information

## Technical Features to Test

### Authentication & Security
- [ ] User registration with validation
- [ ] Login/logout functionality
- [ ] Google OAuth integration
- [ ] Password reset via email
- [ ] Session management
- [ ] Rate limiting protection

### Core Functionality
- [ ] CRUD operations for campgrounds
- [ ] Image upload and management
- [ ] Review and rating system
- [ ] Interactive maps integration
- [ ] Search and filtering
- [ ] Responsive design across devices

### Data Validation
- [ ] Input sanitization (XSS protection)
- [ ] Form validation
- [ ] File upload restrictions
- [ ] MongoDB injection protection

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: connection error
   ```
   - Ensure MongoDB is running locally
   - Check your DB_URL in .env file
   - Verify MongoDB Atlas credentials if using cloud

2. **Image Upload Fails**
   ```
   Error: Cloudinary configuration
   ```
   - Verify Cloudinary credentials in .env
   - Check Cloudinary account status

3. **Email Not Sending**
   ```
   Error: Gmail authentication
   ```
   - Ensure Gmail 2FA is enabled
   - Use App Password instead of regular password
   - Check Gmail credentials in .env
   **Using Brevo for Email Sender**
   -Ensure API key is correct
   -Ensure gmail registered with Brevo

4. **Maps Not Loading**
   ```
   Error: Mapbox token
   ```
   - Verify Mapbox access token
   - Check token permissions in Mapbox dashboard

### Port Already in Use
```bash
# Kill process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Kill process using port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

## Project Structure

```
project/
├── app.js                 # Main application file
├── package.json           # Dependencies and scripts
├── schemas.js            # Joi validation schemas
├── config/
│   └── passport.js       # Authentication configuration
├── controllers/          # Route handlers
│   ├── campgrounds.js
│   ├── reviews.js
│   └── users.js
├── middleware/           # Custom middleware
│   └── upload.js
├── models/              # MongoDB models
│   ├── campground.js
│   ├── review.js
│   └── user.js
├── routes/              # Express routes
│   ├── campgrounds.js
│   ├── reviews.js
│   └── users.js
├── utils/               # Utility functions
│   ├── catchAsync.js
│   ├── email.js
│   └── ExpressError.js
├── views/               # EJS templates
│   ├── campgrounds/
│   ├── users/
│   └── layouts/
└── public/              # Static assets
    ├── css/
    ├── js/
    └── images/
```

## Testing Checklist

### Basic Functionality
- [ ] Application starts without errors
- [ ] Home page loads correctly
- [ ] Navigation works properly
- [ ] Registration form accepts valid data
- [ ] Login form authenticates users
- [ ] Logout clears session

### Advanced Features
- [ ] Image upload works (create campground with images)
- [ ] Maps display correctly
- [ ] Reviews can be added and edited
- [ ] Email password reset works
- [ ] Google OAuth login works
- [ ] Mobile responsiveness

### Security Testing
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] File upload restrictions work
- [ ] Rate limiting prevents abuse
- [ ] Authentication is required for protected routes

## Support

If you encounter any issues during testing:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all external services are properly configured
4. Check that MongoDB is running and accessible

## Development Notes

- Built with Express.js and EJS templating
- Uses Passport.js for authentication
- Implements security best practices with Helmet.js
- Features input validation with Joi
- Includes automated cleanup for temporary files
- Uses Mongoose for MongoDB object modeling

---

**Note**: This application is designed for educational and demonstration purposes.It is intended for Personal projects only.