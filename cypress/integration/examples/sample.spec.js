import "@testing-library/cypress/add-commands";
import "cypress-file-upload";

describe("My First Test", function() {
  it("Does  much!", function() {
    expect(true).to.equal(true);
    cy.visit("http://localhost:3000/");
    cy.queryByTestId("input").should("exist");
    cy.get("[data-testid=input]").click();
    cy.contains("kép helye");

    const fileName = "560.jpg";

    cy.fixture(fileName).then(fileContent => {
      cy.get('[data-testid="input"]').upload({
        fileContent,
        fileName,
        mimeType: "image/jpeg"
      });
    });

    cy.get('[data-testid="resultimage"]').should("not.exist");
    cy.get('[data-testid="cropimage"]')
      .trigger("mousedown", 30, 30)
      .trigger("mousemove", 70, 70)
      .trigger("mouseup");
    cy.get('[data-testid="resultimage"]').should("exist");
  });
});
