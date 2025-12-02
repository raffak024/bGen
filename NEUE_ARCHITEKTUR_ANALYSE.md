# Neue Architektur-Analyse: aiGen Multi-Tenant System

**Datum:** 2025-11-20
**Status:** Entwurf basierend auf Internet-Recherche & Best Practices
**Ziel:** Perfekte Architektur für Business & Private Use Cases

---

## 🎯 Executive Summary

### Aktuelle Probleme

❌ **Keine hierarchische Kategorie-Struktur** - Areas sind flach, ohne übergeordnete Kategorien
❌ **Globale RBAC statt Organisations-scoped** - Rollen gelten systemweit, nicht pro Organisation
❌ **Keine Trennung Business vs. Private Workflows** - Beide nutzen dieselben Modelle
❌ **Customer-Modell vermischt Business & Private** - "project" als Customer-Type ist konzeptionell falsch
❌ **Keine Firmen-Templates/Defaults** - Jede Area wird individuell konfiguriert
❌ **Fehlende Content-Taxonomie** - Keine Struktur für Content-Typen

### Neue Architektur-Ziele

✅ **Hierarchische Kategorien** (3-4 Ebenen max, nach Best Practices)
✅ **Organisation-scoped RBAC** - User kann Admin in Org A, Member in Org B sein
✅ **Getrennte Business/Private Workflows** mit eigenen Datenmodellen
✅ **Template-System** für firmenweite Defaults/Richtlinien
✅ **Permission Matrix** - Role-Resource-Action Mapping
✅ **Content-Taxonomie** für strukturierte Inhalte

---

## 📊 Best Practices aus Internet-Recherche

### 1. Multi-Tenant RBAC (Organisation-Scoped Roles)

**Quelle:** SaaS Multi-Tenancy Best Practices

```
User-Organization Relationship:
- User kann Mitglied in mehreren Organisationen sein
- Rolle wird PRO ORGANISATION gespeichert, nicht global
- Permissions sind abgeleitet aus: Organization + Role + Resource

Beispiel:
User "Max Müller":
  - Org "Firma A": Role = "admin" → Full access zu Firma A
  - Org "Firma B": Role = "member" → Limited access zu Firma B
  - Private Workspace: Role = "owner" → Full control
```

**Implementierung:**
```javascript
// FALSCH (aktuell):
User.role = "admin" // Global!

// RICHTIG (neu):
User.organizations = [
  {
    organizationId: "org-123",
    role: "admin",
    permissions: ["employees:crud", "customers:crud", "reports:crud"]
  },
  {
    organizationId: "org-456",
    role: "member",
    permissions: ["reports:read"]
  }
]
```

### 2. Content Taxonomie (Hierarchische Struktur)

**Quelle:** Content Management System Taxonomy Design

**Best Practice: Maximum 3-4 Ebenen**

```
Ebene 1: Haupt-Kategorie (z.B. "Social Media Content")
├─ Ebene 2: Sub-Kategorie (z.B. "Video Kontent")
│  ├─ Ebene 3: Content-Typ (z.B. "YouTube Videos")
│  │  └─ Ebene 4: Bereiche/Templates (z.B. "Video-Generierung", "Beschreibung")
```

**Warum max. 3-4 Ebenen?**
- Mehr Ebenen = komplexe Navigation, schwer wartbar
- 3-4 Ebenen balancieren Struktur vs. Usability
- Großunternehmen nutzen selten mehr als 4 Ebenen

### 3. Permission Matrix Design

**Quelle:** Enterprise RBAC Patterns

```
Role x Resource x Action = Permission

Beispiel Matrix:
┌─────────────┬───────────┬──────────┬─────────┬────────┐
│ Role        │ Resource  │ Create   │ Read    │ Update │ Delete │
├─────────────┼───────────┼──────────┼─────────┼────────┤
│ admin       │ employees │ ✅       │ ✅      │ ✅     │ ✅     │
│ admin       │ customers │ ✅       │ ✅      │ ✅     │ ✅     │
│ team_lead   │ employees │ ❌       │ ✅      │ ✅     │ ❌     │
│ team_lead   │ customers │ ✅       │ ✅      │ ✅     │ ❌     │
│ member      │ customers │ ❌       │ ✅      │ ❌     │ ❌     │
│ member      │ reports   │ ✅       │ ✅      │ ✅     │ ❌     │
└─────────────┴───────────┴──────────┴─────────┴────────┘
```

