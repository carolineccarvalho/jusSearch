# JusSearch

![Logo Jus Search](./site.jpeg)

## Como rodar o código

Rode python script.py no terminal. É requerido que possua o pip instalado na máquina, pois o script instalará todas as dependências.

## Decisões de implementação

Para percorrer as 20 sugestões oferecidas, deve-se utilizar a seta para baixo. Ao utilizar o scroll do mouse, será percorrido somente as 10 opções visiveis.

## Explicação da solução

## 1. Sugestões só aparecem após o usuário digitar pelo menos 4 caracteres

### Como foi feito:

- No frontend (React), no `useEffect` que escuta a digitação (`query`), foi adicionado:

```js
if (query.length < 4) {
  setSuggestions([]);
  setHighlightedIndex(-1);
  setVisibleStart(0);
  return;
}
```

### Como funciona?

- Define as sugestões como vazia, para não mostrar nenhuma.
- Define que o indice de destaque é -1
- Define que o indice inicial da lista visivel é 0

---

## 2. Não exibir nenhum elemento de autocomplete se não houver sugestões

### Como foi feito:

- No frontend, no trecho onde renderiza a `<ul>` das sugestões, só renderiza se:

```js
{query.length >= 4 && visibleSuggestions.length > 0 && (
  <ul>...</ul>
)}
```

### Como funciona?

- Garante que nenhuma lista apareça quando não há sugestões. Ou seja, se visibleSuggestions.length igual a zero.
- Só aparecerá se o texto digitado for maior que 4.

---

## 3. Backend retorna no máximo 20 sugestões, mas só 10 aparecem inicialmente

### Como foi feito:

- No backend Flask + GraphQL, colocamos um limite de 20 sugestões ao montar a lista final.

```python
if len(ans) == 20:
    break
```

- No frontend React, usamos:

```js
const visibleSuggestions = suggestions.slice(visibleStart, visibleStart + 10);
```

### Como funciona?

- Em python, é realizado a limitação após a request
- Em javascript é realizado o controle do tamanho através do slice
- Garante boa UX sem poluir a tela com uma lista gigante.

---

## 4. Negrito só na parte inicial que corresponde ao termo digitado (prefix match)

### Como foi feito:

```js
const highlightMatch = (text, query) => {
  if (text.toLowerCase().startsWith(query.toLowerCase())) {
    const prefix = text.slice(0, query.length);
    const rest = text.slice(query.length);
    return `<strong>${prefix}</strong>${rest}`;
  }
  return text;
};
```

E usamos `dangerouslySetInnerHTML` para renderizar o HTML com o `<strong>`.

### Como funciona?

- A função verifica se o texto da sugestão começa com o termo digitado, ignorando diferenças entre maiúsculas e minúsculas.
- strong deixa o prefixo em negrito

---

## 5. Destaque ao passar o mouse (hover) ou tocar (mobile)

### Como foi feito:

- Cada `<li>` da lista tem:

```js
style={{
  padding: '6px 10px',
  backgroundColor: isHighlighted ? '#f0f0f0' : 'transparent',
  cursor: 'pointer',
  borderRadius: '5px'
}}
```

E o elemento a ser destacado é controlado por `highlightedIndex`:

```js
onMouseEnter={() => setHighlightedIndex(absoluteIndex)}
onTouchStart={() => setHighlightedIndex(absoluteIndex)}
```

### Como funciona?

- Define qual o cursor para esses elementos
- Ao tocar ou passar o mouse, seu indice é definido como o que será destacado

---

## 6. Sugestões mudam dinamicamente enquanto o usuário digita

### Como foi feito:

- O React `useEffect` escuta alterações na variável `query`.
- A cada alteração, o frontend faz uma nova consulta GraphQL.

```js
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchSuggestions();
  }, 10);
  return () => clearTimeout(delayDebounce);
}, [query]);
```

### Como funciona?

- Evita excesso de requisições.
- Mas é rápido por ser apenas 10ms

---

## 7. Sugestões são exibidas rapidamente ao digitar (minimizando lentidão)

### Como foi feito:

- **Debounce de 10ms** para reduzir chamadas excessivas.

### Como funciona?

- O valor baixo é para aparecer rapidamente após digitar

---

## 8. Ao clicar em uma sugestão, o campo de busca é preenchido

### Como foi feito:

```js
onClick={() => setQuery(sug)}
```

### Como funciona?

- Atualiza o estado da query

---

## O que não deu certo

Tentei utilizar o GraphQl interno do flask, mas por algum motivo, ele não compilava no meu ambiente Mac OS 12. Utilizei alguns fóruns, mas por fim, escolhi o Ariadne que se adequou bem ao sistema operacional.

## Tecnologias usadas:


| Camada        | Tecnologia                                                     |
| ------------- | -------------------------------------------------------------- |
| Frontend      | ReactJS                                                        |
| Backend       | Flask + Ariadne (GraphQL) + Google Suggest API (HTTP requests) |
| Comunicação | GraphQL POST requests                                          |

### Por que utilizei essas?

- ReactJS: solicitado no enunciado do desafio
- Flask: rápido de configurar e de aprender
- Ariadne: obteve um comportamento melhor com o mac os 12
- Google Suggest API: já possui um algoritmo próprio otimizado e treinado com bilhões de buscas. Isso evita ter que criar um dataset manual de sugestões.

### Como fiz as sugestões?

O Google Suggest API possui limite de resultados a cada consulta, por isso era necessário garantir que houvesse 20 consultas, então, manualmente eu concatenei as 26 letras do alfabeto mais o espaço e realizei consultas até ter uma lista de tamanho 20.

```python
ans = []
    listSuffix = [' ','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

    for suffix in listSuffix:
        q = query + suffix
        try:
            response = requests.get(f'http://google.com/complete/search?client=chrome&q={q}', timeout=1)
            suggestions = json.loads(response.text)[1]
            for completion in suggestions:
                if completion not in ans:
                    ans.append(completion)
                    if len(ans) == 20:
                        break
        except Exception:
            continue
        if len(ans) == 20:
            break
```
