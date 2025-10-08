import 'dotenv/config';

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY was not found in your .env file.');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

  try {
    console.log('Fetching available models for your API key...');
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error while fetching models:', errorData);
      return;
    }

    const data = await response.json();
    
    console.log('\n--- Models supporting "generateContent" ---');
    let foundGenerativeModel = false;
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(model => {
        if (model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${model.name} (Display Name: ${model.displayName})`);
          foundGenerativeModel = true;
        }
      });
    }

    if (!foundGenerativeModel) {
        console.log('No models supporting "generateContent" were found for your API key.');
    }
    console.log('\n--------------------------------------------');


  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

listAvailableModels();