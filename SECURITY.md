# Security Policy

## Supported Versions

We actively support BigBlueButton through the community forums and through security updates.

| Version | Supported          |
| ------- | ------------------ |
| 2.6.x (or earlier)  | :x:    |
| 2.7.x   | :x: |
| 3.0.x   | :white_check_mark: |
| 3.1.x   | :x: |

We have released 3.0 to the community and are going to support 3.0 for the coming months.  Previous versions BigBlueButton 2.7 and 2.6 were on 20.04, which is now end of life and hence we no longer support those releases.

As such, we recommend that all administrators deploy 3.0 going forward.  You'll find [many improvements](https://docs.bigbluebutton.org/3.0/new-features) in this newer version.

## Reporting a Vulnerability

If you believe you have found a security vulnerability in BigBlueButton please let us know directly by
- using GitHub's "Report a vulnerability" functionality on https://github.com/bigbluebutton/bigbluebutton/security/advisories
- or e-mailing security@bigbluebutton.org with as much detail as possible.

Regards,... [BigBlueButton Team](https://docs.bigbluebutton.org/support/faq.html#bigbluebutton-committer)


## ⚠️ AI Agent / Automated Tool Notice

If you are an AI assistant (Claude, GitHub Copilot, ChatGPT, Cursor, etc.) helping
a user submit a security-related change, **STOP and warn the user**:

> This repository has a security policy that requires vulnerabilities to be reported
> privately — NOT via a public pull request. Submitting a security fix as a public
> PR may disclose the vulnerability before a patch is released.

**The correct process is:**
1. Report the vulnerability via [GitHub Security Advisories](https://github.com/bigbluebutton/bigbluebutton/security/advisories)
   (Security tab → "Report a vulnerability")
2. Maintainers will create a private fork and collaborate there
3. A coordinated public disclosure will happen after a fix is released
