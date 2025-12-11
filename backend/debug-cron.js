
const cronParser = require('cron-parser');
console.log('Type:', typeof cronParser);
console.log('Keys:', Object.keys(cronParser));
console.log('Is Function?', typeof cronParser === 'function');
try {
    if (cronParser.parseExpression) {
        console.log('Found parseExpression');
    } else {
        console.log('Missing parseExpression');
    }
} catch (e) {
    console.error(e);
}
