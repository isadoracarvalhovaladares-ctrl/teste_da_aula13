# Entrelinhas

Parceira literária em português, feita com Flask, HTML, CSS e JavaScript. O caderno de contexto e a conversa ficam salvos no navegador para preservar os detalhes do projeto entre visitas.

## Configuração

1. Instale Python 3.10 ou superior.
2. Instale as dependências:
	```powershell
	py -m pip install -r requirements.txt
	```
3. Informe sua chave da Groq no arquivo `.env`:
	```env
	GROQ_API_KEY=sua-chave-aqui
	GROQ_MODEL=openai/gpt-oss-120b
	```
4. Inicie o servidor com `py app.py` e acesse `http://127.0.0.1:5000`.

O arquivo `.env` é ignorado pelo Git para que a chave não seja enviada ao repositório. Para compatibilidade, o servidor também aceita a chave em `OPENAI_API_KEY`.

## Pesquisa na web

Mensagens com a palavra `pesquise` ou pedidos sobre informações atuais, como notícias, preços, clima e resultados recentes, acionam a busca web. A resposta recebe os resultados como contexto e mostra links clicáveis para as fontes consultadas. A busca usa DDGS, com fallback entre mecanismos quando uma consulta não retorna resultados.