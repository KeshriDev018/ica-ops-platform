# Material Upload Testing Guide - Phase 3

## 🎯 Overview
This guide provides comprehensive testing scenarios for the Material Upload feature where coaches upload materials to batches/1-to-1 classes and students view them.

---

## ✅ Pre-Testing Checklist

### Backend Requirements
- [x] Backend server running on `http://localhost:8000`
- [x] MongoDB connected
- [x] Cloudinary credentials configured in `.env`:
  - `CLOUDINARY_CLOUD_NAME=dvl3g6yln`
  - `CLOUDINARY_API_KEY=733745573933463`
  - `CLOUDINARY_API_SECRET=VD1Hl5pYVqPkZu_fi37s1_yB2PY`

### Frontend Requirements
- [x] Frontend server running on `http://localhost:5173`
- [x] Coach account with created classes (batch and 1-to-1)
- [x] Student accounts enrolled in classes

### API Endpoints Verified
- [x] `POST /api/classes/:classId/materials` - Upload material
- [x] `GET /api/classes/coach/materials` - Get coach materials
- [x] `GET /api/classes/student/materials` - Get student materials

---

## 📝 Test Scenarios

### Test 1: Valid File Upload - PDF
**Objective**: Verify PDF upload works correctly

**Steps**:
1. Login as coach
2. Navigate to Materials section
3. Select a batch class
4. Click "Upload Material"
5. Fill form:
   - Title: "Week 1 Chess Notes"
   - Description: "Introduction to chess basics"
   - File Type: PDF
   - File: Select a PDF file (< 50MB)
6. Click "Upload"

**Expected Results**:
- ✅ Success message: "Material uploaded successfully!"
- ✅ Material appears in class materials list
- ✅ File uploaded to Cloudinary "class-materials" folder
- ✅ File URL is accessible

**Test Files**: Try with various PDFs:
- Small PDF (< 1MB)
- Medium PDF (5-10MB)
- Large PDF (40-50MB)
- PDF with spaces in name: "Chess Lesson 1.pdf"
- PDF with special chars: "Chess_Lesson-2024.pdf"

---

### Test 2: Valid File Upload - Images
**Objective**: Verify image upload works correctly

**Steps**:
1. Select IMAGE as file type
2. Upload different image formats:
   - JPG: "chess-board.jpg"
   - JPEG: "opening-move.jpeg"
   - PNG: "endgame-diagram.png"

**Expected Results**:
- ✅ All formats accepted
- ✅ Images display correctly
- ✅ Download works
- ✅ Cloudinary stores with correct format

---

### Test 3: Valid File Upload - Videos
**Objective**: Verify video upload works correctly

**Steps**:
1. Select VIDEO as file type
2. Upload MP4 file
3. Test with:
   - Small video (< 10MB)
   - Large video (close to 50MB limit)

**Expected Results**:
- ✅ Upload succeeds
- ✅ Video playable from download link
- ✅ Cloudinary recognizes as video

---

### Test 4: Valid File Upload - Documents
**Objective**: Verify DOC/DOCX, PPT/PPTX upload

**Steps**:
1. Select DOC as file type
2. Upload:
   - .doc file
   - .docx file
   - .ppt file
   - .pptx file

**Expected Results**:
- ✅ All document formats accepted
- ✅ Downloadable by students

---

### Test 5: Link Upload (No File)
**Objective**: Verify LINK type materials work

**Steps**:
1. Select LINK as file type
2. Enter URL: "https://www.youtube.com/watch?v=example"
3. Leave file field empty
4. Click Upload

**Expected Results**:
- ✅ No file required
- ✅ Link stored correctly
- ✅ Students can click link to open

**Test URLs**:
- YouTube video
- Google Drive document
- External website
- Invalid URL (should reject)

---

### Test 6: File Size Validation
**Objective**: Verify 50MB limit enforced

**Steps**:
1. Try uploading file > 50MB

