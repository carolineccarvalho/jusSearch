from flask import Flask, request, jsonify
from ariadne import QueryType, make_executable_schema, graphql_sync
from flask_cors import CORS
import json
import requests
import urllib.parse

app = Flask(__name__)
CORS(app)

type_defs = """
    type Suggestion {
        suggestions: [String]
    }

    type Query {
        autocomplete(query: String!): Suggestion
    }
"""

query = QueryType()

@query.field("autocomplete")
def resolve_autocomplete(_, info, query):
    if len(query) < 4:
        return {"suggestions": []}

    ans = []
    listSuffix = [' ','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']

    for suffix in listSuffix:
        q = query + suffix
        q_encoded = urllib.parse.quote(q)
        try:
            response = requests.get(f'http://google.com/complete/search?client=chrome&q={q_encoded}', timeout=1)
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

    return {"suggestions": ans}

schema = make_executable_schema(type_defs, query)

@app.route("/graphql", methods=["POST"])
def graphql_server():
    data = request.get_json()
    success, result = graphql_sync(
        schema,
        data,
        context_value=request,
        debug=True
    )
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
