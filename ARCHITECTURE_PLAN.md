# Architecture plan: pipeline de embeddings (Python + Hugging Face)

Estado: **borrador — no ejecutar hasta APPROVED**

## 1. Qué hay hoy (backend)

No existe un directorio `backend/` ni servicios ejecutables. El árbol real es:

```text
CyberScan/
  docs/architecture/          # v0.1, decisions, scanner-strategy
  docs/threat-model/
  packages/finding-model/     # finding.schema.json (contrato único)
  README.md                    # layout previsto, aún no materializado
```

Layout **previsto** (README) y aún vacío:

```text
apps/        # APIs y apps
packages/    # contratos y adapters
workers/     # jobs de scan y análisis
test-targets/
```

El “backend” operativo hoy es el **contrato** `packages/finding-model/finding.schema.json` más el pipeline documental:

`Repository → Ingestion → Semgrep/Gitleaks → adapters → findings normalizados → Persistence (PostgreSQL) → dashboard`

Restricciones que este plan debe respetar:

- V0.1 **no** presenta conclusiones de IA como evidencia confirmada.
- Análisis con IA es un hito **posterior**; embeddings son infraestructura de similitud, no un oráculo.
- Evidencia antes que inferencia; incertidumbre explícita; provenance obligatoria.
- Findings, código y secretos son sensibles: el modelo debe correr **en local / worker controlado**, no enviar texto a APIs públicas por defecto.

## 2. Rol del pipeline de embeddings

Objetivo: vectorizar texto **ya normalizado** (títulos, descripciones, snippets de evidencia redactados) para:

1. Deduplicación / agrupación de findings similares entre scanners.
2. Búsqueda semántica en el dashboard (“muestra findings parecidos a este”).
3. Más adelante: retrieval para explicación (RAG) **sin** afirmar exploitabilidad.

No es objetivo de esta fase: generar severidad, attack paths, o “el hallazgo es explotable” desde el modelo.

## 3. Encaje en la arquitectura

```text
Normalized findings (JSON contract)
        |
        v
  Embedding worker (Python, Hugging Face)
        |
        +-- text assembly + redaction
        +-- local sentence-transformers model
        +-- embedding records + provenance
        |
        v
  PostgreSQL + pgvector (tabla separada, no mezclar con evidence)
        |
        v
  API de similitud (apps/) — solo lectura de vectores
```

El worker de embeddings es un **consumidor** del finding model, paralelo a persistencia de findings. Fallo del embedder no debe invalidar un scan (mismo criterio que scanners: error visible, no resultado vacío silencioso).

## 4. Creaciones de archivos propuestas

### Crear (esqueleto de backend alineado al README)

| Path | Propósito |
| --- | --- |
| `workers/embedding-pipeline/` | Worker Python aislado (único sitio con PyTorch/HF) |
| `workers/embedding-pipeline/pyproject.toml` | Dependencias: `sentence-transformers`, `numpy`; opcional `pgvector` / `psycopg` |
| `workers/embedding-pipeline/src/cyberscan_embeddings/__init__.py` | Paquete |
| `workers/embedding-pipeline/src/cyberscan_embeddings/config.py` | Modelo, device (CPU/CUDA), batch size, max tokens, workspace boundary |
| `workers/embedding-pipeline/src/cyberscan_embeddings/text.py` | Ensambla texto desde finding JSON; redacta secretos |
| `workers/embedding-pipeline/src/cyberscan_embeddings/embedder.py` | Carga modelo HF local; `encode()` batch; checksum de pesos |
| `workers/embedding-pipeline/src/cyberscan_embeddings/store.py` | Upsert en `finding_embeddings` |
| `workers/embedding-pipeline/src/cyberscan_embeddings/cli.py` | CLI: embed scan_id / finding JSONL |
| `workers/embedding-pipeline/tests/` | Tests con modelo mock (no descargar GB en CI) |
| `packages/finding-model/embedding.schema.json` | Contrato del registro de embedding (separado del finding) |
| `docs/architecture/decisions.md` | Nueva ADR: embeddings locales HF, no conclusión |
| `apps/` | **No implementar API completa ahora**; reservar endpoint futuro `GET /findings/{id}/similar` |

### No crear todavía

- Cliente Hugging Face Inference API / embeddings en la nube.
- Fine-tuning.
- RAG que escriba `confidence: CONFIRMED`.
- Apps Flutter/C# (el skill Plan.md menciona C#/Dart; **este repo no tiene esos proyectos**). El pipeline Python no debe acoplarse a DTOs C# hasta que existan.

### No borrar

Nada. `finding.schema.json` se conserva.

## 5. Modificaciones estructurales exactas

### 5.1 `finding.schema.json`

**No añadir** `embedding` ni `vector` al finding. Motivos:

- `additionalProperties: false` — un vector sucio el contrato de scanners.
- El vector no es evidencia de scanner; es un artefacto derivado.
- Cambiar el finding rompería adapters futuros (Semgrep/Gitleaks) y el principio de provenance del scanner.

