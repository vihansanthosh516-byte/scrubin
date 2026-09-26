from fastapi.testclient import TestClient

from scrubin_engine.api.app import app


def test_create_case_and_play_over_websocket():
    with TestClient(app) as client:
        assert client.get("/engine/health").json()["ok"]
        r = client.post("/engine/cases", json={"scenario": "appendectomy", "role": "anesthesia", "seed": 11}).json()
        cid = r["case_id"]
        assert r["patient"]["name"] == "Marcus T."
        assert "hidden" not in r["patient"]
        with client.websocket_connect(f"/engine/cases/{cid}/ws") as ws:
            first = ws.receive_json()
            assert first["type"] == "state" and first["paused"] is True
            ws.send_json({"type": "utterance", "text": "put on standard monitors and preoxygenate", "ref": 1})
            got_parse = None
            for _ in range(10):
                m = ws.receive_json()
                if m["type"] == "parsed":
                    got_parse = m
                    break
            assert got_parse and got_parse["result"]["ok"]
            assert [a["type"] for a in got_parse["result"]["actions"]][:1] == ["monitor"]
        state = client.get(f"/engine/cases/{cid}/state").json()
        assert "ecg" in state["monitor"]["attached"]
        d = client.get(f"/engine/cases/{cid}/debrief").json()
        assert d["role"] == "anesthesia" and "items" in d
        log = client.get(f"/engine/cases/{cid}/log").json()
        assert log["seed"] == 11 and log["log"]
