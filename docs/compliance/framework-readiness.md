# Armelis Compliance Framework Readiness

## Scope and wording

Armelis may help an organization collect evidence, map controls, track remediation, and prepare for independent assessment. It must not claim that Armelis itself is SOC 2 compliant or ISO/IEC 27001 certified unless the organization has completed the applicable independent examination or certification process.

Approved product language before assessment:

- “Designed to support SOC 2 readiness.”
- “Designed to support ISO/IEC 27001:2022 readiness.”
- “Maps security evidence to selected control objectives.”
- “Helps teams prepare audit evidence and track remediation.”

Prohibited without verified evidence:

- “SOC 2 compliant.”
- “SOC 2 certified.”
- “ISO 27000 certified.”
- “ISO/IEC 27001 certified.”
- Any claim that a customer is compliant because Armelis was used.

## Framework distinction

SOC 2 is an AICPA examination/report concerning controls at a service organization. The applicable Trust Services Criteria may cover security, availability, processing integrity, confidentiality, and privacy.

ISO/IEC 27001:2022 specifies requirements for an information security management system. Certification applies to the defined organization and scope after an accredited certification process.

ISO/IEC 27000 is an overview standard within the ISO/IEC 27000 family. It is not the requirements standard used as a substitute for ISO/IEC 27001 certification.

## Product capabilities

### Evidence collection

- Security policies and approvals.
- Asset and system inventory.
- Access reviews and identity evidence.
- Vulnerability and dependency scan history.
- Change and deployment history.
- Incident and recovery records.
- Backup and restore verification.
- Security training and acknowledgement records.
- Vendor and subprocessor records.
- Risk assessments and treatment decisions.

### Control mapping

Each control record should include:

- Framework.
- Control or criteria reference.
- Scope.
- Owner.
- Evidence requirements.
- Evidence links.
- Review frequency.
- Status.
- Exceptions and risk acceptance.
- Last reviewed date.
- Audit trail.

### Status vocabulary

- NOT_STARTED
- IN_PROGRESS
- READY_FOR_REVIEW
- EVIDENCE_COLLECTED
- EXCEPTION_OPEN
- VERIFIED
- NOT_APPLICABLE

Armelis should never convert a technical scan result directly into a compliance conclusion. A scanner finding is evidence for review, not proof that a control passes or fails by itself.

## Initial roadmap

1. Add framework and control entities to the domain model.
2. Add evidence attachments with immutable provenance and access control.
3. Add owners, review dates, exceptions, and approval history.
4. Map Armelis findings to candidate control areas with explicit confidence.
5. Add readiness dashboards and evidence export.
6. Add auditor/reviewer access with least privilege.
7. Validate the control scope with a qualified SOC 2 practitioner and ISO/IEC 27001 consultant or certification body.

## Security requirements

- Compliance evidence may contain sensitive business and personal information.
- Enforce tenant isolation and role-based access control.
- Log evidence access and approval actions.
- Encrypt evidence at rest and in transit.
- Prevent secrets from appearing in exported reports.
- Preserve evidence retention and deletion policies.
- Make the assessed organization, system scope, period, and framework version explicit.
