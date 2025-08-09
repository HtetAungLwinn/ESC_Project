describe('Hotel Booking E2E', () => {
  it('should search hotels and view hotel details', () => {
    // 1. Visit homepage
    cy.visit('http://localhost:3000');

    // 2. Check for main title
    cy.contains('Travel Website').should('be.visible');

    // 3. Fill in destination and select suggestion
    cy.get('input[placeholder="Where are you going?"]').as('destinationInput').type('Singapore');
    cy.get('.suggestions-list li').first().click();

    // 4. Pick check-in and check-out dates using react-datepicker
    // Open check-in picker and select a date
    cy.get('input[placeholder="Check‑in"]').click();
    cy.get('.react-datepicker__day--010').first().click(); // 10th of the month

    // Open check-out picker and select a date
    cy.get('input[placeholder="Check‑out"]').click();
    cy.get('.react-datepicker__day--012').first().click(); // 12th of the month

    // 5. Optionally adjust rooms & guests (skip if defaults are fine)
    // cy.get('.rg-toggle').click();
    // cy.get('.rg-row').contains('Adults').parent().find('button').last().click(); // +1 adult
    // cy.get('.rg-done').click();

    // 6. Click Search
    cy.get('button.search-btn').click();

    // 7. Wait for results page and check for hotel cards
    cy.url().should('include', '/results');
    cy.contains('Hotels in Singapore').should('be.visible');
    cy.get('button').contains(/select/i).first().click();

    // 8. Should navigate to hotel details page
    cy.url().should('include', '/room');
    cy.contains(/overview/i).should('be.visible');
    cy.get('h1').should('exist'); // Hotel name
  });
});