### 4. Tenant Isolation (Per-Organization Policy Store)

**Quelle:** Multi-Tenant SaaS Architecture

```
Organization:
  - id: "org-123"
  - name: "Musterfirma AG"
  - settings: {
      defaultTemplates: [...],
      companyPolicies: {...},
      rbacMatrix: {...}
    }
  - members: [
      { userId: "user-1", role: "admin" },
      { userId: "user-2", role: "team_lead" }
    ]
```

**Vorteil:**
- Jede Organisation hat eigene Richtlinien
- Keine globalen Konflikte
- Einfache Multi-Mandanten-Fähigkeit

---

## 🏗️ Neue Architektur: Private Use Case

### Beispiel: Influencer "Sarah's Social Media"

#### Hierarchische Struktur (3 Ebenen)

```
Private Workspace: "Sarah's Social Media"
│
├─ 📁 Kategorie 1: "Video Kontent"
│  ├─ 📄 Bereich: "YouTube - Tutorial Videos"
│  │  ├─ Template: "Video-Script-Generierung"
│  │  └─ Template: "YouTube-Beschreibung"
│  ├─ 📄 Bereich: "TikTok - Short Form"
│  │  └─ Template: "TikTok-Caption-Generator"
│
├─ 📁 Kategorie 2: "Bild Kontent"
│  ├─ 📄 Bereich: "Instagram Posts"
│  │  ├─ Template: "Instagram-Caption"
│  │  └─ Template: "Hashtag-Generator"
│  ├─ 📄 Bereich: "LinkedIn Graphics"
│
├─ 📁 Kategorie 3: "Monats-Ablauf Social Media"
│  ├─ 📄 Bereich: "Content-Kalender"
│  └─ 📄 Bereich: "Wochen-Plan"
```

#### Neue Datenmodelle für Private

**1. Category (Hierarchisch)**

```javascript
const CategorySchema = new mongoose.Schema({
  _id: ObjectId,
  name: String, // z.B. "Video Kontent"
  userId: ObjectId, // Owner (nur bei Private)
  organizationId: ObjectId, // NULL bei Private, gefüllt bei Business
  type: {
    type: String,
    enum: ["business", "private"],
    default: "private"
  },
  parentCategoryId: ObjectId, // Für Sub-Kategorien (optional)
  level: {
    type: Number,
    min: 1,
    max: 4, // Best Practice: max 4 Ebenen
    default: 1
  },
  icon: String, // UI-Icon
  color: String, // UI-Farbe
  order: Number, // Sortierung
  createdAt: Date,
  updatedAt: Date
});
```

**2. Project (Ersetzt "Customer with type=project")**

```javascript
const ProjectSchema = new mongoose.Schema({
  _id: ObjectId,
  name: String, // z.B. "Sarah's Social Media Workspace"
  userId: ObjectId, // Owner
  description: String,
  type: {
    type: String,
    enum: ["personal", "hobby", "freelance"],
    default: "personal"
  },
  categories: [ObjectId], // Referenzen zu Categories
  settings: {
    defaultBasisPrompt: String,
    defaultTextSize: String,
    defaultModel: String
  },
  createdAt: Date,
  updatedAt: Date
});
```

**3. Area (Updated - gehört zu Category)**

```javascript
const AreaSchema = new mongoose.Schema({
  _id: ObjectId,
  name: String, // z.B. "YouTube - Tutorial Videos"
  userId: ObjectId,
  projectId: ObjectId, // Bei Private: Link zu Project
  organizationId: ObjectId, // Bei Business: Link zu Organization
  categoryId: ObjectId, // NEU: Gehört zu Category!
  type: {
    type: String,
    enum: ["business", "private"],
    required: true
  },
  content: {
    basisPrompt: String,
    contextMain: String,
    plannedSolution: String,
    sections: [SectionSchema]
  },
  isTemplate: Boolean, // Kann als Template gespeichert werden
  templateSource: ObjectId, // Falls von Template erstellt
  createdAt: Date,
  updatedAt: Date
});
```

### Private Workflow

