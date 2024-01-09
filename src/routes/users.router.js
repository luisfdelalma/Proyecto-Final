import { Router } from "express"
import passport from "passport"

const router = Router()

// IMPORTACIONES (RUTAS) NUEVAS
import { allUsersG, changePassG, changePassP, chat, current, deleteUsersG, editUsersG, editUsersP, forPassG, forPassP, loginG, loginP, logoutG, newPassConf, registerG, registerP, roleChangeG, roleChangeP } from "../controllers/usersController.js"
import { authorization, passportCall } from "../middlewares/utils.js"
import { deleteProduct } from "../controllers/cartsController.js"

// VERSION NUEVA
router.get("/register", registerG)

router.post("/register", registerP)

router.get("/login", loginG)

router.post("/login", loginP)

router.get("/logout", logoutG)

router.get("/getAllUsers", passportCall("jwt"), authorization("admin"), allUsersG)

router.get("/deleteUsers", passportCall("jwt"), authorization("admin"), deleteUsersG)

router.get("/editusers", passportCall("jwt"), authorization("admin"), editUsersG)

router.post("/editusers", passportCall("jwt"), authorization("admin"), editUsersP)

router.get("/current", passportCall("jwt"), authorization("admin"), current)

router.get("/chat", passportCall("jwt"), authorization("user"), chat)

router.get("/forgotpassword", forPassG)

router.post("/forgotpassword", forPassP)

router.get("/forgotpassword-NewPass/:token", changePassG)

router.post("/forgotpassword-NewPass", changePassP)

router.get("/newPassConfirmation", newPassConf)

router.get("/premium/:uid", roleChangeG)

router.post("/premium/:uid", roleChangeP)

export default router