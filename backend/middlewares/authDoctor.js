import jwt from 'jsonwebtoken'

//doctor authentication middleware
const authDoctor = async (req,res,next) => {
    try {
        const { dtoken } = req.headers
        console.log(dtoken)
        if(!dtoken){
            return res.json({success: false, message: "Not authorized login again"})
        }

        const decodedToken = jwt.verify(dtoken,process.env.JWT_SECRET)

        req.id = decodedToken.id
        console.log(req.id)
        next()

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export default authDoctor 