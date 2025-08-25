# Java Selenium Test Suite for TodoApp Forgot Password Flow

This directory contains a comprehensive Java Selenium WebDriver test suite for the TodoApp's forgot password functionality. The tests are written in Java using TestNG framework and Selenium WebDriver.

## 🧪 Test Overview

The Java Selenium test suite provides end-to-end testing of the forgot password flow with comprehensive test coverage:

### 📋 Test Categories

1. **Navigation and UI Tests**
   - Navigation between login and forgot password pages
   - UI element visibility and proper display
   - Page heading and content validation

2. **Form Validation Tests**
   - Empty email validation
   - Invalid email format validation
   - Email without @ symbol validation

3. **Successful Password Reset Flow Tests**
   - Email sending for valid emails
   - Handling non-existent emails gracefully
   - Complete password reset flow
   - Login with new password after reset

4. **Reset Password Page Validation Tests**
   - Weak password validation
   - Password mismatch validation
   - Empty password field validation

5. **Token Validation Tests**
   - Invalid token handling
   - Missing token handling
   - Expired token handling

6. **Accessibility and UX Tests**
   - Form labels and accessibility attributes
   - Loading states during form submission
   - Button state management

7. **Security Feature Tests**
   - Email existence privacy (same message for all emails)
   - Email field clearing after submission

## 🚀 Setup and Installation

### Prerequisites

1. **Java 11 or higher**
   ```bash
   java -version
   ```

2. **Maven 3.6 or higher**
   ```bash
   mvn -version
   ```

3. **Chrome and/or Firefox browser**
   - Chrome: Latest version
   - Firefox: Latest version

4. **Start the TodoApp**
   ```bash
   # In the main project directory
   npm run dev
   # Ensure the app is running on http://localhost:3003
   ```

### Project Structure

```
selenium-java/
├── pom.xml                                    # Maven configuration
├── testng.xml                                 # TestNG configuration
├── README.md                                  # This file
├── src/
│   ├── main/java/com/todoapp/selenium/
│   │   └── utils/
│   │       └── SeleniumUtils.java            # Selenium utilities
│   └── test/java/com/todoapp/selenium/
│       └── tests/
│           └── ForgotPasswordTest.java        # Main test class
└── screenshots/                               # Screenshots on failures
```

## 🏃‍♂️ Running the Tests

### Basic Commands

```bash
# Navigate to Java Selenium directory
cd selenium-java

# Run all tests
mvn clean test

# Run with specific browser
mvn clean test -Dbrowser=chrome
mvn clean test -Dbrowser=firefox

# Run in headless mode
mvn clean test -Dbrowser=chrome -Dheadless=true

# Run specific test class
mvn clean test -Dtest=ForgotPasswordTest

# Run specific test method
mvn clean test -Dtest=ForgotPasswordTest#testCompletePasswordResetFlow
```

### Maven Profiles

```bash
# Run Chrome tests
mvn clean test -Pchrome

# Run Firefox tests
mvn clean test -Pfirefox

# Run headless tests
mvn clean test -Pheadless

# Run with multiple profiles
mvn clean test -Pchrome,headless
```

### TestNG XML Suites

```bash
# Run specific test suite
mvn clean test -DsuiteXmlFile=testng.xml

# Run smoke tests only
mvn clean test -DsuiteXmlFile=testng.xml -Dtest=Smoke Tests

# Run regression tests
mvn clean test -DsuiteXmlFile=testng.xml -Dtest=Regression Tests
```

### Parallel Execution

```bash
# Run tests in parallel (configured in testng.xml)
mvn clean test -Dparallel=methods -DthreadCount=4
```

## 🔧 Configuration

### Maven Configuration (pom.xml)

The `pom.xml` includes:

- **Selenium WebDriver 4.15.0**
- **TestNG 7.7.1** for testing framework
- **WebDriverManager 5.6.2** for automatic driver management
- **SLF4J** for logging
- **Jackson** for JSON processing
- **AssertJ** for fluent assertions

### TestNG Configuration (testng.xml)

The `testng.xml` provides:

- **Parallel execution** with configurable thread count
- **Multiple test suites** (Smoke, Regression, Browser-specific)
- **Parameterized tests** for different browsers and modes
- **Method-level test selection**

### Browser Configuration

```java
// Chrome with headless mode
WebDriver driver = SeleniumUtils.createDriver("chrome", true);

// Firefox with visible mode
WebDriver driver = SeleniumUtils.createDriver("firefox", false);
```

## 🎯 SeleniumUtils Class

The `SeleniumUtils` class provides comprehensive utilities:

### Driver Management
```java
// Create driver instance
WebDriver driver = SeleniumUtils.createDriver("chrome", false);
SeleniumUtils seleniumUtils = new SeleniumUtils(driver);

// Clean up
seleniumUtils.quit();
```

### Navigation Methods
```java
seleniumUtils.gotoLogin();
seleniumUtils.gotoForgotPassword();
seleniumUtils.gotoResetPassword(token);
```