```
1. User erstellt Project: "Sarah's Social Media"
2. User erstellt Kategorien:
   - "Video Kontent"
   - "Bild Kontent"
   - "Monats-Ablauf Social Media"
3. User erstellt Bereiche pro Kategorie:
   - Kategorie "Video Kontent" → Bereich "YouTube - Tutorial Videos"
   - Bereich "YouTube - Tutorial Videos" → Templates:
     * "Video-Script-Generierung"
     * "YouTube-Beschreibung"
4. User generiert Content aus Templates
5. User speichert Ergebnisse als Reports (gehören zu Project)
```

---

## 🏢 Neue Architektur: Business Use Case

### Beispiel: "Musterfirma AG - IV-Berichte"

#### Hierarchische Struktur (4 Ebenen)

```
Organization: "Musterfirma AG"
│
├─ 👥 Employees (CRUD)
│  ├─ Admin: "Max Müller" (role: admin)
│  ├─ Team Lead: "Anna Schmidt" (role: team_lead)
│  └─ Member: "Tom Weber" (role: member)
│
├─ 👔 Customers (CRUD)
│  ├─ Person: "Hans Meier"
│  ├─ Company: "Technologie GmbH"
│
├─ 📊 Company-Wide Settings
│  ├─ Default Templates
│  ├─ Richtlinien (Policies)
│  ├─ RBAC Matrix
│  └─ AI-Defaults (Model, Temperature, etc.)
│
├─ 📁 Haupt-Kategorie 1: "IV-Berichte"
│  ├─ 📂 Sub-Kategorie: "Arbeitsfähigkeit"
│  │  ├─ 📄 Bereich: "Berufliche Situation"
│  │  │  └─ Templates: ["Standard-Bericht", "Detailbericht"]
│  │  ├─ 📄 Bereich: "Medizinische Abklärungen"
│  │
│  ├─ 📂 Sub-Kategorie: "Hilfsmittel"
│     ├─ 📄 Bereich: "Arbeitsplatz-Hilfsmittel"
│     └─ 📄 Bereich: "Mobilität"
│
├─ 📁 Haupt-Kategorie 2: "Versicherungsberichte"
   └─ ...
```

#### Neue Datenmodelle für Business

**1. Organization (Updated - mit Templates)**

```javascript
const OrganizationSchema = new mongoose.Schema({
  _id: ObjectId,
  name: String, // "Musterfirma AG"
  type: {
    type: String,
    enum: ["business", "private"],
    default: "business"
  },

  // Firmenweite Einstellungen
  settings: {
    defaultBasisPrompt: String,
    defaultModel: String,
    defaultTextSize: String,
    defaultMaxTokens: Number,
    defaultTemperature: Number,
    companyPolicies: {
      allowCustomPrompts: Boolean,
      requireApproval: Boolean,
      dataRetentionDays: Number
    }
  },

  // Templates (firmenweite Vorlagen)
  templates: [
    {
      templateId: ObjectId,
      name: String,
      description: String,
      categoryId: ObjectId,
      isDefault: Boolean
    }
  ],

  // RBAC Matrix
  rbacMatrix: {
    admin: {
      employees: ["create", "read", "update", "delete"],
      customers: ["create", "read", "update", "delete"],
      reports: ["create", "read", "update", "delete"],
      settings: ["read", "update"],
      templates: ["create", "read", "update", "delete"]
    },
    team_lead: {
      employees: ["read", "update"],
      customers: ["create", "read", "update"],
      reports: ["create", "read", "update", "delete"],
      settings: ["read"],
      templates: ["read"]
    },
    member: {
      customers: ["read"],
      reports: ["create", "read", "update"],
      settings: ["read"],
      templates: ["read"]
    }
  },

  members: [
    {
      userId: ObjectId,
      role: {
        type: String,
        enum: ["admin", "team_lead", "member"]
      },
      position: String, // "Leitungsposition", "Sachbearbeiter", etc.
      joinedAt: Date,
      permissions: [String] // Override für spezielle Permissions
    }
  ],

  createdAt: Date,
  updatedAt: Date
});
```

**2. Employee (NEU - für Business CRUD)**

