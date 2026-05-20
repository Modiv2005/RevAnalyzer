import pytest

def test_forecasting_pipeline(client, analyst_token):
    # 1. Setup active workspace dataset
    gen_res = client.post(
        "/api/v1/datasets/demo",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert gen_res.status_code == 201
    dataset_id = gen_res.json()["id"]

    # 2. Run statistical ARIMA forecast run
    req_body = {
        "dataset_id": dataset_id,
        "target_column": "Revenue",
        "date_column": "Date",
        "model_name": "ARIMA",
        "forecast_horizon": 6
    }
    
    fore_res = client.post(
        "/api/v1/forecasting/run",
        headers={"Authorization": f"Bearer {analyst_token}"},
        json=req_body
    )
    if fore_res.status_code != 200:
        print("FORECAST ERROR RES:", fore_res.text)
    assert fore_res.status_code == 200
    res_data = fore_res.json()
    assert res_data["target_column"] == "Revenue"
    assert res_data["model_name"] == "ARIMA"
    assert "metrics" in res_data
    assert "RMSE" in res_data["metrics"]
    
    # 6 projections + 36 history = 42 total items in prediction chart array!
    assert len(res_data["forecast_values"]) == 42
    
    # Assert confidence bounds exist
    ci_values = [v for v in res_data["forecast_values"] if v["predicted"] is not None]
    for val in ci_values:
        assert val["lower_ci"] is not None
        assert val["upper_ci"] is not None

    # 3. Verify history feeds
    hist_res = client.get(
        "/api/v1/forecasting/history/{}".format(dataset_id),
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert hist_res.status_code == 200
    assert len(hist_res.json()) >= 1
