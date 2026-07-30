# Amber — Phone-Capable Voice Agent

## Description

Amber gives an agent real phone capabilities through a Twilio or compatible voice bridge, OpenAI Realtime calling, MCP tools, inbound screening, confirmed outbound calls, call logs, transcripts, optional CRM/contact memory, calendar booking, contacts lookup, and a loopback-only dashboard.

This skill is ready for commercial/non-commercial use.

## Publisher

[batthis](https://clawhub.ai/user/batthis)

## License/Terms of Use

MIT-0

## Use Case

Developers and operators use Amber to connect an agent to real telephone workflows, including inbound screening, explicitly confirmed outbound calls, call-history review, contact lookup, CRM caller memory, and calendar-assisted scheduling. The skill is intended for configured deployments where the operator manages telephony, AI-provider credentials, caller notice, access control, and retention practices.

## Deployment Geography for Use

Global

## Known Risks and Mitigations

Risk: Amber handles sensitive phone, contact, calendar, transcript, and optional CRM data.
Mitigation: Operate it as a sensitive communications system: keep logs, transcripts, contact caches, and CRM files private; define retention and deletion practices; and enable CRM enrichment or extended contacts only when needed.

Risk: CRM caller memory can retain phone numbers, names, summaries, and contextual notes.
Mitigation: CRM is opt-in, the setup wizard defaults it to off, and the runtime hides CRM tools unless `AMBER_CRM_ENABLED=true`.

Risk: Telephony, AI-provider, and optional OpenClaw credentials can expose real calling and data access if over-scoped or leaked.
Mitigation: Use dedicated least-privilege Twilio, OpenAI, and OpenClaw credentials, keep secrets out of logs, rotate them when needed, and review dependency and configuration changes before deployment.

Risk: A locally served bridge or dashboard may expose call controls or communications records if made reachable without protection.
Mitigation: Keep the bridge and dashboard loopback-only or place them behind authentication and network controls before using real callers.

Risk: Real calls may involve people who did not configure the system and may be recorded or transcribed.
Mitigation: Configure caller notice and consent appropriate to the deployment, and require explicit confirmation before outbound calls, calendar writes, payments, commitments, or escalation-sensitive actions.

## References

- [ClawHub skill page](https://clawhub.ai/batthis/skills/amber-phone-agent)
- [Amber repository](https://github.com/batthis/amber-openclaw-voice-agent)
- [Architecture](references/architecture.md)
- [Release checklist](references/release-checklist.md)
- [Runtime README](runtime/README.md)
- [Cowork package README](packaging/cowork/README.md)

## Skill Output

**Output Type(s):** guidance, shell commands, configuration

**Output Format:** Markdown instructions with code blocks and configuration snippets

**Output Parameters:** 1D

**Other Properties Related to Output:** Outputs are operator-facing setup, verification, and usage guidance for connecting Amber runtime and MCP tools to an agent.

## Skill Version(s)

5.5.49

## Ethical Considerations

Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment.