```javascript
const EmployeeSchema = new mongoose.Schema({
  _id: ObjectId,
  organizationId: ObjectId,
  userId: ObjectId, // Link zu User-Account (falls vorhanden)

  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },

  employmentInfo: {
    employeeNumber: String,
    position: String, // "Leitungsposition", "Team Lead", etc.
    department: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["active", "inactive", "on_leave"],
      default: "active"
    }
  },

  role: {
    type: String,
    enum: ["admin", "team_lead", "member"],
    default: "member"
  },

  permissions: {
    // Kann org-weite RBAC Matrix überschreiben
    employees: [String], // ["read", "update"]
    customers: [String],
    reports: [String],
    settings: [String],
    templates: [String]
  },

  createdBy: ObjectId, // Wer hat Mitarbeiter angelegt
  createdAt: Date,
  updatedAt: Date
});
```

**3. Customer (Updated - nur Business)**

```javascript
const CustomerSchema = new mongoose.Schema({
  _id: ObjectId,
  organizationId: ObjectId, // Immer gesetzt bei Business!

  type: {
    type: String,
    enum: ["person", "company"], // "project" ENTFERNT!
    required: true
  },

  // Person-Daten
  person: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    address: AddressSchema
  },

  // Company-Daten
  company: {
    companyName: String,
    legalForm: String,
    taxId: String,
    address: AddressSchema
  },

  customerNumber: String,
  status: {
    type: String,
    enum: ["active", "inactive", "archived"],
    default: "active"
  },

  assignedTo: [ObjectId], // Employees die zuständig sind

  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
});
```

**4. Report (Updated - mit Permissions)**

```javascript
const ReportSchema = new mongoose.Schema({
  _id: ObjectId,
  organizationId: ObjectId, // Business
  projectId: ObjectId, // Private
  areaId: ObjectId,
  customerId: ObjectId, // Nur bei Business

  title: String,
  sections: [GeneratedSectionSchema],
  prompts: [PromptSchema],

  // Permissions & Visibility
  createdBy: ObjectId, // Employee/User
  assignedTo: [ObjectId], // Weitere Employees mit Zugriff
  visibility: {
    type: String,
    enum: ["private", "team", "organization"],
    default: "private"
  },

  // Approval Workflow (für Business)
  status: {
    type: String,
    enum: ["draft", "pending_approval", "approved", "rejected"],
    default: "draft"
  },
  approvedBy: ObjectId,
  approvedAt: Date,

  createdAt: Date,
  updatedAt: Date
});
```

### Business Workflow

```
1. Admin erstellt Organization: "Musterfirma AG"
2. Admin definiert RBAC Matrix in Organization settings
3. Admin erstellt Employees (CRUD):
   - Max Müller (role: admin)
   - Anna Schmidt (role: team_lead)
   - Tom Weber (role: member)
4. Admin erstellt Company-Wide Templates:
   - Category "IV-Berichte" → Template "Standard-Bericht"
5. Admin erstellt Customers (CRUD):
   - Person: "Hans Meier"
   - Company: "Technologie GmbH"
6. Team Lead (Anna) erstellt Bereiche basierend auf Templates
7. Member (Tom) generiert Berichte für Kunden
8. Reports haben Visibility: "team" → Team Lead kann sehen
9. Admin kann alle Reports, Employees, Customers verwalten (CRUD)
```

---

## 🔐 Organisation-Scoped RBAC Implementation

### Permission Check Logic

```javascript
// Backend Middleware für Permission Check
async function checkPermission(req, res, next) {
  const userId = req.user.id;
  const organizationId = req.params.organizationId || req.body.organizationId;
  const resource = req.route.resource; // "employees", "customers", "reports"
  const action = req.method === "GET" ? "read" :
                 req.method === "POST" ? "create" :
                 req.method === "PUT" ? "update" : "delete";

  // 1. Hole User's Rolle in dieser Organization
  const org = await Organization.findById(organizationId);
  const member = org.members.find(m => m.userId.toString() === userId);

  if (!member) {
    return res.status(403).json({ error: "Kein Zugriff auf diese Organization" });
  }

  // 2. Prüfe RBAC Matrix
  const allowedActions = org.rbacMatrix[member.role][resource];

  if (!allowedActions || !allowedActions.includes(action)) {
    return res.status(403).json({
      error: `${member.role} darf ${action} nicht auf ${resource} ausführen`
    });
  }

  // 3. Prüfe individuelle Permissions (Overrides)
  const employee = await Employee.findOne({
    organizationId,
    userId
  });

  if (employee?.permissions?.[resource]) {
    const individualActions = employee.permissions[resource];
    if (!individualActions.includes(action)) {
      return res.status(403).json({
        error: "Individuelle Permissions verbieten diese Aktion"
      });
    }
  }

  next();
}

// Beispiel-Route mit Permission Check
router.get('/organizations/:organizationId/employees',
  authMiddleware.verifyToken,
  (req, res, next) => {
    req.route.resource = 'employees';
    next();
  },
  checkPermission,
  async (req, res) => {
    // Nur wenn Permission Check erfolgreich!
    const employees = await Employee.find({
      organizationId: req.params.organizationId
    });
    res.json({ success: true, data: employees });
  }
);
```

