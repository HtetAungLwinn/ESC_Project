// cypress/e2e/signup_login.cy.js
describe('Signup + Login (frontend ↔ backend ↔ DB)', () => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'TestPass123!';
  
    const fillSignup = () => {
      cy.get('#salutation').select('Mr.');
      cy.get('#religion').select('Buddhism');
      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#phoneNumber').type('91234567');
      cy.get('#address').type('123 Test Street');
      cy.get('#postalCode').type('123456');
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('#confirmPassword').type(password);
    };
  
    it('SU-01 + LG-01: sign up then login (assert redirect + session)', () => {
      // Intercept backend profile upsert triggered during Login
      cy.intercept('POST', '/api/signup').as('postSignup');
  
      // --- Signup ---
      cy.visit('/signup');
      fillSignup();
      cy.get('form').submit();
  
      // Success toast appears, then app navigates to /login
      cy.contains('Signup successful', { timeout: 10000 }).should('be.visible');
      cy.url().should('include', '/login');
  
      // --- Login ---
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('form').submit();
  
      // Ensure backend was called and accepted (200) or duplicate (409)
      cy.wait('@postSignup', { timeout: 15000 }).then(({ response }) => {
        expect([200, 409]).to.include(response?.statusCode);
      });
  
      // Assert redirect to homepage and session persisted
      cy.location('pathname', { timeout: 10000 }).should('eq', '/');
      cy.window().then((win) => {
        const uid = win.localStorage.getItem('uid');
        expect(uid).to.be.a('string').and.to.have.length.greaterThan(0);
      });
  
    });
  
    it('LG-02: wrong password shows auth error', () => {
      cy.visit('/login');
      cy.get('#email').type(email); // user from previous test
      cy.get('#password').type('WrongPass!');
      cy.get('form').submit();
  
      // Frontend shows Firebase error text; match common keywords case-insensitively
      cy.contains(/wrong|invalid|password|auth/i, { timeout: 10000 }).should('be.visible');
    });
  });
  