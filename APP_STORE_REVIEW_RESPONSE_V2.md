# App Store Review Response - Guideline 3.1.2 (EULA)

**Date**: October 30, 2025
**App Name**: Tarot Timer (타로 타이머)
**Version**: 1.1.1
**Build Number**: 107
**Issue**: Guideline 3.1.2 - Missing EULA in App Metadata

---

## Response to Review Team

Dear App Store Review Team,

Thank you for your continued feedback regarding Guideline 3.1.2. We understand the issue now and have made the necessary changes to fully comply with Apple's requirements.

### Root Cause Identified

We have identified that while our app contains functional links to Terms of Use and Privacy Policy **within the app**, the **App Store Connect metadata** was missing the required Custom EULA (End User License Agreement).

### Actions Taken

**1. Custom EULA Added to App Store Connect**

We have prepared and uploaded a comprehensive Custom EULA to App Store Connect that includes:

✅ **Apple Standard EULA Requirements**:
- Limited License Grant and Restrictions
- Auto-Renewable Subscription Terms (24-hour cancellation window clearly stated)
- Warranty Disclaimer (90-day limited warranty as per Apple standard)
- Limitation of Liability
- Indemnification
- Export Compliance

✅ **Apple-Specific Terms (Section 13)**:
- Acknowledgment that the agreement is between user and developer (NOT Apple)
- Apple as Third-Party Beneficiary with enforcement rights
- Apple's Disclaimer of Warranty
- Product Claims responsibility (developer, not Apple)
- Intellectual Property Infringement responsibility
- Legal Compliance (U.S. embargo countries, prohibited parties)

✅ **Subscription Details**:
- Monthly Premium: $4.99 USD
- Annual Premium: $34.99 USD
- Auto-renewal terms with explicit 24-hour cancellation requirement
- Platform-specific refund policies (Apple App Store)
- Subscription management instructions

✅ **Bilingual Content**:
- Complete Korean version (primary language)
- Complete English version
- Both versions contain all required legal terms

**Location**: App Store Connect → App Information → License Agreement → Custom License Agreement

**2. In-App Links Verified (Already Implemented)**

Our app already contains functional links on the subscription purchase screen:
- Terms of Use: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
- Privacy Policy: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html

**3. Support URL Updated**

Support URL in metadata: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html

---

## How We Addressed Guideline 3.1.2

### Before (Rejected Build 107):
❌ In-app links only → Metadata missing EULA
❌ Apple reviewers couldn't find EULA in App Store Connect
❌ Failed Guideline 3.1.2 compliance

### After (Updated Build 107):
✅ **Custom EULA uploaded to App Store Connect metadata**
✅ **In-app links remain functional**
✅ **Full Apple Standard EULA compliance**
✅ **Apple as Third-Party Beneficiary explicitly stated**
✅ **All subscription terms clearly disclosed**

---

## Apple Standard EULA Compliance Checklist

We have verified that our Custom EULA includes all required sections from Apple's Standard EULA (https://www.apple.com/legal/internet-services/itunes/dev/stdeula/):

- [x] **Section 1**: License Agreement and Scope
- [x] **Section 2**: Limited License Grant and Restrictions
- [x] **Section 4**: Auto-Renewable Subscription Terms (24-hour cancellation)
- [x] **Section 6**: Warranty Disclaimer (90-day limited warranty)
- [x] **Section 7**: Limitation of Liability
- [x] **Section 8**: Indemnification
- [x] **Section 9**: Intellectual Property Rights
- [x] **Section 13**: Apple-Specific Terms (Third-Party Beneficiary, Disclaimers, Product Claims, IP Infringement, Legal Compliance)
- [x] **Section 14**: Google-Specific Terms (for Android users)
- [x] **Section 15**: Export Compliance (U.S. embargo countries, prohibited parties)
- [x] **Section 16**: General Provisions (Governing Law, Dispute Resolution, Severability)

---

## Testing Instructions for Review Team

