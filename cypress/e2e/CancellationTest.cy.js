import 'cypress-real-events/support';
import '../support/commands.js'

const STRIPE_IFRAME_PREFIX = '__privateStripeFrame';

const CARD_DETAILS = {
  cardNumber: '4000058260000005',
  cardExpiry: '0535',
  cardCvc: '123',
};
const DECLINED_CARD_NUMBER = '4000000000000002';

// Get the Stripe iframe's document body for interaction
const getStripeIFrameDocument = () => {
  return cy.checkElementExists(`iframe[name^="${STRIPE_IFRAME_PREFIX}"]`).iframeCustom();
};

describe('Hotel Booking E2E', () => {
  it('should book hotel successfully', () => {
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
    cy.get('button.search-btn', { delay: 200 }).click();

    // 7. Wait for results page and check for hotel cards
    cy.url().should('include', '/results');
    cy.contains('Hotels in Singapore').should('be.visible');
    cy.get('button', { delay: 200 }).contains(/select/i).first().click(); // Click first hotel "Select" button

    cy.wait(1000);

    // 8. Should navigate to hotel details page
    cy.url().should('include', '/room');
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name

    // 9. Scroll to Room Options section
    cy.contains('Room Options').scrollIntoView();
    
    // 10. Click "More Rooms" button if present
    cy.get('button.see-more-rooms', { delay: 400 }).should('be.visible').click();

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

    cy.wait(1000);
    cy.url().should('include', '/results');
    cy.contains('Hotels in Singapore').should('be.visible');
    cy.get('button', { delay: 200 }).contains(/select/i).first().click(); // Click first hotel "Select" button

    cy.wait(1000); // Wait for the page to load

    cy.url().should('include', '/room');
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name

    cy.contains('Room Options').scrollIntoView();

    cy.wait(1000);
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

    getStripeIFrameDocument()
      .find('input[data-elements-stable-field-name="cardNumber"]')  // Locate card number field
      .type(CARD_DETAILS.cardNumber);

    getStripeIFrameDocument()
      .find('input[data-elements-stable-field-name="cardExpiry"]')  // Locate expiry date field
      .type(CARD_DETAILS.cardExpiry);

    getStripeIFrameDocument()
      .find('input[data-elements-stable-field-name="cardCvc"]')  // Locate CVC field
      .type(CARD_DETAILS.cardCvc);

    // Click the Pay button and wait for processing
    cy.get('button[type="submit"]')
      .should('be.visible')
      .click();

    // Add a wait for payment processing
    cy.wait(2000);

    // 14. Should show booking confirmation
    cy.contains('Booking Confirmed', { timeout: 20000 }).should('be.visible');

    // 15. Click on "Booking Details" in the header banner
    cy.get('.header').within(() => {
      cy.contains('Booking Details').click();
    });

    // confirm page 
    cy.contains('Your Bookings', { timeout: 20000 }).should('be.visible');

  });
});

describe('Payment Error', () => {
  it('shows error when payment fails', () => {
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
    cy.get('button.search-btn', { delay: 200 }).click();

    // 7. Wait for results page and check for hotel cards
    cy.url().should('include', '/results');
    cy.contains('Hotels in Singapore').should('be.visible');
    cy.get('button', { delay: 200 }).contains(/select/i).first().click(); // Click first hotel "Select" button

    cy.wait(1000);

    // 8. Should navigate to hotel details page
    cy.url().should('include', '/room');
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name

    // 9. Scroll to Room Options section
    cy.contains('Room Options').scrollIntoView();
    
    // 10. Click "More Rooms" button if present
    cy.get('button.see-more-rooms', { delay: 400 }).should('be.visible').click();

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

    cy.wait(1000);
    cy.url().should('include', '/results');
    cy.contains('Hotels in Singapore').should('be.visible');
    cy.get('button', { delay: 200 }).contains(/select/i).first().click(); // Click first hotel "Select" button

    cy.wait(1000); // Wait for the page to load

    cy.url().should('include', '/room');
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name

    cy.contains('Room Options').scrollIntoView();

    cy.wait(1000);
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

    getStripeIFrameDocument()
      .find('input[data-elements-stable-field-name="cardNumber"]')  // Locate card number field
      .type(DECLINED_CARD_NUMBER);

    getStripeIFrameDocument()
      .find('input[data-elements-stable-field-name="cardExpiry"]')  // Locate expiry date field
      .type(CARD_DETAILS.cardExpiry);

    getStripeIFrameDocument()
      .find('input[data-elements-stable-field-name="cardCvc"]')  // Locate CVC field
      .type(CARD_DETAILS.cardCvc);

    // Click the Pay button and wait for processing
    cy.get('button[type="submit"]')
      .should('be.visible')
      .click();

    cy.contains('Your card has been declined.').should('be.visible');
  });
});


