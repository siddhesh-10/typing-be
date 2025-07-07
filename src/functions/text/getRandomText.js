const { TextService } = require('../../services/text.js');

const textService = new TextService();

const getRandomTextHandler = async (event, context) => {
  console.log('getRandomText called with event:', JSON.stringify(event, null, 2));
  
  try {
    const { category, difficulty } = event.queryStringParameters || {};
    
    console.log('Parameters:', { category, difficulty });

    const text = await textService.getRandomText(category, difficulty);
    
    if (!text) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          message: 'No text found for the specified criteria'
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify(text)
    };
  } catch (error) {
    console.error('Error in getRandomText:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to get random text',
        message: error.message
      })
    };
  }
};

module.exports = { handler: getRandomTextHandler }; 