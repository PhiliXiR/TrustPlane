from copy import deepcopy
from .models import RuntimeScenario

REPORTING_ACCESS = RuntimeScenario.model_validate({
    "id": "reporting-access",
    "label": "Grant access to reporting app",
    "request": {
        "title": "Grant access to reporting app",
        "state": "Paused at human approval before governed execution",
        "owner": "IAM Agent",
        "risk": "medium",
        "autonomyMode": "human-approved execution"
    },
    "trustModel": {
        "level": "Moderate",
        "currentBoundary": "Delegation mode: Human-approved execution · Execution mode: Prepared only",
        "delegationRule": "The runtime may prepare the tool call, but it may not issue any write action before human approval.",
        "downgradeRule": "If verification fails or the approval is denied, the workflow remains human-controlled and execution authority is removed."
    },
    "stages": [
        {"id": "submitted", "label": "Request Submitted", "status": "completed", "explanation": "The request entered the runtime with a known target application and a bounded entitlement ask.", "evidence": ["requestId=req_1042", "targetApp=Reporting", "requestedEntitlement=reporting.read"], "rule": "Requests with a clear system target may enter structured intake.", "next": "The intake agent normalizes the request into a governed runtime object."},
        {"id": "intake", "label": "Intake", "status": "completed", "explanation": "The intake agent extracted the target system, requested scope, and business intent into structured state.", "evidence": ["target app parsed from natural language", "business need matched to reporting use case", "request normalized into access_request schema"], "rule": "All downstream control logic depends on normalized request state.", "next": "Classification confirms workflow family and ownership lane."},
        {"id": "classification", "label": "Classification", "status": "completed", "explanation": "The orchestrator classified this as a standard access request with no exception language or escalation indicators.", "evidence": ["workflow=access_request", "confidence=high", "no exception keywords detected"], "rule": "Standard access requests can use versioned IAM playbooks.", "next": "The orchestrator selects the matching IAM playbook."},
        {"id": "playbook", "label": "IAM Playbook", "status": "completed", "explanation": "The runtime selected a governed playbook for analytics read access rather than allowing ad hoc tool use.", "evidence": ["playbook=analytics-read-standard", "version=1.4.2", "allowed tool envelope prepared"], "rule": "Known requests should bind to playbooks before any execution path is opened.", "next": "Policy check determines whether the playbook may proceed as prepared."},
        {"id": "policy", "label": "Policy Check", "status": "completed", "explanation": "Policy evaluation allowed the entitlement in principle but marked it approval-gated because the reporting dataset is governed.", "evidence": ["policyId=pol_reporting_sensitive_02", "requester role is within allowed population", "dataset sensitivity requires approval"], "rule": "Sensitive reporting access requires explicit human approval before runtime execution.", "next": "A human checkpoint pauses execution and waits for approval."},
        {"id": "approval", "label": "Approval Check", "status": "current", "explanation": "The workflow is paused at a trust boundary. The agent has prepared the intended action, but it is not allowed to issue the write until approval is granted.", "evidence": ["approver role=Reporting Data Owner", "prepared tool request is reversible", "execution envelope exists but is blocked"], "rule": "The system that decides must also expose where it is not allowed to continue alone.", "next": "If approved, the governed runtime can execute the prepared access-grant call."},
        {"id": "tool", "label": "Tool Execute", "status": "future", "explanation": "The runtime will execute the access grant through a governed tool interface, not by direct uncontrolled API action.", "evidence": ["tool=reporting-access.grant", "sandbox notes present", "write action currently blocked"], "rule": "Execution must happen through a governed runtime envelope.", "next": "Verification checks resulting access state against expected post-conditions."},
        {"id": "verification", "label": "Verification", "status": "future", "explanation": "Post-execution verification will confirm that the exact entitlement was granted and that no excess permission appeared.", "evidence": ["expected entitlement=reporting.read", "verification query prepared", "artifact template prepared"], "rule": "No governed write is complete until verification passes.", "next": "The runtime records evidence and closes the request."},
        {"id": "done", "label": "Done", "status": "future", "explanation": "The request completes only after execution, verification, and artifact recording are all present.", "evidence": ["completion artifact pending", "verification result pending"], "rule": "Evidence is part of completion, not an optional afterthought.", "next": "No next step."}
    ],
    "humanCheckpoints": [
        {"id": "hc1", "label": "Approval requested", "state": "completed", "detail": "The runtime sent an approval request to the Reporting Data Owner with the prepared action and policy reason."},
        {"id": "hc2", "label": "Human review pending", "state": "current", "detail": "A human approver can inspect the request, policy basis, and planned tool action before deciding."},
        {"id": "hc3", "label": "Execution authority granted", "state": "upcoming", "detail": "If approved, the system may cross the trust boundary and execute the prepared change."}
    ],
    "executionSteps": [
        {"id": "ex1", "label": "Read account state", "state": "completed", "detail": "Directory and reporting entitlements were read before any change path was prepared."},
        {"id": "ex2", "label": "Compare requested access", "state": "completed", "detail": "The runtime compared requested access against policy and current entitlements."},
        {"id": "ex3", "label": "Prepare governed tool call", "state": "current", "detail": "The access-grant request has been assembled but is blocked until approval clears execution."},
        {"id": "ex4", "label": "Verify resulting state", "state": "upcoming", "detail": "Verification will confirm the final entitlement state immediately after execution."},
        {"id": "ex5", "label": "Write audit artifact", "state": "upcoming", "detail": "An audit artifact will capture request basis, approval, execution, and verification outcome."}
    ],
    "timeline": [
        {"id": "t1", "time": "10:01", "title": "workflow.entered_queue", "detail": "Request created and entered the governed runtime intake queue.", "category": "request", "inspectionKey": "request"},
        {"id": "t2", "time": "10:01", "title": "workflow.classified", "detail": "Intake agent parsed target app: Reporting and normalized the request.", "category": "workflow", "inspectionKey": "request"},
        {"id": "t3", "time": "10:02", "title": "workflow.owner_assigned", "detail": "Assigned to IAM Agent under the access_request workflow family.", "category": "workflow", "inspectionKey": "playbook"},
        {"id": "t4", "time": "10:03", "title": "workflow.playbook_selected", "detail": "Playbook selected: analytics-read-standard.", "category": "workflow", "inspectionKey": "playbook"},
        {"id": "t5", "time": "10:03", "title": "policy.check.completed", "detail": "Policy evaluation allowed the entitlement but marked it approval-gated.", "category": "policy", "inspectionKey": "policy"},
        {"id": "t6", "time": "10:04", "title": "human.approval.requested", "detail": "Approval required by policy before the runtime may execute the prepared tool call.", "category": "human", "inspectionKey": "policy"},
        {"id": "t7", "time": "10:04", "title": "execution.change.prepared", "detail": "Governed tool request assembled and held behind the approval boundary.", "category": "tool", "inspectionKey": "tool"},
        {"id": "t8", "time": "10:05", "title": "verification.check.pending", "detail": "Verification and artifact recording are staged but cannot run until execution is allowed.", "category": "verification", "inspectionKey": "artifact"}
    ],
    "inspections": {
        "request": {"title": "Raw request JSON", "content": "{\n  \"requestId\": \"req_1042\",\n  \"workflow\": \"access_request\",\n  \"targetApp\": \"reporting\",\n  \"requestedEntitlement\": \"reporting.read\",\n  \"requester\": \"analyst@company\",\n  \"requesterRole\": \"analyst\",\n  \"businessReason\": \"weekly dashboard review\",\n  \"risk\": \"medium\"\n}"},
        "tool": {"title": "Raw tool request / response", "content": "{\n  \"tool\": \"reporting-access.grant\",\n  \"runtimeMode\": \"governed\",\n  \"status\": \"prepared_not_executed\",\n  \"input\": {\n    \"user\": \"analyst@company\",\n    \"entitlement\": \"reporting.read\"\n  },\n  \"response\": null,\n  \"blockedBy\": \"human.approval.required\"\n}"},
        "policy": {"title": "Policy metadata", "content": "{\n  \"policyId\": \"pol_reporting_sensitive_02\",\n  \"name\": \"Sensitive Reporting Dataset Approval\",\n  \"decision\": \"approval_required\",\n  \"requiredApprover\": \"Reporting Data Owner\",\n  \"delegationMode\": \"human_approved_execution\",\n  \"reason\": \"target dataset contains governed reporting information\"\n}"},
        "playbook": {"title": "Playbook version", "content": "{\n  \"playbook\": \"analytics-read-standard\",\n  \"version\": \"1.4.2\",\n  \"allowedTools\": [\"directory.lookup\", \"reporting-access.grant\", \"access.verify\"],\n  \"runtime\": \"governed-agent-runtime\",\n  \"sandboxMode\": \"write-blocked-until-approved\"\n}"},
        "artifact": {"title": "Artifact preview", "content": "{\n  \"artifactType\": \"access_change_record\",\n  \"status\": \"pending\",\n  \"willInclude\": [\n    \"request basis\",\n    \"policy decision\",\n    \"approval outcome\",\n    \"executed tool request\",\n    \"verification result\"\n  ]\n}"}
    },
    "playbook": {
        "name": "analytics-read-standard",
        "trigger": "Standard request for reporting read access",
        "preconditions": ["Target app is registered in the access catalog", "Requester role is recognized", "Requested entitlement is within approved reporting scope"],
        "allowedTools": ["reporting-access.grant", "directory.lookup", "access.verify"],
        "approvalRequirement": "Required for governed reporting datasets before any write action.",
        "rollback": "Remove entitlement, run verification again, and attach rollback artifact."
    }
})

