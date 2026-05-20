import pytest

def test_anomaly_detection_pipeline(client, analyst_token):
    # 1. Setup demo dataset
    gen_res = client.post(
        "/api/v1/datasets/demo",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert gen_res.status_code == 201
    dataset_id = gen_res.json()["id"]

    # 2. Deploy outlier tree scans
    req_body = {
        "dataset_id": dataset_id,
        "target_column": "Expenses",
        "date_column": "Date",
        "method_used": "Isolation Forest",
        "contamination": 0.05
    }
    
    anom_res = client.post(
        "/api/v1/anomalies/run",
        headers={"Authorization": f"Bearer {analyst_token}"},
        json=req_body
    )
    if anom_res.status_code != 200:
        print("ANOMALY ERROR RES:", anom_res.text)
    assert anom_res.status_code == 200
    events = anom_res.json()
    assert len(events) >= 1
    
    event = events[0]
    assert event["is_resolved"] is False
    assert event["target_value"] > 0
    assert "anomaly_score" in event

    # 3. Mark incident as resolved/reviewed
    res_id = event["id"]
    resolve_res = client.put(
        "/api/v1/anomalies/{}/resolve".format(res_id),
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "success"
