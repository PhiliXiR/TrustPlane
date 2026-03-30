from copy import deepcopy
from .models import RuntimeScenario, ScenarioOption

REPORTING_ACCESS = RuntimeScenario.model_validate({
    "id": "reporting-access",
    "label": "Grant access to reporting app",
    "request": {
        "title": "Grant access to reporting app",
        "state": "Paused at human approval before governed execution",
        "owner": "Access Operator",
        "risk": "medium",
        "autonomyMode": "human-approved execution"
    },
    "trustModel": {
        "level": "Moderate",
        "currentBoundary": "Delegation mode: Human-approved execution · Execution mode: Prepared only",
        "delegationRule": "The runtime may prepare the tool call, but it may not issue any write action before human approval.",
        "downgradeRule": "If verification fails or the approval is denied, the workflow remains human-controlled and execution authority is removed."
    },
    "operators": [
        {
            "agentId": "intake",
            "name": "Intake Bot",
            "kind": "intake-agent",
            "lane": "intake",
            "runtime": "nemoclaw",
            "workspace": "~/.openclaw/workspaces/intake-bot",
            "sessionType": "persistent",
            "authorityProfile": "clarify_and_route_only",
            "allowedSubstrates": ["openclaw-routing"],
            "status": "completed_handoff"
        },
        {
            "agentId": "access-operator",
            "name": "Access Operator",
            "kind": "operator-agent",
            "lane": "access",
            "runtime": "nemoclaw",
            "workspace": "~/.openclaw/workspaces/access-operator",
            "sessionType": "persistent",
            "authorityProfile": "bounded_access_changes",
            "allowedSubstrates": ["openclaw-tools", "openshell"],
            "status": "active"
        },
        {
            "agentId": "duty-operator",
            "name": "Duty Operator",
            "kind": "human-approver",
            "lane": "approval",
            "runtime": "nemoclaw",
            "workspace": None,
            "sessionType": "on-demand",
            "authorityProfile": "approval_and_override",
            "allowedSubstrates": ["trustplane-controls"],
            "status": "pending_approval"
        }
    ],
    "ownership": {
        "currentOwner": {
            "actorType": "operator-agent",
            "agentId": "access-operator",
            "name": "Access Operator",
            "lane": "access"
        },
        "previousOwner": {
            "actorType": "intake-agent",
            "agentId": "intake",
            "name": "Intake Bot",
            "lane": "intake"
        },
        "assignedAt": "10:02",
        "ownershipReason": "NemoClaw routing matched normalized access_request intake to the access lane and handed ownership to Access Operator."
    },
    "delegation": {
        "delegationMode": "automatic",
        "routingComponent": "nemoclaw-request-router",
        "selectedLane": "access",
        "selectedAgentId": "access-operator",
        "candidateLanes": ["access"],
        "rejectedLanes": ["endpoint", "change"],
        "reason": "The request is complete, the target system is reporting, and the workflow maps cleanly to the access operator lane.",
        "confidence": "high",
        "humanConfirmationRequired": False
    },
    "authorityBoundary": {
        "agentId": "access-operator",
        "authorityMode": "prepare_and_execute_with_approval",
        "mayClarify": False,
        "mayPrepare": True,
        "mayExecute": True,
        "mayApprove": False,
        "mayDelegate": False,
        "requiresHumanApprovalBeforeExecution": True,
        "separationOfDutiesRule": "Sensitive access requests cannot be self-approved by the owning operator agent."
    },
    "executionSubstrate": {
        "substrateId": "openclaw-tools",
        "substrateKind": "openclaw-tools",
        "displayName": "OpenClaw Governed Tools",
        "mode": "prepared_only_until_approval",
        "supportsStreaming": True,
        "supportsVerificationArtifacts": True
    },
    "stages": [
        {"id": "submitted", "label": "Request Submitted", "status": "completed", "explanation": "The request entered the runtime with a known target application and a bounded entitlement ask.", "evidence": ["requestId=req_1042", "targetApp=Reporting", "requestedEntitlement=reporting.read"], "rule": "Requests with a clear system target may enter structured intake.", "next": "The intake agent normalizes the request into a governed runtime object."},
        {"id": "intake", "label": "Intake", "status": "completed", "explanation": "The intake agent extracted the target system, requested scope, and business intent into structured state.", "evidence": ["target app parsed from natural language", "business need matched to reporting use case", "request normalized into access_request schema"], "rule": "All downstream control logic depends on normalized request state.", "next": "Classification confirms workflow family and ownership lane."},
        {"id": "classification", "label": "Classification", "status": "completed", "explanation": "The NemoClaw request router classified this as a standard access request and assigned the access operator lane.", "evidence": ["workflow=access_request", "confidence=high", "selectedLane=access"], "rule": "Standard access requests can use versioned IAM playbooks and automatic operator-lane assignment.", "next": "The orchestrator selects the matching IAM playbook."},
        {"id": "playbook", "label": "IAM Playbook", "status": "completed", "explanation": "The runtime selected a governed playbook for analytics read access rather than allowing ad hoc tool use.", "evidence": ["playbook=analytics-read-standard", "version=1.4.2", "allowed tool envelope prepared"], "rule": "Known requests should bind to playbooks before any execution path is opened.", "next": "Policy check determines whether the playbook may proceed as prepared."},
        {"id": "policy", "label": "Policy Check", "status": "completed", "explanation": "Policy evaluation allowed the entitlement in principle but marked it approval-gated because the reporting dataset is governed.", "evidence": ["policyId=pol_reporting_sensitive_02", "requester role is within allowed population", "dataset sensitivity requires approval"], "rule": "Sensitive reporting access requires explicit human approval before runtime execution.", "next": "A human checkpoint pauses execution and waits for approval."},
        {"id": "approval", "label": "Approval Check", "status": "current", "explanation": "The workflow is paused at a trust boundary. The access operator has prepared the intended action, but it is not allowed to issue the write until approval is granted.", "evidence": ["approver role=Reporting Data Owner", "prepared tool request is reversible", "execution envelope exists but is blocked"], "rule": "The system that decides must also expose where it is not allowed to continue alone.", "next": "If approved, the governed runtime can execute the prepared access-grant call."},
        {"id": "tool", "label": "Tool Execute", "status": "future", "explanation": "The access operator will execute the grant through a governed NemoClaw substrate rather than by uncontrolled direct API action.", "evidence": ["substrate=openclaw-tools", "tool=reporting-access.grant", "write action currently blocked"], "rule": "Execution must happen through a governed runtime envelope.", "next": "Verification checks resulting access state against expected post-conditions."},
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
        {"id": "t3", "time": "10:02", "title": "ownership.transferred", "detail": "NemoClaw transferred the request from Intake Bot to Access Operator after the routing layer selected the access lane.", "category": "workflow", "inspectionKey": "playbook"},
        {"id": "t4", "time": "10:03", "title": "workflow.playbook_selected", "detail": "Playbook selected: analytics-read-standard.", "category": "workflow", "inspectionKey": "playbook"},
        {"id": "t5", "time": "10:03", "title": "policy.check.completed", "detail": "Policy evaluation allowed the entitlement but marked it approval-gated.", "category": "policy", "inspectionKey": "policy"},
        {"id": "t6", "time": "10:04", "title": "human.approval.requested", "detail": "Approval required by policy before the runtime may execute the prepared tool call.", "category": "human", "inspectionKey": "policy"},
        {"id": "t7", "time": "10:04", "title": "execution.substrate.selected", "detail": "Execution substrate selected: OpenClaw Governed Tools for the access operator.", "category": "tool", "inspectionKey": "tool"},
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
        "state": "Awaiting operator-agent execution release",
        "owner": "Change Operator",
        "risk": "high",
        "autonomyMode": "operator-agent execution after approval"
    },
    "trustModel": {
        "level": "Moderate",
        "currentBoundary": "Delegation mode: Human-approved operator-agent execution · Execution mode: Prepared in OpenShell",
        "delegationRule": "The change operator may stage the exact change and rollback envelope, but it may not execute through OpenShell until approval releases authority.",
        "downgradeRule": "If verification fails or review rejects the staged change, the operator agent loses execution authority and the envelope is invalidated."
    },
    "operators": [
        {
            "agentId": "intake",
            "name": "Intake Bot",
            "kind": "intake-agent",
            "lane": "intake",
            "runtime": "nemoclaw",
            "workspace": "~/.openclaw/workspaces/intake-bot",
            "sessionType": "persistent",
            "authorityProfile": "clarify_and_route_only",
            "allowedSubstrates": ["openclaw-routing"],
            "status": "completed_handoff"
        },
        {
            "agentId": "change-operator",
            "name": "Change Operator",
            "kind": "operator-agent",
            "lane": "change",
            "runtime": "nemoclaw",
            "workspace": "~/.openclaw/workspaces/change-operator",
            "sessionType": "persistent",
            "authorityProfile": "prepare_high_risk_change_and_execute_after_release",
            "allowedSubstrates": ["openshell"],
            "status": "awaiting_execution_release"
        },
        {
            "agentId": "duty-operator",
            "name": "Duty Operator",
            "kind": "human-approver",
            "lane": "approval",
            "runtime": "nemoclaw",
            "workspace": None,
            "sessionType": "on-demand",
            "authorityProfile": "approval_and_override",
            "allowedSubstrates": ["trustplane-controls"],
            "status": "approved"
        }
    ],
    "ownership": {
        "currentOwner": {
            "actorType": "operator-agent",
            "agentId": "change-operator",
            "name": "Change Operator",
            "lane": "change"
        },
        "previousOwner": {
            "actorType": "intake-agent",
            "agentId": "intake",
            "name": "Intake Bot",
            "lane": "intake"
        },
        "assignedAt": "18:21",
        "ownershipReason": "NemoClaw routing matched the normalized infrastructure_change request to the change operator lane."
    },
    "delegation": {
        "delegationMode": "automatic",
        "routingComponent": "nemoclaw-request-router",
        "selectedLane": "change",
        "selectedAgentId": "change-operator",
        "candidateLanes": ["change"],
        "rejectedLanes": ["access", "endpoint"],
        "reason": "The target system is vpn-policy and the request implies a governed infrastructure change with rollback planning.",
        "confidence": "high",
        "humanConfirmationRequired": False
    },
    "authorityBoundary": {
        "agentId": "change-operator",
        "authorityMode": "prepare_then_execute_after_human_release",
        "mayClarify": False,
        "mayPrepare": True,
        "mayExecute": True,
        "mayApprove": False,
        "mayDelegate": False,
        "requiresHumanApprovalBeforeExecution": True,
        "separationOfDutiesRule": "High-risk policy changes require human approval before a change operator may execute through OpenShell."
    },
    "executionSubstrate": {
        "substrateId": "openshell",
        "substrateKind": "command-runtime",
        "displayName": "NVIDIA OpenShell",
        "mode": "prepared_for_operator_agent_execution",
        "supportsStreaming": True,
        "supportsVerificationArtifacts": True
    },
    "stages": [
        {"id": "submitted", "label": "Request Submitted", "status": "completed", "explanation": "A change request entered the runtime asking for a VPN policy update before the maintenance window.", "evidence": ["requestId=req_2088", "targetSystem=vpn-policy", "changeType=policy_update"], "rule": "Structured change requests can enter governed intake.", "next": "Intake normalizes the requested change."},
        {"id": "intake", "label": "Intake", "status": "completed", "explanation": "The intake agent extracted target policy, requested change scope, and maintenance context into a controlled request object.", "evidence": ["maintenanceWindow=approved", "requestedScope=remote-access-policy", "change intent normalized"], "rule": "Infrastructure changes must be normalized before playbook selection.", "next": "Classification selects the infrastructure-change workflow family."},
        {"id": "classification", "label": "Classification", "status": "completed", "explanation": "The NemoClaw routing layer classified this as a governed infrastructure change and assigned the change operator lane.", "evidence": ["workflow=infrastructure_change", "risk=high", "selectedLane=change"], "rule": "Policy-affecting changes receive stronger execution controls than standard access grants.", "next": "A network playbook is selected."},
        {"id": "playbook", "label": "IAM Playbook", "status": "completed", "explanation": "A versioned network-policy playbook was selected to avoid uncontrolled, one-off execution.", "evidence": ["playbook=vpn-policy-standard-change", "version=0.9.8", "verification runbook attached"], "rule": "Risky policy changes must use playbook-backed envelopes and rollback paths.", "next": "Policy check validates whether the staged change can proceed to operator-agent execution."},
        {"id": "policy", "label": "Policy Check", "status": "completed", "explanation": "Policy review allowed the change to be staged, but execution through OpenShell remains gated until approval releases authority to the change operator.", "evidence": ["executionMode=operator_agent_executed", "rollback path validated", "blast-radius note attached"], "rule": "High-risk infrastructure policy changes require explicit human release before operator-agent execution.", "next": "Approval and execution preparation remain visible to the operator."},
        {"id": "approval", "label": "Approval Check", "status": "completed", "explanation": "Human review has already approved the staged policy change for execution within the maintenance window.", "evidence": ["approver=Duty Operator", "approval status=granted", "window status=active"], "rule": "Approval releases authority to the change operator but does not remove verification requirements.", "next": "The change operator may execute the staged OpenShell command envelope."},
        {"id": "tool", "label": "Tool Execute", "status": "current", "explanation": "The change operator has prepared the exact policy-update envelope and can now execute it through OpenShell within the approved boundaries.", "evidence": ["substrate=openshell", "runtimeMode=prepared_for_operator_agent_execution", "rollback payload staged"], "rule": "The change operator may execute only within the prepared, approved envelope.", "next": "Verification will confirm policy convergence after operator-agent execution."},
        {"id": "verification", "label": "Verification", "status": "future", "explanation": "Verification will compare the resulting VPN policy against the staged desired state.", "evidence": ["verification query prepared", "expected policy hash staged"], "rule": "High-risk changes require immediate post-execution verification.", "next": "The runtime records the completed change artifact."},
        {"id": "done", "label": "Done", "status": "future", "explanation": "The request closes after operator-agent execution, verification, and artifact capture are all complete.", "evidence": ["artifact pending", "verification pending"], "rule": "Completion requires evidence and verified convergence.", "next": "No next step."}
    ],
    "humanCheckpoints": [
        {"id": "hc1", "label": "Approval granted", "state": "completed", "detail": "Duty Operator approved the staged policy change for the current maintenance window."},
        {"id": "hc2", "label": "Operator-agent execution released", "state": "current", "detail": "The change operator may now execute the final VPN policy update through OpenShell."},
        {"id": "hc3", "label": "Verification reviewed", "state": "upcoming", "detail": "After execution, a human can compare the verification result against the staged expected policy state."}
    ],
    "executionSteps": [
        {"id": "ex1", "label": "Read current VPN policy", "state": "completed", "detail": "The runtime read the current policy state and captured the baseline configuration."},
        {"id": "ex2", "label": "Prepare policy diff", "state": "completed", "detail": "The change operator generated a bounded diff and validated rollback payloads."},
        {"id": "ex3", "label": "Stage OpenShell envelope", "state": "completed", "detail": "The exact command envelope and rollback path were staged for operator-agent execution."},
        {"id": "ex4", "label": "Execute through OpenShell", "state": "current", "detail": "Execution authority is active for the change operator within the approved envelope."},
        {"id": "ex5", "label": "Verify resulting policy", "state": "upcoming", "detail": "Verification will compare final policy state to the approved desired policy diff."}
    ],
    "timeline": [
        {"id": "t1", "time": "18:20", "title": "workflow.entered_queue", "detail": "Infrastructure change request created and queued for governed intake.", "category": "request", "inspectionKey": "request"},
        {"id": "t2", "time": "18:21", "title": "ownership.transferred", "detail": "NemoClaw transferred the request from Intake Bot to Change Operator after routing matched the change lane.", "category": "workflow", "inspectionKey": "request"},
        {"id": "t3", "time": "18:22", "title": "workflow.playbook_selected", "detail": "Playbook selected: vpn-policy-standard-change.", "category": "workflow", "inspectionKey": "playbook"},
        {"id": "t4", "time": "18:23", "title": "policy.check.completed", "detail": "Policy review allowed staging but required human release before operator-agent execution.", "category": "policy", "inspectionKey": "policy"},
        {"id": "t5", "time": "18:24", "title": "human.approval.granted", "detail": "Duty Operator approved the staged change for the active maintenance window.", "category": "human", "inspectionKey": "policy"},
        {"id": "t6", "time": "18:25", "title": "execution.substrate.selected", "detail": "Execution substrate selected: NVIDIA OpenShell for the change operator.", "category": "tool", "inspectionKey": "tool"},
        {"id": "t7", "time": "18:25", "title": "agent.authority.released_for_execution", "detail": "Execution authority was released to Change Operator within the approved OpenShell envelope.", "category": "tool", "inspectionKey": "tool"},
        {"id": "t8", "time": "18:26", "title": "verification.check.pending", "detail": "Verification and artifact capture remain queued behind OpenShell execution.", "category": "verification", "inspectionKey": "artifact"}
    ],
    "inspections": {
        "request": {"title": "Raw request JSON", "content": "{\n  \"requestId\": \"req_2088\",\n  \"workflow\": \"infrastructure_change\",\n  \"targetSystem\": \"vpn-policy\",\n  \"changeType\": \"policy_update\",\n  \"requestedBy\": \"network-admin@company\",\n  \"maintenanceWindow\": \"active\",\n  \"risk\": \"high\"\n}"},
        "tool": {"title": "Raw tool request / response", "content": "{\n  \"substrate\": \"openshell\",\n  \"commandEnvelopeStatus\": \"prepared_for_operator_agent_execution\",\n  \"input\": {\n    \"command\": \"vpn-policy update --profile vendor-nightly --allow 203.0.113.10/32\",\n    \"rollbackCommand\": \"vpn-policy rollback --profile vendor-nightly\"\n  },\n  \"response\": null,\n  \"blockedBy\": null\n}"},
        "policy": {"title": "Policy metadata", "content": "{\n  \"policyId\": \"pol_infra_high_risk_07\",\n  \"decision\": \"operator_agent_execution_after_approval\",\n  \"requiredApprover\": \"Duty Operator\",\n  \"delegationMode\": \"human_approved_execution\",\n  \"reason\": \"target workflow affects remote access posture\"\n}"},
        "playbook": {"title": "Playbook version", "content": "{\n  \"playbook\": \"vpn-policy-standard-change\",\n  \"version\": \"0.9.8\",\n  \"allowedTools\": [\"vpn-policy.read\", \"vpn-policy.update\", \"vpn-policy.verify\"],\n  \"runtime\": \"nemoclaw-change-operator\",\n  \"executionAuthority\": \"operator_agent_after_release\"\n}"},
        "artifact": {"title": "Artifact preview", "content": "{\n  \"artifactType\": \"infrastructure_change_record\",\n  \"status\": \"pending\",\n  \"willInclude\": [\n    \"approved OpenShell command envelope\",\n    \"operator-agent execution record\",\n    \"verification result\",\n    \"rollback reference\"\n  ]\n}"}
    },
    "playbook": {
        "name": "vpn-policy-standard-change",
        "trigger": "Standard VPN policy modification during approved maintenance window",
        "preconditions": ["Maintenance window is active", "Requested policy scope is bounded", "Rollback payload has been generated"],
        "allowedTools": ["vpn-policy.read", "vpn-policy.update", "vpn-policy.verify"],
        "approvalRequirement": "Approval required before operator-agent execution release.",
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


def list_scenarios():
    return [ScenarioOption(id=scenario.id, label=scenario.label) for scenario in SCENARIOS.values()]