VPN_POLICY = RuntimeScenario.model_validate({
    "id": "vpn-policy-change",
    "label": "Change VPN access policy",
    "request": {
        "title": "Change VPN access policy",
        "state": "Awaiting human execution of final risky step",
        "owner": "Network Agent",
        "risk": "high",
        "autonomyMode": "human-executed change"
    },
    "trustModel": {
        "level": "Moderate",
        "currentBoundary": "Delegation mode: Human-executed change · Execution mode: Human executed",
        "delegationRule": "The agent can model the change, prepare the exact API envelope, and stage verification, but execution authority does not cross into runtime control for this workflow.",
        "downgradeRule": "If verification fails or human review rejects the staged change, the workflow remains manual and the prepared envelope is invalidated."
    },
    "stages": [
        {"id": "submitted", "label": "Request Submitted", "status": "completed", "explanation": "A change request entered the runtime asking for a VPN policy update before the maintenance window.", "evidence": ["requestId=req_2088", "targetSystem=vpn-policy", "changeType=policy_update"], "rule": "Structured change requests can enter governed intake.", "next": "Intake normalizes the requested change."},
        {"id": "intake", "label": "Intake", "status": "completed", "explanation": "The runtime extracted target policy, requested change scope, and maintenance context into a controlled request object.", "evidence": ["maintenanceWindow=approved", "requestedScope=remote-access-policy", "change intent normalized"], "rule": "Infrastructure changes must be normalized before playbook selection.", "next": "Classification selects the infrastructure-change workflow family."},
        {"id": "classification", "label": "Classification", "status": "completed", "explanation": "The request was classified as a governed infrastructure change with a high-risk execution boundary.", "evidence": ["workflow=infrastructure_change", "risk=high", "target affects remote-access posture"], "rule": "Policy-affecting changes receive stronger execution controls than standard access grants.", "next": "A network playbook is selected."},
        {"id": "playbook", "label": "IAM Playbook", "status": "completed", "explanation": "A versioned network-policy playbook was selected to avoid uncontrolled, one-off execution.", "evidence": ["playbook=vpn-policy-standard-change", "version=0.9.8", "verification runbook attached"], "rule": "Risky policy changes must use playbook-backed envelopes and rollback paths.", "next": "Policy check validates whether the staged change can proceed to human execution."},
        {"id": "policy", "label": "Policy Check", "status": "completed", "explanation": "Policy review allowed the change to be staged, but the runtime cannot directly execute it because the workflow is classified as human-executed.", "evidence": ["executionMode=human_executed", "rollback path validated", "blast-radius note attached"], "rule": "High-risk infrastructure policy changes require human execution even when the agent has correctly prepared the action.", "next": "Approval and execution preparation remain visible to the operator."},
        {"id": "approval", "label": "Approval Check", "status": "completed", "explanation": "Human review has already approved the staged policy change for execution within the maintenance window.", "evidence": ["approver=Network Operations Lead", "approval status=granted", "window status=active"], "rule": "Approval alone does not grant execution authority to the runtime in this workflow class.", "next": "A human operator must execute the staged policy request."},
        {"id": "tool", "label": "Tool Execute", "status": "current", "explanation": "The runtime has prepared the exact policy-update envelope, but a human operator must issue the final change.", "evidence": ["tool=vpn-policy.update", "runtimeMode=prepared_for_human_execution", "rollback payload staged"], "rule": "The runtime may assist, but not act alone, for high-risk policy changes.", "next": "Verification will confirm policy convergence after human execution."},
        {"id": "verification", "label": "Verification", "status": "future", "explanation": "Verification will compare the resulting VPN policy against the staged desired state.", "evidence": ["verification query prepared", "expected policy hash staged"], "rule": "High-risk changes require immediate post-execution verification.", "next": "The runtime records the completed change artifact."},
        {"id": "done", "label": "Done", "status": "future", "explanation": "The request closes after human execution, verification, and artifact capture are all complete.", "evidence": ["artifact pending", "verification pending"], "rule": "Completion requires evidence and verified convergence.", "next": "No next step."}
    ],
    "humanCheckpoints": [
        {"id": "hc1", "label": "Approval granted", "state": "completed", "detail": "Network Operations Lead approved the staged policy change for the current maintenance window."},
        {"id": "hc2", "label": "Human execution required", "state": "current", "detail": "A human operator must execute the final VPN policy update using the staged runtime envelope."},
        {"id": "hc3", "label": "Verification reviewed", "state": "upcoming", "detail": "After execution, a human can compare the verification result against the staged expected policy state."}
    ],
    "executionSteps": [
        {"id": "ex1", "label": "Read current VPN policy", "state": "completed", "detail": "The runtime read the current policy state and captured the baseline configuration."},
        {"id": "ex2", "label": "Prepare policy diff", "state": "completed", "detail": "The runtime generated a bounded diff and validated rollback payloads."},
        {"id": "ex3", "label": "Stage governed tool envelope", "state": "completed", "detail": "The exact API envelope and rollback path were staged for human review."},
        {"id": "ex4", "label": "Await human execution", "state": "current", "detail": "Execution authority remains with a human operator for this workflow class."},
        {"id": "ex5", "label": "Verify resulting policy", "state": "upcoming", "detail": "Verification will compare final policy state to the approved desired policy diff."}
    ],
    "timeline": [
        {"id": "t1", "time": "18:20", "title": "workflow.entered_queue", "detail": "Infrastructure change request created and queued for governed intake.", "category": "request", "inspectionKey": "request"},
        {"id": "t2", "time": "18:21", "title": "workflow.classified", "detail": "Request classified as infrastructure_change with high-risk execution boundaries.", "category": "workflow", "inspectionKey": "request"},
        {"id": "t3", "time": "18:22", "title": "workflow.playbook_selected", "detail": "Playbook selected: vpn-policy-standard-change.", "category": "workflow", "inspectionKey": "playbook"},
        {"id": "t4", "time": "18:23", "title": "policy.check.completed", "detail": "Policy review allowed staging but required human execution of the final change.", "category": "policy", "inspectionKey": "policy"},
        {"id": "t5", "time": "18:24", "title": "human.approval.granted", "detail": "Network Operations Lead approved the staged change for the active maintenance window.", "category": "human", "inspectionKey": "policy"},
        {"id": "t6", "time": "18:25", "title": "human.execution.required", "detail": "The runtime prepared the governed tool request but paused before final execution.", "category": "human", "inspectionKey": "tool"},
        {"id": "t7", "time": "18:25", "title": "execution.change.prepared", "detail": "VPN policy update envelope and rollback payload staged for human operator use.", "category": "tool", "inspectionKey": "tool"},
        {"id": "t8", "time": "18:26", "title": "verification.check.pending", "detail": "Verification and artifact capture remain queued behind human execution.", "category": "verification", "inspectionKey": "artifact"}
    ],
    "inspections": {
        "request": {"title": "Raw request JSON", "content": "{\n  \"requestId\": \"req_2088\",\n  \"workflow\": \"infrastructure_change\",\n  \"targetSystem\": \"vpn-policy\",\n  \"changeType\": \"policy_update\",\n  \"requestedBy\": \"network-admin@company\",\n  \"maintenanceWindow\": \"active\",\n  \"risk\": \"high\"\n}"},
        "tool": {"title": "Raw tool request / response", "content": "{\n  \"tool\": \"vpn-policy.update\",\n  \"runtimeMode\": \"prepared_for_human_execution\",\n  \"input\": {\n    \"policyDiff\": \"...staged diff...\",\n    \"rollbackPayload\": \"...rollback envelope...\"\n  },\n  \"response\": null,\n  \"blockedBy\": \"human.execution.required\"\n}"},
        "policy": {"title": "Policy metadata", "content": "{\n  \"policyId\": \"pol_infra_high_risk_07\",\n  \"decision\": \"human_execution_required\",\n  \"requiredApprover\": \"Network Operations Lead\",\n  \"delegationMode\": \"human_executed_change\",\n  \"reason\": \"target workflow affects remote access posture\"\n}"},
        "playbook": {"title": "Playbook version", "content": "{\n  \"playbook\": \"vpn-policy-standard-change\",\n  \"version\": \"0.9.8\",\n  \"allowedTools\": [\"vpn-policy.read\", \"vpn-policy.update\", \"vpn-policy.verify\"],\n  \"runtime\": \"governed-agent-runtime\",\n  \"executionAuthority\": \"human_operator_only\"\n}"},
        "artifact": {"title": "Artifact preview", "content": "{\n  \"artifactType\": \"infrastructure_change_record\",\n  \"status\": \"pending\",\n  \"willInclude\": [\n    \"approved policy diff\",\n    \"human execution record\",\n    \"verification result\",\n    \"rollback reference\"\n  ]\n}"}
    },
    "playbook": {
        "name": "vpn-policy-standard-change",
        "trigger": "Standard VPN policy modification during approved maintenance window",
        "preconditions": ["Maintenance window is active", "Requested policy scope is bounded", "Rollback payload has been generated"],
        "allowedTools": ["vpn-policy.read", "vpn-policy.update", "vpn-policy.verify"],
        "approvalRequirement": "Approval required before execution staging. Human operator required for final change application.",
        "rollback": "Apply rollback payload, verify policy convergence, and attach rollback artifact."
    }
})

SCENARIOS = {
    REPORTING_ACCESS.id: REPORTING_ACCESS,
    VPN_POLICY.id: VPN_POLICY,
}


def get_scenario(scenario_id: str):
    base = SCENARIOS.get(scenario_id) or REPORTING_ACCESS
    return deepcopy(base)
