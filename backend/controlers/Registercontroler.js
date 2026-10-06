const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "rahasia_jangan_bocor";
const register = async (req, res) => {
    try{
        const{name,email,password} = req.body;

        if (!name || !email || !password){
            return res.status(400).json({
                status: "EROR",
                massage : "Nama, email ,dan password harus di isi !"
            });
        }

        global.users = global.users || [];

        const existingUser = global.users.find(u => u.email === email );
        if (existingUser) {
            return res.status(400).json({
                status: "eror",
                message: "Email sudah di pake !"
            });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = {
            id: global.users.length + 1,
            name,
            email,
            password: hashedPassword
        };
        global.users.push(newUser);

        const token = jwt.sign({id: newUser.id, email: newUser.email},
            JWT_SECRET,
            {expiresIn:'1d'});


        return res.status(201).json({
            status: "success",
            message: "registrasi berhasil ! gass login.",
            token : token ,
            userName: newUser.name
        });
    } catch (error){
        return res.status(500).json({
            status: "eror",
            message: error.message
        });
    }

};

module.exports = {register};