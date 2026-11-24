import re

from ddgs import DDGS


_CURRENT_INFO_PATTERN = re.compile(
	r"\b(?:atual(?:izado|izada|mente)?|hoje|agora|recent(?:e|es)|"
	r"ultim[oa]s?|not[ií]cias?|cotac[aã]o|pre[cç]o|clima|tempo|"
	r"previs[aã]o|resultado|lan[cç]amento|agenda)\b",
	re.IGNORECASE,
)
_SEARCH_KEYWORD_PATTERN = re.compile(r"\bpesquise\b", re.IGNORECASE)


def deve_pesquisar(texto):
	return bool(_SEARCH_KEYWORD_PATTERN.search(texto) or _CURRENT_INFO_PATTERN.search(texto))


def buscar_na_web(consulta, limite=5):
	consulta = re.sub(
		r"^\s*pesquise(?:\s+na\s+web)?(?:\s+sobre)?\s*[:,\-]?\s*",
		"",
		consulta,
		flags=re.IGNORECASE,
	).strip()
	if not consulta:
		raise ValueError("Informe o que deseja pesquisar.")

	consulta_simplificada = re.sub(
		r"\b(?:de|da|do|das|dos|em|no|na|nos|nas|sobre|para|por|favor)\b",
		" ",
		consulta,
		flags=re.IGNORECASE,
	)
	consultas = list(dict.fromkeys((consulta, " ".join(consulta_simplificada.split()))))
	resultados = []
	ultimo_erro = None
	for backend in ("auto", "bing"):
		for termo in consultas:
			try:
				resultados = DDGS().text(
					termo,
					region="br-pt",
					safesearch="moderate",
					max_results=limite,
					backend=backend,
				)
				if resultados:
					break
			except Exception as exc:
				ultimo_erro = exc
		if resultados:
			break

	if not resultados and ultimo_erro:
		raise ultimo_erro

	fontes = []
	for resultado in resultados or []:
		url = resultado.get("href") or resultado.get("url")
		titulo = resultado.get("title")
		trecho = resultado.get("body") or resultado.get("snippet") or ""
		if url and titulo:
			fontes.append({"title": titulo, "url": url, "snippet": trecho})
	return fontes
