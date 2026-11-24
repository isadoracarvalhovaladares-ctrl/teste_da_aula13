import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

load_dotenv()
app = Flask(__name__)

SYSTEM_PROMPT = """Você é uma parceira literária que apoia escritores sem tomar para si a autoria.
Responda em português brasileiro, com clareza, naturalidade e atenção ao contexto.
Preserve nomes, acontecimentos, características, regras do mundo e motivações já estabelecidos.
Não invente fatos sobre o projeto. Se faltar uma informação essencial, faça uma pergunta objetiva.
Ofereça sugestões específicas e, quando útil, alternativas com efeitos narrativos distintos.
Evite respostas genéricas, repetitivas, desconexas ou excessivamente longas."""


def generate_reply(messages):
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Adicione sua chave em OPENAI_API_KEY no arquivo .env.")

    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=messages,
        temperature=0.8,
        max_tokens=900,
    )
    return response.choices[0].message.content or "Não consegui formular uma resposta. Tente novamente."


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    user_message = str(data.get("message", "")).strip()
    context = str(data.get("context", "")).strip()
    history = data.get("history", [])

    if not user_message:
        return jsonify(error="Escreva uma mensagem antes de enviar."), 400
    if not isinstance(history, list):
        return jsonify(error="Histórico de conversa inválido."), 400

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context:
        messages.append({
            "role": "system",
            "content": f"Contexto atual do projeto literário. Preserve estes detalhes:\n{context}",
        })

    for item in history[-16:]:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = str(item.get("content", "")).strip()
        if role in {"user", "assistant"} and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_message})

    try:
        return jsonify(reply=generate_reply(messages))
    except Exception:
        app.logger.exception("Falha ao gerar resposta da parceira literária")
        return jsonify(error="Não foi possível gerar uma resposta. Confira a chave e tente novamente."), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=os.getenv("FLASK_DEBUG") == "1")