### Form Interaction Methods
```java
seleniumUtils.fillLoginForm(email, password);
seleniumUtils.submitLoginForm();
seleniumUtils.fillForgotPasswordForm(email);
seleniumUtils.submitForgotPasswordForm();
seleniumUtils.fillResetPasswordForm(password, confirmPassword);
seleniumUtils.submitResetPasswordForm();
```

### Element Interaction Methods
```java
seleniumUtils.fillElement(selector, value);
seleniumUtils.clickElement(selector);
seleniumUtils.getElementText(selector);
seleniumUtils.getElementValue(selector);
seleniumUtils.isElementVisible(selector);
seleniumUtils.isElementEnabled(selector);
```

### Assertion Methods
```java
seleniumUtils.expectToBeOnLoginPage();
seleniumUtils.expectToBeOnForgotPasswordPage();
seleniumUtils.expectToBeOnResetPasswordPage();
seleniumUtils.expectToBeOnDashboard();
seleniumUtils.expectSuccessMessage(expectedMessage);
seleniumUtils.expectErrorMessage(expectedMessage);
seleniumUtils.expectLoadingState();
seleniumUtils.expectNotLoadingState();
```

### Email Mocking Methods
```java
seleniumUtils.setupEmailMock();
Map<String, Object> lastEmail = seleniumUtils.getLastEmail();
String resetToken = seleniumUtils.extractResetTokenFromEmail();
String resetUrl = seleniumUtils.getResetUrlFromEmail();
```

### Utility Methods
```java
seleniumUtils.waitForPageLoad();
seleniumUtils.waitForElement(selector);
seleniumUtils.waitForElementVisible(selector);
seleniumUtils.waitForText(selector, text);
seleniumUtils.waitForUrl(url);
seleniumUtils.waitForTimeout(milliseconds);
seleniumUtils.takeScreenshot(filename);
```

## 🧪 Test Examples

### Basic Test Structure
```java
@Test(description = "Complete full password reset flow")
public void testCompletePasswordResetFlow() {
    logger.info("Starting test: Complete full password reset flow");
    
    // Step 1: Request password reset
    seleniumUtils.gotoForgotPassword();
    seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
    seleniumUtils.submitForgotPasswordForm();
    
    seleniumUtils.expectSuccessMessage("If an account with that email exists, a password reset link has been sent");
    
    // Step 2: Extract reset token from email
    String resetToken = seleniumUtils.extractResetTokenFromEmail();
    Assert.assertNotNull(resetToken, "Reset token should not be null");
    
    // Step 3: Navigate to reset password page
    seleniumUtils.gotoResetPassword(resetToken);
    seleniumUtils.expectToBeOnResetPasswordPage();
    
    // Step 4: Fill and submit new password
    seleniumUtils.fillResetPasswordForm(SeleniumUtils.VALID_PASSWORD, SeleniumUtils.VALID_PASSWORD);
    seleniumUtils.submitResetPasswordForm();
    
    // Step 5: Verify success and redirect
    seleniumUtils.expectSuccessMessage("Password has been reset successfully");
    seleniumUtils.waitForTimeout(3500);
    seleniumUtils.expectToBeOnLoginPage();
    
    logger.info("Test completed: Complete full password reset flow");
}
```

### Parameterized Test
```java
@BeforeClass
@Parameters({"browser", "headless"})
public void setUp(@Optional("chrome") String browser, @Optional("false") String headless) {
    logger.info("Setting up test environment with browser: {}, headless: {}", browser, headless);
    
    boolean isHeadless = Boolean.parseBoolean(headless);
    driver = SeleniumUtils.createDriver(browser, isHeadless);
    seleniumUtils = new SeleniumUtils(driver);
    
    logger.info("Test environment setup completed");
}
```

## 🔍 Test Data

### Test Constants
```java
public static final String VALID_EMAIL = "test@example.com";
public static final String INVALID_EMAIL = "invalid-email";
public static final String WEAK_PASSWORD = "123";
public static final String VALID_PASSWORD = "newPassword123";
public static final String MISMATCH_PASSWORD = "differentPassword123";
```

### Test User Credentials
- **Email**: `test@example.com`
- **Original Password**: `password123` (hashed in database)
- **New Password**: `newPassword123` (set during tests)

## 🔍 Selectors

The tests use consistent selectors defined as constants:

```java
// Login page
public static final String LOGIN_EMAIL_INPUT = "#email-address";
public static final String LOGIN_PASSWORD_INPUT = "#password";
public static final String LOGIN_SUBMIT_BUTTON = "button[type=\"submit\"]";
public static final String FORGOT_PASSWORD_LINK = "a[href=\"/forgot-password\"]";

// Forgot password page
public static final String FORGOT_EMAIL_INPUT = "#email";
public static final String FORGOT_SUBMIT_BUTTON = "button[type=\"submit\"]";
public static final String FORGOT_SUCCESS_MESSAGE = ".text-green-700, .text-green-300";
public static final String FORGOT_ERROR_MESSAGE = ".text-red-700, .text-red-300";

// Reset password page
public static final String RESET_PASSWORD_INPUT = "#password";
public static final String RESET_CONFIRM_PASSWORD_INPUT = "#confirmPassword";
public static final String RESET_SUCCESS_MESSAGE = ".text-green-700, .text-green-300";
public static final String RESET_ERROR_MESSAGE = ".text-red-700, .text-red-300";
```