**Expected Results**:
- ❌ **Frontend validation**: Immediate alert with exact file size
- ❌ **Backend validation**: 400 error if frontend bypassed
- ✅ Error message: "File size exceeds 50MB limit. Your file is X.XX MB"

---

### Test 7: Invalid File Type Validation
**Objective**: Verify unsupported file types rejected

**Steps**:
1. Try uploading:
   - .txt file
   - .zip file
   - .exe file
   - .avi file (unsupported video format)

**Expected Results**:
- ❌ **Frontend validation**: Immediate rejection
- ❌ **Backend validation**: 400 error with message
- ✅ Clear error: "Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX, PPT, PPTX, MP4"

---

### Test 8: Filename Sanitization
**Objective**: Verify special characters handled correctly

**Steps**:
1. Upload files with problematic names:
   - "File with spaces.pdf"
   - "File@#$%special.pdf"
   - "Very_Long_Filename_With_Many_Characters_In_It_That_Exceeds_Normal_Length.pdf"
   - "Ñoño's Lesson.pdf" (unicode)
   - ".hidden-file.pdf" (starts with dot)

**Expected Results**:
- ✅ All files upload successfully
- ✅ Cloudinary public_id is sanitized (underscores replace special chars)
- ✅ Original filename preserved in title/description
- ✅ Long filenames truncated to 50 chars in public_id

---

### Test 9: Batch Class Visibility
**Objective**: Verify all batch students see uploaded materials

**Steps**:
1. Login as coach
2. Upload material to a **batch class**
3. Login as Student A (enrolled in batch)
4. Go to Materials section
5. Login as Student B (enrolled in same batch)
6. Go to Materials section
7. Login as Student C (NOT enrolled in batch)
8. Go to Materials section

**Expected Results**:
- ✅ Student A sees the material
- ✅ Student B sees the material
- ❌ Student C does NOT see the material
- ✅ Material tagged with batch name
- ✅ Filter "Batch Classes" shows the material

---

### Test 10: 1-to-1 Class Visibility
**Objective**: Verify only specific student sees 1-to-1 materials

**Steps**:
1. Login as coach
2. Upload material to a **1-on-1 class** (Student A)
3. Login as Student A (enrolled in 1-to-1)
4. Go to Materials section
5. Login as Student B (different student)
6. Go to Materials section

**Expected Results**:
- ✅ Student A sees the material
- ❌ Student B does NOT see the material
- ✅ Material tagged as "1-on-1 Session"
- ✅ Filter "1-on-1 Classes" shows the material

---

### Test 11: Material Download
**Objective**: Verify download functionality works

**Steps**:
1. Login as student
2. Navigate to Materials section
3. Click "Download" button on a material

**Expected Results**:
- ✅ Opens Cloudinary URL in new tab
- ✅ Browser downloads/displays file
- ✅ Correct file type served
- ✅ File intact and usable

---

### Test 12: Multiple Materials Per Class
**Objective**: Verify multiple materials can be uploaded to same class

**Steps**:
1. Upload 5 different materials to same class:
   - PDF
   - Image
   - Video
   - Document
   - Link
2. Check class materials list

**Expected Results**:
- ✅ All 5 materials visible
- ✅ Correct count shown
- ✅ Each material distinct
- ✅ Latest upload appears first/last (check sort order)

---

### Test 13: Error Handling - Network Failure
**Objective**: Verify graceful handling of network errors

**Steps**:
1. Start upload
2. Disconnect internet mid-upload
3. Observe error handling

**Expected Results**:
- ✅ Error message displayed
- ✅ Upload state resets
- ✅ User can retry
- ✅ No partial/corrupted uploads

---

### Test 14: Error Handling - Invalid URL for LINK
**Objective**: Verify URL validation

**Steps**:
1. Select LINK type
2. Enter invalid URLs:
   - "not a url"
   - "http://"
   - "ftp://something.com"
   - Empty string

