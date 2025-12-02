# aiGen Neue Architektur - Implementation Roadmap

**Datum:** 2025-11-20
**Status:** ✅ Vollständig geplant & Modelle erstellt
**Nächster Schritt:** Migration ausführen

---

## 📚 Erstellte Dokumentation

### 1. Architektur-Analyse
**Datei:** `/home/raphi/aiGen/NEUE_ARCHITEKTUR_ANALYSE.md`

Enthält:
- ✅ Aktuelle Probleme identifiziert
- ✅ Best Practices aus Internet-Recherche
- ✅ Private Use Case: Influencer mit hierarchischen Kategorien
- ✅ Business Use Case: Full RBAC mit Employee/Customer/Report CRUD
- ✅ Permission Matrix Design
- ✅ Organisation-scoped RBAC Implementation
- ✅ Vorher/Nachher Vergleich

### 2. Azure OpenAI Integration
**Dateien:**
- `/home/raphi/aiGen/M365_COPILOT_INTEGRATION.md` (Technische Doku)
- `/home/raphi/aiGen/ARBEITGEBER_ANFORDERUNGEN.md` (User-facing Guide)

Status: ✅ Vollständig implementiert

---

## 🏗️ Neue Datenmodelle (Erstellt)

### Neue Models

1. **Category.js** - `/home/raphi/aiGen/aiGen_test/backend/models/Category.js`
   - Hierarchische Kategorien (max 4 Ebenen)
   - Business & Private Support
   - Parent-Child Relationships
   - Methoden: `getParents()`, `getAllChildren()`

2. **Project.js** - `/home/raphi/aiGen/aiGen_test/backend/models/Project.js`
   - Ersetzt Customer (type: "project")
   - Private Workspaces für Influencer, Freelancer, etc.
   - Eigene Settings pro Project
   - Methode: `getCategoryTree()`

3. **Employee.js** - `/home/raphi/aiGen/aiGen_test/backend/models/Employee.js`
   - Business Employee Management (CRUD)
   - Organization-scoped Roles
   - Individual Permission Overrides
   - Methoden: `hasPermission()`, `getAllPermissions()`

### Aktualisierte Models

4. **Organization.js** - ✅ Updated
   - RBAC Matrix (admin, team_lead, member)
   - AI Defaults (firmenweite Vorgaben)
   - Company Policies
   - Templates Array

5. **Customer.js** - ✅ Updated
   - Removed "project" type
   - Nur noch "person" und "company"
   - Business-only Model

6. **Area.js** - ✅ Updated
   - `categoryId` (Link zu Category)
   - `projectId` (für Private)
   - `type` ("business" | "private")
   - `isTemplate` & `templateSource`

---

## 🔄 Migration Script

**Datei:** `/home/raphi/aiGen/aiGen_test/backend/scripts/migrate-to-new-architecture.js`

### Was der Script macht:

1. ✅ **Organizations updaten**
   - RBAC Matrix hinzufügen
   - AI Defaults & Company Policies setzen
   - Templates Array initialisieren

2. ✅ **Customer → Project Migration**
   - Alle Customer mit type="project" → Project Model
   - Areas umhängen: `customerId` → `projectId`
   - Reports umhängen
   - Alte Customer löschen

3. ✅ **Default Categories erstellen**
   - Business: "Standard-Berichte" pro Organization
   - Private: "Meine Bereiche" pro Project
   - Areas mit Categories verknüpfen
   - `Area.categoryId` setzen

4. ✅ **Private Areas migrieren**
   - Areas ohne Organization/Project → Default Project
   - `Area.type = "private"` setzen

5. ✅ **Employee Records erstellen**
   - Organization.members → Employee Documents
   - Sync mit User.organizations

### Migration ausführen:

```bash
# Dry-Run (zeigt was passieren würde, NICHT implementiert yet)
cd /home/raphi/aiGen/aiGen_test
node backend/scripts/migrate-to-new-architecture.js --dry-run

# Echte Migration (⚠️ Backup erstellen!)
mongodump --out /tmp/aigen-backup-$(date +%Y%m%d)
node backend/scripts/migrate-to-new-architecture.js
```

---

## 📋 Nächste Schritte

### Phase 1: Backend Routes (Priorität HOCH)

**Zu erstellen:**

```
backend/routes/
├── categories.js       # Hierarchische Kategorien CRUD
├── projects.js         # Private Projects CRUD
├── employees.js        # Employee Management CRUD (Business)
└── organizations.js    # Organization Settings, Templates, RBAC Matrix
```

