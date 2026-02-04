@echo off
echo ===========================================
echo E-Commerce Backend Test Suite
echo ===========================================
echo.

echo Running Unit Tests...
echo ------------------------------------
npm run test:unit
set unit_result=%ERRORLEVEL%

echo.
echo Running Integration Tests...
echo ------------------------------------
npm run test:integration
set integration_result=%ERRORLEVEL%

echo.
echo Running System Tests...
echo ------------------------------------
npm run test:system
set system_result=%ERRORLEVEL%

echo.
echo ===========================================
echo TEST RESULTS SUMMARY
echo ===========================================
if %unit_result%==0 (
    echo ✓ Unit Tests: PASSED
) else (
    echo ✗ Unit Tests: FAILED
)

if %integration_result%==0 (
    echo ✓ Integration Tests: PASSED
) else (
    echo ✗ Integration Tests: FAILED
)

if %system_result%==0 (
    echo ✓ System Tests: PASSED
) else (
    echo ✗ System Tests: FAILED
)

echo.
echo Test reports available in coverage/test-report.html
echo.

if %unit_result%==0 if %integration_result%==0 if %system_result%==0 (
    echo 🎉 All tests passed!
    exit /b 0
) else (
    echo 💥 Some tests failed
    exit /b 1
)