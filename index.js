require('dotenv').config();
const express = require('express');
const { PromptToQuery } = require('prompt-to-query');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());


async function main(prompt) {
  // Inicializar el SDK si no está inicializado
  console.log('Initializing PromptToQuery SDK...');
  // Leer el contenido del archivo /app/schema.json y convertirlo a JSON
  const fs = require('fs').promises;
  const schemaContent = await fs.readFile('./schema.json', 'utf-8');
  const schemaJson = JSON.parse(schemaContent);
  console.log('Schema loaded:', schemaJson);

  // Importar encode dinámicamente ya que es un módulo ESM
  const { encode } = await import('@toon-format/toon');
  const schema = encode(schemaJson);

  console.log('Encoded Schema:', schema);

  try {
        ptq = new PromptToQuery({
        llmProvider: 'openai',
        apiKey: process.env.OPENAI_API_KEY,
        dbSchema: schema
        });
    }catch (error) {
      console.error('Error initializing PromptToQuery SDK:', error);
      throw error;
    }


  // Generar query desde lenguaje natural
  console.log('Generating query for prompt:', prompt);
  const queryObject = await ptq.generateQuery(prompt);
  console.log('Generated Query:', JSON.stringify(queryObject, null, 2));
  

  // Ejecutar la consulta según el tipo de operación
  const { query, columnTitles } = queryObject;
  const { collection, operation } = query;

  console.log(`Executing ${operation} operation on ${collection} collection...`);

  let results;
  const Model = mongoose.connection.collection(collection);

  if (operation === 'aggregate') {
    // Ejecutar aggregation pipeline
    const { pipeline } = query;
    console.log('Pipeline:', JSON.stringify(pipeline, null, 2));
    results = await Model.aggregate(pipeline).toArray();
  } else if (operation === 'find') {
    // Ejecutar find con filter
    const { filter = {} } = query;
    
    results = await Model.find(filter).toArray();
  } else {
    throw new Error(`Operación no soportada: ${operation}`);
  }

  const improvements = await ptq.improvePrompt(query, prompt);


  return {
    query,
    results,
    columnTitles, 
    improvements
  };


}

app.get('/ping', (req, res) => {
  res.send('pong');
});

// Endpoint POST /promt
app.post('/prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Received prompt:', prompt);
    if (!prompt) {
      return res.status(400).json({
        error: 'El parámetro "prompt" es requerido en el body'
      });
    }

    const data = await main(prompt);

    return res.json({
      success: true,
      query: data.query,
      results: data.results,
      columnTitles: data.columnTitles,
      improvements: data.improvements
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Iniciar servidor
async function startServer() {
  try {
    // Conectar a MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
      console.log(`Endpoint disponible: POST http://localhost:${PORT}/promt`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();