### Step 1: Verify Custom EULA in App Store Connect
1. Go to App Store Connect
2. Navigate to: App Information → License Agreement
3. Confirm: "사용자 설정 사용권 계약 (Custom License Agreement)" is selected
4. Verify: Full EULA text is present (Korean + English versions)

### Step 2: Verify In-App Links (Already Functional)
1. Open Tarot Timer app (Build 107)
2. Navigate to: Settings → Upgrade Button
3. On subscription screen, scroll to bottom
4. Tap "Terms of Service" link → Opens full terms
5. Tap "Privacy Policy" link → Opens full policy

### Step 3: Verify Subscription Flow Compliance
1. View subscription options (Monthly $4.99, Annual $34.99)
2. Confirm auto-renewal terms are visible
3. Confirm 24-hour cancellation requirement is stated
4. Confirm EULA is accessible before purchase

---

## Key Changes Summary

| Item | Previous Status | Current Status |
|------|----------------|----------------|
| **App Store Connect EULA** | ❌ Not set (using Apple Standard EULA) | ✅ Custom EULA uploaded |
| **In-App Terms Link** | ✅ Functional | ✅ Functional |
| **In-App Privacy Link** | ✅ Functional | ✅ Functional |
| **Apple Third-Party Beneficiary** | ❌ Not explicitly stated | ✅ Included in Custom EULA |
| **90-Day Limited Warranty** | ❌ Missing | ✅ Included (Section 6.3) |
| **Export Compliance** | ❌ Missing | ✅ Included (Section 15) |
| **Auto-Renewal 24h Cancellation** | ⚠️ Stated in-app only | ✅ In EULA + in-app |

---

## Why This Fully Addresses Guideline 3.1.2

**Guideline 3.1.2 Requirements**:
> Apps offering auto-renewable subscriptions must clearly disclose subscription terms, including:
> - Payment amount and frequency
> - Auto-renewal terms
> - How to cancel
> - Link to Terms of Use (EULA)
> - Link to Privacy Policy

**Our Compliance**:
1. ✅ **Custom EULA in App Store Connect metadata** (addresses root cause)
2. ✅ **EULA contains all Apple Standard EULA requirements** (warranty, liability, Apple third-party beneficiary)
3. ✅ **Auto-renewal terms clearly stated** (24-hour cancellation window)
4. ✅ **In-app links functional** (Terms + Privacy Policy)
5. ✅ **Subscription details disclosed** (pricing, frequency, management)
6. ✅ **Export compliance included** (U.S. embargo countries, prohibited parties)

---

## Additional Information

**App Type**: Auto-Renewable Subscription App (Monthly & Annual plans)
**Target Markets**: Global (primary: Korea, USA, Japan)
**Languages**: Korean (primary), English, Japanese
**Compliance**: GDPR, CCPA, Korean PIPA

**Developer Contact**:
- Email: changsekwon@gmail.com
- Instagram: @deanosajutaro
- Support: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html

---

## Conclusion

We have now **fully addressed Guideline 3.1.2** by:

1. **Uploading a comprehensive Custom EULA to App Store Connect metadata** that includes all Apple Standard EULA requirements
2. **Explicitly stating Apple as Third-Party Beneficiary** with enforcement rights
3. **Including all required legal sections**: warranty disclaimer, liability limitation, export compliance, indemnification
4. **Maintaining functional in-app links** to Terms of Use and Privacy Policy

The Custom EULA is now visible in App Store Connect metadata, which was the missing piece causing the rejections. We believe this fully resolves the Guideline 3.1.2 compliance issue.

**We respectfully request re-review of Build 107 with the updated Custom EULA.**

Please let us know if you need any clarification or additional information.

Thank you for your patience and guidance throughout this process.

Best regards,
**Tarot Timer Development Team**

---

**Submission Date**: October 30, 2025
**App Store Connect**: Custom EULA Uploaded
**Build Ready**: Yes (Build 107)
**Status**: Awaiting Re-Review
