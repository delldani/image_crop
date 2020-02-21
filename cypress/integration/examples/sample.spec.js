import React from "react";
import "@testing-library/cypress/add-commands";

/// <reference types="cypress" />

describe("My First Test", function() {
  it("Does  much!", function() {
    expect(true).to.equal(true);
    cy.visit("http://localhost:3000/");
    cy.queryByTestId("input").should("exist");
    cy.get("[data-testid=input]").click();
    cy.contains("kép helye");
  });

  // it("react", function() {
  //   cy.mount(<div>asasas</div>);
  // });
});
