// Check which Gemini models are available for your API key
import dotenv from 'dotenv'

dotenv.config()

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('GEMINI_API_KEY not found in .env file')
  process.exit(1)
}

console.log('Checking available Gemini models for your API key...\n')

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(response => response.json())
  .then(data => {
    if (data.models && data.models.length > 0) {
      console.log('Available models:\n')
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`)
      })
      console.log('\nUse the first model name (without "models/") in your code')
      console.log(`   Example: genAI.getGenerativeModel({ model: "${data.models[0].name.split('/')[1]}" })`)
    } else {
      console.log('No models found. Check if your API key is valid.')
    }
  })
  .catch(error => {
    console.error('Error:', error.message)
  })