describe('Booking Search Network Error', () => {
  it('shows error if booking details page fails', () => {
    // 1. Visit homepage and login
    cy.visit('http://localhost:3000');
    cy.contains('Login').click();

    cy.get('input#email').type('chia.zhong.yi.zy@gmail.com');
    cy.get('input#password').type('testtest');
    cy.get('button[type="submit"]').click();

    // 2. Intercept the booking search API and force error
    cy.intercept('GET', '/api/bookings*', {
      statusCode: 500,
      body: { error: 'Server error. Please try again later.' }
    }).as('bookingsSearchFail');

    // 3. Navigate to Booking Details
    cy.get('.header').within(() => {
      cy.contains('Booking Details').click();
    });

    // 4. Wait for the failed request
    cy.wait('@bookingsSearchFail');

    // 5. Assert that an error message is displayed to the user
    // Adjust the selector or text to match your app's UI
    cy.contains(/Error loading bookings.../i).should('be.visible');
  });
});

describe('Booking Cancellation Network Error', () => {
  it('shows error if cancel booking fails', () => {
    // 1. Visit homepage and login
    cy.visit('http://localhost:3000');
    cy.contains('Login').click();

    cy.get('input#email').type('chia.zhong.yi.zy@gmail.com');
    cy.get('input#password').type('testtest');
    cy.get('button[type="submit"]').click();

    // 2. Navigate to Booking Details
    cy.get('.header').within(() => {
      cy.contains('Booking Details').click();
    });

    // 3. Verify we're on the bookings page
    cy.contains('Your Bookings', { timeout: 10000 }).should('be.visible');

    cy.wait(1000); // Wait for bookings to load

    // 4. Intercept the cancel booking API and force error
    cy.intercept('DELETE', '/api/bookings/*', {
      statusCode: 500,
      body: { error: 'Server error. Please try again later.' },
    }).as('cancelBookingFail');

    // 5. Spy on window.alert to catch alert calls
    cy.window().then(win => {
      cy.spy(win, 'alert').as('alertSpy');
    });

    // 6. Try to cancel first booking
    cy.get('button').contains('Delete Booking').first().click();

    // Confirm browser popup (OK)
    cy.on('window:confirm', () => true);

    // 7. Wait for the failing request
    cy.wait('@cancelBookingFail');

    // 8. Assert alert was shown with failure message
    cy.get('@alertSpy').should('be.calledWith', 'Failed to delete booking');

    // 9. Assert booking still exists (not removed from list)
    cy.get('button').contains('Delete Booking').should('exist');
  });
});


describe('Booking Cancellation E2E', () => {
  it('should cancel all existing bookings', () => {
    // 1. Visit homepage and login
    cy.visit('http://localhost:3000');
    cy.contains('Login').click();
    
    // 2. Login with test credentials
    cy.get('input#email').type('chia.zhong.yi.zy@gmail.com');
    cy.get('input#password').type('testtest');
    cy.get('button[type="submit"]').click();

    // 3. Navigate to Booking Details
    cy.get('.header').within(() => {
      cy.contains('Booking Details').click();
    });

    // 4. Verify we're on the bookings page
    cy.contains('Your Bookings', { timeout: 10000 }).should('be.visible');

    cy.wait(1000); // Wait for bookings to load

    // 5. Delete all bookings if they exist
    cy.get('body').then(($body) => {
      const deleteBooking = () => {
        if ($body.find('button:contains("Delete Booking")').length > 0) {
          // Click delete button
          cy.get('button').contains('Delete Booking').first().click();
          
          // Handle confirmation dialog
          cy.on('window:confirm', () => true);
          
          // Wait for deletion and page refresh
          cy.wait(1000);
          
          // Refresh page to update booking list
          cy.get('.header').within(() => {
            cy.contains('Booking Details').click();
          });

          cy.wait(1000); // Wait for bookings to reload
          
          // Check if more bookings exist and continue deleting
          cy.get('body').then(($updatedBody) => {
            if ($updatedBody.find('button:contains("Delete Booking")').length > 0) {
              deleteBooking();
            }
          });
        }
      };

      deleteBooking();
    });

    // 6. Verify no bookings remain
    cy.contains('No bookings found').should('be.visible');
  });  
});