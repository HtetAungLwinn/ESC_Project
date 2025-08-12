import 'cypress-real-events/support';
import '../support/commands.js'

describe('Hotel Details and Room Details Integration Test', () => {
  it('hotel details page and room detail page', () => {
    // 1. Visit hotel details page
    cy.visit('http://localhost:3000/room?id=1xUw&destination_id=RsBU&checkin=2025-08-15&checkout=2025-08-22&adults=1&children=0&destination_name=Singapore,%20Singapore');

    // 2. Check for hotel details 
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name

    // 3. Click on the right of hotel image
    cy.get('.nav-button.right', { timeout: 10000 }).click();
    cy.get('.nav-button.right', { timeout: 10000 }).click();
    cy.get('.nav-button.left', { timeout: 10000 }).click({ force: true });

    // 4. Scroll to Room Options section
    cy.contains('Room Options').scrollIntoView();
    
    // 5. Click "More Rooms" button if present
    cy.get('button.see-more-rooms', { delay: 400 }).should('be.visible').click();

    // 6. Click to view Room details
    cy.get('h3.room-card__title').first().click();

    // 7. Check for room details
    cy.contains(/Market Rates:/i).scrollIntoView();
    cy.contains(/Description/i).scrollIntoView();
    cy.contains(/Amenities:/i).scrollIntoView();
    cy.get('h2').should('exist'); // Hotel name

    // 8. Click on the right of room image
    cy.get('.carousel-right', { timeout: 10000 }).click();
    cy.get('.carousel-right', { timeout: 10000 }).click();
    cy.get('.carousel-left', { timeout: 10000 }).click();

    // 9. Click on close button
    cy.get('button.room-modal-close').first().click();

    // 10. Select the first room in the expanded list
    cy.get('.room-card__btn').first().click();

    // After redirect to login page
    cy.url().should('include', '/login');
  });
});