# 🔐 Laravel Policies Report - Fieldworker Multi-Sector

*Generated on: September 13, 2025*

## 📋 Policy Authorization Rules Overview

| Policy Name | Authorization Rules |
|-------------|-------------------|
| **AssetPolicy** | **viewAny**: Admin, Manager, Supervisor, Worker<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (tenant), Client (read-only)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant)<br/>**assign**: Admin (all), Manager/Supervisor (tenant)<br/>**updateStatus**: Admin (all), Manager/Supervisor (tenant), Worker (limited) |
| **AttachmentPolicy** | **viewAny**: Admin, Manager, Supervisor, Worker, Client<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (tenant/own), Client (read-only)<br/>**create**: Admin, Manager, Supervisor, Worker<br/>**update**: Admin (all), Manager/Supervisor (tenant), Worker (own metadata)<br/>**delete**: Admin (all), Manager/Supervisor (tenant), Worker (own)<br/>**approve**: Admin (all), Manager/Supervisor (tenant)<br/>**share**: Admin (all), Manager (tenant)<br/>**move**: Admin (all), Manager/Supervisor (tenant), Worker (own) |
| **AuditLogPolicy** | **viewAny**: Admin, Manager, Supervisor<br/>**view**: Admin (all), Manager (tenant), Supervisor (limited scope), User (own logs)<br/>**create**: Admin only (system generated)<br/>**update**: Admin only (exceptional cases)<br/>**delete**: Admin only (compliance)<br/>**export**: Admin (all), Manager (tenant)<br/>**viewAnalytics**: Admin (all), Manager/Supervisor (tenant)<br/>**search**: Admin (all), Manager/Supervisor (tenant)<br/>**viewSystem**: Admin only<br/>**configure**: Admin only<br/>**archive**: Admin (all), Manager (tenant with retention rules) |
| **CertificationPolicy** | **viewAny**: Admin, Manager, Supervisor, Worker, Client<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (own), Client (read-only)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant), Worker (own pending)<br/>**delete**: Admin (all), Manager/Supervisor (tenant), Worker (own pending)<br/>**approve**: Admin (all), Manager/Supervisor (tenant) for pending<br/>**verify**: Admin (all), Manager/Supervisor (tenant)<br/>**renew**: Admin (all), Manager/Supervisor (tenant), Worker (own request) |
| **FeaturePolicy** | **viewAny**: All authenticated users<br/>**view**: Admin (all), Others (tenant-enabled features)<br/>**create**: Admin only<br/>**update**: Admin only<br/>**delete**: Admin only<br/>**toggle**: Admin (all), Manager (tenant if configurable)<br/>**configure**: Admin (all), Manager (tenant if configurable)<br/>**access**: Role-based + feature enabled + tenant check<br/>**assign**: Admin only<br/>**viewAnalytics**: Admin (all), Manager (tenant)<br/>**request**: Manager, Supervisor |
| **FormPolicy** | **viewAny**: All authenticated users<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (tenant), Client (read-only)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant, no responses)<br/>**publish**: Admin (all), Manager/Supervisor (tenant)<br/>**fill**: Worker/Manager/Supervisor (tenant, published forms)<br/>**viewResponses**: Admin (all), Manager/Supervisor (tenant), Client (read-only) |
| **FormResponsePolicy** | **viewAny**: Admin, Manager, Supervisor, Client<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (own), Client (read-only)<br/>**create**: Admin, Manager, Supervisor, Worker<br/>**update**: Admin (all), Manager/Supervisor (tenant), Worker (own, not submitted)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant, not submitted), Worker (own draft)<br/>**submit**: Admin (all), Worker (own), Manager/Supervisor (tenant)<br/>**approve**: Admin (all), Manager/Supervisor (tenant) for submitted<br/>**export**: Admin (all), Manager/Supervisor/Client (tenant) |
| **JobPolicy** | **viewAny**: Admin, Manager, Supervisor, Worker<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (assigned), Client (tenant read-only)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant), Worker (assigned basic)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant, pending only)<br/>**assignWorkers**: Admin (all), Manager/Supervisor (tenant)<br/>**updateStatus**: Admin (all), Manager/Supervisor (tenant), Worker (assigned) |
| **JobAssignmentPolicy** | **viewAny**: Admin, Manager, Supervisor, Worker<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (own), Client (read-only)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant), Worker (own status/progress)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant, not started)<br/>**accept/reject**: Worker (own), Admin (all), Manager (tenant)<br/>**start**: Worker (own accepted), Admin (all), Manager/Supervisor (tenant)<br/>**complete**: Worker (own in_progress), Admin (all), Manager/Supervisor (tenant)<br/>**updateProgress**: Worker (own), Admin (all), Manager/Supervisor (tenant) |
| **LocationPolicy** | **viewAny**: All authenticated users<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (tenant), Client (tenant)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant, no active jobs)<br/>**assign**: Admin (all), Manager/Supervisor (tenant)<br/>**updateCoordinates**: Admin (all), Manager/Supervisor (tenant) |
| **NotificationPolicy** | **viewAny**: All authenticated users<br/>**view**: Admin (all), User (own), Manager/Supervisor (tenant)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant), User (own read status)<br/>**delete**: Admin (all), Manager/Supervisor (tenant), User (own)<br/>**markAsRead**: User (own), Admin (all), Manager (tenant)<br/>**send**: Admin (all), Manager (tenant), Supervisor (workers)<br/>**sendBulk**: Admin (all), Manager (tenant)<br/>**viewAnalytics**: Admin (all), Manager/Supervisor (tenant) |
| **PermissionPolicy** | **viewAny**: Admin only<br/>**view**: Admin only<br/>**create**: Admin only<br/>**update**: Admin only<br/>**delete**: Admin only (except core permissions)<br/>**assign/revoke**: Admin only<br/>**sync**: Admin only<br/>**viewAnalytics**: Admin only<br/>**export**: Admin only<br/>**manageGroups**: Admin only<br/>**checkDependencies**: Admin only<br/>**validateConflicts**: Admin only<br/>**createTemplate**: Admin only<br/>**audit**: Admin only |
| **RolePolicy** | **viewAny**: Admin, Manager<br/>**view**: Admin (all), Manager (tenant), Supervisor (tenant basic)<br/>**create**: Admin only<br/>**update**: Admin (all), Manager (custom roles in tenant)<br/>**delete**: Admin (all), Manager (custom roles, not assigned)<br/>**assign**: Admin (all), Manager (tenant, except admin/manager)<br/>**revoke**: Admin (all), Manager (tenant, except admin/manager)<br/>**managePermissions**: Admin (all), Manager (custom roles)<br/>**duplicate**: Admin (all), Manager (tenant)<br/>**viewAnalytics**: Admin (all), Manager (tenant)<br/>**export**: Admin (all), Manager (tenant) |
| **SectorPolicy** | **viewAny**: All authenticated users<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (tenant), Client (tenant)<br/>**create**: Admin, Manager<br/>**update**: Admin (all), Manager (tenant)<br/>**delete**: Admin (all), Manager (tenant, not used)<br/>**assign**: Admin (all), Manager/Supervisor (tenant)<br/>**configure**: Admin (all), Manager (tenant)<br/>**viewAnalytics**: Admin (all), Manager/Supervisor/Client (tenant) |
| **SignaturePolicy** | **viewAny**: Admin, Manager, Supervisor, Worker, Client<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (own), Client (read-only)<br/>**create**: All authenticated users<br/>**update**: Admin (all), Manager/Supervisor (tenant), User (own, not finalized)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant, not finalized), User (own, not finalized)<br/>**finalize**: Admin (all), User (own), Manager/Supervisor (tenant)<br/>**verify**: Admin (all), Manager/Supervisor (tenant)<br/>**download**: Same as view permissions<br/>**invalidate**: Admin (all), Manager (tenant)<br/>**createTemplate**: Admin (all), Manager (tenant) |
| **SkillPolicy** | **viewAny**: All authenticated users<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (tenant), Client (tenant)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant)<br/>**delete**: Admin (all), Manager (tenant), Supervisor (tenant, not assigned)<br/>**assign**: Admin (all), Manager/Supervisor (tenant)<br/>**certify**: Admin (all), Manager/Supervisor (tenant) |
| **TenantPolicy** | **viewAny**: Admin, Manager<br/>**view**: Admin (all), Manager (own tenant), Supervisor (own tenant basic)<br/>**create**: Admin only<br/>**update**: Admin (all), Manager (own tenant limited)<br/>**delete**: Admin only<br/>**suspend**: Admin only<br/>**activate**: Admin only<br/>**configure**: Admin (all), Manager (own tenant)<br/>**viewAnalytics**: Admin (all), Manager (own tenant)<br/>**manageUsers**: Admin (all), Manager (own tenant)<br/>**manageQuotas**: Admin only<br/>**export**: Admin (all), Manager (own tenant) |
| **TenantQuotaPolicy** | **viewAny**: Admin, Manager<br/>**view**: Admin (all), Manager (own tenant), Supervisor (own tenant basic)<br/>**create**: Admin only<br/>**update**: Admin only<br/>**delete**: Admin only<br/>**checkUsage**: Admin (all), Manager/Supervisor (own tenant)<br/>**resetUsage**: Admin only<br/>**increaseLimits**: Admin only<br/>**viewAnalytics**: Admin (all), Manager (own tenant)<br/>**configureAlerts**: Admin (all), Manager (own tenant)<br/>**requestIncrease**: Manager (own tenant)<br/>**approveIncrease**: Admin only<br/>**export**: Admin (all), Manager (own tenant)<br/>**monitorViolations**: Admin (all), Manager (own tenant)<br/>**createTemplate**: Admin only |
| **UserPolicy** | **viewAny**: Admin, Manager, Supervisor<br/>**view**: Admin (all), Manager (tenant), Supervisor (tenant), User (own profile)<br/>**create**: Admin, Manager<br/>**update**: Admin (all), Manager (tenant), User (own profile limited)<br/>**delete**: Admin (all), Manager (tenant inactive users)<br/>**suspend**: Admin (all), Manager (tenant)<br/>**activate**: Admin (all), Manager (tenant)<br/>**assignRoles**: Admin (all), Manager (tenant, limited roles)<br/>**revokeRoles**: Admin (all), Manager (tenant, limited roles)<br/>**resetPassword**: Admin (all), Manager (tenant), User (own)<br/>**viewProfile**: Admin (all), Manager (tenant), User (own)<br/>**export**: Admin (all), Manager (tenant) |
| **WorkerPolicy** | **viewAny**: Admin, Manager, Supervisor<br/>**view**: Admin (all), Manager/Supervisor (tenant), Worker (own profile)<br/>**create**: Admin, Manager, Supervisor<br/>**update**: Admin (all), Manager/Supervisor (tenant), Worker (own profile limited)<br/>**delete**: Admin (all), Manager (tenant)<br/>**assignJobs**: Admin (all), Manager/Supervisor (tenant)<br/>**updateProfile**: Worker (own), Admin (all), Manager/Supervisor (tenant)<br/>**viewAnalytics**: Admin (all), Manager/Supervisor (tenant) |

