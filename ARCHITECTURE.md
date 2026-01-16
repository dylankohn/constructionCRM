# AWS EC2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            INTERNET                                  │
│                               ↓                                      │
│                     User Browser Access                              │
│                    http://YOUR_EC2_IP                                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       AWS EC2 INSTANCE                               │
│                     (Ubuntu 22.04 LTS)                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        NGINX (Port 80)                        │  │
│  │                     Reverse Proxy Server                      │  │
│  │                                                               │  │
│  │  Routes:                                                      │  │
│  │  • /               → React Frontend (static files)           │  │
│  │  • /auth/*         → Backend API (localhost:3000)            │  │
│  │  • /customers/*    → Backend API (localhost:3000)            │  │
│  │  • /jobs/*         → Backend API (localhost:3000)            │  │
│  │  • /materials/*    → Backend API (localhost:3000)            │  │
│  │  • /inventory/*    → Backend API (localhost:3000)            │  │
│  │  • /areas/*        → Backend API (localhost:3000)            │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
│                              │                                       │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Build Files)                     │  │
│  │         /home/ubuntu/constructionCRM/                        │  │
│  │         inventory-frontend/build/                            │  │
│  │                                                               │  │
│  │  • index.html                                                │  │
│  │  • static/js/main.*.js                                       │  │
│  │  • static/css/main.*.css                                     │  │
│  │  • Served directly by Nginx                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│                              ↓ API Calls                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            Backend API (Node.js + Express)                    │  │
│  │                  Managed by PM2                               │  │
│  │                localhost:3000                                 │  │
│  │                                                               │  │
│  │  Process: server                               │  │
│  │  • User Authentication                                        │  │
│  │  • Customer Management                                        │  │
│  │  • Job Management                                             │  │
│  │  • Material Tracking                                          │  │
│  │  • Inventory Management                                       │  │
│  │  • Area Calculations                                          │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
│                              │                                       │
│                              │ Database Queries                     │
│                              ↓                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                               │
                               │ MySQL Connection
                               │ (Port 3306)
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        AWS RDS MySQL                                 │
│              (Your existing database instance)                       │
│                                                                      │
│  Tables:                                                             │
│  • users                                                             │
│  • customers                                                         │
│  • jobs                                                              │
│  • job_materials                                                     │
│  • inventory                                                         │
│  • job_areas                                                         │
│                                                                      │
│  Security Group: Must allow connections from EC2 instance           │
└─────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                        EXTERNAL SERVICES
═══════════════════════════════════════════════════════════════════════

┌──────────────────────┐
│  Google Maps API     │  ← Used by AreaCalculator component
│                      │     in React frontend
└──────────────────────┘


═══════════════════════════════════════════════════════════════════════
                          DATA FLOW
═══════════════════════════════════════════════════════════════════════

User Request Flow:
─────────────────
1. User visits http://YOUR_EC2_IP
2. Nginx serves React app (index.html + static files)
3. React app loads in browser
4. User interacts with UI (e.g., clicks "View Customers")
5. React makes API call to http://YOUR_EC2_IP/customers/:userId
6. Nginx receives request and proxies to http://localhost:3000/customers/:userId
7. Express backend processes request
8. Backend queries RDS MySQL database
9. Database returns data
10. Backend sends JSON response
11. Nginx forwards response to browser
12. React updates UI with data


═══════════════════════════════════════════════════════════════════════
                       SECURITY GROUPS
═══════════════════════════════════════════════════════════════════════

EC2 Security Group (Inbound Rules):
────────────────────────────────────
┌──────────┬──────┬─────────────────┬────────────────────────┐
│   Type   │ Port │     Source      │      Description       │
├──────────┼──────┼─────────────────┼────────────────────────┤
│   SSH    │  22  │    My IP        │  SSH access for admin  │
│   HTTP   │  80  │  0.0.0.0/0      │  Web traffic           │
│   HTTPS  │ 443  │  0.0.0.0/0      │  Secure web traffic    │
│  Custom  │ 3000 │  0.0.0.0/0      │  Direct API (optional) │
└──────────┴──────┴─────────────────┴────────────────────────┘

RDS Security Group (Inbound Rules):
───────────────────────────────────
┌──────────┬──────┬─────────────────┬────────────────────────┐
│   Type   │ Port │     Source      │      Description       │
├──────────┼──────┼─────────────────┼────────────────────────┤
│  MySQL   │ 3306 │ EC2 Sec Group   │  Database access       │
└──────────┴──────┴─────────────────┴────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                    PROCESS MANAGEMENT (PM2)
═══════════════════════════════════════════════════════════════════════

PM2 manages the backend Node.js process:

┌──────────────────────────────────────┐
│  PM2 Process Manager                 │
│  ─────────────────────               │
│                                      │
│  Process: server      │
│  Status:  online                    │
│  Restart: 0                         │
│  Uptime:  24h                       │
│  Memory:  ~50MB                     │
│  CPU:     <5%                       │
│                                      │
│  Features:                          │
│  ✓ Auto-restart on crash           │
│  ✓ Startup on server reboot        │
│  ✓ Log management                  │
│  ✓ Resource monitoring             │
└──────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                      FILE STRUCTURE ON EC2
═══════════════════════════════════════════════════════════════════════

/home/ubuntu/
└── constructionCRM/
    ├── server.js                          # Backend entry point
    ├── package.json                       # Backend dependencies
    ├── .env                              # Backend config (SECRET!)
    ├── node_modules/                     # Backend packages
    │
    ├── inventory-frontend/
    │   ├── build/                        # Production build (served by Nginx)
    │   │   ├── index.html
    │   │   └── static/
    │   ├── src/                          # Source code (not used in prod)
    │   ├── package.json                  # Frontend dependencies
    │   └── .env.production              # Frontend config (SECRET!)
    │
    ├── setup-ec2.sh                     # Initial setup script
    ├── deploy.sh                        # Deployment script
    ├── monitoring.sh                    # Monitoring script
    │
    └── Documentation/
        ├── EC2-QUICKSTART.md
        ├── deploy-to-ec2.md
        ├── TROUBLESHOOTING.md
        └── ARCHITECTURE.md (this file)

/etc/nginx/
└── sites-available/
    └── construction-crm                 # Nginx configuration

/var/log/nginx/
├── access.log                          # HTTP access logs
└── error.log                           # Nginx error logs


═══════════════════════════════════════════════════════════════════════
                          MONITORING
═══════════════════════════════════════════════════════════════════════

Available monitoring tools:

./monitoring.sh
    ↓
    ├─→ System resources (CPU, Memory, Disk)
    ├─→ PM2 process status
    ├─→ Nginx status
    ├─→ Port status (80, 3000)
    ├─→ Recent logs
    └─→ API health check

pm2 logs server
    ↓
    └─→ Real-time backend logs

sudo tail -f /var/log/nginx/error.log
    ↓
    └─→ Real-time Nginx errors


═══════════════════════════════════════════════════════════════════════
                     DEPLOYMENT WORKFLOW
═══════════════════════════════════════════════════════════════════════

Option 1: Manual Deployment
────────────────────────────
Developer's Machine                    EC2 Instance
─────────────────                      ────────────
    │
    │ 1. git push
    ↓
GitHub Repository
    │
    │ 2. ssh into EC2
    ↓
EC2 Instance
    │
    │ 3. git pull
    │ 4. ./deploy.sh
    ↓
Backend restarted (PM2) + Frontend rebuilt + Nginx reloaded
    ↓
Application Updated!


Option 2: Automated Deployment (GitHub Actions)
────────────────────────────────────────────────
Developer's Machine
    │
    │ git push origin main
    ↓
GitHub Repository
    │
    │ Triggers workflow
    ↓
GitHub Actions Runner
    │
    │ SSH into EC2
    │ Run deployment commands
    ↓
EC2 Instance
    │
    │ Pull, build, restart
    ↓
Application Updated!


═══════════════════════════════════════════════════════════════════════
                      COST BREAKDOWN
═══════════════════════════════════════════════════════════════════════

Monthly Costs (USD):

EC2 Instance (t3.small)
  • 2 vCPU, 2 GB RAM
  • ~720 hours/month
  • $0.0208/hour
  • Total: ~$15.00/month

  Alternative: t2.micro (Free Tier)
  • 1 vCPU, 1 GB RAM
  • Free for first 12 months
  • $0.0116/hour after
  • Total: ~$8.35/month (after free tier)

EBS Storage (20 GB)
  • General Purpose SSD (gp3)
  • $0.08/GB-month
  • Total: ~$1.60/month

Data Transfer
  • First 1 GB free
  • $0.09/GB after
  • Estimate: ~$1-5/month

RDS Database
  • Already running (existing cost)
  • No additional charge

────────────────────────────────
Total Monthly Cost: $16-20/month
(or $2-7/month with t2.micro free tier)


═══════════════════════════════════════════════════════════════════════
                    SCALING CONSIDERATIONS
═══════════════════════════════════════════════════════════════════════

Current Setup: Single EC2 Instance
─────────────────────────────────
Good for:
  ✓ Small to medium traffic (100-1000 users)
  ✓ Development and testing
  ✓ Cost-effective solution

Limitations:
  ✗ Single point of failure
  ✗ Limited vertical scaling
  ✗ No built-in redundancy

Future Scaling Options:
──────────────────────

Level 1: Vertical Scaling
  → Upgrade to t3.medium or t3.large
  → More CPU/RAM for same architecture

Level 2: Load Balancing
  → Add Application Load Balancer
  → Multiple EC2 instances
  → Auto-scaling group

Level 3: Container Orchestration
  → Move to ECS/Fargate
  → Docker containers
  → Automatic scaling

Level 4: Serverless
  → Lambda for backend
  → S3 + CloudFront for frontend
  → API Gateway
  → Aurora Serverless for database


═══════════════════════════════════════════════════════════════════════
                      BACKUP STRATEGY
═══════════════════════════════════════════════════════════════════════

RDS Database:
  • Automated backups (enabled by default)
  • Retention: 7 days
  • Manual snapshots before major changes

EC2 Instance:
  • Create AMI monthly
  • Backup environment files (.env)

Code Repository:
  • Git version control (already done)
  • GitHub as remote backup


═══════════════════════════════════════════════════════════════════════
```

This architecture provides a solid foundation for your Construction CRM with room to scale as your needs grow!