### Frontend Permission Check

```typescript
// React Hook für Permission Check
function usePermission(resource: string, action: string) {
  const { currentOrganization } = useOrganizationStore();
  const { user } = useAuthStore();

  const hasPermission = useMemo(() => {
    if (!currentOrganization || !user) return false;

    const member = currentOrganization.members.find(
      m => m.userId === user._id
    );
    if (!member) return false;

    const allowedActions =
      currentOrganization.rbacMatrix[member.role]?.[resource];

    return allowedActions?.includes(action) || false;
  }, [currentOrganization, user, resource, action]);

  return hasPermission;
}

// Verwendung in Component
function EmployeeManagement() {
  const canCreateEmployee = usePermission('employees', 'create');
  const canDeleteEmployee = usePermission('employees', 'delete');

  return (
    <div>
      {canCreateEmployee && (
        <button onClick={handleCreateEmployee}>
          Neuer Mitarbeiter
        </button>
      )}
      {canDeleteEmployee && (
        <button onClick={handleDeleteEmployee}>
          Mitarbeiter löschen
        </button>
      )}
    </div>
  );
}
```

---

## 📁 Neue API-Struktur

### Business Endpoints

```
POST   /organizations                    # Neue Organization erstellen
GET    /organizations/:id                # Organization Details
PUT    /organizations/:id/settings       # Company-Wide Settings
GET    /organizations/:id/templates      # Firmen-Templates

POST   /organizations/:id/employees      # Employee erstellen (CRUD)
GET    /organizations/:id/employees      # Alle Employees
PUT    /organizations/:id/employees/:eid # Employee updaten
DELETE /organizations/:id/employees/:eid # Employee löschen

POST   /organizations/:id/customers      # Customer erstellen (CRUD)
GET    /organizations/:id/customers      # Alle Customers
PUT    /organizations/:id/customers/:cid # Customer updaten
DELETE /organizations/:id/customers/:cid # Customer löschen

POST   /organizations/:id/categories     # Kategorie erstellen
GET    /organizations/:id/categories     # Hierarchische Kategorien

POST   /organizations/:id/areas          # Bereich erstellen
GET    /organizations/:id/areas          # Bereiche (gefiltert nach Category)

POST   /organizations/:id/reports        # Report generieren (CRUD)
GET    /organizations/:id/reports        # Reports (mit Permissions)
PUT    /organizations/:id/reports/:rid   # Report updaten
DELETE /organizations/:id/reports/:rid   # Report löschen
```

### Private Endpoints

```
POST   /projects                         # Neues Project erstellen
GET    /projects                         # User's Projects
GET    /projects/:id                     # Project Details
PUT    /projects/:id/settings            # Project Settings

POST   /projects/:id/categories          # Kategorie erstellen
GET    /projects/:id/categories          # Hierarchische Kategorien

POST   /projects/:id/areas               # Bereich erstellen
GET    /projects/:id/areas               # Bereiche pro Kategorie

POST   /projects/:id/reports             # Report generieren
GET    /projects/:id/reports             # Alle Reports
```

---

## 🔄 Migration Strategy

### Phase 1: Neue Modelle erstellen

```bash
# Neue Model-Dateien
backend/models/Category.js
backend/models/Project.js
backend/models/Employee.js
backend/models/Template.js  # Für firmenweite Templates

# Updated Models
backend/models/Organization.js  # + settings, rbacMatrix, templates
backend/models/Customer.js      # - "project" type
backend/models/Area.js          # + categoryId, projectId
backend/models/Report.js        # + visibility, status, approvedBy
backend/models/User.js          # (bereits gut mit organizations array)
```

### Phase 2: Daten-Migration Script