## 🔒 Security Testing

The tests verify important security features:

1. **Email Privacy**: Same success message for all emails (existing or not)
2. **Field Clearing**: Email field is cleared after submission
3. **Token Validation**: Invalid/expired tokens are properly rejected
4. **Password Requirements**: Minimum 6 characters enforced
5. **Token Expiry**: Tokens expire after 1 hour

## 🐛 Debugging Tests

### Common Issues

1. **WebDriver Issues**: Ensure WebDriverManager can download drivers
2. **Port Conflicts**: Ensure port 3003 is available and app is running
3. **Element Not Found**: Check if selectors match the current UI
4. **Timeout Issues**: Increase timeout in SeleniumUtils

### Debug Commands

```bash
# Run with verbose output
mvn clean test -Dtest=ForgotPasswordTest -DfailIfNoTests=false -X

# Run single test with debug
mvn clean test -Dtest=ForgotPasswordTest#testCompletePasswordResetFlow -DfailIfNoTests=false

# Run with specific browser and visible mode
mvn clean test -Dbrowser=chrome -Dheadless=false
```

### Taking Screenshots

Screenshots are automatically taken on test failures:

```java
// Manual screenshot
seleniumUtils.takeScreenshot("test-step");

// Screenshots are saved in selenium-java/screenshots/
```

## 📊 Test Reports

TestNG provides detailed test reports:

```bash
# Run tests (reports generated automatically)
mvn clean test

# View reports
# Reports are generated in target/surefire-reports/
# Open target/surefire-reports/index.html in browser
```

## 🚀 CI/CD Integration

The tests are configured for CI/CD with:

- **Maven Integration**: Standard Maven lifecycle
- **Parallel Execution**: Configurable parallel test execution
- **Screenshot Capture**: Automatic screenshots on failures
- **Exit Codes**: Proper exit codes for CI integration

### CI Configuration Example

```yaml
# GitHub Actions example
- name: Run Java Selenium Tests
  run: |
    cd selenium-java
    mvn clean test -Dbrowser=chrome -Dheadless=true
  env:
    CI: true
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh 'cd selenium-java && mvn clean compile'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'cd selenium-java && mvn test -Dbrowser=chrome -Dheadless=true'
            }
        }
        
        stage('Publish Results') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'selenium-java/target/surefire-reports',
                    reportFiles: 'index.html',
                    reportName: 'Selenium Test Report'
                ])
            }
        }
    }
}
```

## 🔄 Email Mocking

The tests use sophisticated email mocking:

```java
// Setup email mock
seleniumUtils.setupEmailMock();

// Submit form (triggers mock)
seleniumUtils.fillForgotPasswordForm("test@example.com");
seleniumUtils.submitForgotPasswordForm();

// Extract token from mock email
String resetToken = seleniumUtils.extractResetTokenFromEmail();
```

The email mock:
- Intercepts API calls to `/api/auth/forgot-password`
- Generates mock reset tokens
- Stores email data for testing
- Provides realistic email simulation

## 📝 Adding New Tests

To add new tests:

1. **Create test method** in `ForgotPasswordTest.java`
2. **Use SeleniumUtils** methods for interactions
3. **Follow naming convention**: `test[Description]`
4. **Add to testng.xml** if needed

Example:
```java
@Test(description = "New feature test")
public void testNewFeature() {
    logger.info("Starting test: New feature test");
    
    seleniumUtils.setupEmailMock();
    
    // Your test logic here
    seleniumUtils.gotoLogin();
    // ... more test steps
    
    logger.info("Test completed: New feature test");
}
```

## 🤝 Contributing

When contributing to Java Selenium tests:

1. **Follow existing patterns**: Use SeleniumUtils and consistent selectors
2. **Add comprehensive coverage**: Test happy path, error cases, and edge cases
3. **Use descriptive names**: Test names should clearly describe what they test
4. **Add logging**: Use SLF4J logger for test progress
5. **Update documentation**: Keep this README updated
6. **Handle cleanup**: Always clean up resources in `@AfterClass`

## 📞 Support

For issues with Java Selenium tests:

1. Check the [Selenium WebDriver documentation](https://selenium.dev/documentation/webdriver/)
2. Review test logs and screenshots
3. Run tests in visible mode to see what's happening
4. Check browser console for JavaScript errors
5. Verify WebDriverManager can download drivers

## 🔗 Related Documentation

- [Selenium WebDriver](https://selenium.dev/documentation/webdriver/)
- [TestNG Framework](https://testng.org/doc/)
- [WebDriverManager](https://github.com/bonigarcia/webdrivermanager)
- [Maven](https://maven.apache.org/guides/)
- [Java](https://docs.oracle.com/en/java/)
