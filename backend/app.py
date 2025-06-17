# File: backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from model.recommender import recommend_movies_by_mood

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Movie Recommendation API is running!"

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    mood = data.get("mood", "")
    history = data.get("user_history_titles", [])
    top_n = data.get("top_n", 10)

    results = recommend_movies_by_mood(mood, history, top_n)
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)