```javascript
// backend/scripts/migrate-to-new-architecture.js

async function migrateToNewArchitecture() {
  console.log("🚀 Migration gestartet...");

  // 1. Bestehende Organizations updaten
  const orgs = await Organization.find({ type: "business" });
  for (const org of orgs) {
    org.settings = {
      defaultBasisPrompt: "",
      defaultModel: "gpt-4o",
      defaultTextSize: "Mittel",
      companyPolicies: {
        allowCustomPrompts: true,
        requireApproval: false,
        dataRetentionDays: 365
      }
    };
    org.rbacMatrix = getDefaultRBACMatrix();
    await org.save();
    console.log(`✅ Organization ${org.name} updated`);
  }

  // 2. Customer "project" → Project umwandeln
  const projectCustomers = await Customer.find({ type: "project" });
  for (const customer of projectCustomers) {
    const newProject = new Project({
      name: customer.projectName || "Unbenanntes Projekt",
      userId: customer.userId,
      description: customer.description || "",
      type: "personal",
      categories: [],
      settings: {}
    });
    await newProject.save();

    // Areas umhängen
    await Area.updateMany(
      { customerId: customer._id },
      {
        projectId: newProject._id,
        type: "private",
        $unset: { customerId: 1 }
      }
    );

    // Customer löschen
    await Customer.deleteOne({ _id: customer._id });
    console.log(`✅ Customer ${customer._id} → Project ${newProject._id}`);
  }

  // 3. Default Kategorien erstellen
  const allOrgs = await Organization.find();
  for (const org of allOrgs) {
    if (org.type === "business") {
      // Standard Business-Kategorie
      const category = new Category({
        name: "Standard-Berichte",
        organizationId: org._id,
        type: "business",
        level: 1,
        order: 0
      });
      await category.save();

      // Alle Areas ohne categoryId an diese Kategorie hängen
      await Area.updateMany(
        { organizationId: org._id, categoryId: { $exists: false } },
        { categoryId: category._id }
      );
      console.log(`✅ Default Category für ${org.name} erstellt`);
    }
  }

  // 4. Private User: Default Projects erstellen
  const privateUsers = await User.find({
    organizations: { $size: 0 } // User ohne Organization = Private
  });
  for (const user of privateUsers) {
    const project = new Project({
      name: "Mein Workspace",
      userId: user._id,
      type: "personal",
      categories: []
    });
    await project.save();

    // Default Kategorie
    const category = new Category({
      name: "Meine Bereiche",
      userId: user._id,
      type: "private",
      level: 1,
      order: 0
    });
    await category.save();

    // Areas umhängen
    await Area.updateMany(
      { userId: user._id, organizationId: { $exists: false } },
      {
        projectId: project._id,
        type: "private",
        categoryId: category._id
      }
    );
    console.log(`✅ Project für User ${user.username} erstellt`);
  }

  console.log("✅ Migration abgeschlossen!");
}
```

### Phase 3: Backend Routes updaten

```javascript
// backend/routes/organizations.js (NEU)
// - CRUD für Employees
// - CRUD für Customers (nur Business)
// - Company-Wide Settings
// - RBAC Matrix Management

// backend/routes/projects.js (NEU)
// - Project CRUD
// - Private Categories
// - Private Areas

// backend/routes/categories.js (NEU)
// - Hierarchische Kategorien
// - Category CRUD mit Parent-Child

// backend/routes/areas.js (UPDATE)
// + categoryId Filter
// + projectId vs organizationId Handling

// backend/routes/reports.js (UPDATE)
// + Permission Checks
// + Visibility Filters
// + Approval Workflow
```

### Phase 4: Frontend Anpassungen

```typescript
// Neue Stores
src/store/organizationStore.ts  // Organization + Members + RBAC
src/store/employeeStore.ts      // Employee CRUD
src/store/customerStore.ts      // Customer CRUD
src/store/categoryStore.ts      // Hierarchische Categories
src/store/projectStore.ts       // Private Projects

// Neue Components
src/components/business/EmployeeManagement.tsx
src/components/business/CustomerManagement.tsx
src/components/business/CompanySettings.tsx
src/components/business/RBACMatrix.tsx

src/components/private/ProjectSettings.tsx
src/components/private/CategoryTree.tsx

src/components/shared/CategorySelector.tsx  // Hierarchische Auswahl

// Updated Components
src/components/wizard/SelectArea.tsx  // + Category Filter
src/components/SettingsModalNew.tsx   // Business vs Private Tabs
```

