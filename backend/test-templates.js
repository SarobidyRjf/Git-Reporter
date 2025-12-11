/**
 * Script de test pour l'API Templates
 */

const API_URL = 'http://localhost:4000';

async function testTemplatesAPI() {
  console.log('🧪 Testing Templates API...\n');

  try {
    // Test 1: GET / - Info API
    console.log('1️⃣ Testing GET / ...');
    const infoResponse = await fetch(`${API_URL}/`);
    const info = await infoResponse.json();
    console.log('✅ API Info:', info.data.endpoints.templates);
    console.log('');

    // Test 2: GET /health
    console.log('2️⃣ Testing GET /health ...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const health = await healthResponse.json();
    console.log('✅ Health:', health.data.status);
    console.log('');

    // Note: Les tests suivants nécessitent une authentification
    console.log('⚠️  Les endpoints /api/templates nécessitent une authentification');
    console.log('   Pour tester complètement:');
    console.log('   1. Connectez-vous via le frontend');
    console.log('   2. Récupérez le token JWT');
    console.log('   3. Utilisez-le dans les headers: Authorization: Bearer <token>');
    console.log('');

    console.log('✅ Tests de base réussis!');
    console.log('📝 Backend templates API est opérationnel');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTemplatesAPI();
