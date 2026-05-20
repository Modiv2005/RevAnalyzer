import pytest

def test_conversational_bi_chatbot(client, analyst_token):
    # 1. Generate demo dataset to ensure context is populated
    gen_res = client.post(
        "/api/v1/datasets/demo",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert gen_res.status_code == 201
    dataset_id = gen_res.json()["id"]

    # 2. Query AI Chatbot
    req_body = {
        "message": "What is our predicted revenue trend?",
        "session_id": "test_session_123",
        "dataset_id": dataset_id
    }
    
    chat_res = client.post(
        "/api/v1/chat",
        headers={"Authorization": f"Bearer {analyst_token}"},
        json=req_body
    )
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert data["session_id"] == "test_session_123"
    assert data["query"] == "What is our predicted revenue trend?"
    assert "answer" in data
    assert "context_used" in data
    
    # 3. Retrieve chat history transcript
    hist_res = client.get(
        "/api/v1/chat/history/test_session_123",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert hist_res.status_code == 200
    history = hist_res.json()
    # Should have 2 messages (1 user prompt + 1 AI response)
    assert len(history) == 2
    assert history[0]["sender"] == "user"
    assert history[0]["message"] == "What is our predicted revenue trend?"
    assert history[1]["sender"] == "ai"
