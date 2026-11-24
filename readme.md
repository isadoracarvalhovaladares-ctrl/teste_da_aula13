# Entrelinhas

Parceira literária em português, feita com Flask, HTML, CSS e JavaScript. O caderno de contexto e a conversa ficam salvos no navegador para preservar os detalhes do projeto entre visitas.

## Configuração

1. Instale Python 3.10 ou superior.
2. Instale as dependências:
	```powershell
	py -m pip install -r requirements.txt
	```
3. Informe sua chave da API no arquivo `.env`:
	```env
	OPENAI_API_KEY=sua-chave-aqui
	OPENAI_MODEL=gpt-4o-mini
	```
4. Inicie o servidor com `py app.py` e acesse `http://127.0.0.1:5000`.

O arquivo `.env` é ignorado pelo Git para que a chave não seja enviada ao repositório.