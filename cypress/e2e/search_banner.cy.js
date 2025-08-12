describe("SearchBanner full E2E test", () => {
  beforeEach(() => {
    // Visit your frontend root page where SearchBanner is mounted
    cy.visit("http://localhost:3000");
  });

  it("handles no suggestions for nonsense input and then searches valid destination", () => {
    // Try nonsense destination 
    cy.get('input[placeholder="Where are you going?"]').type("sinnnnnng");

    // Wait shortly and confirm no suggestions shown
    cy.wait(500);
    cy.get(".suggestions-list").should("not.exist");

    // Now type valid search with slight typo
    cy.get('input[placeholder="Where are you going?"]').clear().type("Sinng");

    // Suggestions list should appear with at least one suggestion "Singapore"
    cy.get(".suggestions-list").should("be.visible");
    cy.contains(".suggestions-list li", "Singapore, Singapore").should("exist");

    // Click the Singapore suggestion
    cy.contains(".suggestions-list li", "Singapore, Singapore").click();

    // Select check-in date (using the date picker inputs)
    cy.get('input[placeholder="Check‑in"]').clear().type("2025-08-15").blur();
    cy.get('input[placeholder="Check‑out"]').clear().type("2025-08-18").blur();

    // Open Rooms & Guests dropdown
    cy.get(".rg-toggle").click();

    // Set Rooms = 2
    cy.contains(".rg-row", "Rooms").find("button").last().click();

    // Set Adults = 2
    cy.contains(".rg-row", "Adults").find("button").last().click();

    // Set Children = 1
    cy.contains(".rg-row", "Children").find("button").last().click();

    // Close the dropdown
    cy.contains("button", "Done").click();

    // Click Search button
    cy.get("button.search-btn").click();

    // Confirm URL includes /results and correct query params
    cy.url().should("include", "/results");
    cy.url().should("include", "destination=Singapore");
    cy.url().should("include", "checkin=2025-08-15");
    cy.url().should("include", "checkout=2025-08-18");
    cy.url().should("include", "rooms=2");
    cy.url().should("include", "adults=2");
    cy.url().should("include", "children=1");

    // Optionally, assert that the results page content loaded (if you have an element to check)
    // cy.contains("h1", "Hotels in Singapore").should("exist");
  });
});
