# Prompt to Query - API REST con Express y Mongoose

Este proyecto utiliza el SDK `prompt-to-query` para generar queries de MongoDB desde lenguaje natural, integrado con Mongoose para la gestión de la base de datos y Express para exponer una API REST.

## Características

- API REST con Express.js
- MongoDB como base de datos
- Mongoose para ODM (Object Document Mapping)
- Modelos basados en el schema.json
- Variables de entorno para configuración
- Endpoint POST `/prompt` para generar queries desde lenguaje natural

## Estructura del Proyecto

```
.
├── config/
│   └── database.js         # Configuración de conexión a MongoDB
├── docker-compose.yml      # Configuración de Docker Compose
├── Dockerfile             # Imagen de la aplicación
├── .dockerignore          # Archivos ignorados por Docker
├── .env                   # Variables de entorno (no subir a git)
├── .env.example           # Ejemplo de variables de entorno
├── schema.json            # Schema de la base de datos
├── index.js               # Punto de entrada de la aplicación
└── package.json           # Dependencias del proyecto
```

## Requisitos Previos

- Docker
- Docker Compose
- Node.js 18+ (para desarrollo local sin Docker)

## Instalación y Uso

### Opción 1: Con Docker (Recomendado)

1. Clonar el repositorio y navegar al directorio:
   ```bash
   cd impl-promt-to-query
   ```

2. Copiar el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

3. Editar `.env` y configurar tu API key de OpenAI:
   ```bash
   OPENAI_API_KEY=tu_api_key_aquí
   ```

4. Iniciar los contenedores:
   ```bash
   docker-compose up -d
   ```

5. Ver los logs:
   ```bash
   docker-compose logs -f app
   ```

6. Detener los contenedores:
   ```bash
   docker-compose down
   ```

7. Detener y eliminar volúmenes (borra los datos):
   ```bash
   docker-compose down -v
   ```

### Opción 2: Local (Sin Docker)

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Asegurarse de tener MongoDB ejecutándose localmente en el puerto 27017

3. Configurar el archivo `.env`

4. Ejecutar la aplicación:
   ```bash
   node index.js
   ```

## Modelos de Mongoose

### User
- email (único, indexado)
- name
- status (active, inactive, suspended)
- role (user, admin, manager)
- profile (objeto con age, city, country, phoneNumber)
- lastLogin
- timestamps (createdAt, updatedAt)

### Product
- name (indexado)
- sku (único, indexado)
- price (indexado)
- categoryId (referencia a Category)
- stock
- salesCount
- rating (0-5)
- tags (array)
- isActive
- timestamps

### Category
- name (único, indexado)
- slug (único)
- parentId (referencia a Category)
- description
- timestamps

### Order
- orderNumber (único, indexado)
- userId (referencia a User, indexado)
- status (pending, processing, shipped, delivered, cancelled)
- items (array de objetos con productId, quantity, price)
- totalAmount
- timestamps

## Uso del SDK prompt-to-query con Mongoose

```javascript
const { PromptToQuery } = require('prompt-to-query');
const { User } = require('./models');

// Inicializar el SDK
const ptq = new PromptToQuery({
  llmProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  dbSchemaPath: './schema.json'
});

// Generar query desde lenguaje natural
const query = await ptq.generateQuery('Get all active users from last month');

// Ejecutar con Mongoose
const results = await User.find(query.filter)
  .limit(query.limit || 10)
  .sort(query.sort || {});
```

## Acceso a MongoDB

Cuando uses Docker Compose, MongoDB estará disponible en:

- **Host**: localhost
- **Puerto**: 27017
- **Usuario**: admin (configurado en .env)
- **Contraseña**: password (configurado en .env)
- **Base de datos**: prompttoquery

Para conectarte desde el host:
```bash
mongosh "mongodb://admin:password@localhost:27017/prompttoquery?authSource=admin"
```

## Comandos Útiles de Docker

```bash
# Reconstruir las imágenes
docker-compose build

# Iniciar en primer plano
docker-compose up

# Reiniciar servicios
docker-compose restart

# Ver estado de los contenedores
docker-compose ps

# Ejecutar comandos en el contenedor de la app
docker-compose exec app sh

# Ejecutar comandos en MongoDB
docker-compose exec mongodb mongosh -u admin -p password
```

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| MONGO_USERNAME | Usuario de MongoDB | admin |
| MONGO_PASSWORD | Contraseña de MongoDB | password |
| MONGO_DATABASE | Nombre de la base de datos | prompttoquery |
| MONGODB_URI | URI de conexión completa | mongodb://admin:password@localhost:27017/prompttoquery?authSource=admin |
| NODE_ENV | Entorno de ejecución | development |
| OPENAI_API_KEY | API Key de OpenAI | (requerido) |

## Notas

- El archivo `.env` contiene información sensible y no debe subirse a control de versiones
- Los datos de MongoDB se persisten en volúmenes de Docker
- El código de la aplicación se monta como volumen en modo desarrollo para hot-reload