### Phase 5: Testing & Rollout

```bash
# 1. Lokale Migration testen
npm run migrate:dry-run   # Zeigt was passieren würde
npm run migrate:execute   # Führt Migration aus

# 2. Backend Tests
npm run test:models       # Neue Modelle testen
npm run test:rbac         # Permission Checks testen
npm run test:api          # Neue Endpoints testen

# 3. Frontend Tests
npm run test:stores       # Zustand Stores testen
npm run test:permissions  # usePermission Hook testen

# 4. E2E Tests
npm run test:e2e          # Business Workflow
npm run test:e2e:private  # Private Workflow
```

---

## 📈 Vorher/Nachher Vergleich

### Vorher (Aktuell)

```
❌ Areas sind flach ohne Kategorien
❌ User.role ist global ("admin" überall)
❌ Customer.type = "project" ist konzeptionell falsch
❌ Keine Firmen-Templates
❌ Keine granularen Permissions
❌ Business & Private nutzen dieselben Models

Beispiel Private:
User → Customer (type: project) → Area
         ❌ Project ist kein Customer!

Beispiel Business:
User (role: "admin" global) → Organization → Area
  ❌ User ist Admin in ALLEN Orgs!
```

### Nachher (Neu)

```
✅ Hierarchische Kategorien (3-4 Ebenen)
✅ Organization-scoped Roles
✅ Separate Project Model für Private
✅ Firmen-Templates & Defaults
✅ RBAC Matrix mit granularen Permissions
✅ Klare Trennung Business vs Private

Beispiel Private:
User → Project → Category → Area → Report
  ✅ Klare Hierarchie, kein Customer!

Beispiel Business:
User (org1: admin, org2: member) → Organization → Category → Area → Report
  ✅ User kann verschiedene Rollen haben!
  ✅ Employee CRUD ✅ Customer CRUD ✅ Report CRUD
```

---

## 🎯 Zusammenfassung: Ziele erreicht

### Private Use Case: Influencer ✅

```
✅ User erstellt Project: "Sarah's Social Media"
✅ Hierarchische Kategorien:
   - Video Kontent
     └─ YouTube - Tutorial Videos
        ├─ Video-Generierung
        └─ Video-Beschreibung
   - Bild Kontent
   - Monats-Ablauf Social Media
✅ Bereiche sind Templates wiederverwendbar
✅ Reports gehören zu Projects, nicht zu Customers
```

### Business Use Case: Musterfirma AG ✅

```
✅ Admin kann Employees verwalten (CRUD)
✅ Admin kann Customers verwalten (CRUD)
✅ Admin kann Reports verwalten (CRUD)
✅ Team Lead hat eingeschränkte Permissions
✅ Member kann nur eigene Reports erstellen
✅ Firmenweite Templates & Richtlinien
✅ Organization-scoped RBAC Matrix
✅ Permission Checks auf allen Endpoints
```

---

## 📚 Nächste Schritte

### Priorität 1: Modelle erstellen

- [ ] Category.js Model erstellen
- [ ] Project.js Model erstellen
- [ ] Employee.js Model erstellen
- [ ] Organization.js updaten (settings, rbacMatrix)
- [ ] Customer.js updaten (remove "project" type)
- [ ] Area.js updaten (categoryId, projectId)
- [ ] Report.js updaten (visibility, approvedBy)

### Priorität 2: Backend Routes

- [ ] /organizations/:id/employees (CRUD)
- [ ] /organizations/:id/customers (CRUD)
- [ ] /organizations/:id/reports (CRUD mit Permissions)
- [ ] /projects (CRUD für Private)
- [ ] /categories (hierarchisch)
- [ ] Permission Middleware erstellen

### Priorität 3: Migration

- [ ] Migration Script schreiben
- [ ] Dry-Run testen
- [ ] Backup erstellen
- [ ] Migration ausführen

### Priorität 4: Frontend

- [ ] Organization Store (mit RBAC)
- [ ] Employee Management UI
- [ ] Customer Management UI
- [ ] Category Tree Component
- [ ] Permission Hooks
- [ ] Business vs Private Workflows trennen

---

**Status:** Architektur-Entwurf komplett
**Nächster Schritt:** Modelle implementieren

*Erstellt: 2025-11-20*
*Basierend auf: Internet Best Practices + User Requirements*
