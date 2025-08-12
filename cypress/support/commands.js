import 'cypress-iframe';
import 'cypress-real-events/support';

Cypress.Commands.add('iframeLoaded', { prevSubject: 'element' }, ($iframe) => {
  const contentWindow = $iframe.prop('contentWindow');
  
  return new Cypress.Promise((resolve) => {
    if (contentWindow && contentWindow.document.readyState === 'complete') {
      resolve(contentWindow);
    } else {
      $iframe.on('load', () => {
        resolve(contentWindow);
      });
    }
  });
});

// Custom command to find a selector within a specific iframe's document

Cypress.Commands.add('iframeCustom', { prevSubject: 'element' }, ($iframe) => {
  return new Cypress.Promise((resolve) => {
    // Wait for iframe to load, then get the document body
    $iframe.ready(function () {
      resolve($iframe.contents().find('body'));
    });
  });
});

Cypress.Commands.add('checkElementExists', (selector) => {
  // Ensure that the element exists before interacting
  return cy.get(selector).should('exist').then(cy.wrap);
});




// Add this temporarily to commands.js to debug
// Cypress.Commands.add('getWithinIframe', (selector) => {
//   return cy
//     .get('iframe[name^="__privateStripeFrame"], iframe[src*="stripe.com"]', { timeout: 15000 })
//     .then($iframes => {
//       console.log('FOUND IFRAMES:', $iframes.length);
//       $iframes.each((i, iframe) => console.log('Frame:', iframe.name));
//     })
//     .iframeLoaded() // Wait until iframe is loaded
//     .its('document')
//     .then((doc) => {
//       const el = doc.querySelector(selector);
//       if (el) {
//         return cy.wrap(el);
//       } else {
//         throw new Error(`Element ${selector} not found inside the iframe.`);
//       }
//     });
// });

// // Fill Stripe Elements fields
// Cypress.Commands.add('fillStripeCardNumber', (card = '4242 4242 4242 4242') => {
//   cy.getWithinIframe('input[name="cardnumber"]').click().type(card, { delay: 100 });
// });

// Cypress.Commands.add('fillStripeExpiry', (exp = '12/34') => {
//   cy.getWithinIframe('input[name="expiry"]')
//     .click()
//     .type(exp.replace('/', ''), { delay: 100 });  // Expiry can be typed as MMYY or MM/YY
// });

// Cypress.Commands.add('fillStripeCvc', (cvc = '123') => {
//   cy.getWithinIframe('input[name="cvcNumber"]').click().type(cvc, { delay: 100 });
// });

// Cypress.Commands.add('fillStripeCard', (card, exp, cvc) => {
//   cy.fillStripeCardNumber(card);
//   cy.wait(1000);
// //   cy.fillStripeExpiry(exp);
//   cy.wait(1000)
//   cy.fillStripeCvc(cvc);
// });



// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })