describe("Results Page with cypress, real api", () => {
  beforeEach(() => {
    // Visit results page with query params
    cy.visit(
      "/results?destination=Singapore%2C+Singapore&uid=RsBU&checkin=2025-08-15&checkout=2025-08-18&nights=3&rooms=2&adults=2&children=1&guestRating=0&sortBy=rating"
    );
  });

  it("loads hotel cards from real API and displays them", () => {

    // Wait for hotel cards to be visible
    cy.get('.hotel-card', { timeout: 10000 }).should('exist');

    // Wait for hotel cards to load (assuming hotel cards have a container with border style as per your JSX)
    cy.get('.hotel-card').should('have.length.greaterThan', 0);
    
    // Check each hotel card has a hotel name
    cy.get('.hotel-card').each(($card) => {
      cy.wrap($card).find('.hotel-name').should('not.be.empty');
      cy.wrap($card).find('.rating-card').should('exist');
    });
  });

  it("filters hotels by star rating", () => {
    cy.get("#star-rating").select("4");
    cy.get("button.filter-btn").click();

    // After filtering, hotel cards should update
    cy.get(".hotel-card").should("exist");

    // Optional: check all visible star ratings >= 4
    cy.get(".rating-card").then((ps) => {
      ps.toArray().forEach((p) => {
        const text = p.innerText;
        if (text.includes("⭐ Star Rating")) {
          const ratingMatch = text.match(/(\d+)/);
          if (ratingMatch) {
            expect(Number(ratingMatch[1])).to.be.at.least(4);
          }
        }
      });
    });
  });

  it("applies price range filter", () => {
    // Clear & type min price
    cy.get('input[placeholder="Min Price"]').clear().type("2000");
    // Clear & type max price
    cy.get('input[placeholder="Max Price"]').clear().type("4000");
    cy.get("button.filter-btn").click();

    cy.get(".hotel-card").should("exist");

    // Check prices on page are within range if possible
    cy.get(".price-card").then((ps) => {
      ps.toArray().forEach((p) => {
        const text = p.innerText;
        if (text.startsWith("$")) {
          const price = Number(text.replace(/[$,]/g, ""));
          expect(price).to.be.gte(2000).and.lte(4000);
        }
      });
    });
  }); 

  it("clicking on a map marker navigates to hotel details", () => {
    // Wait for markers to load — typical Leaflet marker class is 'leaflet-marker-icon'
    cy.get('.leaflet-marker-icon', { timeout: 10000 }).should('have.length.greaterThan', 0);

    // Click the first marker on the map
    cy.get('.leaflet-marker-icon').first().click({ force: true });

    // Or if clicking triggers navigation, check url includes room id param (example)
    cy.url().should('include', '/room?id=');
  });
});
