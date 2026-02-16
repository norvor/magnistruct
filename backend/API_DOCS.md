# Backend API Documentation

**Base URL**: `http://localhost:8080/api`

## Authentication
> All endpoints below require authentication (except login/register if implemented).
> Data is typically exchanged in JSON format.

---

## 1. Project Management (PM) Module
*Note: PM routes are mounted directly under `/api`.*

### Organizations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/orgs` | Get list of organizations for the current user |
| `POST` | `/orgs` | Create a new organization |

### Teams
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/orgs/{orgID}/teams` | List teams within an organization |
| `POST` | `/orgs/{orgID}/teams` | Create a new team |

### Projects
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/projects` | List all projects |
| `POST` | `/projects` | Create a new project |
| `PUT` | `/projects/{projectID}` | Update project details |
| `GET` | `/projects/{projectID}/board` | Get project tasks/board view |
| `POST` | `/projects/{projectID}/tasks` | Create a task in a project |

### Tasks
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `PUT` | `/tasks/{taskID}` | Update a task |
| `DELETE` | `/tasks/{taskID}` | Delete a task |

---

## 2. HR Module
*Base Path: `/api/hr`*

### Employees
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/hr/employees` | List all employees |
| `POST` | `/hr/employees` | Create a new employee |
| `GET` | `/hr/employees/{employeeID}` | Get employee details |
| `PUT` | `/hr/employees/{employeeID}` | Update employee details |

### Organization
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/hr/org-chart` | Get organization hierarchy/chart |

### Locations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/hr/locations` | List office locations |
| `POST` | `/hr/locations` | Add a new location |

### Policies
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/hr/policies` | List HR policies |
| `POST` | `/hr/policies` | Create a new policy |

---

## 3. CRM Module
*Base Path: `/api/crm`*

### Opportunities (Deals)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/crm/opportunities` | List sales opportunities |
| `POST` | `/crm/opportunities` | Create a new opportunity |
| `PUT` | `/crm/opportunities/{oppID}` | Update an opportunity |
| `DELETE` | `/crm/opportunities/{oppID}` | Delete an opportunity |

### Contacts
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/crm/contacts` | List contacts/leads |
| `POST` | `/crm/contacts` | Create a new contact |
| `PUT` | `/crm/contacts/{contactID}` | Update contact details |
