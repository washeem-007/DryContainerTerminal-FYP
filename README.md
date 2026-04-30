<img width="400" height="400" alt="PortZen" src="https://github.com/user-attachments/assets/09226cbc-534c-4a82-b1f7-61cc32655561" />

# PortZen — Digital workflow management system for Dry container terminals

**PortZen** is a high-performance, software-based Terminal Operating System (TOS) designed to automate the end-to-end container lifecycle in inland container depots. By replacing legacy paper-based workflows with a decoupled three-tier architecture, PortZen optimizes container routing, enforces strict Role-Based Access Control (RBAC), and provides real-time operational transparency.

## 📖 Key Features

*   **Automated Gate Onboarding:** Streamlined check-in process with built-in ISO 6346 container ID validation.
*   **Intelligent Yard Routing:** An algorithm that automatically assigns containers to Weigh Bays, Inspection Bays, or Stacks based on real-time occupancy and clearance status.
*   **Role-Based Security:** Granular access management using JSON Web Tokens (JWT) for Gate Clerks, Yard Supervisors, Wharf Clerks, and Administrators.
*   **Live Analytics Dashboard:** Real-time visualization of yard capacity, bay utilization, and critical bottlenecks.
*   **Financial & Safety Guardrails:** Programmatic locks that prevent cargo release until inspection passes and storage payments are verified.

## System Architecture

PortZen is built using a modern, containerized three-tier architecture:

*   **Presentation Layer:** Responsive **React.js** web application providing role-specific views.
*   **Application Layer:** Robust **.NET 8 Web API** handling business logic, state management, and security middleware.
*   **Data Layer:** **MySQL** relational database managing persistent container records, audit trails, and user identity.

## Technology Stack

*   **Frontend:** React, Tailwind CSS, Axios.
*   **Backend:** ASP.NET Core 8, Entity Framework Core.
*   **Database:** MySQL 8.0.
*   **Containerization:** Docker, Docker Compose.

## Quick Start

### Azure deployment 
The system is fully deployed in AzureVM and can be accessed using the following link. 
*   **Web Dashboard:** [http://portzen.southeastasia.cloudapp.azure.com:5000](http://portzen.southeastasia.cloudapp.azure.com:5173)

The project can be fully run in the local machine as well. PortZen is fully containerized to ensure a consistent environment. The system handles database initialization and data seeding automatically upon startup.

### 1. Prerequisites
*   Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.

### 2. Launch
Clone the repository and run the following command in the root directory (/TerminalSystem):
```bash
docker-compose up --build
```

### 3. Access Points
*   **Web Dashboard:** [http://localhost:5173](http://localhost:5173)

### 4. Default Test Credentials
| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `washeem` | `washeem123` |
| **Gate Clerk** | `Patrick` | `Patrick123` |
| **Yard Supervisor** | `Cho` | `Cho123` |
| **Wharf Clerk** | `Lesly` | `Lesly123` |

⚠️ Important: Technical Note on Startup (Race Condition)
Due to the time required for the MySQL engine to fully initialize before the .NET backend can begin data seeding, a Race Condition may occasionally occur on the first run.  

If you encounter a login issue or an empty dashboard:

Stop the backend and db containers.

Restart them using: docker-compose up backend db.
This ensures the database is fully ready to accept the application's connection handshake.

## 📂 Project Structure

*   `/Client`: React frontend source code.
*   `/Server`: .NET API backend.
*   `docker-compose.yml`: Docker deplyment for the full stack.

---

