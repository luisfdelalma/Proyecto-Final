import { transporter } from "../middlewares/mailing.js";
import { cartsServices, productsServices, usersServices } from "../repositories/index.js";

export const searchG = async (req, res) => {
    let limit = parseInt(req.query.limit)
    let page = parseInt(req.query.page)
    let sort = req.query.sort
    let category = req.query.category
    let status = req.query.status

    if (!limit || limit === 0) { limit = 10 }

    if (!page || page === 0) { page = 1 }

    if (sort == "ASC" || sort == "asc") { sort = 1 }
    if (sort == "DESC" || sort == "desc") { sort = -1 }
    if (!status) { status = [true, false] }
    if (!category) { category = ["Category A", "Category B", "Category C"] }

    let products = await productsServices.searchQuery(limit, page, sort, category, status)

    let rendProd = products.docs.map(item => item.toObject())
    // console.log(products);

    if (req.url.includes("?")) {
        if (req.url.includes("page")) {
            let nextUrl = `/api/products${req.url.replace(`page=${products.page}`, `${products.nextLink}`)}`
            let prevUrl = `/api/products${(req.url.replace(`page=${products.page}`, `${products.prevLink}`))}`

            let user = req.cookies["User"]

            if (user) {
                const cart = await cartsServices.getCartByUser(user)
                let cartid
                if (cart) {
                    const cart_transformed = cart.toObject()
                    cartid = cart_transformed.CId
                } else {
                    cartid = null
                }

                res.render("products", { products: rendProd, hasNextPage: products.hasNextPage, hasPrevPage: products.hasPrevPage, prevLink: prevUrl, nextLink: nextUrl, cart: true, cartid: cartid })
            } else {
                res.render("products", { products: rendProd, hasNextPage: products.hasNextPage, hasPrevPage: products.hasPrevPage, prevLink: prevUrl, nextLink: nextUrl, cart: false })
            }

        } else {
            let nextUrl = `/api/products${req.url + `&${products.nextLink}`}`
            let prevUrl = `/api/products${(req.url.replace(`page=${products.page}`, `${products.prevLink}`))}`

            let user = req.cookies["User"]

            if (user) {
                const cart = await cartsServices.getCartByUser(user)
                let cartid
                if (cart) {
                    const cart_transformed = cart.toObject()
                    cartid = cart_transformed.CId
                } else {
                    cartid = null
                }

                res.render("products", { products: rendProd, hasNextPage: products.hasNextPage, hasPrevPage: products.hasPrevPage, prevLink: prevUrl, nextLink: nextUrl, cart: true, cartid: cartid })
            } else {
                res.render("products", { products: rendProd, hasNextPage: products.hasNextPage, hasPrevPage: products.hasPrevPage, prevLink: prevUrl, nextLink: nextUrl, cart: false })
            }
        }

    } else {
        let nextUrl = `/api/products${req.url + `?${products.nextLink}`}`
        let prevUrl = `/api/products${(req.url.replace(`page=${products.page}`, `${products.prevLink}`))}`

        let user = req.cookies["User"]

        if (user) {
            const cart = await cartsServices.getCartByUser(user)
            let cartid
            if (cart) {
                const cart_transformed = cart.toObject()
                cartid = cart_transformed.CId
            } else {
                cartid = null
            }

            res.render("products", { products: rendProd, hasNextPage: products.hasNextPage, hasPrevPage: products.hasPrevPage, prevLink: prevUrl, nextLink: nextUrl, cart: true, cartid: cartid || false })
        } else {
            res.render("products", { products: rendProd, hasNextPage: products.hasNextPage, hasPrevPage: products.hasPrevPage, prevLink: prevUrl, nextLink: nextUrl, cart: false })
        }
    }



}

export const searchId = async (req, res) => {
    let id = parseInt(req.params.pid)
    let product = await productsServices.searchBId(id)

    // res.send({ result: "success", payload: product })
    res.render("singleproduct", { product: product })
}

export const create = async (req, res) => {
    let { title, BId, description, code, price, status, stock, category, thumbnail } = req.body

    let result = await productsServices.create(title, BId, description, code, price, status, stock, category, thumbnail)

    res.send({ status: "success", payload: result })
}

export const update = async (req, res) => {
    let BId = req.params.BId
    let productToModify = req.body

    let result = await productsServices.update(BId, productToModify)
    res.send({ result: "success", payload: result })
}

export const deleteP = async (req, res) => {
    const BId = parseInt(req.params.BId)
    const userId = req.cookies["User"]
    const product = await productsServices.searchBId(BId)
    const user = await usersServices.getById(userId)
    const ownerid = product.owner
    const owner = await usersServices.getById(ownerid)
    const ownerRole = owner.role
    const ownerEmail = owner.email

    if (user.role === "premium" && user._id == product.owner) {

        const mailOptions = {
            from: process.env.email_user,
            to: `${user.email}`,
            subject: "Advertencia: Eliminación de producto",
            text: `Se eliminó el producto con id: ${BId} que creaste en nuestro sistema`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                req.logger.error("Error de envio")
                res.send("Error de envio")
            } else {
                req.logger.info("Correo enviado " + info.response)
            }
        })

        let result = await productsServices.delete(BId)
        res.send({ result: "success", payload: result })

    } else {
        if (user.role === "admin" && ownerRole === "premium") {

            const mailOptions = {
                from: process.env.email_user,
                to: `${user.email}`,
                subject: "Advertencia: Eliminación de producto",
                text: `Se eliminó el producto con id: ${BId} que creaste en nuestro sistema`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    req.logger.error("Error de envio")
                    res.send("Error de envio")
                } else {
                    req.logger.info("Correo enviado " + info.response)
                }
            })

            let result = await productsServices.delete(BId)
            res.send({ result: "success", payload: result })
        } else {
            res.send("No tiene permisos para eliminar este producto")
        }
    }
}