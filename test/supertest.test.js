import * as chai from "chai"
import supertest from "supertest";

const expect = chai.expect
const requester = supertest("http://localhost:8080")

describe("Testing de proyecto final", () => {
    describe("Test de PRODUCTS", () => {
        it("El endpoint GET debe encontrar un producto correctamente", async () => {
            const productMock = 616949

            const response = await requester.get(`/api/products/${productMock}`).send()

            expect(response.statusCode).to.equal(200)
        })
    })

    describe("Test de CARTS", () => {
        it("El endpoint GET debe devolver un carrito correctamente", async () => {
            const cartMock = 1704367462695

            const response = await requester.get(`/api/carts/${cartMock}`).send()

            expect(response.statusCode).to.equal(200)
        })
    })

    describe("Test de USERS", () => {
        it("El endpoint GET debe devoler la página para reestablecer la contraseña correctamente", async () => {

            const response = await requester.get("/api/users/forgotpassword").send()

            expect(response.statusCode).to.equal(200)
        })
    })
})