const express = require('express');
const cors = require('cors');
const { containerBootstrap } = require('@nlpjs/core');
const { Nlp } = require('@nlpjs/nlp');
const { LangPt } = require('@nlpjs/lang-pt');

const greetings = require('./intents/greetings.json');

const api = express();

api.use(cors());
api.use(express.json());

let lastIntent = '';

api.post('/', async (request, response) => {
	const {message} = request.body;

	const container = await containerBootstrap();
	container.use(Nlp);
	container.use(LangPt);
	const nlp = container.get('nlp');
	nlp.settings.autoSave = false;
	nlp.addLanguage('pt');
	await nlp.addCorpus(greetings);

	await nlp.train();

	const nlpResponse = await nlp.process('pt', message);

	
	const {answer, intent, answers} = nlpResponse
	
	const {opts: options} = answers.find(item => item.answer === answer);

	const botResponse = {
		answer: answer || 'Desculpe, não entendi.',
		intent: intent === "None" ? 'naoentendi' :  intent,
		lastIntent,
		options
	}

	lastIntent = botResponse.intent;

	return response.json(botResponse)
});

api.listen(4000, () => { console.log ('Bot has been started on port 4000!')})