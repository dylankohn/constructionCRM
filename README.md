
# Overview

This project is a react based application that allows users to manage their construction companies and projects. It features a user-friendly interface for tracking project progress, and managing resources. Using AWS RDS for database management, the application ensures data integrity and security.

This is designed for small to medium construction companies looking to streamline their operations and improve project management efficiency.

## Key Features

- **Customer & Job Management**: Track customers, jobs, and project details
- **Area Calculator**: Calculate areas using Google Maps integration with polygon, rectangle, and circle drawing tools
- **Material Tracking**: Comprehensive material management with cost tracking and status updates
- **Intelligent Material Recognition**: Automatically detects material types (lumber, pipe, concrete, etc.) and provides relevant dimension input fields
- **Cost Management**: Real-time cost tracking and budget monitoring
- **User Authentication**: Secure user login and data management

I used the existing app to transition this to a mobile app using React Native. The mobile app allows users to access their construction management tools on the go, providing flexibility and convenience. For the development of the mobile app, I utilized Expo to simplify the build and deployment process across both iOS and Android platforms.


[Software Demo Video](https://www.youtube.com/watch?v=m5lsmiaPnPI)

# New Feature: Intelligent Material Dimensions

When adding materials to a job, the system now automatically recognizes material types and provides relevant dimension fields:

- **Lumber**: Automatically detects lumber materials and shows Length, Width, and Thickness fields
- **Pipe/Conduit**: Provides Length and Diameter fields
- **Concrete**: Shows Length, Width, and Height fields
- **And more**: Supports drywall, roofing, insulation, and paint

The system also auto-suggests appropriate units (board feet for lumber, linear feet for pipe, etc.) and automatically fills in the description with dimension details.

📖 [Full documentation](MATERIAL_DIMENSIONS_FEATURE.md)

# Getting Started

## Prerequisites
- Node.js and npm
- MySQL database
- Google Maps API key (for Area Calculator feature)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd inventory-frontend && npm install
   ```

3. Run the database migration to enable material dimensions:
   ```bash
   mysql -u your_username -p your_database < add_material_dimensions.sql
   ```

4. Set up environment variables:
   - Create `.env` in root directory for backend configuration
   - Create `.env.local` in `inventory-frontend` directory with your Google Maps API key:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```

5. Start the backend server:
   ```bash
   node server.js
   ```

6. Start the frontend (in another terminal):
   ```bash
   cd inventory-frontend
   npm start
   ```

# Development Environment

- React
- JavaScript
- AWS RDS
- HTML/CSS
- VSCode
- Live Server Extension
- Git & GitHub
- Expo
- React Native

# Useful Websites

- [AWS RDS Docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [YouTube - AWS RDS Tutorials](https://www.youtube.com/watch?v=AiuTdIrUoT4)
- [W3 Schools](https://www.w3schools.com/)
- [ChatGPT](https://chat.openai.com/)

# Deployment

## 🚀 AWS EC2 Deployment (Production Ready!)

Your Construction CRM is **100% ready** to deploy to AWS EC2 with complete automation!

### 📚 **START HERE: [INDEX.md](INDEX.md)** - Complete Deployment Documentation

The INDEX will guide you to the right documentation for your needs:
- **[EC2-QUICKSTART.md](EC2-QUICKSTART.md)** - 15-minute deployment guide
- **[VISUAL-GUIDE.md](VISUAL-GUIDE.md)** - Visual step-by-step walkthrough
- **[deploy-to-ec2.md](deploy-to-ec2.md)** - Complete detailed manual
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solutions to common issues
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Command cheat sheet

### ⚡ Quick Deploy (4 steps)

```bash
# 1. Launch Ubuntu EC2 instance on AWS (t3.small or t2.micro)
# 2. SSH into your instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# 3. Clone and run automated setup
git clone https://github.com/YOUR_USERNAME/constructionCRM.git
cd constructionCRM
./setup-ec2.sh

# 4. Configure RDS security group (see EC2-QUICKSTART.md)
# Done! Access at http://YOUR_EC2_IP
```

### ✨ What's Included

✅ **Automated Setup Scripts** - One command deployment  
✅ **Comprehensive Documentation** - 9 detailed guides (~30,000 words)  
✅ **CI/CD Ready** - GitHub Actions workflow included  
✅ **Monitoring Tools** - Health check scripts  
✅ **Production Optimized** - Nginx, PM2, auto-restart  
✅ **Complete Troubleshooting** - Solutions for common issues  

### 💰 Cost

- **Development**: ~$3-7/month (t2.micro free tier)
- **Production**: ~$16-20/month (t3.small)

### 🎯 Features

- Zero-downtime updates
- Automatic restart on server reboot
- Reverse proxy with Nginx
- SSL ready (Let's Encrypt)
- Real-time monitoring
- Comprehensive logging

**[📖 Read the Complete Documentation →](INDEX.md)**

---

# Future Work

- Implement push notifications for job updates and reminders
- Add offline capabilities for job site access without internet
- Integrate with third-party services for enhanced functionality
- Optimize performance for larger datasets and complex projects
