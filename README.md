# Fieldworker Multi-Sector Application

A comprehensive Laravel-based multi-tenant SaaS application for managing fieldworkers across multiple sectors.

## 🌟 Features

### 🏢 Multi-Tenant Architecture
- Complete tenant isolation with separate domains
- Tenant-specific quotas and limitations
- Tenant feature management

### 👥 User Management
- Role-based access control (Admin, Manager, Worker)
- Permission-based authorization
- User authentication with Sanctum
- Email verification and password reset

### 🛠️ Core Functionality
- **Worker Management**: Complete CRUD for field workers with skills and certifications
- **Job Management**: Job creation, assignment, and tracking
- **Asset Management**: Track and assign assets to workers and jobs
- **Location Management**: Manage work locations and geographic areas
- **Form Management**: Dynamic forms with responses and submissions
- **File Management**: Secure file uploads and attachments
- **Digital Signatures**: Capture and verify digital signatures
- **Audit Logging**: Complete audit trail for all system activities

### 📊 Advanced Features
- **Dashboard Analytics**: Real-time statistics and insights
- **Notification System**: In-app and email notifications
- **Quota Management**: Monitor and enforce tenant usage limits
- **Job Assignments**: Advanced job assignment workflow with status tracking
- **API Resources**: Complete RESTful API with proper serialization

## 🚀 Technology Stack

- **Backend**: Laravel 11
- **Database**: SQLite (configurable)
- **Authentication**: Laravel Sanctum
- **Frontend**: React with TypeScript + Inertia.js
- **Styling**: Tailwind CSS
- **API**: RESTful API with Resource classes
- **Validation**: Custom Request classes with comprehensive validation

## 📁 Project Structure

### Models
- `User`, `Tenant`, `Worker`, `Job`, `Asset`
- `Location`, `Form`, `FormResponse`, `Attachment`
- `Signature`, `Notification`, `AuditLog`
- `Role`, `Permission`, `Skill`, `Certification`
- `TenantQuota`, `JobAssignment`

### API Controllers
- Complete CRUD operations for all entities
- Authentication controller with login/register/logout
- Advanced features like job assignment workflows
- File upload and signature management
- Audit logging and statistics

### Request Validation
- `AuthRequests`: Login, Register, Password management
- `TenantQuotaRequest`: Quota validation with tenant constraints
- `AttachmentRequest`: File upload validation with security checks
- `JobAssignmentRequest`: Complex assignment validation with business rules
- `SignatureRequest`: Digital signature validation with integrity checks

### API Resources
- Consistent API responses with proper data serialization
- Relationship loading and computed fields
- Pagination and filtering support

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Korey90/fieldworker_multi_vendor.git
   cd fieldworker_multi_vendor
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Install API support**
   ```bash
   php artisan install:api
   ```

6. **Build frontend assets**
   ```bash
   npm run build
   ```

## 🎯 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset

### Core Resources
- `/api/v1/tenants` - Tenant management
- `/api/v1/users` - User management
- `/api/v1/workers` - Worker management
- `/api/v1/jobs` - Job management
- `/api/v1/assets` - Asset management
- `/api/v1/locations` - Location management
- `/api/v1/forms` - Form management
- `/api/v1/notifications` - Notification management

### Advanced Features
- `/api/v1/job-assignments` - Job assignment workflow
- `/api/v1/attachments` - File management
- `/api/v1/signatures` - Digital signatures
- `/api/v1/tenant-quotas` - Quota management
- `/api/v1/audit-logs` - Audit logging

## 🔐 Security Features

- **Request Validation**: Comprehensive validation with custom Request classes
- **Authorization**: Role and permission-based access control
- **File Security**: Secure file uploads with type and size validation
- **Audit Trail**: Complete activity logging for compliance
- **Data Integrity**: Digital signature verification
- **Multi-tenant Security**: Complete tenant data isolation

## 📊 Database Schema

The application includes 25+ database tables with proper relationships:
- User and tenant management
- Worker skills and certifications
- Job assignments and tracking
- Asset management
- Form builder with responses
- File attachments
- Digital signatures
- Audit logging
- Quota management

## 🧪 Testing

The project includes comprehensive test coverage:
- Authentication tests
- Feature tests for all major functionality
- Unit tests for business logic
- API endpoint testing

Run tests with:
```bash
php artisan test
```

## 📝 Development Notes

### Created Components
1. **Complete Model Layer** - All models with relationships and business logic
2. **API Layer** - Full RESTful API with proper resource serialization
3. **Validation Layer** - Custom Request classes with comprehensive validation
4. **Database Layer** - Complete migrations and seeders with realistic data
5. **Authentication** - Full auth system with multi-tenant support

### Key Features Implemented
- Multi-tenant SaaS architecture
- Role-based access control
- Job assignment workflows
- File management system
- Digital signature capture
- Audit logging system
- Quota management
- Comprehensive API documentation

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## 👨‍💻 Author

Created by [Korey90](https://github.com/Korey90) - September 2025

---

*A complete fieldworker management solution built with Laravel and modern web technologies.*
