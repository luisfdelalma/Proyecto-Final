import { usersServices } from "../repositories/index.js";
import { createHash, isValidatedPassword } from "../middlewares/utils.js";
import jwt from "jsonwebtoken"
import { io } from "../app.js";
import customError from "../repositories/errors/customError.js";
import EErrors from "../repositories/errors/enums.js";
import { registerUserErrorInfo } from "../repositories/errors/info.js";
import { transporter } from "../middlewares/mailing.js";

export const loginG = (req, res) => {
    res.render("login")
}

export const loginP = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).send({ status: "error", error: "Faltan valores" })

    let user = await usersServices.getByEmail(email)
    req.logger.info(user)

    if (!user) return res.status(400).send({ status: "error", error: "Usuario no registrado" })

    if (!isValidatedPassword(user, password)) {
        req.logger.warning("Password incorrecto")
        res.status(403).send({ status: "error", error: "Password incorrecto" })
    } else {

        let token = jwt.sign({ email, password, role: user.role }, process.env.Passport_key, { expiresIn: "12h" })
        let userToken = user._id
        delete user.password
        res.cookie("CoderCookie", token, { maxAge: 60 * 60 * 12 * 1000, httpOnly: true })
        res.cookie("User", userToken, { maxAge: 60 * 60 * 12 * 1000, httpOnly: true })
        res.send({ message: "logged in!" })
    }
}

export const logoutG = async (req, res) => {
    const user = req.cookies["User"]
    const lastConnection = await usersServices.lastConnection(user)
    res.clearCookie("User")
    res.clearCookie("CoderCookie")
    res.send("Logout exitoso, cookies eliminadas")
}

export const registerG = (req, res) => {
    res.render("register")
}

export const registerP = async (req, res, next) => {
    try {
        const { first_name, last_name, email, age } = req.body
        const user = await usersServices.getByEmail(req.body.email)
        if (user) {
            req.logger.warning("El usuario ya existe");
            res.render("useralreadyexists")
        } else {
            if (!first_name || !last_name || !email || !age) {
                customError.createError({
                    name: "User registrartion error",
                    cause: registerUserErrorInfo({ first_name, last_name, email, age }),
                    message: "Missing registration information",
                    code: EErrors.INVALID_TYPES_ERROR
                })
            } else {
                let result = await usersServices.create(req.body)
                res.render("successregister")
            }
        }
    } catch (error) {
        next(error)
    }
}

export const current = (req, res) => {
    let { email, role } = req.user
    res.send({ status: "success", payload: { email, role } })
}

export const chat = (req, res) => {

    res.render("chat")

    const users = {}

    io.on("connection", (socket) => {
        console.log("User connected");

        socket.on("newUser", (username) => {
            users[socket.id] = username
            io.emit("userConnected", username)
        })

        socket.on("chatMessage", (message) => {
            const username = users[socket.id]
            io.emit("message", { username, message })
        })

        socket.on("disconnect", () => {
            const username = users[socket.id]
            delete users[socket.id]
            io.emit("userDisconnected", username)
        })
    })
}

export const forPassG = (req, res) => {
    res.render("forgot-password")
}

export const forPassP = async (req, res) => {
    try {
        let user_email = req.body.email
        if (user_email) {
            let user = await usersServices.getByEmail(user_email)
            if (user) {

                const token = jwt.sign({ user_email }, process.env.email_key, { expiresIn: "1h" })
                const recoverUrl = `http://localhost:8080/api/users/forgotpassword-NewPass/${token}`
                const mailOptions = {
                    from: process.env.email_user,
                    to: `${user_email}`,
                    subject: "Email de recuperación",
                    text: `Parece que has olvidado tu contraseña, por favor usa el siguiente link para crear una nueva contraseña: ${recoverUrl} - Si no has solicitado cambio de contraseña por favor ignora este correo.`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        req.logger.error("Error de envio")
                        res.send("Error de envio")
                    } else {
                        req.logger.info("Correo enviado " + info.response)
                        res.send("Correo enviado con éxito a tu correo electrónico, haz click en el link que enviamos y sigue los pasos indicados. Ya puedes cerrar esta ventana :)")
                    }
                })

            } else {
                req.logger.warning("User was not found in our databases")
                res.send("User was not found in our databases, please try again")
            }
        } else {
            req.logger.warning("No user email was entered")
            res.send("No user email was entered")
        }
    } catch (error) {
        req.logger.error(error)
    }
}