**Zu updaten:**

```
backend/routes/
├── areas.js           # + Category Filter, Business/Private Trennung
├── customers.js       # Remove "project" type validation
└── report.js          # + Permission Checks, Visibility, Approval
```

**Permission Middleware:**

```javascript
backend/middlewares/
└── permissions.js     # checkPermission(resource, action)
```

### Phase 2: Frontend (Priorität MITTEL)

**Neue Stores:**

```typescript
src/store/
├── categoryStore.ts      # Hierarchische Kategorien
├── projectStore.ts       # Private Projects
├── employeeStore.ts      # Employee Management
└── organizationStore.ts  # Organization Settings, RBAC
```

**Neue Components:**

```typescript
src/components/
├── business/
│   ├── EmployeeManagement.tsx    # Employee CRUD Table
│   ├── CustomerManagement.tsx    # Customer CRUD Table
│   ├── CompanySettings.tsx       # AI Defaults, Policies
│   └── RBACMatrix.tsx            # Permissions Editor
│
├── private/
│   ├── ProjectSettings.tsx       # Project-spezifische Settings
│   └── CategoryTree.tsx          # Hierarchische Category Navigation
│
└── shared/
    ├── CategorySelector.tsx      # Category Dropdown mit Hierarchie
    └── PermissionGuard.tsx       # Conditional Rendering basierend auf Permissions
```

**Updated Components:**

```typescript
src/components/wizard/
└── SelectArea.tsx        # + Category Filter, Business/Private Split

src/components/
└── SettingsModalNew.tsx  # Business vs Private Tabs
```

### Phase 3: Frontend Hooks

**Permission Hook:**

```typescript
// src/hooks/usePermission.ts
function usePermission(resource: string, action: string): boolean {
  const { currentOrganization } = useOrganizationStore();
  const { user } = useAuthStore();

  // Prüft RBAC Matrix + Employee Permissions
  return checkPermission(user, currentOrganization, resource, action);
}

// Verwendung:
const canCreateEmployee = usePermission('employees', 'create');
```

### Phase 4: Testing

**Backend Tests:**

```bash
backend/tests/
├── models/
│   ├── category.test.js       # Hierarchie, getParents, getAllChildren
│   ├── project.test.js        # CRUD, getCategoryTree
│   └── employee.test.js       # hasPermission, getAllPermissions
│
├── routes/
│   ├── categories.test.js     # CRUD Endpoints
│   ├── projects.test.js       # CRUD Endpoints
│   └── employees.test.js      # CRUD + Permission Checks
│
└── migration/
    └── migrate.test.js        # Migration Dry-Run Tests
```

**Frontend Tests:**

```bash
src/__tests__/
├── stores/
│   ├── categoryStore.test.ts
│   ├── projectStore.test.ts
│   └── employeeStore.test.ts
│
└── hooks/
    └── usePermission.test.ts
```

---

## 🎯 Use Case Examples

### Private: Influencer "Sarah's Social Media"

```javascript
// 1. Erstelle Project
const project = await Project.create({
  name: "Sarah's Social Media",
  userId: user._id,
  type: "personal"
});

// 2. Erstelle Kategorien
const videoCategory = await Category.create({
  name: "Video Kontent",
  userId: user._id,
  type: "private",
  level: 1
});

const imageCategory = await Category.create({
  name: "Bild Kontent",
  userId: user._id,
  type: "private",
  level: 1
});

// 3. Erstelle Sub-Kategorien
const youtubeCategory = await Category.create({
  name: "YouTube Videos",
  userId: user._id,
  type: "private",
  parentCategoryId: videoCategory._id,
  level: 2
});

// 4. Erstelle Areas
const videoGenArea = await Area.create({
  name: "Video-Generierung",
  userId: user._id,
  projectId: project._id,
  categoryId: youtubeCategory._id,
  type: "private",
  content: {
    basisPrompt: "Erstelle professionelle YouTube Video-Scripts...",
    sections: [...]
  }
});

// 5. Generiere Content
const report = await Report.create({
  projectId: project._id,
  areaId: videoGenArea._id,
  title: "YouTube Tutorial #42",
  sections: [...],
  visibility: "private"
});
```

### Business: "Musterfirma AG" - IV-Berichte

