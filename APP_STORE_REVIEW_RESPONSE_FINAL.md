# App Store Review Response - Guideline 3.1.2

**App**: Tarot Timer | **Version**: 1.1.1 (Build 107) | **Date**: October 30, 2025

---

Dear App Store Review Team,

Thank you for your feedback on Guideline 3.1.2. We have identified and resolved the issue.

## Root Cause & Solution

**Problem**: App Store Connect metadata was missing the Custom EULA (though in-app links were functional).

**Solution**: We have uploaded a comprehensive Custom EULA to App Store Connect that includes all Apple Standard EULA requirements.

## Custom EULA Uploaded

**Location**: App Store Connect → App Information → License Agreement → Custom License Agreement

**Content Includes**:
✅ Limited License Grant and Restrictions
✅ Auto-Renewable Subscription Terms (24-hour cancellation window)
✅ Warranty Disclaimer (90-day limited warranty)
✅ Limitation of Liability & Indemnification
✅ Export Compliance (U.S. embargo countries, prohibited parties)

**Apple-Specific Terms (Section 13)**:
✅ Agreement between user and developer (NOT Apple)
✅ **Apple as Third-Party Beneficiary with enforcement rights**
✅ Apple's Disclaimer of Warranty
✅ Product Claims & IP Infringement responsibility (developer, not Apple)
✅ Legal Compliance verification

## Compliance Checklist

| Requirement | Status |
|------------|--------|
| Custom EULA in App Store Connect | ✅ Uploaded |
| Apple Third-Party Beneficiary | ✅ Section 13.2 |
| 90-Day Limited Warranty | ✅ Section 6.3 |
| Export Compliance | ✅ Section 15 |
| Auto-Renewal 24h Cancellation | ✅ EULA + in-app |
| In-App Terms Link | ✅ Functional |
| In-App Privacy Link | ✅ Functional |

## Apple Standard EULA Compliance

Our Custom EULA includes all required sections from https://www.apple.com/legal/internet-services/itunes/dev/stdeula/:

- [x] Section 1: License Agreement and Scope
- [x] Section 2: Limited License Grant
- [x] Section 4: Auto-Renewable Subscriptions
- [x] Section 6: Warranty Disclaimer (90-day)
- [x] Section 7: Limitation of Liability
- [x] Section 8: Indemnification
- [x] Section 13: **Apple Third-Party Beneficiary**
- [x] Section 15: Export Compliance

## In-App Links (Already Functional)

- Terms: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
- Privacy: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html

## Subscription Details

- Monthly Premium: $4.99 USD
- Annual Premium: $34.99 USD (42% savings)
- Auto-renewal: 24-hour cancellation window before renewal
- Management: iOS Settings → Subscriptions

## Testing Instructions

1. **App Store Connect**: Navigate to App Information → License Agreement → Verify Custom EULA (Korean + English)
2. **In-App**: Open app → Settings → Upgrade → Subscription screen → Verify Terms/Privacy links at bottom
3. **Compliance**: Confirm subscription pricing, auto-renewal terms, and 24-hour cancellation visible

## Resolution Summary

**Before**: In-app links only → Metadata missing EULA → Failed Guideline 3.1.2
**After**: Custom EULA in App Store Connect + In-app links → **Full compliance**

**Key Fix**: Uploaded Custom EULA to App Store Connect metadata with Apple Third-Party Beneficiary clause (Section 13.2), 90-day warranty (Section 6.3), and export compliance (Section 15).

**This was the missing piece causing the rejections.**

We respectfully request re-review of Build 107.

Thank you for your guidance.

Best regards,
**Tarot Timer Development Team**

**Contact**: changsekwon@gmail.com | Instagram: @deanosajutaro