export const changePassG = async (req, res) => {
    try {
        const token = req.params.token
        jwt.verify(token.toString(), process.env.email_key, (err, decoded) => {
            if (err) {
                req.logger.error(err)
                if (err.name === "TokenExpiredError") {
                    return res.render("forgot-password", { expired: true })
                } else {
                    return res.send(err)
                }

            } else {
                const userEmail = decoded.user_email
                res.render("newpass", { userEmail: userEmail })
            }
        })
    } catch (error) {
        req.logger.error(error)
    }
}

export const changePassP = async (req, res) => {
    try {
        const userNew = req.body
        const userOld = await usersServices.getByEmail(userNew.email)
        if (isValidatedPassword(userOld, userNew.newpass)) {
            res.send("No se puede usar la misma contraseña que tenías")
        } else {
            const updatedUser = await usersServices.updatePass(userNew.email, createHash(userNew.newpass))
            res.render("newPassConfirmation")
        }

    } catch (error) {
        req.logger.error(error)
    }
}

export const newPassConf = async (req, res) => {
    try {
        res.render("newPassConfirmation")
    } catch (error) {
        req.logger.error(error)
    }
}

export const roleChangeG = async (req, res) => {
    try {
        const uid = req.params.uid
        const userSearch = await usersServices.getById(uid)
        const user = userSearch.toObject()
        if (user.role == "premium") {
            res.render("rolechange", { user: user, premium: true })
        } else {
            if (user.role == "user") {
                res.render("rolechange", { user: user, premium: false })
            } else {
                res.send("No puedes cambiar de rol")
            }
        }
    } catch (error) {
        req.logger.error(error)
    }
}

export const roleChangeP = async (req, res) => {
    try {
        const uid = req.params.uid
        const userSearch = await usersServices.getById(uid)
        const user = userSearch.toObject()

        if (user.role == "premium") {
            const change = await usersServices.updateRole(uid, "user")
            res.render("rolechangeconfirm", { change: change })
        } else {
            const change = await usersServices.updateRole(uid, "premium")
            res.render("rolechangeconfirm", { change: change })
        }

    } catch (error) {
        console.log(error)
    }
}

export const allUsersG = async (req, res) => {
    try {
        const usersList = await usersServices.getAllUsers()
        res.send(usersList)
    } catch (error) {
        req.logger.error(error)
    }
}

export const deleteUsersG = async (req, res) => {
    try {
        const usersList = await usersServices.getAllUsers()

        usersList.forEach(async (user) => {
            let difference = Math.round((new Date() - new Date(user.lastConnection)) / (1000 * 60))
            if (difference > 5 && user.role !== "admin" && user.role !== "premium") {
                const mailOptions = {
                    from: process.env.email_user,
                    to: `${user.email}`,
                    subject: "Cuenta eliminada - Sin conexión +30mins",
                    text: `Parece que no has usado nuestros servicios en más de 30 minutos, por tal motivo tu cuenta ha sido eliminada`
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        req.logger.error("Error de envio")
                        res.send("Error de envio")
                    } else {
                        req.logger.info("Correo enviado " + info.response)
                        console.log(`El usuario ${user.email} será eliminado`)
                    }
                })

                const deleteUser = await usersServices.deleteUser(user._id)

            } else {
                console.log("Usuario no eliminado")
            }
        });

        const updatedList = await usersServices.getAllUsers()
        res.send("Los usuarios inactivos se han eliminado, quedan los siguientes usuarios activos: ", updatedList)

    } catch (error) {
        req.logger.error(error)
    }
}