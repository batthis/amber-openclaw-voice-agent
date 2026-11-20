## Description:

Inbound calls, confirmed outbound calls, transcripts, calendar booking, optional CRM, and opt-in Apple Contacts lookup through MCP.

This skill is ready for commercial/non-commercial use.

## Publisher:

[batthis](https://clawhub.ai/user/batthis)

### License/Terms of Use:

MIT-0

## Use Case:

Developers and operators use Amber to connect an agent to real phone workflows: answer and screen inbound calls, prepare confirmed outbound calls, review call history, resolve contacts, and use calendar or CRM context during phone tasks.

### Deployment Geography for Use:

Global

## Known Risks and Mitigations:

Risk: Outbound-call confirmation can be bypassed by a caller-supplied MCP flag according to ClawHub security evidence.

Mitigation: Review and patch the outbound-call workflow before enabling real calls; require server-side, single-use approval state bound to the exact phone number and objective, or set AMBER_ENABLE_OUTBOUND_CALLS=false until fixed.

Risk: Phone calls, transcripts, contact data, local CRM records, and calendar data can contain sensitive communications and personal information.

Mitigation: Use clear caller notice and consent, define retention and deletion practices, restrict access to local logs and CRM data, and enable CRM or transcript enrichment only when those controls are in place.

Risk: Provider credentials and webhook endpoints can be abused if reused broadly or left weakly validated.

Mitigation: Use a dedicated Twilio subaccount, a dedicated OpenAI project key, BRIDGE_API_TOKEN, strict webhook validation, least-privilege gateway credentials, and regular credential rotation.

Risk: Flagged dependencies may expose production deployments to known vulnerabilities.

Mitigation: Update flagged dependencies before production deployment and review dependency changes against the pinned lockfiles.

## Reference(s):

- [ClawHub listing](https://clawhub.ai/batthis/skills/amber-phone-agent)
- [Publisher profile](https://clawhub.ai/user/batthis)
- [OpenClaw](https://openclaw.ai)
- [Architecture notes](references/architecture.md)

## Skill Output:

**Output Type(s):** [Guidance, Shell commands, Configuration, Markdown, Code]

**Output Format:** [Markdown guidance with shell commands and YAML configuration snippets]

**Output Parameters:** [1D]

**Other Properties Related to Output:** [Guides MCP setup, runtime verification, and phone workflow safety checks; the configured runtime may produce call logs, transcripts, CRM records, calendar actions, and MCP tool responses.]

## Skill Version(s):

5.5.50 (source: server release metadata and skill frontmatter)

## Ethical Considerations:

Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment.
