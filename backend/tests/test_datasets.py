import pytest

def test_ledger_demo_generation(client, analyst_token):
    # Trigger dynamic mock ledger generation
    res = client.post(
        "/api/v1/datasets/demo",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["filename"] == "Enterprise_Revenue_Ledger.csv"
    assert data["row_count"] == 36
    assert data["col_count"] == 6

    # Check list datasets
    list_res = client.get(
        "/api/v1/datasets",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert list_res.status_code == 200
    datasets = list_res.json()
    assert len(datasets) == 1
    assert datasets[0]["id"] == data["id"]

def test_fetch_metadata_profile(client, analyst_token):
    # Generate demo first
    gen_res = client.post(
        "/api/v1/datasets/demo",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert gen_res.status_code == 201
    dataset_id = gen_res.json()["id"]

    # Fetch schema metadata
    meta_res = client.get(
        "/api/v1/datasets/{}/metadata".format(dataset_id),
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert meta_res.status_code == 200
    metadata = meta_res.json()
    assert len(metadata) == 6
    
    # Assert column types identified by ETL
    columns = [col["col_name"] for col in metadata]
    assert "Date" in columns
    assert "Revenue" in columns
    assert "Expenses" in columns
    
    date_col = next(c for c in metadata if c["col_name"] == "Date")
    assert date_col["data_type"] == "date"

    rev_col = next(c for c in metadata if c["col_name"] == "Revenue")
    assert rev_col["data_type"] == "numeric"
