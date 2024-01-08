import userDTO from "../DAO/dtos/users.dto.js"


export default class userRepository {
    constructor(dao) {
        this.dao = dao
    }

    async getByEmail(email) {
        const result = await this.dao.findByEmail(email)
        return result
    }

    async create(user) {
        const DTOuser = new userDTO(user)
        console.log(DTOuser);
        const result = await this.dao.create(DTOuser)
        return result
    }

    async updatePass(user, newPass) {
        const result = await this.dao.updatePass(user, newPass)
        return result
    }

    async updateRole(id, role) {
        const result = await this.dao.updateRole(id, role)
        return result
    }

    async getById(id) {
        const result = await this.dao.getById(id)
        return result
    }

    async lastConnection(id) {
        const result = await this.dao.lastConnection(id)
        return result
    }

    async getAllUsers() {
        const result = await this.dao.getAllUsers()
        return result
    }

    async deleteUser(id) {
        const result = await this.dao.deleteUser(id)
        return result
    }
}