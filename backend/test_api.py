import urllib.request, urllib.error, json, time

BASE = "http://localhost:8000"
results = []

def api(label, url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req)
        result = json.loads(r.read())
        results.append(("OK", label))
        return result
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:150]
        results.append(("ERR", label + " -> HTTP " + str(e.code) + ": " + err))
        return None

# Health check
api("Health", BASE + "/health")

# Login demo account
login = api("Login", BASE + "/api/auth/login", "POST", {"email":"demo@career.com","password":"demo123"})
token = login.get("access_token") if login else None
user = login.get("user") if login else None
print("User:", user)

if token:
    # Profile
    api("Get Profile", BASE + "/api/profile", token=token)
    
    # Skills
    user_skills = api("Get User Skills", BASE + "/api/user-skills", token=token)
    print("User skills count:", len(user_skills) if user_skills else 0)
    
    # Career goal
    goal = api("Get Career Goal", BASE + "/api/career-goal", token=token)
    print("Career goal:", goal.get("career", {}).get("career_name") if goal else "None")
    
    # Skill gap analysis
    gap = api("Skill Gap Analyze", BASE + "/api/skill-gap/analyze", "POST", None, token)
    if gap:
        print("Match %:", gap.get("match_percentage"))
        print("Gaps count:", len(gap.get("gaps", [])))
    
    # Skill gap summary (dashboard)
    summary = api("Skill Gap Summary", BASE + "/api/skill-gap/summary", token=token)
    if summary:
        print("Summary gaps:", len(summary.get("gaps", [])))
    
    # Generate roadmap
    rm = api("Generate Roadmap", BASE + "/api/roadmap/generate", "POST", None, token)
    if rm:
        print("Roadmap items:", len(rm.get("items", [])))
    
    # Get roadmap progress
    prog = api("Roadmap Progress", BASE + "/api/roadmap/progress", token=token)
    if prog:
        print("Completion:", prog.get("completion_pct"), "%")
    
    # Career monitoring
    mon = api("Career Monitor Update", BASE + "/api/career-monitoring/update", "POST", None, token)
    if mon:
        print("Feasibility:", mon.get("feasibility_status") if isinstance(mon, dict) else "ok")
    
    # Career recovery
    rec = api("Career Recovery Analyze", BASE + "/api/career-recovery/analyze", "POST", {"include_interests":True}, token)
    if rec:
        alts = rec.get("alternatives", [])
        print("Alternatives found:", len(alts))
        if alts:
            top = alts[0]
            career = top.get("career", {})
            print("Top alternative:", career.get("career_name"))
            print("  Skill Reuse:", top.get("skill_reuse_score"), "%")
            print("  Recovery Score:", top.get("recovery_score"))
            print("  Est. months:", top.get("estimated_months"))
            print("  Reasoning:", top.get("reasoning"))
    
    # Transferable skills
    ts = api("Transferable Skills", BASE + "/api/career-recovery/transferable-skills", token=token)
    if ts:
        print("Transferable skills:", len(ts.get("transferable_skills", [])))
    
    # Recovery recommendations (cached)
    recs = api("Recovery Recommendations", BASE + "/api/career-recovery/recommendations", token=token)
    
    # Career comparison
    if goal and rec and rec.get("alternatives"):
        career_ids = [goal.get("career", {}).get("id"), rec["alternatives"][0]["career"]["id"]]
        comp = api("Career Compare", BASE + "/api/career-recovery/compare", "POST", {"career_ids": career_ids}, token)

print("\n=== RESULTS ===")
for status, label in results:
    print(f"[{status}] {label}")