---

## 🎯 Policy Features Summary

### 🔑 **Role Hierarchy**
- **Admin**: Full system access across all tenants
- **Manager**: Full tenant management within own tenant
- **Supervisor**: Team/operational management within tenant
- **Worker**: Personal data management + assigned work
- **Client**: Read-only access to tenant data

### 🏢 **Multi-Tenant Security**
- All policies respect `tenant_id` boundaries
- Cross-tenant access strictly controlled
- Admin role bypasses tenant restrictions

### 📊 **Special Policy Categories**

#### **System-Level (Admin Only)**
- PermissionPolicy
- FeaturePolicy (creation/configuration)
- TenantQuotaPolicy (management)
- AuditLogPolicy (system logs)

#### **Tenant-Level Management**
- TenantPolicy
- RolePolicy (custom roles)
- UserPolicy
- SectorPolicy

#### **Operational Policies**
- JobPolicy
- JobAssignmentPolicy
- WorkerPolicy
- AssetPolicy
- LocationPolicy

#### **Data & Content**
- FormPolicy
- FormResponsePolicy
- NotificationPolicy
- AttachmentPolicy
- SignaturePolicy

#### **Skills & Compliance**
- SkillPolicy
- CertificationPolicy

---

## 🛡️ Security Features

### **Tenant Isolation**
✅ All models respect tenant boundaries  
✅ Cross-tenant data access prevented  
✅ Admin override for system management  

### **Role-Based Access Control**
✅ Granular permissions per role  
✅ Hierarchical access levels  
✅ Context-aware authorization  

### **Data Protection**
✅ Personal data access (workers own data)  
✅ Audit trail protection  
✅ Sensitive operations restricted  

### **Business Logic Integration**
✅ Status-based permissions (pending, approved, etc.)  
✅ Workflow-aware authorization  
✅ Resource dependency checks  

---

*Total Policies: 20*  
*Coverage: 100% of application models*  
*Security Level: Enterprise-grade multi-tenant*

---

**Generated by:** Laravel Policy Generator  
**Project:** Fieldworker Multi-Sector Management System  
**Version:** 2025.09.13