# Material Service

A Spring Boot microservice for managing lecture materials (notes, PDFs, transcripts) uploaded by teachers. Files are stored in **Supabase Storage**, while metadata is persisted in a dedicated **PostgreSQL** database (`materialdb`).

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                         │
│   /upload-material      /teacher-materials      /teacher-dashboard│
└───────────────────────────┬───────────────────────────────────────┘
                            │ HTTP (via API Gateway)
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                  API Gateway  (Port 8765)                         │
│  • JWT validation                                                 │
│  • ROLE_TEACHER enforced on: POST /materials/upload,              │
│    DELETE /materials/{id}, PUT /materials/{id}/transcript         │
│  • Routes /materials/** → material-service                        │
└───────────────────────────┬───────────────────────────────────────┘
                            │ load-balanced via Eureka
                            ▼
┌───────────────────────────────────────────────────────────────────┐
│               Material Service  (Port 8082)                       │
│                                                                   │
│   MaterialController                                              │
│       │                                                           │
│       ├─ MaterialService  (business logic)                        │
│       │       │                                                   │
│       │       ├─ LectureMaterialRepository  (JPA → materialdb)    │
│       │       └─ SupabaseStorageService  (Supabase REST API)      │
│       └─ LectureMaterial  (JPA Entity)                            │
└───────────┬────────────────────────┬──────────────────────────────┘
            │                        │
            ▼                        ▼
┌───────────────────┐    ┌────────────────────────┐
│  PostgreSQL        │    │  Supabase Storage       │
│  materialdb        │    │  Bucket: lecture-mater… │
│  lecture_materials │    │  Files: teacher/uuid_fn │
└───────────────────┘    └────────────────────────┘
```

---

## REST API Endpoints

| Method | Endpoint                        | Role Required | Description                             |
|--------|---------------------------------|---------------|-----------------------------------------|
| POST   | `/materials/upload`             | TEACHER       | Upload file + metadata (multipart/form-data) |
| GET    | `/materials/my`                 | TEACHER       | Get all materials by the logged-in teacher |
| GET    | `/materials/teacher/{username}` | Any auth user | Get all materials by teacher username   |
| GET    | `/materials/{id}`               | Any auth user | Get material by ID                      |
| GET    | `/materials/category/{category}`| Any auth user | Get materials by course category        |
| DELETE | `/materials/{id}`               | TEACHER       | Delete material (owner only)            |
| PUT    | `/materials/{id}/transcript`    | TEACHER       | Add/update transcript text (owner only) |

### Upload Request (multipart/form-data)

| Field        | Type   | Required | Description                   |
|--------------|--------|----------|-------------------------------|
| `file`       | File   | ✅ Yes    | The file to upload             |
| `title`      | String | ✅ Yes    | Display title                  |
| `category`   | String | ✅ Yes    | Course category                |
| `description`| String | ❌ No     | Optional description           |

### Transcript Request (PUT)

```json
{
  "transcript": "Full text of the lecture..."
}
```

---

## Database Schema

```sql
CREATE TABLE lecture_materials (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  VARCHAR(1000),
    teacher_username VARCHAR(255) NOT NULL,
    category     VARCHAR(255) NOT NULL,
    file_url     VARCHAR(255) NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_type    VARCHAR(255) NOT NULL,
    file_size    BIGINT,
    transcript   TEXT,
    uploaded_at  TIMESTAMP NOT NULL
);
```

> JPA `ddl-auto: update` will auto-create this table on first startup.

---

## Configuration

### Environment Variables

| Variable              | Description                         | Example                              |
|-----------------------|-------------------------------------|--------------------------------------|
| `SUPABASE_URL`        | Your Supabase project URL           | `https://xxxx.supabase.co`           |
| `SUPABASE_SERVICE_KEY`| Supabase service role key           | `eyJhbGciOiJIUzI1NiIsInR5cCI6...`    |
| `SUPABASE_BUCKET`     | Storage bucket name                 | `lecture-materials`                  |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL               | `jdbc:postgresql://postgres-db:5432/materialdb` |
| `SPRING_DATASOURCE_USERNAME` | DB username                | `postgres`                           |
| `SPRING_DATASOURCE_PASSWORD` | DB password                | `aryan`                              |

### `application.yml`

```yaml
server:
  port: 8082

spring:
  application:
    name: material-service
  datasource:
    url: jdbc:postgresql://postgres-db:5432/materialdb
    username: postgres
    password: aryan
  jpa:
    hibernate:
      ddl-auto: update
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB

supabase:
  url: ${SUPABASE_URL}
  service-key: ${SUPABASE_SERVICE_KEY}
  bucket: ${SUPABASE_BUCKET:-lecture-materials}
```

---

## Supabase Storage Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Storage** → **New Bucket** → name it `lecture-materials`.
3. Set bucket policy to **Private** (service key is used for uploads; public URLs are returned for downloads).
4. Copy your **Project URL** and **service_role key** from **Project Settings → API**.
5. Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` environment variables.

---

## File Storage Path

Files are stored under the path `{teacherUsername}/{uuid}_{originalFileName}` inside the bucket. This ensures each teacher's files are namespaced separately.

Public URL format:
```
https://{project}.supabase.co/storage/v1/object/public/lecture-materials/{teacherUsername}/{uuid}_{filename}
```

---

## Running Locally

```bash
# From the material-service directory
mvn spring-boot:run \
  -Dspring-boot.run.jvmArguments="\
  -DSUPABASE_URL=https://your-project.supabase.co \
  -DSUPABASE_SERVICE_KEY=your-key \
  -DSUPABASE_BUCKET=lecture-materials \
  -DSPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/materialdb"
```

> Make sure `materialdb` database exists in your local PostgreSQL and Eureka (service-registry) is running.

---

## Running with Docker Compose

Add the following to your `.env` file (next to `docker-compose.yml`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_BUCKET=lecture-materials
```

Then run:

```bash
docker-compose up --build material-service
```

---

## Service Registration

This service registers with **Eureka** under the name `MATERIAL-SERVICE`. The API Gateway routes `/materials/**` to this service via load-balanced Eureka discovery.

---

## Frontend Pages

| Page              | Route                  | Description                                    |
|-------------------|------------------------|------------------------------------------------|
| Upload Material   | `/upload-material`     | Upload form for teachers (TEACHER role only)   |
| My Materials      | `/teacher-materials`   | List, view, delete, and add transcripts        |
| Teacher Dashboard | `/teacher-dashboard`   | Includes "My Materials" button linking above   |

---

## Supported File Types

| Type         | Extensions             |
|--------------|------------------------|
| PDF          | `.pdf`                 |
| Word         | `.doc`, `.docx`        |
| PowerPoint   | `.ppt`, `.pptx`        |
| Text         | `.txt`                 |
| Video        | `.mp4`                 |
| Audio        | `.mp3`                 |

Maximum file size: **50 MB**

---

## Security

- All endpoints require a valid **JWT token** (validated at the API Gateway).
- Upload, delete, and transcript update require **ROLE_TEACHER**.
- Teachers can only delete/update their own materials (enforced at the service layer).
- Supabase service key is never exposed to the frontend; all storage operations happen server-side.
