import urllib.request
import json

def test_api():
    print("Testing /health ...")
    with urllib.request.urlopen("http://127.0.0.1:8000/health") as response:
        health = json.loads(response.read().decode())
        print(f"Health Status: {health.get('status')}, Version: {health.get('version')}")

    print("\nTesting /api/v1/organizations/ ...")
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/organizations/") as response:
        orgs = json.loads(response.read().decode())
        print(f"Total Organizations Seeded: {len(orgs)}")
        for o in orgs:
            print(f" - {o['name']} ({o['category']}) | Available: {o['weekly_available_hours']} hrs/wk | Trust: {o['trust_score']}%")

    print("\nTesting /api/v1/matching/matches ...")
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/matching/matches?exploration_boost=true") as response:
        matches = json.loads(response.read().decode())
        print(f"Tenant: {matches['tenant_name']}")
        print(f"Total Candidates: {matches['total_candidates']}")
        for c in matches["candidates"]:
            scores = c["scores"]
            print(f" * {c['name']} -> S(A, B): {scores['composite']}% [C:{scores['skill_complementarity']}%, G:{scores['goal_alignment']}%, R:{scores['resource_availability']}%, T:{scores['verification_trust']}%]")

    print("\nTesting /api/v1/exchange/items ...")
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/exchange/items") as response:
        items = json.loads(response.read().decode())
        print(f"Total Equipment Items: {len(items)}")
        for it in items:
            print(f" # {it['title']} ({it['category']}) @ {it['lab_name']}")

    print("\nTesting /api/v1/charters/ ...")
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/charters/") as response:
        charters = json.loads(response.read().decode())
        print(f"Total Active Charters: {len(charters)}")
        for ch in charters:
            print(f" $ Charter: {ch['title']} [Status: {ch['status']}]")
            print(f"   Participants: {len(ch['participants'])}, Milestones: {len(ch['milestones'])}")

if __name__ == "__main__":
    test_api()
