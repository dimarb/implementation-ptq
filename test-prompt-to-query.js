const { PromptToQuery } = require('prompt-to-query');
const path = require('path');

async function test() {
  console.log('🧪 Probando prompt-to-query SDK...\n');

  // Check if API key is available
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('❌ No se encontró API key');
    console.log('   Configura OPENAI_API_KEY o ANTHROPIC_API_KEY\n');
    console.log('Ejemplo:');
    console.log('  export OPENAI_API_KEY="sk-..."');
    console.log('  node test-prompt-to-query.js\n');
    process.exit(1);
  }

  const llmProvider = process.env.OPENAI_API_KEY ? 'openai' : 'anthropic';
  console.log(`📡 Usando ${llmProvider}\n`);

  try {
    // Initialize SDK
    console.log('1️⃣  Inicializando SDK...');
    const ptq = new PromptToQuery({
      llmProvider,
      apiKey,
      dbSchemaPath: path.join(__dirname, 'examples', 'schema.json')
    });
    console.log('   ✅ SDK inicializado correctamente');
    console.log(`   Version: ${ptq.getVersion()}\n`);

    // Test query generation
    console.log('2️⃣  Generando query...');
    const prompt = 'Get all active users';
    console.log(`   Prompt: "${prompt}"`);

    const query = await ptq.generateQuery(prompt);
    console.log('   ✅ Query generada:');
    console.log('   ' + JSON.stringify(query, null, 2).split('\n').join('\n   '));

    console.log('\n✅ Todos los tests pasaron correctamente!\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

test().catch(console.error);
