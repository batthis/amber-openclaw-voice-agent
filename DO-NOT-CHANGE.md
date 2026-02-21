# DO NOT CHANGE - CRITICAL BRANDING RULES

⚠️ **READ THIS BEFORE EDITING SKILL.MD** ⚠️

## Fixed Branding (DO NOT MODIFY unless explicitly instructed by Abe)

### Title Field (frontmatter in SKILL.md)
```yaml
title: "Amber — Phone-Capable Voice Agent"
```
**This is the display title on ClawHub.**  
**NOT:** "Amber Voice Assistant"  
**NOT:** "Amber Voice Agent"  
**NOT:** Any other variation

### H1 Heading (in SKILL.md body)
```markdown
# Amber — Phone-Capable Voice Agent
```
Should match the frontmatter title field.

### Description (frontmatter in SKILL.md)
```
"The most complete phone skill for OpenClaw. Production-ready, low-latency AI calls — inbound & outbound, multilingual, live dashboard, brain-in-the-loop."
```

Must be exactly 155 characters or less.

## Rules
1. **NEVER change the title** unless Abe explicitly instructs you to
2. **NEVER change the description** unless Abe explicitly instructs you to
3. These are finalized branding decisions - respect them
4. If you need to update documentation, update OTHER sections, not these

## Why This File Exists
Because I (Jarvis) keep making mistakes with the title/branding. This file is here to stop that from happening again.

**Mistake history:**
- 2026-02-21 v4.2.2: Reverted title to "Amber Voice Assistant" in H1 heading
- 2026-02-21 v4.2.3: Fixed H1 but forgot to add `title` field to frontmatter (ClawHub still showed wrong name)
- 2026-02-21 v4.2.4: Finally added both the H1 AND the frontmatter `title` field

**The lesson:** BOTH the frontmatter `title:` field AND the H1 heading must be set to "Amber — Phone-Capable Voice Agent"