```javascript
// 1. Setup Organization
const org = await Organization.create({
  name: "Musterfirma AG",
  type: "business",
  owner: adminUser._id,
  rbacMatrix: getDefaultRBACMatrix(),
  settings: {
    aiDefaults: {
      defaultModel: "gpt-4o",
      defaultTextSize: "Mittel"
    },
    companyPolicies: {
      requireApproval: true
    }
  }
});

// 2. Erstelle Employees
const adminEmployee = await Employee.create({
  organizationId: org._id,
  userId: adminUser._id,
  personalInfo: {
    firstName: "Max",
    lastName: "Müller"
  },
  employmentInfo: {
    employeeNumber: "EMP-001",
    position: "Administrator"
  },
  role: "admin"
});

const memberEmployee = await Employee.create({
  organizationId: org._id,
  userId: memberUser._id,
  personalInfo: {
    firstName: "Tom",
    lastName: "Weber"
  },
  employmentInfo: {
    employeeNumber: "EMP-002",
    position: "Sachbearbeiter"
  },
  role: "member"
});

// 3. Erstelle Customers
const customer = await Customer.create({
  organizationId: org._id,
  type: "person",
  firstName: "Hans",
  lastName: "Meier",
  customerNumber: "CUST-001",
  createdBy: adminEmployee._id
});

// 4. Erstelle Categories
const ivCategory = await Category.create({
  name: "IV-Berichte",
  organizationId: org._id,
  type: "business",
  level: 1
});

const arbeitsfaehigkeitCategory = await Category.create({
  name: "Arbeitsfähigkeit",
  organizationId: org._id,
  type: "business",
  parentCategoryId: ivCategory._id,
  level: 2
});

// 5. Erstelle Area (mit Template)
const area = await Area.create({
  name: "Berufliche Situation",
  userId: adminEmployee.userId,
  organizationId: org._id,
  categoryId: arbeitsfaehigkeitCategory._id,
  type: "business",
  isTemplate: true,
  content: {
    basisPrompt: org.settings.defaultBasisPrompt,
    sections: [...]
  }
});

// 6. Member generiert Report (Permission Check!)
const canCreate = await memberEmployee.hasPermission('reports', 'create');
if (canCreate) {
  const report = await Report.create({
    organizationId: org._id,
    areaId: area._id,
    customerId: customer._id,
    title: "IV-Bericht: Hans Meier",
    createdBy: memberEmployee._id,
    visibility: "team",
    status: "pending_approval"
  });
}

// 7. Admin approved Report
const canApprove = await adminEmployee.hasPermission('reports', 'update');
if (canApprove) {
  report.status = "approved";
  report.approvedBy = adminEmployee._id;
  await report.save();
}
```

---

## ✅ Abgeschlossene Tasks

- [x] Web-Recherche: Multi-Tenant SaaS Best Practices
- [x] Aktuelle Datenmodelle analysieren
- [x] Business vs. Private Use Cases definieren
- [x] Perfekte Architektur entwerfen
- [x] Neue Datenmodelle erstellen
- [x] Migrations-Plan erstellen

---

## 🚀 Deployment Checklist

### Vor Migration:

- [ ] Backup erstellen: `mongodump --out /tmp/aigen-backup-$(date +%Y%m%d)`
- [ ] Test-Datenbank aufsetzen
- [ ] Migration Script auf Test-DB testen
- [ ] Verifizierung durchführen

### Nach Migration:

- [ ] Backend Routes implementieren (Phase 1)
- [ ] Permission Middleware testen
- [ ] Frontend Stores & Components (Phase 2)
- [ ] E2E Tests schreiben (Phase 3)
- [ ] Dokumentation aktualisieren
- [ ] User Training für neue Features

---

## 📞 Support & Ressourcen

### Dokumentation

- **Architektur:** `/home/raphi/aiGen/NEUE_ARCHITEKTUR_ANALYSE.md`
- **Migration:** `/home/raphi/aiGen/aiGen_test/backend/scripts/migrate-to-new-architecture.js`
- **Azure Integration:** `/home/raphi/aiGen/M365_COPILOT_INTEGRATION.md`

### Neue Models

```
/home/raphi/aiGen/aiGen_test/backend/models/
├── Category.js      # Hierarchische Kategorien
├── Project.js       # Private Workspaces
├── Employee.js      # Business Employees
├── Organization.js  # Updated (RBAC Matrix, Templates)
├── Customer.js      # Updated (removed "project")
└── Area.js          # Updated (categoryId, projectId, type)
```

---

**Status:** ✅ Bereit für Implementation
**Nächster Schritt:** Migration Script ausführen

*Erstellt: 2025-11-20*
*Basierend auf: Internet Best Practices + User Requirements*