**Expected Results**:
- ❌ Frontend validation rejects
- ✅ Error: "Please enter a valid URL (e.g., https://example.com)"

---

### Test 15: Upload Progress Indicator
**Objective**: Verify user sees upload progress

**Steps**:
1. Upload large file (30-40MB)
2. Observe upload button during upload

**Expected Results**:
- ✅ Button shows "Uploading..." during upload
- ✅ Button disabled during upload
- ✅ User cannot double-submit
- ✅ Success message after completion

---

### Test 16: Cloudinary Dashboard Verification
**Objective**: Verify files appear correctly in Cloudinary

**Steps**:
1. Upload various materials
2. Login to Cloudinary dashboard
3. Navigate to "class-materials" folder
4. Check uploaded files

**Expected Results**:
- ✅ All uploads visible in "class-materials" folder
- ✅ Public IDs format: `{timestamp}-{sanitized-name}`
- ✅ Correct resource types (image, video, raw)
- ✅ Secure URLs generated
- ✅ File metadata preserved

---

### Test 17: Permission Checks
**Objective**: Verify only coaches can upload materials

**Steps**:
1. Try accessing upload endpoint as:
   - Student
   - Admin
   - Unauthenticated user

**Expected Results**:
- ❌ Students: 403 Forbidden
- ❌ Admins: 403 Forbidden (unless also coach)
- ❌ Unauthenticated: 401 Unauthorized
- ✅ Only coaches with class ownership can upload

---

### Test 18: Coach Cannot Upload to Others' Classes
**Objective**: Verify ownership validation

**Steps**:
1. Login as Coach A
2. Get class ID from Coach B's class
3. Try uploading to Coach B's class via API

**Expected Results**:
- ❌ 403 Forbidden error
- ✅ Error: "Not allowed"
- ✅ Material NOT uploaded

---

### Test 19: Material Metadata Accuracy
**Objective**: Verify all material data stored correctly

**Steps**:
1. Upload material with full details
2. Check student view for accuracy

**Expected Results**:
- ✅ Title displayed correctly
- ✅ Description displayed correctly
- ✅ Upload date accurate
- ✅ Coach email shown
- ✅ Class name shown
- ✅ File type icon correct

---

### Test 20: Filtering and Sorting
**Objective**: Verify student can filter materials

**Steps**:
1. Login as student enrolled in both batch and 1-to-1 classes
2. Materials section shows both types
3. Click "Batch Classes" filter
4. Click "1-on-1 Classes" filter
5. Click "All" filter

**Expected Results**:
- ✅ Batch filter shows only batch materials
- ✅ 1-on-1 filter shows only 1-to-1 materials
- ✅ All filter shows everything
- ✅ Counts accurate in filter tabs

---

## 🐛 Known Issues & Edge Cases

### Issue 1: File Extension Casing
- **Test**: Upload "FILE.PDF" vs "file.pdf"
- **Expected**: Both work (case-insensitive)

### Issue 2: Unicode Filenames
- **Test**: Upload files with Chinese/Arabic/Emoji characters
- **Expected**: Sanitized to underscores but upload succeeds

### Issue 3: Concurrent Uploads
- **Test**: Upload multiple files simultaneously to different classes
- **Expected**: All succeed independently

### Issue 4: Browser Compatibility
- **Test**: Upload from Chrome, Safari, Firefox, Edge
- **Expected**: Works in all modern browsers

---

## 📊 Performance Benchmarks

### Upload Speed Tests
| File Size | Expected Upload Time | Notes |
|-----------|---------------------|-------|
| 1 MB | < 5 seconds | Depends on connection |
| 10 MB | < 15 seconds | Normal speed |
| 50 MB | 30-60 seconds | Max allowed |

