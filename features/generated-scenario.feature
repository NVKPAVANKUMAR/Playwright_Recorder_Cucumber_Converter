Feature: User Login and Navigation

  Scenario: Successful login and navigation
    Given the user navigates to "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
    When the user clicks on the input with placeholder "Username"
    When the user enters "Admin" into the input with placeholder "Username"
    When the user enters "admin123" into the input with placeholder "Password"
    When the user clicks on the element with role "button" and name "Login"
    When the user clicks on the element with role "img" and name "profile picture"
    When the user clicks on the element with role "menuitem" and name "Logout"
    When the user clicks on the element with role "img" and name "company-branding"
