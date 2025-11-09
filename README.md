# 📚 StudyMate

A full-stack study tracking application that helps students maximize their learning potential through data-driven insights and AI-powered recommendations.

![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green?logo=spring)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Azure](https://img.shields.io/badge/Azure-Deployed-blue?logo=microsoft-azure)

## 🌟 Features

- **📊 Study Tracking** - Log and monitor study sessions with detailed analytics
- **🏆 Leaderboard** - Compete with peers and stay motivated
- **🤖 AI Advisor** - Get personalized study recommendations powered by Google Gemini
- **⏱️ Focus Timer** - Built-in Pomodoro timer for productive study sessions
- **📈 Dashboard** - Visualize your progress with interactive charts
- **📅 Calendar View** - Track your study schedule at a glance
- **🔐 Secure Authentication** - JWT-based authentication with Spring Security

## 🚀 Live Demo

**Frontend:** [https://studymatefrontend.z1.web.core.windows.net](https://studymatefrontend.z1.web.core.windows.net)

## 🛠️ Tech Stack

### Frontend
- **Framework:** Angular 19
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** Chart.js
- **Icons:** Lucide Angular

### Backend
- **Framework:** Spring Boot 3.5
- **Language:** Java 17
- **Security:** Spring Security + JWT
- **Database:** MongoDB Atlas
- **AI:** Google Gemini API

### Deployment
- **Frontend:** Azure Storage Static Website
- **Backend:** Azure App Service
- **Database:** MongoDB Atlas Cloud

## 📦 Installation

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.6+
- MongoDB Atlas account
- Google Gemini API key

### Backend Setup

```bash
cd study-tracker-backend

# Set environment variables
export MONGODB_URI="your-mongodb-connection-string"
export GEMINI_API_KEY="your-gemini-api-key"

# Build and run
mvn clean package
java -jar target/taskflow-0.0.1-SNAPSHOT.jar
```

Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd study-tracker-frontend

# Install dependencies
npm install

# Run development server
ng serve
```

Frontend runs on `http://localhost:4200`

## 🔧 Configuration

### Backend (`application.properties`)
```properties
spring.data.mongodb.uri=${MONGODB_URI}
gemini.api.key=${GEMINI_API_KEY}
server.port=8080
```

### Frontend (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Study Logs
- `GET /api/logs` - Get all study logs
- `POST /api/logs` - Create study log
- `PUT /api/logs/{id}` - Update study log
- `DELETE /api/logs/{id}` - Delete study log

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard rankings

### AI Advisor
- `POST /api/ai/advice` - Get AI study recommendations

### Focus Timer
- `GET /api/focus-logs` - Get focus sessions
- `POST /api/focus-logs` - Log focus session

## 🏗️ Project Structure

```
taskflow/
├── study-tracker-backend/     # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/mohamed/taskflow/
│   │       ├── controller/    # REST controllers
│   │       ├── service/       # Business logic
│   │       ├── model/         # Data models
│   │       ├── repository/    # MongoDB repositories
│   │       ├── security/      # JWT & security config
│   │       └── config/        # Application config
│   └── pom.xml
│
└── study-tracker-frontend/    # Angular frontend
    ├── src/app/
    │   ├── pages/             # Page components
    │   ├── components/        # Reusable components
    │   ├── services/          # API services
    │   ├── models/            # TypeScript interfaces
    │   └── guards/            # Route guards
    └── package.json
```

## 🚀 Deployment

### Backend (Azure App Service)
```bash
mvn clean package -DskipTests
az webapp deploy --resource-group study-tracker-rg \
  --name study-tracker-backend \
  --src-path target/taskflow-0.0.1-SNAPSHOT.jar \
  --type jar
```

### Frontend (Azure Storage)
```bash
ng build --configuration production
az storage blob upload-batch \
  --account-name studymatefrontend \
  --source dist/study-tracker-frontend/browser \
  --destination '$web' \
  --overwrite
```

## 🔐 Security

- JWT-based authentication
- Password encryption with BCrypt
- CORS configuration for secure cross-origin requests
- Environment variables for sensitive data
- MongoDB Atlas network security

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Mohamed Guenidi**

- GitHub: [@PsyCode404](https://github.com/PsyCode404)
- LinkedIn: [Mohamed Guenidi](https://linkedin.com/in/your-profile)

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- MongoDB Atlas for cloud database
- Azure for hosting infrastructure
- Angular and Spring Boot communities

---

⭐ Star this repo if you find it helpful!