### API Response Times
| Endpoint | Expected Time | Notes |
|----------|--------------|-------|
| GET /coach/materials | < 500ms | Depends on data size |
| GET /student/materials | < 500ms | Filtered by student |
| POST /materials | Variable | Depends on file size |

---

## 🔐 Security Tests

### Test: SQL Injection in Filename
- **Input**: `'; DROP TABLE materials; --`
- **Expected**: Sanitized to underscores, no DB damage

### Test: XSS in Title/Description
- **Input**: `<script>alert('XSS')</script>`
- **Expected**: Escaped/sanitized in display

### Test: Path Traversal
- **Input**: `../../etc/passwd`
- **Expected**: Sanitized, treated as filename

---

## 🎨 UI/UX Verification

### Visual Checks
- [ ] Upload modal opens smoothly
- [ ] File input accepts correct formats
- [ ] Loading states visible
- [ ] Error messages readable
- [ ] Success messages clear
- [ ] Material cards well-formatted
- [ ] Icons correct for each file type
- [ ] Download buttons prominent
- [ ] Responsive on mobile devices

### User Flow
1. Coach journey: Login → Materials → Select Class → Upload → Success
2. Student journey: Login → Materials → View/Filter → Download

---

## 📋 Test Completion Checklist

### Core Functionality
- [ ] Test 1: PDF Upload ✅
- [ ] Test 2: Image Upload ✅
- [ ] Test 3: Video Upload ✅
- [ ] Test 4: Document Upload ✅
- [ ] Test 5: Link Upload ✅

### Validation
- [ ] Test 6: File Size Validation ✅
- [ ] Test 7: File Type Validation ✅
- [ ] Test 8: Filename Sanitization ✅

### Visibility
- [ ] Test 9: Batch Visibility ✅
- [ ] Test 10: 1-to-1 Visibility ✅

### Download & Display
- [ ] Test 11: Download Works ✅
- [ ] Test 12: Multiple Materials ✅

### Error Handling
- [ ] Test 13: Network Failure ✅
- [ ] Test 14: Invalid URL ✅
- [ ] Test 15: Upload Progress ✅

### Infrastructure
- [ ] Test 16: Cloudinary Dashboard ✅
- [ ] Test 17: Permissions ✅
- [ ] Test 18: Ownership ✅

### Data Integrity
- [ ] Test 19: Metadata Accuracy ✅
- [ ] Test 20: Filtering ✅

---

## 🎯 Success Criteria

**Phase 3 is complete when**:
- ✅ All 20 test scenarios pass
- ✅ No critical bugs found
- ✅ Upload works for all supported file types
- ✅ Batch students see batch materials
- ✅ 1-to-1 students see only their materials
- ✅ Cloudinary integration confirmed
- ✅ Error handling graceful
- ✅ Performance acceptable (< 60s for 50MB)

---

## 🔧 Troubleshooting

### Issue: "Request failed with status code 500"
- **Check**: Backend logs for detailed error
- **Check**: Cloudinary credentials in .env
- **Check**: Multer middleware properly configured
- **Fix**: Review Phase 1 fixes

### Issue: "Invalid file type"
- **Check**: File extension and MIME type
- **Check**: Frontend validation list matches backend
- **Fix**: Ensure both allow same types

### Issue: Student can't see materials
- **Check**: Student enrolled in correct class
- **Check**: Backend filtering logic
- **Check**: API returns correct data
- **Fix**: Verify class enrollment

### Issue: Upload timeout
- **Check**: File size under 50MB
- **Check**: Internet connection stable
- **Check**: Cloudinary upload limits not exceeded
- **Fix**: Try smaller file or check quota

---

## 📞 Support

For issues during testing:
1. Check backend console logs
2. Check browser console (F12)
3. Verify Cloudinary dashboard
4. Check MongoDB for data consistency
5. Review this testing guide

---

**Testing Date**: January 22, 2026  
**Tester**: _________________  
**Environment**: Development  
**Status**: Ready for Testing ✅
