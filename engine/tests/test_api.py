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


def test_cases_persist_resume_and_replay_exactly():
    from scrubin_engine.api import app as api

    with TestClient(app) as client:
        r = client.post("/engine/cases", json={"scenario": "appendectomy", "role": "anesthesia", "seed": 5, "user_id": "u1"}).json()
        cid = r["case_id"]
        s = api.store.get(cid)
        for text in ["standard monitors", "preoxygenate"]:
            client.post(f"/engine/cases/{cid}/utterance", json={"text": text})
        s.case.run(90)
        client.post(f"/engine/cases/{cid}/action", json={"type": "drug", "drug": "propofol", "dose": 150})
        s.case.run(60)
        live_truth = s.case.truth()
        live_comms = [(c["from"], c["text"]) for c in s.case.comms]
        s.persist()

        rows = client.get("/engine/users/u1/cases").json()
        assert rows and rows[0]["id"] == cid and rows[0]["scenario_name"] == "Laparoscopic Appendectomy"

        # Drop the live session: resume must rebuild the identical case from the log.
        api.store.sessions.pop(cid).task.cancel()
        info = client.post(f"/engine/cases/{cid}/resume").json()
        assert info["t"] == s.case.t
        rebuilt = api.store.get(cid).case
        assert rebuilt.truth() == live_truth
        assert [(c["from"], c["text"]) for c in rebuilt.comms] == live_comms  # includes the trainee's words

        rep = client.get(f"/engine/cases/{cid}/replay?every_s=5").json()
        assert len(rep["frames"]) >= 30 and rep["frames"][-1]["monitor"]["attached"]
        assert any(m["kind"] == "trainee" for f in rep["frames"] for m in f["comms"])

        assert client.delete(f"/engine/cases/{cid}").json()["ok"]
        assert client.get("/engine/users/u1/cases").json() == []
