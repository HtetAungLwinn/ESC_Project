// cypress/e2e/signup_login.cy.js
describe('Signup + Login (frontend ↔ backend ↔ DB)', () => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'TestPass123!';
  
    const fillSignup = (opts = {}) => {
      const {
        emailVal = email,
        pwd = password,
        confirm = password,
        includeEmail = true,
      } = opts;
  
      cy.get('#salutation').select('Mr.');
      cy.get('#religion').select('Buddhism');
      cy.get('#firstName').type('John');
      cy.get('#lastName').type('Doe');
      cy.get('#phoneNumber').type('91234567');
      cy.get('#address').type('123 Test Street');
      cy.get('#postalCode').type('123456');
      if (includeEmail) cy.get('#email').type(emailVal);
      cy.get('#password').type(pwd);
      cy.get('#confirmPassword').type(confirm);
    };
  
    it('SU-01 + LG-01: sign up then login (assert redirect + session)', () => {
      // Intercept Firebase REST login & user lookup
      cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword*', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            localId: 'test-uid',
            email,
            emailVerified: true,
            idToken: 'fake-id-token',
            refreshToken: 'fake-refresh-token',
            expiresIn: '3600',
          },
        });
      }).as('firebaseSignIn');

      cy.intercept('POST', 'https://identitytoolkit.googleapis.com/v1/accounts:lookup*', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            users: [{
              localId: 'test-uid',
              emailVerified: true,
              email,
            }],
          },
        });
      }).as('firebaseUserLookup');

      // Intercept backend API call that happens on first login (after email verified)
      cy.intercept('POST', '/api/signup').as('postSignup');

      // Signup
      cy.visit('/signup');
      fillSignup();
      cy.get('form').submit();

      cy.contains('Signup successful', { timeout: 10000 }).should('be.visible');
      cy.url().should('include', '/login');

      // Login
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('form').submit();

      // Wait for Firebase login and user lookup
      cy.wait('@firebaseSignIn', { timeout: 15000 });
      cy.wait('@firebaseUserLookup', { timeout: 15000 });

      // Wait for backend /api/signup call triggered on login after email verification
      cy.wait('@postSignup', { timeout: 15000 }).its('response.statusCode').should(status => {
        expect([200, 409]).to.include(status);
      });

      // Assert redirect to homepage
      cy.location('pathname', { timeout: 10000 }).should('eq', '/');

      // Assert localStorage uid set
      cy.window().then(win => {
        const uid = win.localStorage.getItem('uid');
        expect(uid).to.be.a('string').and.to.have.length.greaterThan(0);
      });
    });
  
    it('LG-02: wrong password shows auth error', () => {
      cy.visit('/login');
      cy.get('#email').type(email);
      cy.get('#password').type('WrongPass!');
      cy.get('form').submit();
  
      cy.contains(/wrong|invalid|password|auth/i, { timeout: 10000 })
        .should('be.visible');
    });
  
    it('SU-02: signup fails with empty/invalid email (stays on /signup)', () => {
      cy.visit('/signup');
      // leave email empty
      fillSignup({ includeEmail: false });
      cy.get('form').submit();
  
      // Accept common Firebase variants: missing-email / invalid-email
      cy.contains(/auth\/(missing-email|invalid-email)|missing.*email|invalid.*email/i, { timeout: 10000 })
        .should('be.visible');
  
      cy.location('pathname').should('eq', '/signup');
    });
  
    it('SU-03: signup fails when passwords do not match (stays on /signup)', () => {
      cy.visit('/signup');
      fillSignup({
        emailVal: `bad+${Date.now()}@example.com`,
        pwd: 'TestPass123!',
        confirm: 'Different123!',
      });
      cy.get('form').submit();
  
      cy.contains(/passwords?\s+do\s+not\s+match/i, { timeout: 5000 })
        .should('be.visible');
      cy.location('pathname').should('eq', '/signup');
    });
  });
  