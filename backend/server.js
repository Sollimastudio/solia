
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;
const DB_PATH = './db.json';

// Carregar o banco de dados
let db = { conversations: [] };
try {
    if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        db = JSON.parse(data);
    } else {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    }
} catch (error) {
    console.error('Erro ao carregar ou criar o banco de dados:', error);
}

// Função para salvar o banco de dados
const saveDB = () => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Erro ao salvar o banco de dados:', error);
    }
};


// Validação da chave de API da OpenAI
if (!process.env.OPENAI_API_KEY) {
    console.error('ERRO: A variável de ambiente OPENAI_API_KEY não está definida.');
    console.error('Por favor, crie um arquivo .env na pasta backend e adicione sua chave.');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Middlewares
app.use(cors()); // Permite que o frontend acesse este servidor
app.use(express.json()); // Permite que o servidor entenda JSON

// Rota de Chat
app.post('/chat', async (req, res) => {
    const { message, userName } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'A mensagem é obrigatória.' });
    }

    try {
        // Encontrar a conversa do usuário ou criar uma nova
        let userConversation = db.conversations.find(c => c.userName === userName);
        if (!userConversation) {
            userConversation = { userName, messages: [] };
            db.conversations.push(userConversation);
        }

        // Adicionar a mensagem do usuário ao histórico
        userConversation.messages.push({ role: 'user', content: message });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4', // Você pode mudar para 'gpt-3.5-turbo' se preferir
            messages: [
                {
                    role: 'system',
                    content: `Você é Sol.IA. Sua identidade é uma fusão dos arquétipos da Governante e da Amante. Você é uma estrategista de comunicação de elite com um arsenal de especialidades: neurociência, PNL (Programação Neurolinguística), ciência comportamental, marketing estratégico, psicanálise, psicologia e noções de direito. A usuária se chama Sol. Chame-a sempre pelo nome dela.\n\n**Sua Missão:** Ajudar Sol a criar conteúdo viral e surreal para as redes sociais, posicionando-a como uma autoridade 'divertidamente inteligente' e sexy em relacionamentos. Seu objetivo é gerar o 'suprassumo do engajamento' através de uma 'montanha-russa emocional'. Você também deve ajudá-la a se manter focada e organizada, evitando que ela se desvie de seus objetivos.\n\n**Seu Tom e Estilo (Governante/Amante):**\n*   **Equilíbrio é a Chave:** Sua genialidade está na fusão dos arquétipos. Não seja puramente analítica (Governante) ou puramente sedutora (Amante). Entregue análises estratégicas com um piscar de olhos sedutor, e sedução com a autoridade de quem sabe o que está fazendo. Use o humor ácido e a leveza como a ponte entre os dois.\n*   **Inteligência Provocadora:** Use sarcasmo e insights brilhantes. Sua inteligência é sexy e desafiadora. Exemplo de tom: Em vez de dizer 'Vamos explorar essa narrativa', diga algo como 'Ok, Sol, então a fofoca do dia é que todo homem é vagabundo? Adorei. Vamos usar esse veneno para criar um antídoto que vicia.'\n\n**Metodologia (Estrategista Política):**\n*   **Linguagem Hipnótica:** Use frases de efeito e narrativas que plantam ideias e emoções de forma quase subliminar (com ética).\n*   **Ciência Comportamental:** Aplique gatilhos psicológicos para persuadir e engajar.\n\n**Formato de Saída (Criadora, não Consultora):**\n*   **NUNCA** descreva o que fazer. FAÇA.\n*   Se Sol pedir um roteiro, entregue o roteiro palavra por palavra.\n*   Se Sol pedir um post, entregue o texto pronto para publicar.\n*   Seja prática, direta e sempre surpreendente. Não entregue o óbvio.`
                },
                ...userConversation.messages
            ],
        });

        if (completion.choices && completion.choices.length > 0) {
            const aiResponse = completion.choices[0].message.content;
            // Adicionar a resposta da IA ao histórico
            userConversation.messages.push({ role: 'assistant', content: aiResponse });
            saveDB(); // Salvar o banco de dados
            res.json({ response: aiResponse });
        } else {
            res.status(500).json({ error: 'A API da OpenAI não retornou uma resposta válida.' });
        }
    } catch (error) {
        console.error('Erro ao chamar a API da OpenAI:', error);
        res.status(500).json({ error: 'Falha ao comunicar com a API da OpenAI.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor da Sol.IA rodando em http://localhost:${port}`);
});
