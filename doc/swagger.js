const swaggerAutogen = require('swagger-autogen')()
const outputFile = './swagger_output.json'
const endpointsFiles = ['../src/routes/streamHandler.js']
swaggerAutogen(outputFile, endpointsFiles)