Relación: `finding.id` (1) → `finding_embeddings` (N, uno por `model_id` + versión).

### 5.2 Nuevo contrato `embedding.schema.json` (campos)

- `id`, `finding_id`
- `model_id` (ej. `sentence-transformers/all-MiniLM-L6-v2`)
- `model_revision` (hash git de HF Hub o digest local)
- `embedding_dim`
- `vector` (array float, o omitido en JSON de API y solo en DB)
- `text_hash` (SHA-256 del texto embebido, para invalidar si cambia el finding)
- `source_fields` (lista: `title`, `description`, `evidence.snippet`)
- `status`: `PENDING` | `SUCCEEDED` | `FAILED`
- `error` (si FAILED; visible, no silencioso)
- `created_at`

### 5.3 Persistencia (PostgreSQL, ya elegido en v0.1)

Tabla nueva, no columnas en `findings`:

```text
finding_embeddings (
  id, finding_id, model_id, model_revision,
  embedding vector(384),  -- dim = modelo elegido
  text_hash, source_fields, status, error, created_at
)
UNIQUE (finding_id, model_id, model_revision)
INDEX ivfflat / hnsw on embedding
```

Migraciones: cuando exista capa de persistencia. Hasta entonces, el worker puede escribir JSONL junto al scan para no bloquear V0.1.

### 5.4 Texto a embeber

Concatenar, con límites:

- `title` + `description` + `category` + `cwe`/`cve` si hay
- De `evidence`: solo claves no secretas; **nunca** valores crudos de Gitleaks
- Truncar a la ventana del modelo (p. ej. 256–512 tokens)

### 5.5 Modelo Hugging Face (recomendación inicial)

| Opción | Dim | Notas |
| --- | --- | --- |
| **`sentence-transformers/all-MiniLM-L6-v2`** (default) | 384 | CPU-friendly, suficiente para similitud de findings |
| `BAAI/bge-small-en-v1.5` | 384 | Mejor calidad EN; más pesado |

Fijar `model_revision` en config. Cache local (`HF_HOME` dentro del workspace del worker). Sin `trust_remote_code` salvo ADR explícita.

Runtime: `sentence-transformers` (wrapper de Transformers). Device: CPU por defecto; CUDA opcional.

## 6. Dependencias y conflictos de runtime

| Riesgo | Conflicto | Mitigación |
| --- | --- | --- |
| PyTorch + CUDA | Tamaño, wheels Windows, RAM | Worker aislado; extra `cpu` vs `cu124`; CI solo CPU + mock |
| Descarga de modelo | Red, licencia, supply chain | Pin revision; cache; no Hub en runtime de prod si hay mirror |
| Secretos en texto | Embedding de secretos = fuga en vectores/logs | Redaction en `text.py`; no loguear texto embebido |
| Conclusión vs evidencia | UI podría mostrar “IA dice…” | El API de similitud no escribe `severity`/`status`; score de similitud ≠ confidence del finding |
| V0.1 incompleto | No hay ingestion, workers de scan, ni Postgres | Pipeline debe funcionar con JSONL de findings de prueba |
| Dimensión vs índice | Cambiar de MiniLM (384) a otro modelo rompe pgvector | Nueva fila por `(model_id, revision)`, no ALTER de una sola columna |
| Windows (este entorno) | Paths OneDrive, HF cache | Config explícita de cache dir |
| Monorepo sin Python aún | Mezclar deps con futuros apps Node/C# | Solo `workers/embedding-pipeline/pyproject.toml` |
| `additionalProperties: false` | Meter vector en finding | Tabla/schema separados (arriba) |

## 7. Secuencia de implementación (post-APPROVED)

1. Scaffold `workers/embedding-pipeline` + tests con embedder fake.
2. `embedding.schema.json` + validación.
3. `text.py` + reglas de redacción alineadas al threat model.
4. `embedder.py` con MiniLM pinneado; job CLI sobre un finding de ejemplo.
5. ADR en `docs/architecture/decisions.md`.
6. Store: JSONL primero; pgvector cuando exista persistencia.
7. (Más tarde) endpoint de similitud en `apps/` cuando exista API.

## 8. Fuera de alcance de esta aprobación

- Implementar Semgrep/Gitleaks.
- Dashboard.
- Entrenar o fine-tunear modelos.
- Llamadas a Inference Endpoints de Hugging Face.
- Cualquier payload de exploit o análisis ofensivo; solo vectores sobre findings propios.

## 9. Criterio de hecho (cuando se ejecute)

- Un finding normalizado de prueba produce un vector reproducible para el mismo `text_hash` + `model_revision`.
- Un fallo de modelo queda en `status=FAILED` con error observable.
- El finding original no se muta.
- Tests de CI no descargan el modelo completo (mock / fixture de dimensión fija).
