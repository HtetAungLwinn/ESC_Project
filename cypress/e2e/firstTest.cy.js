import 'cypress-real-events/support';

describe('Hotel Booking E2E', () => {
  // Helper function to handle Stripe iframe fields
function fillStripeElement(field, value) {
  // Get the specific Stripe Element iframe
  return cy
    .get(`iframe[title="${field}"]`, { timeout: 10000 })
    .should('be.visible')
    .then($iframe => {
      const $body = $iframe.contents().find('body');
      // Wrap the body and type the value
      cy.wrap($body)
        .find('input')
        .should('exist')
        .type(value, { delay: 50 });
    });
}


  it('should search hotels and view hotel details', () => {
    // 1. Visit homepage
    cy.visit('http://localhost:3000');

    // 2. Check for main title
    cy.contains('Travel Website').should('be.visible');

    // 3. Fill in destination and select suggestion
    cy.get('input[placeholder="Where are you going?"]').as('destinationInput').type('Singapore');
    cy.get('.suggestions-list li').first().click();

    // 4. Pick check-in and check-out dates using react-datepicker
    // Open check-in picker
    cy.get('input[placeholder="Check‑in"]').click();

    // Click next month button
    cy.get('.react-datepicker__navigation--next').click(); // Move to next month

    // Now select the 10th of the next month
    cy.get('.react-datepicker__day--010').first().click();

    // Open check-out picker and select a date
    cy.get('input[placeholder="Check‑out"]').click();
    cy.get('.react-datepicker__day--012').first().click(); // 12th of the month

    // 6. Click Search
    cy.get('button.search-btn').click();

    // 7. Wait for results page and check for hotel cards
    cy.url().should('include', '/results');
    cy.contains('Hotels in Singapore').should('be.visible');
    cy.get('button').contains(/select/i).first().click(); // Click first hotel "Select" button

    // 8. Should navigate to hotel details page
    cy.url().should('include', '/room');
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name

    // 9. Scroll to Room Options section
    cy.contains('Room Options').scrollIntoView();

    // 10. Click "More Rooms" button if present
    cy.get('button.see-more-rooms').should('be.visible').click();

    // 11. Select the first room in the expanded list
    cy.get('.room-card__btn').first().click();

    // After redirect to login page
    cy.url().should('include', '/login');

    // Fill in email and password fields
    cy.get('input#email').type('chia.zhong.yi.zy@gmail.com');
    cy.get('input#password').type('testtest');

    // Submit the login form
    cy.get('button[type="submit"]').click();

    // repeat steps 3 to 11
    cy.get('input[placeholder="Where are you going?"]').as('destinationInput').type('Singapore');
    cy.get('.suggestions-list li').first().click();

    // Open check-in picker
    cy.get('input[placeholder="Check‑in"]').click();

    // Click next month button
    cy.get('.react-datepicker__navigation--next').click(); // Move to next month

    // Now select the 10th of the next month
    cy.get('.react-datepicker__day--010').first().click();

    // Open check-out picker and select a date
    cy.get('input[placeholder="Check‑out"]').click();
    cy.get('.react-datepicker__day--012').first().click(); // 12th of the month

    cy.get('button.search-btn').click();

    cy.url().should('include', '/results');
    cy.contains('Hotels in Singapore').should('be.visible');
    cy.get('button').contains(/select/i).first().click(); // Click first hotel "Select" button

    cy.url().should('include', '/room');
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name

    cy.contains('Room Options').scrollIntoView();

    cy.get('button.see-more-rooms', { delay: 200 }).should('be.visible').click();

    // Select the first room in the expanded list
    cy.get('.room-card__btn').first().click();

    // 12. Fill in payment details
    cy.url().should('include', '/payment');
    cy.get('input[placeholder="First and last name"]').type('Chia Zhong Yi');
    cy.get('input[placeholder="Include country code"]').type('98778537');
    cy.get('input[placeholder="someone@example.com"]').type('chia.zhong.yi.zy@gmail.com');
    cy.get('input[placeholder="Billing address"]').type('8 somapah road');
    cy.get('input[placeholder="Any extra requests"]').type('heeheeheehaww');

    // Fill card number
    cy.wait(1000); // Wait for Stripe elements to load

    // Fill card number
    fillStripeElement('Card Number', '4242424242424242', { delay: 200 });

    // Fill expiry
    fillStripeElement('Expiry Date', '1234', { delay: 200 });

    // Fill CVC
    fillStripeElement('CVC', '123', { delay: 200 });


    // 13. Fill in Stripe card fields using data-cy and iframe
    // // Card Number
    // cy.get('[data-cy="card-number-element"] iframe')
    //   .first()
    //   .then($iframe => {
    //     cy.wrap($iframe.contents().find('input[name="cardnumber"]'))
    //       .realType('4242424242424242', { delay: 20 });
    //   });

    // // Expiry Date
    // cy.get('[data-cy="card-expiry-element"] iframe')
    //   .first()
    //   .then($iframe => {
    //     cy.wrap($iframe.contents().find('input[name="exp-date"]'))
    //       .realType('1234', { delay: 20 });
    //   });

    // // CVC
    // cy.get('[data-cy="card-cvc-element"] iframe')
    //   .first()
    //   .then($iframe => {
    //     cy.wrap($iframe.contents().find('input[name="cvc"]'))
    //       .realType('123', { delay: 20 });
    //   });


    // Cypress.Commands.add('getStripeElement', (fieldName) => {
    //   if (Cypress.config('chromeWebSecurity')) {
    //     throw new Error('To get stripe element `chromeWebSecurity` must be disabled');
    //   }

    //   const selector = `input[data-elements-stable-field-name="${fieldName}"]`;

    //   return cy
    //     .get('iframe')
    //     .its('0.contentDocument.body').should('not.be.empty')
    //     .then(cy.wrap)
    //     .find(selector);
    // });

    
    // Cypress.Commands.add('getByTestId', (testid) => {
    //   return cy.get(`[data-testid=${testid}]`)
    // });

    // cy.getByTestId('card-number').find('.StripeElement').should('exist');
    // cy.getByTestId('card-expiry').find('.StripeElement').should('exist');
    // cy.getByTestId('card-cvc').find('.StripeElement').should('exist');

    // 14. Should show booking confirmation
    cy.contains('Booking Confirmed', { timeout: 20000 }).should('be.visible');

    // 15. Click on "Booking Details" in the header banner
    cy.get('.header').within(() => {
      cy.contains('Booking Details').click();
    });

  });
});