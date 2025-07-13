# Delete Discussion Button Alignment Task

## Summary
Successfully aligned the delete discussion button's look-and-feel with the view link styling as requested.

## Changes Made

### 1. Updated Delete Discussion Component
**File**: `src/features/discussions/components/delete-discussion.tsx`

**Changes**:
- ✅ Removed Trash icon import (lucide-react)
- ✅ Changed button from `Button` component with `variant="destructive"` to plain `<button>`
- ✅ Applied Link component styling: `text-slate-600 hover:text-slate-900`
- ✅ Changed text from "Delete Discussion" to "Delete"
- ✅ Removed trash icon from trigger button

### 2. Preserved Functionality
- ✅ Authorization wrapper remains intact (ADMIN role required)
- ✅ Confirmation dialog still works with proper title and body
- ✅ Delete mutation functionality unchanged
- ✅ Success notification still triggers
- ✅ Confirm button in dialog still shows proper destructive styling

### 3. Quality Assurance
- ✅ Linting passed on the modified file
- ✅ No breaking changes to existing functionality
- ✅ Security measures remain in place

## Review

The delete discussion button now has a consistent look-and-feel with the view link:
- Both use the same gray text styling (`text-slate-600 hover:text-slate-900`)
- Both have simple text labels ("View" and "Delete")
- Both appear as subtle links rather than prominent buttons
- The delete action maintains its safety through the confirmation dialog

The change successfully reduces visual hierarchy conflicts while maintaining all security and functionality requirements.