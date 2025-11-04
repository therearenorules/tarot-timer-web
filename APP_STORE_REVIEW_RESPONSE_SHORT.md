# App Store Review Response - Guideline 3.1.2

**App**: Tarot Timer (타로 타이머)
**Version**: 1.1.1 (Build 107)
**Date**: October 30, 2025

---

Dear App Store Review Team,

Thank you for your feedback on Guideline 3.1.2. We have identified and resolved the issue.

## Root Cause

While our app contains functional Terms of Use and Privacy Policy links, **App Store Connect metadata was missing the Custom EULA**. This was the root cause of the rejection.

## Actions Taken

### 1. Custom EULA Uploaded to App Store Connect

We have uploaded a comprehensive Custom EULA that includes all Apple Standard EULA requirements:

✅ Limited License Grant and Restrictions
✅ Auto-Renewable Subscription Terms (24-hour cancellation window)
✅ Warranty Disclaimer (90-day limited warranty)
✅ Limitation of Liability
✅ Indemnification
✅ Export Compliance (U.S. embargo countries, prohibited parties)

**Apple-Specific Terms (Section 13)**:
✅ Agreement between user and developer (NOT Apple)
✅ Apple as Third-Party Beneficiary with enforcement rights
✅ Apple's Disclaimer of Warranty
✅ Product Claims responsibility (developer, not Apple)
✅ Intellectual Property Infringement responsibility
✅ Legal Compliance verification

**Location**: App Store Connect → App Information → License Agreement → Custom License Agreement

### 2. In-App Links (Already Functional)

- Terms of Use: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
- Privacy Policy: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html

### 3. Subscription Details Disclosed

- Monthly Premium: $4.99 USD
- Annual Premium: $34.99 USD
- Auto-renewal with 24-hour cancellation requirement
- Platform-specific refund policies
- Subscription management instructions (iOS Settings → Subscriptions)

## Compliance Summary

| Requirement | Status |
|------------|--------|
| Custom EULA in App Store Connect | ✅ Uploaded |
| Apple Third-Party Beneficiary | ✅ Included (Section 13.2) |
| 90-Day Limited Warranty | ✅ Included (Section 6.3) |
| Export Compliance | ✅ Included (Section 15) |
| Auto-Renewal 24h Cancellation | ✅ In EULA + in-app |
| In-App Terms Link | ✅ Functional |
| In-App Privacy Link | ✅ Functional |

## Apple Standard EULA Compliance

Our Custom EULA includes all sections from Apple's Standard EULA (https://www.apple.com/legal/internet-services/itunes/dev/stdeula/):

- [x] Section 1: License Agreement and Scope
- [x] Section 2: Limited License Grant and Restrictions
- [x] Section 4: Auto-Renewable Subscription Terms
- [x] Section 6: Warranty Disclaimer (90-day limited warranty)
- [x] Section 7: Limitation of Liability
- [x] Section 8: Indemnification
- [x] Section 9: Intellectual Property Rights
- [x] Section 13: Apple-Specific Terms (Third-Party Beneficiary, Disclaimers, Legal Compliance)
- [x] Section 15: Export Compliance

## Testing Instructions

**Step 1**: Verify Custom EULA in App Store Connect
- Navigate to: App Information → License Agreement
- Confirm: Custom License Agreement is selected with full text (Korean + English)

**Step 2**: Verify In-App Links (Build 107)
- Open app → Settings → Upgrade → Subscription screen
- Tap "Terms of Service" and "Privacy Policy" links at bottom
- Confirm both links open full legal documents

**Step 3**: Verify Subscription Compliance
- View subscription options with pricing
- Confirm auto-renewal and 24-hour cancellation terms visible
- Confirm EULA accessible before purchase

## Why This Resolves Guideline 3.1.2

**Before**: In-app links only → Metadata missing EULA → Failed compliance
**After**: Custom EULA in App Store Connect + In-app links → Full compliance

**Guideline 3.1.2 Requirements Met**:
1. ✅ Custom EULA in App Store Connect metadata (root cause resolved)
2. ✅ All Apple Standard EULA requirements included
3. ✅ Apple Third-Party Beneficiary explicitly stated
4. ✅ Auto-renewal terms with 24-hour cancellation clearly disclosed
5. ✅ In-app links functional (Terms + Privacy Policy)
6. ✅ Subscription details disclosed (pricing, frequency, management)

## Conclusion

We have fully addressed Guideline 3.1.2 by uploading a comprehensive Custom EULA to App Store Connect metadata that includes all Apple Standard EULA requirements, particularly the Apple Third-Party Beneficiary clause and export compliance terms.

**The Custom EULA is now live in App Store Connect.** This was the missing piece causing the rejections.

**We respectfully request re-review of Build 107.**

Thank you for your guidance.

Best regards,
**Tarot Timer Development Team**

**Contact**: changsekwon@gmail.com | Instagram: @deanosajutaro
**Support**: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html
